'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import {
  fetchCourse, updateCourse, deleteCourse,
  fetchModules, createModule, updateModule, deleteModule,
  createLesson, updateLesson, deleteLesson,
} from '@/lib/studio';
import type {
  Course, CourseModule, CourseLesson, UpdateCourseData,
  CourseCategory, CourseStatus,
} from '@/types/studio';
import type { IconName } from '@/components/ui/Icon';

type Tab = 'overview' | 'curriculum' | 'settings';

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

  const loadCourse = useCallback(async () => {
    try {
      const [c, m] = await Promise.all([
        fetchCourse(courseId),
        fetchModules(courseId),
      ]);
      setCourse(c);
      setModules(m);
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
        content_type: 'text',
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
      <div className="flex gap-1 mb-6" style={{ borderBottom: '1px solid var(--divider-l)' }}>
        {([
          { key: 'overview' as Tab, label: 'Uebersicht', icon: 'info' as IconName },
          { key: 'curriculum' as Tab, label: `Curriculum (${modules.length} Module, ${totalLessons} Lektionen)`, icon: 'book' as IconName },
          { key: 'settings' as Tab, label: 'Einstellungen', icon: 'edit' as IconName },
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
        <div className="space-y-4 max-w-2xl">
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
        </div>
      )}

      {/* ── Tab: Curriculum ──────────────────────────────── */}
      {activeTab === 'curriculum' && (
        <div className="max-w-2xl space-y-3">
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
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingModuleId(mod.id); setEditValue(mod.title); }}
                    className="cursor-pointer border-none"
                    style={{ background: 'none', padding: 4 }}
                    title="Umbenennen"
                  >
                    <Icon name="pencil" size={12} style={{ color: 'var(--text-muted)' }} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod.id); }}
                    className="cursor-pointer border-none"
                    style={{ background: 'none', padding: 4 }}
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
                      className="flex items-center gap-3 py-2.5"
                      style={{ borderBottom: li < (mod.lessons?.length ?? 0) - 1 ? '1px solid var(--divider-l)' : 'none' }}
                    >
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
                          className="flex-1 py-1 px-2 rounded text-sm font-body outline-none"
                          style={inputStyle}
                        />
                      ) : (
                        <span
                          className="flex-1 text-sm"
                          style={{ color: 'var(--text-sec)' }}
                          onDoubleClick={() => { setEditingLessonId(lesson.id); setEditValue(lesson.title); }}
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
                      <button
                        onClick={() => handleTogglePreview(lesson.id, mod.id, lesson.is_preview)}
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
                        onClick={() => { setEditingLessonId(lesson.id); setEditValue(lesson.title); }}
                        className="cursor-pointer border-none"
                        style={{ background: 'none', padding: 2 }}
                      >
                        <Icon name="pencil" size={11} style={{ color: 'var(--text-muted)' }} />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id, mod.id)}
                        className="cursor-pointer border-none"
                        style={{ background: 'none', padding: 2 }}
                      >
                        <Icon name="trash" size={11} style={{ color: 'var(--danger, #A85454)' }} />
                      </button>
                    </div>
                  ))}

                  {/* Add Lesson */}
                  {addingLessonToModule === mod.id ? (
                    <div className="flex items-center gap-2 py-2">
                      <input
                        autoFocus
                        value={addingLessonTitle}
                        onChange={(e) => setAddingLessonTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddLesson(mod.id)}
                        placeholder="Lektion-Titel ..."
                        className="flex-1 py-1.5 px-3 rounded text-sm font-body outline-none"
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
                        onClick={() => { setAddingLessonToModule(null); setAddingLessonTitle(''); }}
                        className="cursor-pointer border-none"
                        style={{ background: 'none', padding: 4, color: 'var(--text-muted)' }}
                      >
                        <Icon name="x" size={14} />
                      </button>
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
      )}

      {/* ── Tab: Einstellungen ───────────────────────────── */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-4">
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

          {/* Preis */}
          <div className="glass-card rounded-[8px] p-5" style={{ background: 'var(--card-bg)' }}>
            <h3
              className="font-label mb-4"
              style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}
            >
              Preis & Teilnehmer
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                  Preis (Cent)
                </label>
                <input
                  type="number"
                  value={form.price_cents ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, price_cents: parseInt(e.target.value) || 0 }))}
                  className="w-full py-2.5 px-4 rounded-[8px] text-sm font-body outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                  Max. Teilnehmer
                </label>
                <input
                  type="number"
                  value={form.max_participants ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, max_participants: parseInt(e.target.value) || undefined }))}
                  placeholder="Unbegrenzt"
                  className="w-full py-2.5 px-4 rounded-[8px] text-sm font-body outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                  Drip Interval
                </label>
                <input
                  value={form.drip_interval ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, drip_interval: e.target.value }))}
                  placeholder="z.B. 7 days"
                  className="w-full py-2.5 px-4 rounded-[8px] text-sm font-body outline-none"
                  style={inputStyle}
                />
              </div>
            </div>
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
