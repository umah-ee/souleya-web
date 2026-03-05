'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { fetchMediaItems, createMediaItem, deleteMediaItem } from '@/lib/studio';
import type { MediaItem } from '@/types/studio';

const TYPE_LABELS: Record<string, string> = { video: 'Video', audio: 'Audio', pdf: 'PDF', image: 'Bild' };
const TYPE_ICONS: Record<string, any> = { video: 'video', audio: 'microphone', pdf: 'file-text', image: 'photo' };

export default function ContentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');

  // Create form state
  const [creating, setCreating] = useState(searchParams.get('create') === '1');
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('video');
  const [newUrl, setNewUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchMediaItems({ content_type: typeFilter || undefined });
      setItems(res.data);
    } catch { setItems([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [typeFilter]);

  useEffect(() => {
    if (searchParams.get('create') === '1') setCreating(true);
  }, [searchParams]);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    setSaving(true);
    try {
      await createMediaItem({ title: newTitle.trim(), content_type: newType, file_url: newUrl.trim() });
      setCreating(false);
      setNewTitle('');
      setNewUrl('');
      router.replace('/studio/content');
      load();
    } catch {
      alert('Medium konnte nicht erstellt werden.');
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
      <div className="flex items-center justify-between mb-6">
        <h2 style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Content & Mediathek
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
              Neues Medium
            </button>
          )}
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

      {/* Create Form */}
      {creating && (
        <div className="glass-card rounded-[8px] p-5 mb-6" style={{ background: 'var(--card-bg)', border: '1.5px solid var(--gold-border)' }}>
          <h3 style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold-text)', marginBottom: 12 }}>
            Neues Medium erstellen
          </h3>
          <div className="flex flex-col gap-3">
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Titel eingeben..."
              className="w-full py-2.5 px-4 text-sm font-body outline-none"
              style={inputStyle}
            />
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Datei-URL (z.B. https://...)"
              className="w-full py-2.5 px-4 text-sm font-body outline-none"
              style={inputStyle}
            />
            <div className="flex gap-2">
              {(['video', 'audio', 'pdf', 'image'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setNewType(t)}
                  className="border-none cursor-pointer transition-all duration-200"
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase',
                    background: newType === t ? 'var(--gold-bg)' : 'var(--glass)',
                    color: newType === t ? 'var(--gold-text)' : 'var(--text-muted)',
                    border: newType === t ? '1px solid var(--gold-border-s)' : '1px solid var(--glass-border)',
                  }}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={saving || !newTitle.trim() || !newUrl.trim()}
                className="border-none cursor-pointer transition-all duration-200"
                style={{
                  padding: '10px 24px', borderRadius: 9999, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase',
                  background: newTitle.trim() && newUrl.trim() ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))' : 'var(--glass)',
                  color: newTitle.trim() && newUrl.trim() ? 'var(--text-on-gold)' : 'var(--text-muted)',
                }}
              >
                {saving ? 'Wird erstellt...' : 'Medium erstellen'}
              </button>
              <button
                onClick={() => { setCreating(false); setNewTitle(''); setNewUrl(''); router.replace('/studio/content'); }}
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
        <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 40 }}>Lade Medien...</p>
      ) : items.length === 0 ? (
        <div className="glass-card rounded-[8px] p-8 text-center" style={{ background: 'var(--card-bg)' }}>
          <Icon name="library" size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 14, color: 'var(--text-sec)', fontStyle: 'italic' }}>Noch keine Medien hochgeladen.</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Nutze den + Button um dein erstes Medium zu erstellen.</p>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {items.map((item) => (
            <div key={item.id} className="glass-card rounded-[8px] p-4 transition-transform duration-200 hover:-translate-y-0.5" style={{ background: 'var(--card-bg)' }}>
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
