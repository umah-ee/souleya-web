'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import {
  fetchCourse, updateCourse, deleteCourse,
  fetchModules, createModule, updateModule, deleteModule,
  createLesson, updateLesson, deleteLesson,
  fetchEnrollments,
} from '@/lib/studio';
import type {
  Course, CourseModule, CourseLesson, UpdateCourseData,
  CourseCategory, CourseStatus, Enrollment,
} from '@/types/studio';
import type { IconName } from '@/components/ui/Icon';
import LessonThumbnail from '@/components/studio/LessonThumbnail';
import { createClient } from '@/lib/supabase/client';

// ── Demo-Daten fuer Bewertungen + Analytics ──────────────────
const DEMO_REVIEWS = [
  { id: 'r1', userName: 'Lisa M.', rating: 5, comment: 'Der beste Kurs den ich je gemacht habe. Sehr strukturiert und liebevoll aufbereitet.', date: '2026-03-15', avatar: null },
  { id: 'r2', userName: 'Max K.', rating: 4, comment: 'Sehr gut erklaert, die Atem-Uebungen haben mir besonders geholfen.', date: '2026-03-12', avatar: null },
  { id: 'r3', userName: 'Sarah L.', rating: 5, comment: 'Wunderschoen gestaltet und sehr tiefgehend. Danke!', date: '2026-03-08', avatar: null },
  { id: 'r4', userName: 'Tom B.', rating: 5, comment: 'Ich habe so viel gelernt. Die Live-Sessions waren der Hammer.', date: '2026-02-28', avatar: null },
  { id: 'r5', userName: 'Julia W.', rating: 3, comment: 'Guter Inhalt, aber Modul 3 war etwas zu lang.', date: '2026-02-20', avatar: null },
];

const DEMO_ANALYTICS = {
  enrollmentsThisMonth: 12,
  enrollmentsLastMonth: 8,
  completionRate: 68,
  avgTimePerLesson: 14, // Minuten
  dropoffModules: [
    { name: 'Modul 1', percent: 100 },
    { name: 'Modul 2', percent: 82 },
    { name: 'Modul 3', percent: 61 },
    { name: 'Modul 4', percent: 45 },
  ],
  revenueThisMonth: 89400, // Cent
};

const LESSON_TYPES: { key: string; label: string; icon: IconName }[] = [
  { key: 'video', label: 'Video', icon: 'video' },
  { key: 'audio', label: 'Audio', icon: 'microphone' },
  { key: 'pdf', label: 'PDF', icon: 'file-text' },
  { key: 'text', label: 'Text', icon: 'edit' },
  { key: 'live', label: 'Live', icon: 'player-play' },
  { key: 'quiz', label: 'Quiz', icon: 'check' },
];

type Tab = 'overview' | 'curriculum' | 'participants' | 'reviews' | 'analytics' | 'settings';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Entwurf',
  active: 'Aktiv',
  archived: 'Archiviert',
  sold_out: 'Ausverkauft',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'var(--text-muted)',
  active: 'var(--success)',
  archived: 'var(--text-sec)',
  sold_out: 'var(--warn)',
};

