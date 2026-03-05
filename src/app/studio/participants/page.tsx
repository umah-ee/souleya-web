'use client';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { fetchCourses, fetchEnrollments } from '@/lib/studio';
import type { Course, Enrollment } from '@/types/studio';

export default function ParticipantsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses({ limit: 100 }).then((r) => {
      setCourses(r.data);
      if (r.data.length > 0) setSelectedCourse(r.data[0].id);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    fetchEnrollments(selectedCourse).then((r) => setEnrollments(r.data)).catch(() => setEnrollments([]));
  }, [selectedCourse]);

  return (
    <div>
      <h2 style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>Teilnehmer</h2>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 40 }}>Lade...</p>
      ) : courses.length === 0 ? (
        <div className="glass-card rounded-[8px] p-8 text-center" style={{ background: 'var(--card-bg)' }}>
          <p style={{ fontSize: 14, color: 'var(--text-sec)', fontStyle: 'italic' }}>Erstelle zuerst einen Kurs.</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-6 flex-wrap">
            {courses.map((c) => (
              <button key={c.id} onClick={() => setSelectedCourse(c.id)} className="border-none cursor-pointer" style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 10, letterSpacing: '1px',
                background: selectedCourse === c.id ? 'var(--gold-bg)' : 'var(--glass)',
                color: selectedCourse === c.id ? 'var(--gold-text)' : 'var(--text-muted)',
                border: selectedCourse === c.id ? '1px solid var(--gold-border-s)' : '1px solid var(--glass-border)',
              }}>
                {c.title}
              </button>
            ))}
          </div>
          {enrollments.length === 0 ? (
            <div className="glass-card rounded-[8px] p-6 text-center" style={{ background: 'var(--card-bg)' }}>
              <p style={{ fontSize: 13, color: 'var(--text-sec)', fontStyle: 'italic' }}>Keine Teilnehmer in diesem Kurs.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {enrollments.map((e) => (
                <div key={e.id} className="glass-card rounded-[8px] p-4 flex items-center gap-3" style={{ background: 'var(--card-bg)' }}>
                  <div className="flex-shrink-0 rounded-full overflow-hidden" style={{ width: 36, height: 36, background: 'var(--avatar-bg)' }}>
                    {e.user?.avatar_url && <img src={e.user.avatar_url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <div style={{ fontSize: 13, color: 'var(--text-h)' }}>{e.user?.display_name ?? e.user?.username ?? 'User'}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-sec)' }}>Fortschritt: {e.progress_percent}%</div>
                  </div>
                  <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 6, background: e.status === 'active' ? 'var(--success-bg)' : 'var(--glass)', color: e.status === 'active' ? 'var(--success)' : 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    {e.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
