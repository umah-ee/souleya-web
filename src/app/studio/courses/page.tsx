'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { fetchCourses, deleteCourse, updateCourse } from '@/lib/studio';
import type { Course } from '@/types/studio';

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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Meine Kurse
        </h2>
        <div className="flex gap-2">
          {['', 'draft', 'active', 'archived'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="border-none cursor-pointer transition-all duration-200"
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 10,
                letterSpacing: '1px',
                textTransform: 'uppercase',
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

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 40 }}>Lade Kurse...</p>
      ) : courses.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center" style={{ background: 'var(--card-bg)' }}>
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
              className="glass-card rounded-2xl overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
              style={{ background: 'var(--card-bg)' }}
            >
              {/* Cover */}
              <div
                className="relative"
                style={{ height: 140, background: 'var(--avatar-bg)', overflow: 'hidden' }}
              >
                {course.cover_url ? (
                  <img src={course.cover_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Icon name="school" size={40} style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}
                {/* Status Badge */}
                <span
                  className="absolute top-3 right-3"
                  style={{
                    padding: '3px 10px',
                    borderRadius: 8,
                    fontSize: 9,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    background: 'var(--glass-strong)',
                    backdropFilter: 'blur(12px)',
                    color: STATUS_COLORS[course.status] ?? 'var(--text-muted)',
                    border: '1px solid var(--glass-border)',
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
                  <span style={{ fontSize: 11, color: 'var(--text-sec)' }}>
                    {course.participants_count} Teilnehmer
                  </span>
                  {course.rating_avg > 0 && (
                    <span className="flex items-center gap-1" style={{ fontSize: 11, color: 'var(--gold-text)' }}>
                      <Icon name="star" size={12} style={{ color: 'var(--gold)' }} />
                      {course.rating_avg.toFixed(1)}
                    </span>
                  )}
                  {course.price_cents > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--text-sec)' }}>
                      {(course.price_cents / 100).toFixed(2).replace('.', ',')} EUR
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/studio/courses/${course.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 no-underline transition-all duration-200"
                    style={{
                      padding: '7px 0',
                      borderRadius: 10,
                      fontSize: 10,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      background: 'var(--gold-bg)',
                      color: 'var(--gold-text)',
                      border: '1px solid var(--gold-border-s)',
                    }}
                  >
                    <Icon name="edit" size={12} />
                    Bearbeiten
                  </Link>
                  <button
                    onClick={() => handleToggleStatus(course)}
                    className="flex items-center justify-center cursor-pointer border-none transition-all duration-200"
                    style={{
                      width: 32, height: 32, borderRadius: 10,
                      background: 'var(--glass)',
                      border: '1px solid var(--glass-border)',
                    }}
                    title={course.status === 'active' ? 'Deaktivieren' : 'Aktivieren'}
                  >
                    <Icon
                      name={course.status === 'active' ? 'circle-check' : 'player-play'}
                      size={14}
                      style={{ color: 'var(--text-sec)' }}
                    />
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="flex items-center justify-center cursor-pointer border-none transition-all duration-200"
                    style={{
                      width: 32, height: 32, borderRadius: 10,
                      background: 'var(--glass)',
                      border: '1px solid var(--glass-border)',
                    }}
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
