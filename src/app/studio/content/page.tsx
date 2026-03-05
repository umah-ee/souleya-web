'use client';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { fetchMediaItems, deleteMediaItem } from '@/lib/studio';
import type { MediaItem } from '@/types/studio';

const TYPE_LABELS: Record<string, string> = { video: 'Video', audio: 'Audio', pdf: 'PDF', image: 'Bild' };
const TYPE_ICONS: Record<string, any> = { video: 'video', audio: 'microphone', pdf: 'file-text', image: 'photo' };

export default function ContentPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchMediaItems({ content_type: typeFilter || undefined });
      setItems(res.data);
    } catch { setItems([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [typeFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Content & Mediathek
        </h2>
        <div className="flex gap-2">
          {['', 'video', 'audio', 'pdf', 'image'].map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)} className="border-none cursor-pointer" style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase',
              background: typeFilter === t ? 'var(--gold-bg)' : 'var(--glass)',
              color: typeFilter === t ? 'var(--gold-text)' : 'var(--text-muted)',
              border: typeFilter === t ? '1px solid var(--gold-border-s)' : '1px solid var(--glass-border)',
            }}>
              {t === '' ? 'Alle' : TYPE_LABELS[t] ?? t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 40 }}>Lade Medien...</p>
      ) : items.length === 0 ? (
        <div className="glass-card rounded-lg p-8 text-center" style={{ background: 'var(--card-bg)' }}>
          <Icon name="library" size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 14, color: 'var(--text-sec)', fontStyle: 'italic' }}>Noch keine Medien hochgeladen.</p>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {items.map((item) => (
            <div key={item.id} className="glass-card rounded-lg p-4 transition-transform duration-200 hover:-translate-y-0.5" style={{ background: 'var(--card-bg)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--gold-bg)' }}>
                  <Icon name={(TYPE_ICONS[item.content_type] ?? 'file-text') as any} size={18} style={{ color: 'var(--gold)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="truncate italic" style={{ fontSize: 13, color: 'var(--text-h)', margin: 0 }}>{item.title}</h4>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{TYPE_LABELS[item.content_type] ?? item.content_type}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {item.duration_seconds && <span style={{ fontSize: 10, color: 'var(--text-sec)' }}>{Math.floor(item.duration_seconds / 60)} Min</span>}
                {item.rating_avg > 0 && <span className="flex items-center gap-1" style={{ fontSize: 10, color: 'var(--gold-text)' }}><Icon name="star" size={10} />{item.rating_avg.toFixed(1)}</span>}
                {item.download_count > 0 && <span style={{ fontSize: 10, color: 'var(--text-sec)' }}>{item.download_count}x</span>}
                {item.is_micro_content && <span style={{ fontSize: 8, padding: '2px 6px', borderRadius: 6, background: 'var(--gold-bg)', color: 'var(--gold-text)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Micro</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
