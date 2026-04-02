'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Icon } from '@/components/ui/Icon';
import { fetchMediaItems, createMediaItem, updateMediaItem, deleteMediaItem } from '@/lib/studio';
import type { MediaItem, CreateMediaData } from '@/types/studio';
import { createClient } from '@/lib/supabase/client';
import MediaPlayerModal from '@/components/studio/MediaPlayerModal';
import MiniAudioPlayer from '@/components/studio/MiniAudioPlayer';

// ── Konstanten ────────────────────────────────────────────
type ViewMode = 'grid' | 'list';
type ContentType = '' | 'video' | 'audio' | 'pdf' | 'ebook' | 'image';
type Visibility = 'public' | 'circle' | 'course' | 'premium';

const TYPE_LABELS: Record<string, string> = { video: 'Video', audio: 'Audio/Podcast', pdf: 'PDF', ebook: 'eBook', image: 'Bild' };
const TYPE_ICONS: Record<string, string> = { video: 'video', audio: 'microphone', pdf: 'file-text', ebook: 'book', image: 'photo' };
const TYPE_COLORS: Record<string, string> = { video: '#7BA0D4', audio: '#9488BE', pdf: '#C4919A', ebook: '#6EAA78', image: '#C8A96E' };
const VIS_LABELS: Record<string, string> = { public: 'Oeffentlich', circle: 'Nur Circle', course: 'Nur Kurs', premium: 'Premium' };
const VIS_ICONS: Record<string, string> = { public: 'world', circle: 'users', course: 'school', premium: 'sparkles' };

