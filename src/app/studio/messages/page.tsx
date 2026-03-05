'use client';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { fetchAnnouncements, fetchReviews, replyToReview } from '@/lib/studio';
import type { Announcement, Review } from '@/types/studio';

export default function MessagesPage() {
  const [tab, setTab] = useState<'announcements' | 'reviews'>('announcements');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <h2 style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>
        Nachrichten & Bewertungen
      </h2>

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

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 40 }}>Lade...</p>
      ) : tab === 'announcements' ? (
        announcements.length === 0 ? (
          <div className="glass-card rounded-[8px] p-6 text-center" style={{ background: 'var(--card-bg)' }}>
            <Icon name="speakerphone" size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, color: 'var(--text-sec)', fontStyle: 'italic' }}>Noch keine Ankuendigungen gesendet.</p>
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