const CATEGORY_LABELS: Record<string, string> = {
  online: 'Online',
  offline: 'Vor Ort',
  recurring: 'Wiederkehrend',
  live: 'Live',
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  video: 'Video',
  audio: 'Audio',
  text: 'Text',
  pdf: 'PDF',
  live: 'Live',
  quiz: 'Quiz',
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Settings Form
  const [form, setForm] = useState<UpdateCourseData>({});

  // Curriculum Edit State
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [addingModuleTitle, setAddingModuleTitle] = useState('');
  const [addingLessonToModule, setAddingLessonToModule] = useState<string | null>(null);
  const [addingLessonTitle, setAddingLessonTitle] = useState('');
  const [addingLessonType, setAddingLessonType] = useState('text');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  // Upload + Detail-Panel
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [uploadingLessonId, setUploadingLessonId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOverLessonId, setDragOverLessonId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetLessonRef = useRef<{ lessonId: string; moduleId: string; contentType: string } | null>(null);

  // Detail-Panel State
  const [detailForm, setDetailForm] = useState<{ title: string; description: string; duration_minutes: number; is_preview: boolean }>({
    title: '', description: '', duration_minutes: 0, is_preview: false,
  });

  const loadCourse = useCallback(async () => {
    try {
      const [c, m, e] = await Promise.all([
        fetchCourse(courseId),
        fetchModules(courseId),
        fetchEnrollments(courseId).catch(() => ({ data: [], total: 0 })),
      ]);
      setCourse(c);
      setModules(m);
      setEnrollments(Array.isArray(e) ? e : (e as any)?.data ?? []);
      setForm({
        title: c.title,
        description: c.description ?? '',
        category: c.category,
        price_cents: c.price_cents,
        max_participants: c.max_participants ?? undefined,
        location_name: c.location_name ?? '',
        location_address: c.location_address ?? '',
        starts_at: c.starts_at ?? '',
        ends_at: c.ends_at ?? '',
        drip_interval: c.drip_interval ?? '',
      });
      // Alle Module aufklappen
      setExpandedModules(new Set(m.map((mod) => mod.id)));
    } catch {
      setError('Kurs konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { loadCourse(); }, [loadCourse]);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  // ── Settings Save ────────────────────────────────────────
  const handleSaveSettings = async () => {
    if (!course) return;
    setSaving(true);
    setError('');
    try {
      const updated = await updateCourse(course.id, form);
      setCourse(updated);
      showSuccess('Einstellungen gespeichert');
    } catch {
      setError('Speichern fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (status: CourseStatus) => {
    if (!course) return;
    try {
      const updated = await updateCourse(course.id, { status });
      setCourse(updated);
      showSuccess(`Status: ${STATUS_LABELS[status]}`);
    } catch {
      setError('Status-Aenderung fehlgeschlagen');
    }
  };

  const handleDeleteCourse = async () => {
    if (!confirm('Kurs wirklich loeschen? Dies kann nicht rueckgaengig gemacht werden.')) return;
    try {
      await deleteCourse(courseId);
      router.push('/studio/courses');
    } catch {
      setError('Loeschen fehlgeschlagen');
    }
  };

  // ── Curriculum: Modules ──────────────────────────────────
  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAddModule = async () => {
    if (!addingModuleTitle.trim()) return;
    try {
      const mod = await createModule(courseId, { title: addingModuleTitle.trim() });
      setModules((prev) => [...prev, mod]);
      setAddingModuleTitle('');
      setExpandedModules((prev) => new Set([...prev, mod.id]));
      showSuccess('Modul hinzugefuegt');
    } catch {
      setError('Modul erstellen fehlgeschlagen');
    }
  };

  const handleSaveModuleTitle = async (moduleId: string) => {
    if (!editValue.trim()) return;
    try {
      const updated = await updateModule(moduleId, { title: editValue.trim() });
      setModules((prev) => prev.map((m) => m.id === moduleId ? { ...m, ...updated } : m));
      setEditingModuleId(null);
      setEditValue('');
    } catch {
      setError('Modul aktualisieren fehlgeschlagen');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Modul mit allen Lektionen loeschen?')) return;
    try {
      await deleteModule(moduleId);
      setModules((prev) => prev.filter((m) => m.id !== moduleId));
      showSuccess('Modul geloescht');
    } catch {
      setError('Modul loeschen fehlgeschlagen');
    }
  };

  // ── Curriculum: Lessons ──────────────────────────────────
  const handleAddLesson = async (moduleId: string) => {
    if (!addingLessonTitle.trim()) return;
    try {
      const lesson = await createLesson(moduleId, {
        title: addingLessonTitle.trim(),
        content_type: addingLessonType,
      });
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: [...(m.lessons ?? []), lesson] }
            : m,
        ),
      );
      setAddingLessonToModule(null);
      setAddingLessonTitle('');
      showSuccess('Lektion hinzugefuegt');
    } catch {
      setError('Lektion erstellen fehlgeschlagen');
    }
  };

  const handleSaveLessonTitle = async (lessonId: string, moduleId: string) => {
    if (!editValue.trim()) return;
    try {
      const updated = await updateLesson(lessonId, { title: editValue.trim() });
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: (m.lessons ?? []).map((l) => l.id === lessonId ? { ...l, ...updated } : l) }
            : m,
        ),
      );
      setEditingLessonId(null);
      setEditValue('');
    } catch {
      setError('Lektion aktualisieren fehlgeschlagen');
    }
  };

  const handleDeleteLesson = async (lessonId: string, moduleId: string) => {
    if (!confirm('Lektion loeschen?')) return;
    try {
      await deleteLesson(lessonId);
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: (m.lessons ?? []).filter((l) => l.id !== lessonId) }
            : m,
        ),
      );
      showSuccess('Lektion geloescht');
    } catch {
      setError('Lektion loeschen fehlgeschlagen');
    }
  };

  const handleTogglePreview = async (lessonId: string, moduleId: string, current: boolean) => {
    try {
      await updateLesson(lessonId, { is_preview: !current });
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: (m.lessons ?? []).map((l) => l.id === lessonId ? { ...l, is_preview: !current } : l) }
            : m,
        ),
      );
    } catch {}
  };

  // ── Lesson Upload ───────────────────────────────────────
  const ACCEPT_MAP: Record<string, string> = {
    video: 'video/*',
    audio: 'audio/*',
    pdf: '.pdf',
    text: '.txt,.md,.html',
    quiz: '',
    live: '',
  };

  const handleLessonUpload = async (file: File, lessonId: string, moduleId: string) => {
    setUploadingLessonId(lessonId);
    setUploadProgress(10);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht eingeloggt');

      const ext = file.name.split('.').pop() ?? 'bin';
      const path = `${user.id}/${courseId}/${lessonId}-${Date.now()}.${ext}`;
      setUploadProgress(30);

      const { error: uploadError } = await supabase.storage
        .from('media-items')
        .upload(path, file, { contentType: file.type, upsert: true });

      if (uploadError) throw uploadError;
      setUploadProgress(80);

      const { data: { publicUrl } } = supabase.storage
        .from('media-items')
        .getPublicUrl(path);

      await updateLesson(lessonId, { content_url: publicUrl });
      setUploadProgress(100);

      // Modul-State updaten
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: (m.lessons ?? []).map((l) => l.id === lessonId ? { ...l, content_url: publicUrl } : l) }
            : m,
        ),
      );
      showSuccess('Datei hochgeladen');
    } catch (err) {
      setError('Upload fehlgeschlagen');
    } finally {
      setUploadingLessonId(null);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = uploadTargetLessonRef.current;
    if (file && target) {
      handleLessonUpload(file, target.lessonId, target.moduleId);
    }
    e.target.value = '';
  };

  const triggerUpload = (lessonId: string, moduleId: string, contentType: string) => {
    uploadTargetLessonRef.current = { lessonId, moduleId, contentType };
    if (fileInputRef.current) {
      fileInputRef.current.accept = ACCEPT_MAP[contentType] || '*/*';
      fileInputRef.current.click();
    }
  };

  const handleLessonDrop = (e: React.DragEvent, lessonId: string, moduleId: string) => {
    e.preventDefault();
    setDragOverLessonId(null);
    const file = e.dataTransfer.files[0];
    if (file) handleLessonUpload(file, lessonId, moduleId);
  };

  // ── Detail Panel ──────────────────────────────────────
  const selectedLesson = (() => {
    if (!selectedLessonId) return null;
    for (const m of modules) {
      const l = m.lessons?.find((l) => l.id === selectedLessonId);
      if (l) return { lesson: l, moduleId: m.id };
    }
    return null;
  })();

  const handleSaveDetail = async () => {
    if (!selectedLesson) return;
    setSaving(true);
    try {
      const updated = await updateLesson(selectedLesson.lesson.id, {
        title: detailForm.title,
        description: detailForm.description,
        duration_seconds: detailForm.duration_minutes * 60,
        is_preview: detailForm.is_preview,
      });
      setModules((prev) =>
        prev.map((m) =>
          m.id === selectedLesson.moduleId
            ? { ...m, lessons: (m.lessons ?? []).map((l) => l.id === selectedLesson.lesson.id ? { ...l, ...updated } : l) }
            : m,
        ),
      );
      showSuccess('Lektion gespeichert');
    } catch {
      setError('Speichern fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  };

  // Sync detail form when selection changes
  useEffect(() => {
    if (selectedLesson) {
      setDetailForm({
        title: selectedLesson.lesson.title,
        description: (selectedLesson.lesson as any).description ?? '',
        duration_minutes: Math.floor((selectedLesson.lesson.duration_seconds ?? 0) / 60),
        is_preview: selectedLesson.lesson.is_preview,
      });
    }
  }, [selectedLessonId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ───────────────────────────────────────────────
  if (loading) {
    return <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 60 }}>Lade Kurs...</p>;
  }

  if (!course) {
    return (
      <div className="text-center" style={{ paddingTop: 60 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Kurs nicht gefunden.</p>
        <button
          onClick={() => router.push('/studio/courses')}
          className="mt-4 cursor-pointer border-none"
          style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--gold-bg)', color: 'var(--gold-text)', fontSize: 11 }}
        >
          Zurueck zur Kursliste
        </button>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--glass)',
    border: '1px solid var(--gold-border-s)',
    color: 'var(--text-h)',
  };

  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0);

  return (
    <div>
      {/* Messages */}
      {success && (
        <div
          className="mb-4 px-4 py-2 rounded-[8px] text-center text-sm"
          style={{ background: 'var(--success-bg, rgba(34,134,58,0.1))', color: 'var(--success)', border: '1px solid rgba(34,134,58,0.2)' }}
        >
          {success}
        </div>
      )}
      {error && (
        <div
          className="mb-4 px-4 py-2 rounded-[8px] text-center text-sm"
          style={{ background: 'var(--error-bg, rgba(168,84,84,0.1))', color: 'var(--error)', border: '1px solid rgba(168,84,84,0.2)' }}
        >
          {error}
        </div>
      )}

      {/* Hidden file input for lesson uploads */}
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => router.push('/studio/courses')}
          className="cursor-pointer border-none flex items-center gap-1"
          style={{ background: 'none', color: 'var(--text-muted)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase' }}
        >
          <Icon name="arrow-left" size={12} />
          Kurse
        </button>
        <span style={{ color: 'var(--divider)', fontSize: 11 }}>/</span>
        <span style={{ color: 'var(--text-sec)', fontSize: 11 }}>{course.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="font-heading text-xl italic" style={{ color: 'var(--text-h)' }}>
              {course.title}
            </h2>
            <span
              style={{
                padding: '3px 10px', borderRadius: 8, fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase',
                background: 'var(--glass)', border: '1px solid var(--glass-border)',
                color: STATUS_COLORS[course.status] ?? 'var(--text-muted)',
              }}
            >
              {STATUS_LABELS[course.status] ?? course.status}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span style={{ fontSize: 12, color: 'var(--text-sec)' }}>
              {CATEGORY_LABELS[course.category] ?? course.category}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {course.participants_count} Teilnehmer
            </span>
            {course.rating_avg > 0 && (
              <span className="flex items-center gap-1" style={{ fontSize: 12, color: 'var(--gold-text)' }}>
                <Icon name="star" size={12} style={{ color: 'var(--gold)' }} />
                {course.rating_avg.toFixed(1)} ({course.rating_count})
              </span>
            )}
            {course.price_cents > 0 && (
              <span style={{ fontSize: 12, color: 'var(--gold-text)', fontWeight: 500 }}>
                {(course.price_cents / 100).toFixed(0)} {course.currency}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-gold" style={{ borderBottom: '1px solid var(--divider-l)' }}>
        {([
          { key: 'overview' as Tab, label: 'Uebersicht', icon: 'info' as IconName },
          { key: 'curriculum' as Tab, label: `Curriculum (${modules.length})`, icon: 'book' as IconName },
          { key: 'participants' as Tab, label: 'Teilnehmer', icon: 'users' as IconName },
          { key: 'reviews' as Tab, label: 'Bewertungen', icon: 'star' as IconName },
          { key: 'analytics' as Tab, label: 'Analytics', icon: 'chart-bar' as IconName },
          { key: 'settings' as Tab, label: 'Einstellungen', icon: 'settings' as IconName },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-1.5 cursor-pointer border-none transition-all duration-200"
            style={{
              padding: '10px 18px',
              fontSize: 11,
              letterSpacing: '0.5px',
              background: 'none',
              color: activeTab === tab.key ? 'var(--gold-text)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.key ? '2px solid var(--gold)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            <Icon name={tab.icon} size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Uebersicht ──────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Cover */}
          {course.cover_url && (
            <div className="rounded-[8px] overflow-hidden" style={{ height: 200 }}>
              <img src={course.cover_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Beschreibung */}
          <div className="glass-card rounded-[8px] p-5" style={{ background: 'var(--card-bg)' }}>
            <h3
              className="font-label mb-3"
              style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}
            >
              Beschreibung
            </h3>
            <p style={{ fontSize: 14, lineHeight: '1.7', color: 'var(--text-sec)', whiteSpace: 'pre-wrap' }}>
              {course.description || 'Keine Beschreibung vorhanden.'}
            </p>
          </div>

          {/* Ort + Datum */}
          {(course.location_name || course.starts_at) && (
            <div className="glass-card rounded-[8px] p-5" style={{ background: 'var(--card-bg)' }}>
              <h3
                className="font-label mb-3"
                style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}
              >
                Details
              </h3>
              <div className="space-y-2">
                {course.location_name && (
                  <div className="flex items-center gap-2">
                    <Icon name="map-pin" size={14} style={{ color: 'var(--gold)' }} />
                    <span style={{ fontSize: 13, color: 'var(--text-sec)' }}>
                      {course.location_name}{course.location_address ? ` – ${course.location_address}` : ''}
                    </span>
                  </div>
                )}
                {course.starts_at && (
                  <div className="flex items-center gap-2">
                    <Icon name="calendar-event" size={14} style={{ color: 'var(--gold)' }} />
                    <span style={{ fontSize: 13, color: 'var(--text-sec)' }}>
                      {new Date(course.starts_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {course.ends_at ? ` – ${new Date(course.ends_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([
              { label: 'Module', value: modules.length, icon: 'book' as IconName },
              { label: 'Lektionen', value: totalLessons, icon: 'edit' as IconName },
              { label: 'Teilnehmer', value: course.participants_count, icon: 'users' as IconName },
              { label: 'Bewertung', value: course.rating_avg > 0 ? course.rating_avg.toFixed(1) : '–', icon: 'star' as IconName },
            ]).map((stat) => (
              <div
                key={stat.label}
                className="glass-card rounded-[8px] p-4 text-center"
                style={{ background: 'var(--card-bg)' }}
              >
                <Icon name={stat.icon} size={18} style={{ color: 'var(--gold)', margin: '0 auto 6px' }} />
                <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-h)' }}>{stat.value}</div>
                <div style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 2 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Kurs-Circle (Feature 8) */}
          <div className="glass-card rounded-[8px] p-5" style={{ background: 'var(--card-bg)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-label mb-1" style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Kurs-Community
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-sec)' }}>
                  Diskussionsforum fuer Teilnehmer — Fragen, Austausch und Announcements.
                </p>
              </div>
              <button
                onClick={() => {
                  // TODO: Auto-create course channel via API
                  showSuccess('Kurs-Community wird erstellt …');
                }}
                className="flex items-center gap-2 cursor-pointer border-none transition-all"
                style={{
                  padding: '10px 20px', borderRadius: 9999,
                  background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                  color: 'var(--text-on-gold)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap',
                }}
              >
                <Icon name="message-circle" size={14} />
                Community oeffnen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Curriculum ──────────────────────────────── */}
      {activeTab === 'curriculum' && (
        <div className="flex gap-6" style={{ alignItems: 'flex-start' }}>
        {/* Left: Module + Lessons */}
        <div className="flex-1 min-w-0 space-y-3">
          {modules.length === 0 && (
            <div className="glass-card rounded-[8px] p-8 text-center" style={{ background: 'var(--card-bg)' }}>
              <Icon name="book" size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, color: 'var(--text-sec)' }}>Noch keine Module. Erstelle dein erstes Modul.</p>
            </div>
          )}

          {modules.map((mod, mi) => (
            <div key={mod.id} className="glass-card rounded-[8px] overflow-hidden" style={{ background: 'var(--card-bg)' }}>
              {/* Module Header */}
              <div
                className="flex items-center gap-3 px-5 py-3.5 cursor-pointer"
                style={{ borderBottom: expandedModules.has(mod.id) ? '1px solid var(--divider-l)' : 'none' }}
                onClick={() => toggleModule(mod.id)}
              >
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, minWidth: 24 }}>
                  {mi + 1}.
                </span>
                {editingModuleId === mod.id ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleSaveModuleTitle(mod.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveModuleTitle(mod.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 py-1 px-2 rounded text-sm font-body outline-none"
                    style={inputStyle}
                  />
                ) : (
                  <span
                    className="flex-1 text-sm font-medium"
                    style={{ color: 'var(--text-h)' }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingModuleId(mod.id);
                      setEditValue(mod.title);
                    }}
                  >
                    {mod.title}
                  </span>
                )}
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {mod.lessons?.length ?? 0} Lektionen
                </span>
                <div className="flex items-center gap-0.5">
                  {mi > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); const n = [...modules]; [n[mi-1],n[mi]] = [n[mi],n[mi-1]]; setModules(n); updateModule(mod.id, { sort_order: mi - 1 }).catch(()=>{}); updateModule(modules[mi-1].id, { sort_order: mi }).catch(()=>{}); }}
                      className="cursor-pointer border-none" style={{ background: 'none', padding: 3 }} title="Nach oben"
                    >
                      <Icon name="chevron-right" size={12} style={{ color: 'var(--text-muted)', transform: 'rotate(-90deg)' }} />
                    </button>
                  )}
                  {mi < modules.length - 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); const n = [...modules]; [n[mi],n[mi+1]] = [n[mi+1],n[mi]]; setModules(n); updateModule(mod.id, { sort_order: mi + 1 }).catch(()=>{}); updateModule(modules[mi+1].id, { sort_order: mi }).catch(()=>{}); }}
                      className="cursor-pointer border-none" style={{ background: 'none', padding: 3 }} title="Nach unten"
                    >
                      <Icon name="chevron-down" size={12} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingModuleId(mod.id); setEditValue(mod.title); }}
                    className="cursor-pointer border-none"
                    style={{ background: 'none', padding: 3 }}
                    title="Umbenennen"
                  >
                    <Icon name="pencil" size={12} style={{ color: 'var(--text-muted)' }} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod.id); }}
                    className="cursor-pointer border-none"
                    style={{ background: 'none', padding: 3 }}
                    title="Loeschen"
                  >
                    <Icon name="trash" size={12} style={{ color: 'var(--danger, #A85454)' }} />
                  </button>
                </div>
                <Icon
                  name="chevron-right"
                  size={14}
                  style={{
                    color: 'var(--text-muted)',
                    transform: expandedModules.has(mod.id) ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}
                />
              </div>

              {/* Lessons */}
              {expandedModules.has(mod.id) && (
                <div className="px-5 py-2">
                  {(mod.lessons ?? []).map((lesson, li) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 py-2.5 transition-all cursor-pointer"
                      style={{
                        borderBottom: li < (mod.lessons?.length ?? 0) - 1 ? '1px solid var(--divider-l)' : 'none',
                        border: dragOverLessonId === lesson.id ? '2px dashed var(--gold)' : undefined,
                        borderRadius: dragOverLessonId === lesson.id ? 8 : undefined,
                        padding: dragOverLessonId === lesson.id ? '8px' : undefined,
                        background: selectedLessonId === lesson.id ? 'var(--gold-bg)' : undefined,
                      }}
                      onClick={() => setSelectedLessonId(lesson.id === selectedLessonId ? null : lesson.id)}
                      onDragOver={(e) => { e.preventDefault(); setDragOverLessonId(lesson.id); }}
                      onDragLeave={() => setDragOverLessonId(null)}
                      onDrop={(e) => handleLessonDrop(e, lesson.id, mod.id)}
                    >
                      {/* Thumbnail */}
                      <div style={{ position: 'relative' }}>
                        <LessonThumbnail
                          contentType={lesson.content_type}
                          contentUrl={lesson.content_url}
                          title={lesson.title}
                          size="sm"
                        />
                        {uploadingLessonId === lesson.id && (
                          <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
                            borderRadius: '0 0 8px 8px', overflow: 'hidden',
                            background: 'var(--glass)',
                          }}>
                            <div style={{
                              height: '100%', width: `${uploadProgress}%`,
                              background: 'linear-gradient(90deg, var(--gold-deep), var(--gold))',
                              transition: 'width 0.3s',
                            }} />
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', minWidth: 32 }}>
                        {mi + 1}.{li + 1}
                      </span>
                      {editingLessonId === lesson.id ? (
                        <input
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleSaveLessonTitle(lesson.id, mod.id)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveLessonTitle(lesson.id, mod.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 py-1 px-2 rounded text-sm font-body outline-none"
                          style={inputStyle}
                        />
                      ) : (
                        <span
                          className="flex-1 text-sm"
                          style={{ color: 'var(--text-sec)' }}
                          onDoubleClick={(e) => { e.stopPropagation(); setEditingLessonId(lesson.id); setEditValue(lesson.title); }}
                        >
                          {lesson.title}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: 8, letterSpacing: '1px', textTransform: 'uppercase',
                          padding: '2px 8px', borderRadius: 8,
                          background: 'var(--glass)', color: 'var(--text-muted)',
                          border: '1px solid var(--glass-border)',
                        }}
                      >
                        {CONTENT_TYPE_LABELS[lesson.content_type] ?? lesson.content_type}
                      </span>
                      {lesson.duration_seconds != null && lesson.duration_seconds > 0 && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {Math.floor(lesson.duration_seconds / 60)}:{String(lesson.duration_seconds % 60).padStart(2, '0')}
                        </span>
                      )}
                      {/* Upload Button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); triggerUpload(lesson.id, mod.id, lesson.content_type); }}
                        className="cursor-pointer border-none transition-all"
                        style={{
                          background: lesson.content_url ? 'none' : 'var(--gold-bg)',
                          padding: lesson.content_url ? 2 : '2px 8px',
                          borderRadius: 8,
                          border: lesson.content_url ? 'none' : '1px solid var(--gold-border-s)',
                          display: 'flex', alignItems: 'center', gap: 3,
                        }}
                        title={lesson.content_url ? 'Datei ersetzen' : 'Datei hochladen'}
                      >
                        <Icon name="arrow-forward-up" size={11} style={{ color: lesson.content_url ? 'var(--text-muted)' : 'var(--gold-text)' }} />
                        {!lesson.content_url && (
                          <span style={{ fontSize: 8, color: 'var(--gold-text)', letterSpacing: '0.5px' }}>Upload</span>
                        )}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleTogglePreview(lesson.id, mod.id, lesson.is_preview); }}
                        className="cursor-pointer border-none"
                        style={{ background: 'none', padding: 2 }}
                        title={lesson.is_preview ? 'Vorschau deaktivieren' : 'Als Vorschau markieren'}
                      >
                        <Icon
                          name={(lesson.is_preview ? 'star-filled' : 'star') as IconName}
                          size={12}
                          style={{ color: lesson.is_preview ? 'var(--gold)' : 'var(--text-muted)' }}
                        />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingLessonId(lesson.id); setEditValue(lesson.title); }}
                        className="cursor-pointer border-none"
                        style={{ background: 'none', padding: 2 }}
                      >
                        <Icon name="pencil" size={11} style={{ color: 'var(--text-muted)' }} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson.id, mod.id); }}
                        className="cursor-pointer border-none"
                        style={{ background: 'none', padding: 2 }}
                      >
                        <Icon name="trash" size={11} style={{ color: 'var(--danger, #A85454)' }} />
                      </button>
                    </div>
                  ))}

                  {/* Add Lesson */}
                  {addingLessonToModule === mod.id ? (
                    <div className="py-2 space-y-2">
                      <div className="flex gap-1 flex-wrap">
                        {LESSON_TYPES.map((lt) => (
                          <button
                            key={lt.key}
                            onClick={() => setAddingLessonType(lt.key)}
                            className="flex items-center gap-1 cursor-pointer border-none transition-all"
                            style={{
                              padding: '4px 10px', borderRadius: 8, fontSize: 9, letterSpacing: '0.5px',
                              background: addingLessonType === lt.key ? 'var(--gold-bg)' : 'var(--glass)',
                              color: addingLessonType === lt.key ? 'var(--gold-text)' : 'var(--text-muted)',
                              border: `1px solid ${addingLessonType === lt.key ? 'var(--gold-border-s)' : 'var(--glass-border)'}`,
                            }}
                          >
                            <Icon name={lt.icon} size={10} />
                            {lt.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={addingLessonTitle}
                          onChange={(e) => setAddingLessonTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddLesson(mod.id)}
                          placeholder="Lektion-Titel ..."
                          className="flex-1 py-1.5 px-3 rounded-[8px] text-sm font-body outline-none"
                          style={inputStyle}
                        />
                        <button
                          onClick={() => handleAddLesson(mod.id)}
                          className="cursor-pointer border-none"
                          style={{ padding: '4px 12px', borderRadius: 8, background: 'var(--gold-bg)', color: 'var(--gold-text)', fontSize: 11 }}
                        >
                          Hinzufuegen
                        </button>
                        <button
                          onClick={() => { setAddingLessonToModule(null); setAddingLessonTitle(''); setAddingLessonType('text'); }}
                          className="cursor-pointer border-none"
                          style={{ background: 'none', padding: 4, color: 'var(--text-muted)' }}
                        >
                          <Icon name="x" size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAddingLessonToModule(mod.id); setAddingLessonTitle(''); }}
                      className="flex items-center gap-1.5 cursor-pointer border-none w-full py-2"
                      style={{ background: 'none', color: 'var(--gold-text)', fontSize: 11, letterSpacing: '0.5px' }}
                    >
                      <Icon name="plus" size={12} />
                      Lektion hinzufuegen
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Add Module */}
          <div className="flex items-center gap-2">
            <input
              value={addingModuleTitle}
              onChange={(e) => setAddingModuleTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
              placeholder="Neues Modul ..."
              className="flex-1 py-2.5 px-4 rounded-[8px] text-sm font-body outline-none"
              style={inputStyle}
            />
            <button
              onClick={handleAddModule}
              disabled={!addingModuleTitle.trim()}
              className="cursor-pointer border-none transition-all duration-200"
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                background: addingModuleTitle.trim() ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))' : 'var(--glass)',
                color: addingModuleTitle.trim() ? 'var(--text-on-gold)' : 'var(--text-muted)',
                fontSize: 11,
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              + Modul
            </button>
          </div>
        </div>

        {/* Right: Detail Panel */}
        {selectedLesson && (
          <div
            className="glass-card rounded-[8px] p-5 space-y-4"
            style={{
              width: 380, flexShrink: 0, position: 'sticky', top: 16,
              background: 'var(--card-bg)', border: '1px solid var(--glass-border)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-label" style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Lektion bearbeiten
              </h3>
              <button
                onClick={() => setSelectedLessonId(null)}
                className="cursor-pointer border-none"
                style={{ background: 'none', padding: 2 }}
              >
                <Icon name="x" size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            {/* Large Thumbnail / Preview */}
            {selectedLesson.lesson.content_url ? (
              <div className="rounded-[8px] overflow-hidden" style={{ background: '#000' }}>
                {selectedLesson.lesson.content_type === 'video' && (
                  <video
                    src={selectedLesson.lesson.content_url}
                    controls
                    className="w-full"
                    style={{ maxHeight: 200 }}
                  />
                )}
                {selectedLesson.lesson.content_type === 'audio' && (
                  <div className="p-4" style={{ background: 'var(--glass)' }}>
                    <audio src={selectedLesson.lesson.content_url} controls className="w-full" />
                  </div>
                )}
                {selectedLesson.lesson.content_type === 'pdf' && (
                  <div className="p-4 text-center" style={{ background: 'var(--glass)' }}>
                    <Icon name="file-text" size={32} style={{ color: '#D44638', margin: '0 auto 8px' }} />
                    <a
                      href={selectedLesson.lesson.content_url}
                      target="_blank"
                      rel="noopener"
                      style={{ fontSize: 11, color: 'var(--gold-text)', textDecoration: 'underline' }}
                    >
                      PDF oeffnen
                    </a>
                  </div>
                )}
                {!['video', 'audio', 'pdf'].includes(selectedLesson.lesson.content_type) && (
                  <div className="p-4 text-center" style={{ background: 'var(--glass)' }}>
                    <LessonThumbnail
                      contentType={selectedLesson.lesson.content_type}
                      contentUrl={selectedLesson.lesson.content_url}
                      title={selectedLesson.lesson.title}
                      size="lg"
                    />
                  </div>
                )}
              </div>
            ) : (
              /* Upload Zone */
              <div
                className="rounded-[8px] text-center py-8 cursor-pointer transition-all"
                style={{
                  border: '2px dashed var(--gold-border-s)',
                  background: 'var(--glass)',
                }}
                onClick={() => triggerUpload(selectedLesson.lesson.id, selectedLesson.moduleId, selectedLesson.lesson.content_type)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleLessonDrop(e, selectedLesson.lesson.id, selectedLesson.moduleId)}
              >
                <Icon name="arrow-forward-up" size={32} style={{ color: 'var(--gold)', margin: '0 auto 8px' }} />
                <div style={{ fontSize: 12, color: 'var(--text-sec)', marginBottom: 4 }}>
                  Datei hierher ziehen
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  oder klicken zum Auswaehlen
                </div>
              </div>
            )}

            {/* Replace file button if already uploaded */}
            {selectedLesson.lesson.content_url && (
              <button
                onClick={() => triggerUpload(selectedLesson.lesson.id, selectedLesson.moduleId, selectedLesson.lesson.content_type)}
                className="w-full flex items-center justify-center gap-2 cursor-pointer border-none transition-all"
                style={{
                  padding: '8px', borderRadius: 8,
                  background: 'var(--glass)', border: '1px solid var(--glass-border)',
                  fontSize: 10, color: 'var(--text-muted)',
                }}
              >
                <Icon name="arrow-forward-up" size={12} />
                Datei ersetzen
              </button>
            )}

            {/* Form Fields */}
            <div>
              <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                Titel
              </label>
              <input
                value={detailForm.title}
                onChange={(e) => setDetailForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full py-2 px-3 rounded-[8px] text-sm font-body outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                Beschreibung
              </label>
              <textarea
                value={detailForm.description}
                onChange={(e) => setDetailForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full py-2 px-3 rounded-[8px] text-sm font-body outline-none resize-none"
                style={inputStyle}
                placeholder="Optional: Beschreibe diese Lektion ..."
              />
            </div>
            <div>
              <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                Dauer (Minuten)
              </label>
              <input
                type="number"
                value={detailForm.duration_minutes || ''}
                onChange={(e) => setDetailForm((f) => ({ ...f, duration_minutes: parseInt(e.target.value) || 0 }))}
                placeholder="z.B. 15"
                className="w-full py-2 px-3 rounded-[8px] text-sm font-body outline-none"
                style={inputStyle}
              />
            </div>

            {/* Preview Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={detailForm.is_preview}
                onChange={(e) => setDetailForm((f) => ({ ...f, is_preview: e.target.checked }))}
                style={{ accentColor: 'var(--gold)' }}
              />
              <span style={{ fontSize: 11, color: 'var(--text-sec)' }}>Als Vorschau markieren (kostenlos sichtbar)</span>
            </label>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleSaveDetail}
                disabled={saving}
                className="flex-1 py-2.5 rounded-full cursor-pointer border-none transition-all"
                style={{
                  background: saving ? 'var(--gold-bg)' : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                  color: saving ? 'var(--text-muted)' : 'var(--text-on-gold)',
                  fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase',
                }}
              >
                {saving ? 'Speichert ...' : 'Speichern'}
              </button>
              <button
                onClick={() => {
                  if (confirm('Lektion wirklich loeschen?')) {
                    handleDeleteLesson(selectedLesson.lesson.id, selectedLesson.moduleId);
                    setSelectedLessonId(null);
                  }
                }}
                className="flex items-center justify-center cursor-pointer border-none"
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  background: 'var(--glass)', border: '1px solid var(--glass-border)',
                }}
                title="Lektion loeschen"
              >
                <Icon name="trash" size={14} style={{ color: 'var(--danger, #A85454)' }} />
              </button>
            </div>
          </div>
        )}
        </div>
      )}

      {/* ── Tab: Teilnehmer ───────────────────────────────── */}
      {activeTab === 'participants' && (
        <div className="space-y-4">
          <div className="glass-card rounded-[8px] p-5" style={{ background: 'var(--card-bg)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-label" style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {enrollments.length} Teilnehmer
              </h3>
            </div>
            {enrollments.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="users" size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, color: 'var(--text-sec)', fontStyle: 'italic' }}>Noch keine Teilnehmer eingeschrieben.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {enrollments.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid var(--divider-l)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
                      {e.user?.avatar_url ? (
                        <img src={e.user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <Icon name="user" size={14} style={{ color: 'var(--text-muted)' }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <span style={{ fontSize: 13, color: 'var(--text-h)' }}>{e.user?.display_name ?? 'Unbekannt'}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {e.status === 'completed' ? 'Abgeschlossen' : e.status === 'paused' ? 'Pausiert' : 'Aktiv'}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                          Seit {new Date(e.enrolled_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                    {/* Fortschrittsbalken */}
                    <div className="flex items-center gap-2" style={{ minWidth: 120 }}>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--glass)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${e.progress_percent}%`, background: e.progress_percent === 100 ? 'var(--success)' : 'linear-gradient(90deg, var(--gold-deep), var(--gold))' }} />
                      </div>
                      <span style={{ fontSize: 11, color: e.progress_percent === 100 ? 'var(--success)' : 'var(--gold-text)', fontWeight: 500, minWidth: 32, textAlign: 'right' }}>
                        {e.progress_percent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Bewertungen ───────────────────────────────── */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {/* Rating Overview */}
          <div className="glass-card rounded-[8px] p-5" style={{ background: 'var(--card-bg)' }}>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div style={{ fontSize: 36, fontWeight: 500, color: 'var(--gold-text)' }}>
                  {course.rating_avg > 0 ? course.rating_avg.toFixed(1) : '–'}
                </div>
                <div className="flex gap-0.5 justify-center my-1">
                  {[1,2,3,4,5].map((s) => (
                    <Icon key={s} name="star" size={14} style={{ color: s <= Math.round(course.rating_avg) ? 'var(--gold)' : 'var(--glass-border)' }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{course.rating_count} Bewertungen</span>
              </div>
              <div className="flex-1 space-y-1">
                {[5,4,3,2,1].map((star) => {
                  const count = DEMO_REVIEWS.filter((r) => r.rating === star).length;
                  const pct = DEMO_REVIEWS.length > 0 ? (count / DEMO_REVIEWS.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 12 }}>{star}</span>
                      <Icon name="star" size={10} style={{ color: 'var(--gold)' }} />
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--glass)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--gold-deep), var(--gold))' }} />
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', minWidth: 20, textAlign: 'right' }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-2">
            {DEMO_REVIEWS.map((review) => (
              <div key={review.id} className="glass-card rounded-[8px] p-4" style={{ background: 'var(--card-bg)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
                    <Icon name="user" size={12} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div className="flex-1">
                    <span style={{ fontSize: 13, color: 'var(--text-h)', fontWeight: 500 }}>{review.userName}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 8 }}>
                      {new Date(review.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Icon key={s} name="star" size={11} style={{ color: s <= review.rating ? 'var(--gold)' : 'var(--glass-border)' }} />
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: 13, lineHeight: '1.6', color: 'var(--text-sec)' }}>{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: Analytics ──────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([
              { label: 'Einschreibungen', value: DEMO_ANALYTICS.enrollmentsThisMonth, sub: `+${DEMO_ANALYTICS.enrollmentsThisMonth - DEMO_ANALYTICS.enrollmentsLastMonth} vs. letzter Monat`, icon: 'users' as IconName },
              { label: 'Abschlussrate', value: `${DEMO_ANALYTICS.completionRate}%`, sub: 'Durchschnitt', icon: 'trophy' as IconName },
              { label: 'Ø pro Lektion', value: `${DEMO_ANALYTICS.avgTimePerLesson} Min`, sub: 'Verweildauer', icon: 'clock' as IconName },
              { label: 'Umsatz/Monat', value: `${(DEMO_ANALYTICS.revenueThisMonth / 100).toFixed(0)} €`, sub: 'Aktueller Monat', icon: 'wallet' as IconName },
            ]).map((kpi) => (
              <div key={kpi.label} className="glass-card rounded-[8px] p-4 text-center" style={{ background: 'var(--card-bg)' }}>
                <Icon name={kpi.icon} size={18} style={{ color: 'var(--gold)', margin: '0 auto 6px' }} />
                <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-h)' }}>{kpi.value}</div>
                <div style={{ fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 2 }}>{kpi.label}</div>
                <div style={{ fontSize: 10, color: 'var(--gold-text)', marginTop: 2 }}>{kpi.sub}</div>
              </div>
            ))}
          </div>

          {/* Abbruchpunkte */}
          <div className="glass-card rounded-[8px] p-5" style={{ background: 'var(--card-bg)' }}>
            <h3 className="font-label mb-4" style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Abbruchpunkte — Wo brechen Teilnehmer ab?
            </h3>
            <div className="space-y-3">
              {DEMO_ANALYTICS.dropoffModules.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span style={{ fontSize: 12, color: 'var(--text-sec)', minWidth: 80 }}>{m.name}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--glass)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${m.percent}%`,
                        background: m.percent > 70 ? 'var(--success)' : m.percent > 40 ? 'linear-gradient(90deg, var(--gold-deep), var(--gold))' : 'var(--danger, #A85454)',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: m.percent > 70 ? 'var(--success)' : m.percent > 40 ? 'var(--gold-text)' : 'var(--danger, #A85454)', minWidth: 36, textAlign: 'right' }}>
                    {m.percent}%
                  </span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12, fontStyle: 'italic' }}>
              Tipp: Modul 3 und 4 haben hohe Abbruchraten. Pruefe ob sie zu lang oder zu komplex sind.
            </p>
          </div>
        </div>
      )}

      {/* ── Tab: Einstellungen ───────────────────────────── */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          {/* Status */}
          <div className="glass-card rounded-[8px] p-5" style={{ background: 'var(--card-bg)' }}>
            <h3
              className="font-label mb-3"
              style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}
            >
              Status
            </h3>
            <div className="flex gap-2">
              {(['draft', 'active', 'archived'] as CourseStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className="flex-1 py-2 rounded-full cursor-pointer border-none transition-all duration-200"
                  style={{
                    fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase',
                    background: course.status === s ? 'var(--gold-bg)' : 'transparent',
                    color: course.status === s ? 'var(--gold-text)' : 'var(--text-muted)',
                    border: course.status === s ? '1px solid var(--gold-border-s)' : '1px solid var(--divider)',
                  }}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Grunddaten */}
          <div className="glass-card rounded-[8px] p-5" style={{ background: 'var(--card-bg)' }}>
            <h3
              className="font-label mb-4"
              style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}
            >
              Grunddaten
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                  Titel
                </label>
                <input
                  value={form.title ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full py-2.5 px-4 rounded-[8px] text-sm font-body outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                  Beschreibung
                </label>
                <textarea
                  value={form.description ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={4}
                  className="w-full py-2.5 px-4 rounded-[8px] text-sm font-body outline-none resize-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                  Kategorie
                </label>
                <div className="flex gap-2">
                  {(['online', 'offline', 'recurring', 'live'] as CourseCategory[]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setForm((f) => ({ ...f, category: cat }))}
                      className="flex-1 py-2 rounded-full cursor-pointer border-none transition-all duration-200"
                      style={{
                        fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase',
                        background: form.category === cat ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))' : 'transparent',
                        color: form.category === cat ? 'var(--text-on-gold)' : 'var(--text-muted)',
                        border: form.category === cat ? 'none' : '1px solid var(--divider)',
                      }}
                    >
                      {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preis & Preismodell */}
          <div className="glass-card rounded-[8px] p-5" style={{ background: 'var(--card-bg)' }}>
            <h3 className="font-label mb-4" style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Preismodell
            </h3>
            <div className="flex gap-2 mb-4">
              {([
                { key: 0, label: 'Kostenlos', icon: 'gift' as IconName },
                { key: -1, label: 'Einmalkauf', icon: 'wallet' as IconName },
                { key: -2, label: 'Seeds', icon: 'seedling' as IconName },
              ]).map((pm) => {
                const isActive = pm.key === 0 ? (form.price_cents ?? 0) === 0 : pm.key === -1 ? (form.price_cents ?? 0) > 0 : false;
                return (
                  <button
                    key={pm.key}
                    onClick={() => pm.key === 0 ? setForm((f) => ({ ...f, price_cents: 0 })) : undefined}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full cursor-pointer border-none transition-all"
                    style={{
                      fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase',
                      background: isActive ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))' : 'transparent',
                      color: isActive ? 'var(--text-on-gold)' : 'var(--text-muted)',
                      border: isActive ? 'none' : '1px solid var(--divider)',
                    }}
                  >
                    <Icon name={pm.icon} size={12} />
                    {pm.label}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Preis (€)</label>
                <input
                  type="number"
                  value={form.price_cents ? (form.price_cents / 100).toFixed(0) : '0'}
                  onChange={(e) => setForm((f) => ({ ...f, price_cents: Math.round(parseFloat(e.target.value || '0') * 100) }))}
                  className="w-full py-2.5 px-4 rounded-[8px] text-sm font-body outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Max. Teilnehmer</label>
                <input
                  type="number"
                  value={form.max_participants ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, max_participants: parseInt(e.target.value) || undefined }))}
                  placeholder="Unbegrenzt"
                  className="w-full py-2.5 px-4 rounded-[8px] text-sm font-body outline-none"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Drip Content */}
          <div className="glass-card rounded-[8px] p-5" style={{ background: 'var(--card-bg)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-label" style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Drip Content — Zeitgesteuerte Freischaltung
              </h3>
              <button
                onClick={() => setForm((f) => ({ ...f, drip_interval: f.drip_interval ? '' : '7 days' }))}
                className="cursor-pointer border-none"
                style={{
                  padding: '4px 12px', borderRadius: 16, fontSize: 10,
                  background: form.drip_interval ? 'var(--gold-bg)' : 'var(--glass)',
                  color: form.drip_interval ? 'var(--gold-text)' : 'var(--text-muted)',
                  border: `1px solid ${form.drip_interval ? 'var(--gold-border-s)' : 'var(--glass-border)'}`,
                }}
              >
                {form.drip_interval ? 'Aktiv' : 'Deaktiviert'}
              </button>
            </div>
            {form.drip_interval && (
              <div>
                <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                  Intervall zwischen Modulen
                </label>
                <div className="flex gap-2">
                  {['3 days', '7 days', '14 days', '30 days'].map((iv) => (
                    <button
                      key={iv}
                      onClick={() => setForm((f) => ({ ...f, drip_interval: iv }))}
                      className="flex-1 py-2 rounded-full cursor-pointer border-none transition-all"
                      style={{
                        fontSize: 10,
                        background: form.drip_interval === iv ? 'var(--gold-bg)' : 'transparent',
                        color: form.drip_interval === iv ? 'var(--gold-text)' : 'var(--text-muted)',
                        border: form.drip_interval === iv ? '1px solid var(--gold-border-s)' : '1px solid var(--divider)',
                      }}
                    >
                      {iv.replace(' days', ' Tage')}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>
                  Module werden nacheinander freigeschaltet — Modul 2 wird {form.drip_interval?.replace(' days', ' Tage')} nach Einschreibung verfuegbar.
                </p>
              </div>
            )}
          </div>

          {/* Zertifikat (Feature 9) */}
          <div className="glass-card rounded-[8px] p-5" style={{ background: 'var(--card-bg)' }}>
            <h3 className="font-label mb-3" style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Abschluss-Zertifikat
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-sec)', marginBottom: 12 }}>
              Teilnehmer erhalten nach 100% Abschluss ein PDF-Zertifikat mit Souleya-Branding.
            </p>
            <div className="flex items-center gap-3 mb-3">
              <button
                className="cursor-pointer border-none transition-all"
                style={{
                  padding: '4px 14px', borderRadius: 16, fontSize: 10,
                  background: 'var(--gold-bg)', color: 'var(--gold-text)',
                  border: '1px solid var(--gold-border-s)',
                }}
              >
                Aktiviert
              </button>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Zertifikat wird automatisch bei 100% Abschluss angeboten
              </span>
            </div>

            {/* Zertifikat-Vorschau */}
            <div
              className="rounded-[8px] p-6 text-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(200,169,110,.08), rgba(200,169,110,.03))',
                border: '2px solid rgba(200,169,110,.2)',
                minHeight: 180,
              }}
            >
              {/* Dekoratives Enso */}
              <div style={{ position: 'absolute', top: 12, left: 12, opacity: 0.08 }}>
                <svg viewBox="0 0 100 100" width="60" height="60">
                  <circle cx="50" cy="50" r="36" fill="none" stroke="var(--gold)" strokeWidth="8" strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15" />
                </svg>
              </div>
              <div style={{ position: 'absolute', bottom: 12, right: 12, opacity: 0.08 }}>
                <svg viewBox="0 0 100 100" width="60" height="60">
                  <circle cx="50" cy="50" r="36" fill="none" stroke="var(--gold)" strokeWidth="8" strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15" />
                </svg>
              </div>

              <div style={{ fontSize: 8, letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>
                Souleya Zertifikat
              </div>
              <div className="font-heading text-lg italic" style={{ color: 'var(--text-h)', marginBottom: 4 }}>
                {course.title}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-sec)', marginBottom: 16 }}>
                Erfolgreich abgeschlossen von
              </div>
              <div className="font-heading text-xl italic" style={{ color: 'var(--gold-text)', marginBottom: 16 }}>
                [Teilnehmername]
              </div>
              <div style={{ width: 60, height: 1, background: 'var(--gold)', margin: '0 auto 12px', opacity: 0.3 }} />
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center', fontStyle: 'italic' }}>
              Vorschau — Das Zertifikat wird als PDF mit Souleya-Branding generiert
            </p>
          </div>

          {/* Speichern + Loeschen */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex-1 py-3 rounded-full cursor-pointer border-none transition-all duration-200"
              style={{
                background: saving ? 'var(--gold-bg)' : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                color: saving ? 'var(--text-muted)' : 'var(--text-on-gold)',
                fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase',
              }}
            >
              {saving ? 'Wird gespeichert ...' : 'Einstellungen speichern'}
            </button>
            <button
              onClick={handleDeleteCourse}
              className="flex items-center justify-center cursor-pointer border-none transition-all duration-200"
              style={{
                width: 44, height: 44, borderRadius: 22,
                background: 'var(--glass)', border: '1px solid var(--glass-border)',
              }}
              title="Kurs loeschen"
            >
              <Icon name="trash" size={16} style={{ color: 'var(--danger, #A85454)' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
