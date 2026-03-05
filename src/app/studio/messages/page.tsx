'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { fetchAnnouncements, fetchReviews, replyToReview, createAnnouncement, fetchCourses } from '@/lib/studio';
import type { Announcement, Review, Course } from '@/types/studio';

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState<'announcements' | 'reviews'>('announcements');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Create announcement form state
  const [creating, setCreating] = useState(searchParams.get('announce') === '1');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCourseId, setNewCourseId] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses({ limit: 100 }).then((r) => setCourses(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (tab === 'announcements') {
          const r = await fetchAnnouncements();
          setAnnouncements(r.data);
        } else {
          const r = await fetchReviews({ pending_reply: true });
          setReviews(r.data);
        }
      } catch {}
      setLoading(false);
    };
    loadData();
  }, [tab]);

  useEffect(() => {
    if (searchParams.get('announce') === '1') {
      setTab('announcements');
      setCreating(true);
    }
  }, [searchParams]);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    setSaving(true);
    try {
      await createAnnouncement({
        title: newTitle.trim(),
        body: newBody.trim(),
        course_id: newCourseId || undefined,
      });
      setCreating(false);
      setNewTitle('');
      setNewBody('');
      setNewCourseId('');
      router.replace('/studio/messages');
      // Reload announcements
      const r = await fetchAnnouncements();
      setAnnouncements(r.data);
    } catch {
      alert('Ankuendigung konnte nicht gesendet werden.');
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
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Nachrichten & Bewertungen
        </h2>
        {!creating && tab === 'announcements' && (
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
            Ankuendigung
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['announcements', 'reviews'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className="border-none cursor-pointer" style={{
            padding: '8px 18px', borderRadius: 8, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase',
            background: tab === t ? 'var(--gold-bg)' : 'var(--glass)',
            color: tab === t ? 'var(--gold-text)' : 'var(--text-muted)',
            border: tab === t ? '1px solid var(--gold-border-s)' : '1px solid var(--glass-border)',
          }}>
            {t === 'announcements' ? 'Ankuendigungen' : 'Offene Bewertungen'}
          </button>
        ))}
      </div>

      {/* Create Announcement Form */}
      {creating && (
        <div className="glass-card rounded-[8px] p-5 mb-6" style={{ background: 'var(--card-bg)', border: '1.5px solid var(--gold-border)' }}>
          <h3 style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold-text)', marginBottom: 12 }}>
            Neue Ankuendigung senden
          </h3>
          <div className="flex flex-col gap-3">
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Betreff..."
              className="w-full py-2.5 px-4 text-sm font-body outline-none"
              style={inputStyle}
            />
            <textarea
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Nachricht an deine Teilnehmer..."
              rows={4}
              className="w-full py-2.5 px-4 text-sm font-body outline-none resize-y"
              style={{ ...inputStyle, minHeight: 80 }}
            />
            {courses.length > 0 && (
              <div>
                <label style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, display: 'block', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  An Kurs senden (optional)
                </label>
                <select
                  value={newCourseId}
                  onChange={(e) => setNewCourseId(e.target.value)}
                  className="w-full py-2.5 px-4 text-sm font-body outline-none"
                  style={inputStyle}
                >
                  <option value="">Alle Teilnehmer</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={saving || !newTitle.trim() || !newBody.trim()}
                className="border-none cursor-pointer transition-all duration-200"
                style={{
                  padding: '10px 24px', borderRadius: 9999, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase',
                  background: newTitle.trim() && newBody.trim() ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))' : 'var(--glass)',
                  color: newTitle.trim() && newBody.trim() ? 'var(--text-on-gold)' : 'var(--text-muted)',
                }}
              >
                {saving ? 'Wird gesendet...' : 'Ankuendigung senden'}
              </button>
              <button
                onClick={() => { setCreating(false); setNewTitle(''); setNewBody(''); setNewCourseId(''); router.replace('/studio/messages'); }}
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
        <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 40 }}>Lade...</p>
      ) : tab === 'announcements' ? (
        announcements.length === 0 ? (
          <div className="glass-card rounded-[8px] p-6 text-center" style={{ background: 'var(--card-bg)' }}>
            <Icon name="speakerphone" size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, color: 'var(--text-sec)', fontStyle: 'italic' }}>Noch keine Ankuendigungen gesendet.</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Nutze den + Button um eine Ankuendigung zu senden.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {announcements.map((a) => (
              <div key={a.id} className="glass-card rounded-[8px] p-4" style={{ background: 'var(--card-bg)' }}>
                <h4 style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--text-h)', marginBottom: 4 }}>{a.title}</h4>
                <p style={{ fontSize: 12, color: 'var(--text-sec)', marginBottom: 8 }}>{a.body.slice(0, 120)}...</p>
                <div className="flex gap-4" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  <span>{a.recipient_count} Empfaenger</span>
                  <span>{new Date(a.sent_at).toLocaleDateString('de-DE')}</span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        reviews.length === 0 ? (
          <div className="glass-card rounded-[8px] p-6 text-center" style={{ background: 'var(--card-bg)' }}>
            <Icon name="star" size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, color: 'var(--text-sec)', fontStyle: 'italic' }}>Keine offenen Bewertungen.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {reviews.map((r) => (
              <div key={r.id} className="glass-card rounded-[8px] p-4" style={{ background: 'var(--card-bg)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="rounded-full overflow-hidden flex-shrink-0" style={{ width: 28, height: 28, background: 'var(--avatar-bg)' }}>
                    {r.reviewer?.avatar_url && <img src={r.reviewer.avatar_url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-h)' }}>{r.reviewer?.display_name ?? 'User'}</span>
                  <span className="ml-auto flex items-center gap-1" style={{ fontSize: 11, color: 'var(--gold-text)' }}>
                    <Icon name="star" size={12} style={{ color: 'var(--gold)' }} />{r.rating}
                  </span>
                </div>
                {r.comment && <p style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--text-sec)', lineHeight: 1.6 }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