export default function ContentPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<ContentType>('');
  const [tagFilter, setTagFilter] = useState('');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [hoverItem, setHoverItem] = useState<string | null>(null);

  // Upload
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Media Player
  const [playerItem, setPlayerItem] = useState<MediaItem | null>(null);
  const [miniPlayerItem, setMiniPlayerItem] = useState<MediaItem | null>(null);

  // Edit Modal
  const [editItem, setEditItem] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editVisibility, setEditVisibility] = useState<Visibility>('public');
  const [editIsMeditation, setEditIsMeditation] = useState(false);
  const [editMeditationType, setEditMeditationType] = useState('');

  // ── Daten laden ─────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchMediaItems({
        content_type: typeFilter || undefined,
        tags: tagFilter ? [tagFilter] : undefined,
      });
      setItems(res.data ?? []);
    } catch { setItems([]); }
    setLoading(false);
  }, [typeFilter, tagFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Alle Tags sammeln ───────────────────────────────────
  const allTags = Array.from(new Set(items.flatMap(i => i.tags ?? []))).sort();

  // ── Suche ───────────────────────────────────────────────
  const filtered = items.filter(i => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!i.title.toLowerCase().includes(q) && !i.description?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // ── Upload Handler ──────────────────────────────────────
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadProgress(0);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(Math.round(((i) / files.length) * 100));

      // Typ erkennen
      let contentType = 'pdf';
      if (file.type.startsWith('video/')) contentType = 'video';
      else if (file.type.startsWith('audio/')) contentType = 'audio';
      else if (file.type.startsWith('image/')) contentType = 'image';
      else if (file.name.endsWith('.epub')) contentType = 'ebook';

      // Zu Supabase Storage hochladen
      const ext = file.name.split('.').pop() ?? 'bin';
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('media-items')
        .upload(path, file, { contentType: file.type, upsert: false });

      if (uploadError) {
        console.warn('[Content] Upload fehlgeschlagen:', uploadError.message);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('media-items')
        .getPublicUrl(path);

      // Media-Item erstellen
      await createMediaItem({
        title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
        content_type: contentType,
        file_url: publicUrl,
        file_size_bytes: file.size,
      }).catch(() => {});

      setUploadProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setUploading(false);
    setUploadProgress(0);
    setShowUpload(false);
    loadData();
  };

  // ── Drag & Drop ─────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); };

  // ── Edit ────────────────────────────────────────────────
  const openEdit = (item: MediaItem) => {
    setEditItem(item);
    setEditTitle(item.title);
    setEditDesc(item.description ?? '');
    setEditTags((item.tags ?? []).join(', '));
    setEditPrice(item.price_cents > 0 ? (item.price_cents / 100).toFixed(0) : '');
    setEditVisibility('public');
    setEditIsMeditation((item as any).is_meditation ?? false);
    setEditMeditationType((item as any).meditation_type ?? '');
  };

  const saveEdit = async () => {
    if (!editItem) return;
    await updateMediaItem(editItem.id, {
      title: editTitle,
      description: editDesc || undefined,
      tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
      price_cents: editPrice ? Math.round(parseFloat(editPrice) * 100) : 0,
      is_meditation: editIsMeditation,
      meditation_type: editIsMeditation ? editMeditationType || undefined : undefined,
    } as any).catch(() => {});
    setEditItem(null);
    loadData();
  };

  // ── Delete ──────────────────────────────────────────────
  // ── Thumbnail Upload per Drag&Drop auf Karte ────────────
  const [thumbDragItem, setThumbDragItem] = useState<string | null>(null);

  const handleThumbnailDrop = async (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setThumbDragItem(null);
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `thumbnails/${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('media-items').upload(path, file, { contentType: file.type });
    if (error) return;

    const { data: { publicUrl } } = supabase.storage.from('media-items').getPublicUrl(path);
    await updateMediaItem(itemId, { thumbnail_url: publicUrl }).catch(() => {});
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Medium loeschen?')) return;
    await deleteMediaItem(id).catch(() => {});
    loadData();
  };

  // ── Helpers ─────────────────────────────────────────────
  // ── Verwandte Inhalte (gleiche Tags) ─────────────────────
  const getRelated = (item: MediaItem): MediaItem[] => {
    if (!item.tags?.length) return [];
    return items
      .filter(i => i.id !== item.id && i.tags?.some(t => item.tags?.includes(t)))
      .slice(0, 4);
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const cardBg = 'var(--card-bg)';
  const border = 'var(--gold-border-s)';

  return (
    <div>
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <h2 style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Content & Mediathek
        </h2>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex rounded-[8px] overflow-hidden" style={{ border: `1px solid ${border}` }}>
            <button onClick={() => setViewMode('grid')} className="border-none cursor-pointer p-1.5" style={{ background: viewMode === 'grid' ? 'var(--gold-bg)' : 'var(--glass)' }}>
              <Icon name="layout-grid" size={14} style={{ color: viewMode === 'grid' ? 'var(--gold-text)' : 'var(--text-muted)' }} />
            </button>
            <button onClick={() => setViewMode('list')} className="border-none cursor-pointer p-1.5" style={{ background: viewMode === 'list' ? 'var(--gold-bg)' : 'var(--glass)' }}>
              <Icon name="menu-2" size={14} style={{ color: viewMode === 'list' ? 'var(--gold-text)' : 'var(--text-muted)' }} />
            </button>
          </div>
          <button onClick={() => setShowUpload(s => !s)} className="border-none cursor-pointer flex items-center gap-1.5" style={{
            padding: '6px 14px', borderRadius: 9999, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase',
            background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))', color: 'var(--text-on-gold)',
          }}>
            <Icon name="plus" size={12} /> Hochladen
          </button>
        </div>
      </div>

      {/* ── Upload Drop Zone ───────────────────────────── */}
      {(showUpload || dragOver) && (
        <div
          className="rounded-[8px] mb-5 flex flex-col items-center justify-center cursor-pointer transition-all duration-200"
          style={{
            padding: '32px 24px',
            background: dragOver ? 'var(--gold-bg)' : 'var(--glass)',
            border: `2px dashed ${dragOver ? 'var(--gold)' : border}`,
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" multiple className="hidden" accept="video/*,audio/*,.pdf,.epub,image/*" onChange={e => handleFiles(e.target.files)} />
          {uploading ? (
            <>
              <div className="w-full max-w-xs rounded-full overflow-hidden mb-2" style={{ height: 6, background: 'var(--glass)' }}>
                <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--gold)', transition: 'width 0.3s' }} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-sec)' }}>Wird hochgeladen … {uploadProgress}%</p>
            </>
          ) : (
            <>
              <Icon name="plus" size={32} style={{ color: dragOver ? 'var(--gold)' : 'var(--text-muted)', marginBottom: 8 }} />
              <p style={{ fontSize: 13, color: 'var(--text-h)', marginBottom: 2 }}>Dateien hierher ziehen</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>oder klicken um auszuwaehlen · PDF, Video, Audio, eBook, Bilder</p>
            </>
          )}
        </div>
      )}

      {/* ── Filter + Suche ─────────────────────────────── */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Icon name="search" size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Suchen …" value={search} onChange={e => setSearch(e.target.value)} className="w-full py-2 pl-8 pr-3 text-sm outline-none" style={{ background: 'var(--glass)', border: `1px solid ${border}`, borderRadius: 8, color: 'var(--text-h)' }} />
        </div>
        {/* Typ-Filter */}
        {(['', 'video', 'audio', 'pdf', 'ebook', 'image'] as ContentType[]).map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} className="border-none cursor-pointer" style={{
            padding: '5px 10px', borderRadius: 8, fontSize: 10,
            background: typeFilter === t ? 'var(--gold-bg)' : 'var(--glass)',
            color: typeFilter === t ? 'var(--gold-text)' : 'var(--text-muted)',
            border: `1px solid ${typeFilter === t ? border : 'var(--glass-border)'}`,
          }}>{t === '' ? 'Alle' : TYPE_LABELS[t] ?? t}</button>
        ))}
      </div>

      {/* ── Tags Cloud ─────────────────────────────────── */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tagFilter && (
            <button onClick={() => setTagFilter('')} className="border-none cursor-pointer" style={{
              padding: '3px 8px', borderRadius: 9999, fontSize: 9, background: 'var(--gold)', color: 'var(--text-on-gold)',
            }}>✕ {tagFilter}</button>
          )}
          {allTags.filter(t => t !== tagFilter).slice(0, 15).map(tag => (
            <button key={tag} onClick={() => setTagFilter(tag)} className="border-none cursor-pointer" style={{
              padding: '3px 8px', borderRadius: 9999, fontSize: 9,
              background: 'var(--glass)', color: 'var(--text-sec)', border: '1px solid var(--glass-border)',
            }}>{tag}</button>
          ))}
        </div>
      )}

      {/* ── Content ────────────────────────────────────── */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 40 }}>Lade …</p>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-[8px] p-8 text-center" style={{ background: cardBg }}>
          <Icon name="library" size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
          <p style={{ fontSize: 12, color: 'var(--text-sec)', fontStyle: 'italic' }}>
            {items.length === 0 ? 'Noch keine Inhalte. Lade dein erstes Medium hoch.' : 'Keine Treffer.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── Grid View ─────────────────────────────────── */
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {filtered.map(item => {
            const color = TYPE_COLORS[item.content_type] ?? 'var(--gold)';
            return (
              <div
                key={item.id}
                className="glass-card rounded-[8px] overflow-hidden transition-all duration-200 relative cursor-pointer"
                style={{ background: cardBg, border: `1px solid ${border}`, transform: hoverItem === item.id ? 'translateY(-2px)' : 'none' }}
                onClick={() => setPlayerItem(item)}
                onMouseEnter={() => setHoverItem(item.id)}
                onMouseLeave={() => setHoverItem(null)}
              >
                {/* Thumbnail / Preview — Drag&Drop fuer Kopfgrafik */}
                <div
                  className="relative"
                  style={{
                    height: 140, background: 'var(--glass)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: thumbDragItem === item.id ? '2px dashed var(--gold)' : 'none',
                  }}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setThumbDragItem(item.id); }}
                  onDragLeave={(e) => { e.stopPropagation(); setThumbDragItem(null); }}
                  onDrop={(e) => handleThumbnailDrop(e, item.id)}
                >
                  {item.thumbnail_url ? (
                    <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Icon name={(TYPE_ICONS[item.content_type] ?? 'file-text') as any} size={32} style={{ color }} />
                      <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Bild hierher ziehen</span>
                    </div>
                  )}
                  {/* Typ-Badge */}
                  <span className="absolute top-2 left-2" style={{ padding: '2px 8px', borderRadius: 4, fontSize: 8, letterSpacing: '0.5px', textTransform: 'uppercase', background: `${color}22`, color, fontWeight: 500 }}>
                    {TYPE_LABELS[item.content_type] ?? item.content_type}
                  </span>
                  {/* Duration (Video/Audio) */}
                  {item.duration_seconds && (
                    <span className="absolute bottom-2 right-2" style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9, background: 'rgba(0,0,0,.6)', color: '#fff' }}>
                      {Math.floor(item.duration_seconds / 60)}:{(item.duration_seconds % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                  {/* Hover Aktionen */}
                  {hoverItem === item.id && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2" style={{ background: 'rgba(0,0,0,.5)' }}>
                      <button onClick={(e) => { e.stopPropagation(); openEdit(item); }} className="border-none cursor-pointer rounded-full flex items-center justify-center" style={{ width: 32, height: 32, background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)' }}>
                        <Icon name="edit" size={14} style={{ color: '#fff' }} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); window.open(item.file_url, '_blank'); }} className="border-none cursor-pointer rounded-full flex items-center justify-center" style={{ width: 32, height: 32, background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)' }}>
                        <Icon name="share" size={14} style={{ color: '#fff' }} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="border-none cursor-pointer rounded-full flex items-center justify-center" style={{ width: 32, height: 32, background: 'rgba(220,50,50,.3)', backdropFilter: 'blur(8px)' }}>
                        <Icon name="trash" size={14} style={{ color: '#fff' }} />
                      </button>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-3">
                  <h4 className="truncate" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-h)', margin: '0 0 4px' }}>{item.title}</h4>
                  {/* Tags */}
                  {item.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.tags.slice(0, 3).map(tag => (
                        <span key={tag} style={{ padding: '1px 5px', borderRadius: 4, fontSize: 8, background: 'var(--glass)', color: 'var(--text-muted)', border: '1px solid var(--glass-border)' }}>{tag}</span>
                      ))}
                    </div>
                  )}
                  {/* Stats */}
                  <div className="flex items-center gap-3" style={{ fontSize: 10, color: 'var(--text-sec)' }}>
                    {item.rating_avg > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Icon name="star-filled" size={10} style={{ color: 'var(--gold)' }} />
                        {item.rating_avg.toFixed(1)} ({item.rating_count})
                      </span>
                    )}
                    {item.download_count > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Icon name="chart-bar" size={10} style={{ color: 'var(--text-muted)' }} />
                        {item.download_count}
                      </span>
                    )}
                    {item.price_cents > 0 && (
                      <span style={{ color: 'var(--gold-text)', fontWeight: 500 }}>{(item.price_cents / 100).toFixed(0)} €</span>
                    )}
                    {formatSize(item.file_size_bytes) && (
                      <span>{formatSize(item.file_size_bytes)}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── List View ─────────────────────────────────── */
        <div className="flex flex-col gap-2">
          {filtered.map(item => {
            const color = TYPE_COLORS[item.content_type] ?? 'var(--gold)';
            return (
              <div
                key={item.id}
                className="glass-card rounded-[8px] p-3 flex items-center gap-3 transition-all duration-200 group cursor-pointer"
                style={{ background: cardBg, border: `1px solid ${border}` }}
                onClick={() => setPlayerItem(item)}
              >
                {/* Icon */}
                <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: 8, background: `${color}15` }}>
                  <Icon name={(TYPE_ICONS[item.content_type] ?? 'file-text') as any} size={18} style={{ color }} />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-h)' }}>{item.title}</span>
                    {item.tags?.slice(0, 2).map(tag => (
                      <span key={tag} style={{ padding: '1px 5px', borderRadius: 4, fontSize: 8, background: 'var(--glass)', color: 'var(--text-muted)' }}>{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3" style={{ fontSize: 10, color: 'var(--text-sec)' }}>
                    <span style={{ color }}>{TYPE_LABELS[item.content_type] ?? item.content_type}</span>
                    {item.duration_seconds && <span>{Math.floor(item.duration_seconds / 60)} Min</span>}
                    {formatSize(item.file_size_bytes) && <span>{formatSize(item.file_size_bytes)}</span>}
                  </div>
                </div>
                {/* Stats */}
                <div className="flex items-center gap-3 flex-shrink-0" style={{ fontSize: 10 }}>
                  {item.rating_avg > 0 && (
                    <span className="flex items-center gap-0.5" style={{ color: 'var(--gold-text)' }}>
                      <Icon name="star-filled" size={10} style={{ color: 'var(--gold)' }} /> {item.rating_avg.toFixed(1)}
                    </span>
                  )}
                  {item.download_count > 0 && (
                    <span style={{ color: 'var(--text-sec)' }}>{item.download_count}x</span>
                  )}
                  {item.price_cents > 0 && (
                    <span style={{ color: 'var(--gold-text)', fontWeight: 500 }}>{(item.price_cents / 100).toFixed(0)} €</span>
                  )}
                </div>
                {/* Aktionen */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); openEdit(item); }} className="border-none cursor-pointer p-1.5 rounded-[4px]" style={{ background: 'var(--glass)' }}>
                    <Icon name="edit" size={12} style={{ color: 'var(--text-muted)' }} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); window.open(item.file_url, '_blank'); }} className="border-none cursor-pointer p-1.5 rounded-[4px]" style={{ background: 'var(--glass)' }}>
                    <Icon name="share" size={12} style={{ color: 'var(--text-muted)' }} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="border-none cursor-pointer p-1.5 rounded-[4px]" style={{ background: 'var(--glass)' }}>
                    <Icon name="trash" size={12} style={{ color: 'var(--danger)' }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Edit Modal ─────────────────────────────────── */}
      {editItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={() => setEditItem(null)}>
          <div className="rounded-[8px] p-5 w-full max-w-md overflow-y-auto scrollbar-gold" style={{ background: cardBg, border: `1px solid ${border}`, maxHeight: '85vh' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Medium bearbeiten</h3>
              <button onClick={() => setEditItem(null)} className="border-none cursor-pointer p-1" style={{ background: 'none' }}><Icon name="x" size={16} style={{ color: 'var(--text-muted)' }} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Titel</label>
                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full py-2 px-3 text-sm outline-none" style={{ background: 'var(--glass)', border: `1px solid ${border}`, borderRadius: 8, color: 'var(--text-h)' }} />
              </div>
              <div>
                <label style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Beschreibung</label>
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} className="w-full p-3 text-sm outline-none resize-none font-body" style={{ background: 'var(--glass)', border: `1px solid ${border}`, borderRadius: 8, color: 'var(--text-h)' }} />
              </div>
              <div>
                <label style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Tags (kommagetrennt)</label>
                <input type="text" value={editTags} onChange={e => setEditTags(e.target.value)} placeholder="meditation, anfaenger, achtsamkeit" className="w-full py-2 px-3 text-sm outline-none" style={{ background: 'var(--glass)', border: `1px solid ${border}`, borderRadius: 8, color: 'var(--text-h)' }} />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Preis (€, leer = kostenlos)</label>
                  <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} placeholder="0" className="w-full py-2 px-3 text-sm outline-none" style={{ background: 'var(--glass)', border: `1px solid ${border}`, borderRadius: 8, color: 'var(--text-h)' }} />
                </div>
                <div className="flex-1">
                  <label style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Sichtbarkeit</label>
                  <div className="flex gap-1 flex-wrap">
                    {(['public', 'circle', 'course', 'premium'] as Visibility[]).map(v => (
                      <button key={v} onClick={() => setEditVisibility(v)} className="border-none cursor-pointer flex items-center gap-1" style={{
                        padding: '4px 8px', borderRadius: 6, fontSize: 9,
                        background: editVisibility === v ? 'var(--gold-bg)' : 'var(--glass)',
                        color: editVisibility === v ? 'var(--gold-text)' : 'var(--text-muted)',
                        border: `1px solid ${editVisibility === v ? border : 'var(--glass-border)'}`,
                      }}>
                        <Icon name={(VIS_ICONS[v] ?? 'world') as any} size={9} /> {VIS_LABELS[v]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Meditation Toggle (nur fuer Audio) */}
              {(editItem?.content_type === 'audio' || editItem?.content_type === 'video') && (
                <div className="rounded-[8px] p-3" style={{ background: editIsMeditation ? 'var(--gold-bg)' : 'var(--glass)', border: `1px solid ${editIsMeditation ? 'var(--gold-border-s)' : 'var(--glass-border)'}`, transition: 'all 0.2s' }}>
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => setEditIsMeditation(v => !v)}>
                    <div className="flex items-center justify-center" style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${editIsMeditation ? 'var(--gold)' : 'var(--text-muted)'}`, background: editIsMeditation ? 'var(--gold)' : 'transparent' }}>
                      {editIsMeditation && <Icon name="check" size={12} style={{ color: 'var(--text-on-gold)' }} />}
                    </div>
                    <span style={{ fontSize: 11, color: editIsMeditation ? 'var(--gold-text)' : 'var(--text-h)', fontWeight: 500 }}>Meditation im Pulse-Modul</span>
                  </div>
                  {editIsMeditation && (
                    <div className="mt-2.5">
                      <label style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Art der Meditation</label>
                      <div className="flex gap-1.5 flex-wrap">
                        {['Gefuehrte Meditation', 'Body Scan', 'Atemmeditation', 'Klangmeditation', 'Yoga Nidra', 'Achtsamkeit', 'Tiefenentspannung'].map(t => (
                          <button key={t} onClick={() => setEditMeditationType(t)} className="border-none cursor-pointer" style={{
                            padding: '4px 10px', borderRadius: 9999, fontSize: 9,
                            background: editMeditationType === t ? 'var(--gold)' : 'var(--glass)',
                            color: editMeditationType === t ? 'var(--text-on-gold)' : 'var(--text-muted)',
                            border: `1px solid ${editMeditationType === t ? 'var(--gold)' : 'var(--glass-border)'}`,
                          }}>{t}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <button onClick={saveEdit} className="border-none cursor-pointer w-full" style={{
                padding: '10px 0', borderRadius: 9999, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase',
                background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))', color: 'var(--text-on-gold)',
              }}>Speichern</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Media Player Modal ─────────────────────────── */}
      {playerItem && (
        <MediaPlayerModal
          item={playerItem}
          onClose={() => setPlayerItem(null)}
          onPlayInMini={(item) => { setMiniPlayerItem(item); setPlayerItem(null); }}
          relatedItems={getRelated(playerItem)}
          onSelectRelated={(r) => setPlayerItem(r)}
        />
      )}

      {/* ── Mini Audio Player (persistent) ─────────────── */}
      {miniPlayerItem && (
        <MiniAudioPlayer
          item={miniPlayerItem}
          onClose={() => setMiniPlayerItem(null)}
          onExpand={() => { setPlayerItem(miniPlayerItem); setMiniPlayerItem(null); }}
        />
      )}
    </div>
  );
}
