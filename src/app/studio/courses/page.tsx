'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { fetchCourses, createCourse, deleteCourse, updateCourse } from '@/lib/studio';
import type { Course, CourseCategory } from '@/types/studio';

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

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [creating, setCreating] = useState(searchParams.get('create') === '1');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CourseCategory>('online');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newMaxParticipants, setNewMaxParticipants] = useState('');
  const [newCoverUrl, setNewCoverUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await fetchCourses({ status: statusFilter || undefined });
      setCourses(res.data);
    } catch {
      setCourses([]);
    }
    setLoading(false);
  };

  useEffect(() => { loadCourses(); }, [statusFilter]);

  useEffect(() => {
    if (searchParams.get('create') === '1') setCreating(true);
  }, [searchParams]);

  const handleToggleStatus = async (course: Course) => {
    const newStatus = course.status === 'active' ? 'draft' : 'active';
    try {
      await updateCourse(course.id, { status: newStatus });
      loadCourses();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Kurs wirklich loeschen?')) return;
    try {
      await deleteCourse(id);
      loadCourses();
    } catch {}
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      const course = await createCourse({
        title: newTitle.trim(),
        category: newCategory,
        description: newDescription.trim() || undefined,
        price_cents: newPrice ? Math.round(parseFloat(newPrice) * 100) : undefined,
        max_participants: newMaxParticipants ? parseInt(newMaxParticipants) : undefined,
        cover_url: newCoverUrl || undefined,
      });
      setCreating(false);
      setNewTitle('');
      setNewDescription('');
      setNewPrice('');
      setNewMaxParticipants('');
      setNewCoverUrl('');
      router.replace('/studio/courses');
      router.push(`/studio/courses/${course.id}`);
    } catch {
      alert('Kurs konnte nicht erstellt werden.');
    }
    setSaving(false);
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--glass)',
    border: '1px solid var(--gold-border-s)',
    color: 'var(--text-h)',
    borderRadius: 8,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Meine Kurse
        </h2>
        <div className="flex gap-2">
          {!creating && (
            <button
              onClick={() => setCreating(true)}
              className="border-none cursor-pointer transition-all duration-200 flex items-center gap-1.5"
              style={{
                padding: '6px 14px', borderRadius: 9999, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase',
                background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                color: 'var(--text-on-gold)',
              }}
            >
              <Icon name="plus" size={12} />
              Neuer Kurs
            </button>
          )}
          {['', 'draft', 'active', 'archived'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="border-none cursor-pointer transition-all duration-200"
              style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase',
                background: statusFilter === s ? 'var(--gold-bg)' : 'var(--glass)',
                color: statusFilter === s ? 'var(--gold-text)' : 'var(--text-muted)',
                border: statusFilter === s ? '1px solid var(--gold-border-s)' : '1px solid var(--glass-border)',
              }}
            >
              {s === '' ? 'Alle' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Create Form */}
      {creating && (
        <div className="glass-card rounded-[8px] p-5 mb-6" style={{ background: 'var(--card-bg)', border: '1.5px solid var(--gold-border)' }}>
          <h3 style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold-text)', marginBottom: 16 }}>
            Neuen Kurs erstellen
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Cover */}
            <div>
              <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                Cover-Bild (optional)
              </label>
              {newCoverUrl ? (
                <div className="relative rounded-[8px] overflow-hidden" style={{ height: 160 }}>
                  <img src={newCoverUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setNewCoverUrl('')}
                    className="absolute top-2 right-2 cursor-pointer border-none"
                    style={{ width: 24, height: 24, borderRadius: 12, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Icon name="x" size={12} style={{ color: '#fff' }} />
                  </button>
                </div>
              ) : (
                <div className="rounded-[8px] p-6 text-center" style={{ border: '2px dashed var(--gold-border-s)', background: 'var(--glass)' }}>
                  <Icon name="photo" size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                  <div style={{ fontSize: 11, color: 'var(--text-sec)', marginBottom: 8 }}>Cover-URL einfuegen</div>
                  <input
                    value={newCoverUrl}
                    onChange={(e) => setNewCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full py-2 px-3 rounded-[8px] text-xs font-body outline-none"
                    style={inputStyle}
                  />
                </div>
              )}
            </div>

            {/* Right: Fields */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                  Titel *
                </label>
                <input
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="z.B. Achtsamkeit im Alltag"
                  className="w-full py-2.5 px-4 text-sm font-body outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                  Beschreibung
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  placeholder="Worum geht es in deinem Kurs?"
                  className="w-full py-2.5 px-4 text-sm font-body outline-none resize-none"
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
                      onClick={() => setNewCategory(cat)}
                      className="border-none cursor-pointer transition-all duration-200"
                      style={{
                        padding: '6px 14px', borderRadius: 8, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase',
                        background: newCategory === cat ? 'var(--gold-bg)' : 'var(--glass)',
                        color: newCategory === cat ? 'var(--gold-text)' : 'var(--text-muted)',
                        border: newCategory === cat ? '1px solid var(--gold-border-s)' : '1px solid var(--glass-border)',
                      }}
                    >
                      {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                    Preis (€)
                  </label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="0 = kostenlos"
                    className="w-full py-2.5 px-4 text-sm font-body outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                    Max. Teilnehmer
                  </label>
                  <input
                    type="number"
                    value={newMaxParticipants}
                    onChange={(e) => setNewMaxParticipants(e.target.value)}
                    placeholder="Unbegrenzt"
                    className="w-full py-2.5 px-4 text-sm font-body outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreate}
              disabled={saving || !newTitle.trim()}
              className="border-none cursor-pointer transition-all duration-200"
              style={{
                padding: '10px 24px', borderRadius: 9999, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase',
                background: newTitle.trim() ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))' : 'var(--glass)',
                color: newTitle.trim() ? 'var(--text-on-gold)' : 'var(--text-muted)',
              }}
              >
                {saving ? 'Wird erstellt...' : 'Kurs erstellen'}
              </button>
              <button
                onClick={() => { setCreating(false); setNewTitle(''); router.replace('/studio/courses'); }}
                className="border-none cursor-pointer"
                style={{ background: 'none', color: 'var(--text-muted)', fontSize: 11, padding: '10px 12px' }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 40 }}>Lade Kurse...</p>
      ) : courses.length === 0 ? (
        <div className="glass-card rounded-[8px] p-8 text-center" style={{ background: 'var(--card-bg)' }}>
          <Icon name="school" size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 14, color: 'var(--text-sec)', fontStyle: 'italic' }}>
            Noch keine Kurse erstellt.
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Nutze den + Button um deinen ersten Kurs zu erstellen.
          </p>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {courses.map((course) => (
            <div
              key={course.id}
              className="glass-card rounded-[8px] overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
              style={{ background: 'var(--card-bg)' }}
            >
              {/* Cover */}
              <div className="relative" style={{ height: 140, background: 'var(--avatar-bg)', overflow: 'hidden' }}>
                {course.cover_url ? (
                  <img src={course.cover_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Icon name="school" size={40} style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}
                <span
                  className="absolute top-3 right-3"
                  style={{
                    padding: '3px 10px', borderRadius: 6, fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase',
                    background: 'var(--glass-strong)', backdropFilter: 'blur(12px)',
                    color: STATUS_COLORS[course.status] ?? 'var(--text-muted)', border: '1px solid var(--glass-border)',
                  }}
                >
                  {STATUS_LABELS[course.status] ?? course.status}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="italic mb-1 truncate" style={{ fontSize: 15, color: 'var(--text-h)' }}>
                  {course.title}
                </h3>
                <div className="flex items-center gap-4 mb-3">
                  <span style={{ fontSize: 11, color: 'var(--text-sec)' }}>{course.participants_count} Teilnehmer</span>
                  {course.rating_avg > 0 && (
                    <span className="flex items-center gap-1" style={{ fontSize: 11, color: 'var(--gold-text)' }}>
                      <Icon name="star" size={12} style={{ color: 'var(--gold)' }} />{course.rating_avg.toFixed(1)}
                    </span>
                  )}
                  {course.price_cents > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--text-sec)' }}>{(course.price_cents / 100).toFixed(2).replace('.', ',')} EUR</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/studio/courses/${course.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 no-underline transition-all duration-200"
                    style={{
                      padding: '7px 0', borderRadius: 8, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase',
                      background: 'var(--gold-bg)', color: 'var(--gold-text)', border: '1px solid var(--gold-border-s)',
                    }}
                  >
                    <Icon name="edit" size={12} />Bearbeiten
                  </Link>
                  <button
                    onClick={() => handleToggleStatus(course)}
                    className="flex items-center justify-center cursor-pointer border-none transition-all duration-200"
                    style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)' }}
                    title={course.status === 'active' ? 'Deaktivieren' : 'Aktivieren'}
                  >
                    <Icon name={course.status === 'active' ? 'circle-check' : 'player-play'} size={14} style={{ color: 'var(--text-sec)' }} />
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="flex items-center justify-center cursor-pointer border-none transition-all duration-200"
                    style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)' }}
                  >
                    <Icon name="trash" size={14} style={{ color: 'var(--danger)' }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
