'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { MediaItem } from '@/types/studio';

// ── Typen ─────────────────────────────────────────────────
interface Chapter {
  time: number; // Sekunden
  label: string;
}

interface Props {
  item: MediaItem;
  chapters?: Chapter[];
  onClose: () => void;
  onPlayInMini?: (item: MediaItem) => void; // Audio → Mini-Player
  relatedItems?: MediaItem[];
  onSelectRelated?: (item: MediaItem) => void;
  isPremiumLocked?: boolean;
  previewSeconds?: number; // Teaser-Dauer fuer Premium
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MediaPlayerModal({
  item,
  chapters = [],
  onClose,
  onPlayInMini,
  relatedItems = [],
  onSelectRelated,
  isPremiumLocked = false,
  previewSeconds = 30,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [pdfPage, setPdfPage] = useState(1);

  // Fortschritt speichern (localStorage)
  const storageKey = `media-progress-${item.id}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const time = parseFloat(saved);
      if (videoRef.current) videoRef.current.currentTime = time;
      if (audioRef.current) audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, [storageKey]);

  const saveProgress = useCallback((time: number) => {
    localStorage.setItem(storageKey, String(time));
  }, [storageKey]);

  // ── Video/Audio Controls ────────────────────────────────
  const togglePlay = () => {
    const el = videoRef.current ?? audioRef.current;
    if (!el) return;
    if (playing) { el.pause(); } else { el.play(); }
    setPlaying(!playing);
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>) => {
    const t = (e.target as HTMLMediaElement).currentTime;
    setCurrentTime(t);
    // Alle 5s speichern
    if (Math.floor(t) % 5 === 0) saveProgress(t);
    // Premium Lock
    if (isPremiumLocked && t > previewSeconds) {
      (e.target as HTMLMediaElement).pause();
      setPlaying(false);
    }
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>) => {
    setDuration((e.target as HTMLMediaElement).duration);
  };

  const seekTo = (time: number) => {
    const el = videoRef.current ?? audioRef.current;
    if (el) { el.currentTime = time; setCurrentTime(time); }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seekTo(pct * duration);
  };

  // ── Download ────────────────────────────────────────────
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = item.file_url;
    a.download = item.title;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ── Embed Code ──────────────────────────────────────────
  const [showEmbed, setShowEmbed] = useState(false);
  const embedCode = `<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed/media/${item.id}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>`;

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedCode).catch(() => {});
    setShowEmbed(false);
  };

  const isVideo = item.content_type === 'video';
  const isAudio = item.content_type === 'audio';
  const isPdf = item.content_type === 'pdf' || item.content_type === 'ebook';
  const isImage = item.content_type === 'image';

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const border = 'var(--gold-border-s)';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background: 'rgba(0,0,0,.85)' }} onClick={onClose}>
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-[8px] overflow-hidden" style={{ background: 'var(--card-bg)', border: `1px solid ${border}` }} onClick={e => e.stopPropagation()}>

        {/* ── Header ──────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid var(--divider-l)` }}>
          <div className="flex-1 min-w-0">
            <h3 style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-h)', margin: 0 }} className="truncate">{item.title}</h3>
            {item.description && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }} className="truncate">{item.description}</p>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            {/* Download */}
            {!isPremiumLocked && (
              <button onClick={handleDownload} className="border-none cursor-pointer p-1.5 rounded-[4px]" style={{ background: 'var(--glass)' }} title="Herunterladen">
                <Icon name="share" size={14} style={{ color: 'var(--text-muted)' }} />
              </button>
            )}
            {/* Embed */}
            <button onClick={() => setShowEmbed(s => !s)} className="border-none cursor-pointer p-1.5 rounded-[4px]" style={{ background: showEmbed ? 'var(--gold-bg)' : 'var(--glass)' }} title="Einbetten">
              <Icon name="link" size={14} style={{ color: showEmbed ? 'var(--gold-text)' : 'var(--text-muted)' }} />
            </button>
            {/* Mini-Player (Audio) */}
            {isAudio && onPlayInMini && (
              <button onClick={() => { onPlayInMini(item); onClose(); }} className="border-none cursor-pointer p-1.5 rounded-[4px]" style={{ background: 'var(--glass)' }} title="Im Mini-Player">
                <Icon name="player-play" size={14} style={{ color: 'var(--text-muted)' }} />
              </button>
            )}
            <button onClick={onClose} className="border-none cursor-pointer p-1.5" style={{ background: 'none' }}>
              <Icon name="x" size={18} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>

        {/* ── Embed Code ─────────────────────────────── */}
        {showEmbed && (
          <div className="px-4 py-2 flex items-center gap-2" style={{ borderBottom: `1px solid var(--divider-l)`, background: 'var(--glass)' }}>
            <input readOnly value={embedCode} className="flex-1 py-1.5 px-2 text-xs outline-none font-mono" style={{ background: 'var(--card-bg)', border: `1px solid ${border}`, borderRadius: 4, color: 'var(--text-sec)' }} />
            <button onClick={copyEmbed} className="border-none cursor-pointer" style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, background: 'var(--gold-bg)', color: 'var(--gold-text)' }}>Kopieren</button>
          </div>
        )}

        {/* ── Content Area ────────────────────────────── */}
        <div className="flex-1 overflow-y-auto scrollbar-gold relative">

          {/* Video */}
          {isVideo && (
            <div className="relative" style={{ background: '#000' }}>
              <video
                ref={videoRef}
                src={item.file_url}
                className="w-full"
                style={{ maxHeight: '60vh' }}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onClick={togglePlay}
              />
              {/* Play Overlay */}
              {!playing && (
                <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={togglePlay}>
                  <div className="flex items-center justify-center" style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(200,169,110,.9)' }}>
                    <Icon name="player-play" size={28} style={{ color: '#fff', marginLeft: 3 }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Audio */}
          {isAudio && (
            <div className="p-8 flex flex-col items-center gap-6" style={{ background: 'linear-gradient(180deg, var(--glass) 0%, var(--card-bg) 100%)' }}>
              <audio ref={audioRef} src={item.file_url} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
              {/* Album Art */}
              <div className="flex items-center justify-center" style={{ width: 160, height: 160, borderRadius: 8, background: 'var(--glass)', border: `1px solid ${border}` }}>
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover rounded-[8px]" />
                ) : (
                  <Icon name="microphone" size={48} style={{ color: 'var(--gold)' }} />
                )}
              </div>
              <div className="text-center">
                <div style={{ fontSize: 18, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: 'var(--text-h)' }}>{item.title}</div>
                {item.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{item.description}</div>}
              </div>
              {/* Play Button */}
              <button onClick={togglePlay} className="border-none cursor-pointer flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))' }}>
                <Icon name={playing ? 'player-pause' : 'player-play'} size={24} style={{ color: 'var(--text-on-gold)', marginLeft: playing ? 0 : 2 }} />
              </button>
            </div>
          )}

          {/* PDF / eBook */}
          {isPdf && (
            <div className="flex flex-col items-center p-4">
              <iframe src={`${item.file_url}#page=${pdfPage}`} className="w-full border-0 rounded-[8px]" style={{ height: '60vh', background: '#fff' }} title={item.title} />
              <div className="flex items-center gap-3 mt-3">
                <button onClick={() => setPdfPage(p => Math.max(1, p - 1))} className="border-none cursor-pointer p-1.5 rounded-[4px]" style={{ background: 'var(--glass)' }}>
                  <Icon name="chevron-left" size={16} style={{ color: 'var(--text-muted)' }} />
                </button>
                <span style={{ fontSize: 12, color: 'var(--text-sec)' }}>Seite {pdfPage}</span>
                <button onClick={() => setPdfPage(p => p + 1)} className="border-none cursor-pointer p-1.5 rounded-[4px]" style={{ background: 'var(--glass)' }}>
                  <Icon name="chevron-right" size={16} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
            </div>
          )}

          {/* Bild */}
          {isImage && (
            <div className="flex items-center justify-center p-4">
              <img src={item.file_url} alt={item.title} className="max-w-full rounded-[8px]" style={{ maxHeight: '65vh', objectFit: 'contain' }} />
            </div>
          )}

          {/* ── Premium Lock Overlay ─────────────────── */}
          {isPremiumLocked && (isVideo || isAudio) && currentTime >= previewSeconds && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(12px)' }}>
              <div className="text-center">
                <Icon name="lock" size={36} style={{ color: 'var(--gold)', margin: '0 auto 12px' }} />
                <div style={{ fontSize: 16, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#F0E8D8', marginBottom: 4 }}>
                  Premium-Inhalt
                </div>
                <p style={{ fontSize: 12, color: 'rgba(240,232,216,.6)', marginBottom: 16 }}>
                  Vorschau beendet. Schalte den Inhalt frei um weiterzuschauen.
                </p>
                <button className="border-none cursor-pointer" style={{
                  padding: '8px 20px', borderRadius: 9999, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase',
                  background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))', color: 'var(--text-on-gold)',
                }}>
                  <Icon name="sparkles" size={12} /> Freischalten · {item.price_cents > 0 ? `${(item.price_cents / 100).toFixed(0)} €` : 'Premium'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Timeline + Controls (Video/Audio) ──────── */}
        {(isVideo || isAudio) && (
          <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: `1px solid var(--divider-l)` }}>
            {/* Progress Bar */}
            <div className="relative cursor-pointer mb-2" style={{ height: 6, background: 'var(--glass)', borderRadius: 3 }} onClick={handleSeek}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--gold)', borderRadius: 3, transition: 'width 0.1s' }} />
              {/* Kapitel-Marker */}
              {chapters.map((ch, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ left: `${(ch.time / duration) * 100}%`, width: 8, height: 8, borderRadius: '50%', background: 'var(--gold-text)', border: '2px solid var(--card-bg)', transform: 'translate(-50%, -50%)' }}
                  title={ch.label}
                  onClick={(e) => { e.stopPropagation(); seekTo(ch.time); }}
                />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={togglePlay} className="border-none cursor-pointer p-0" style={{ background: 'none' }}>
                  <Icon name={playing ? 'player-pause' : 'player-play'} size={18} style={{ color: 'var(--text-h)' }} />
                </button>
                <span style={{ fontSize: 11, color: 'var(--text-sec)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              {/* Kapitel-Liste */}
              {chapters.length > 0 && (
                <div className="flex items-center gap-1.5">
                  {chapters.map((ch, i) => (
                    <button key={i} onClick={() => seekTo(ch.time)} className="border-none cursor-pointer" style={{
                      padding: '2px 6px', borderRadius: 4, fontSize: 9, background: currentTime >= ch.time ? 'var(--gold-bg)' : 'var(--glass)', color: currentTime >= ch.time ? 'var(--gold-text)' : 'var(--text-muted)',
                    }}>{ch.label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Verwandte Inhalte ───────────────────────── */}
        {relatedItems.length > 0 && (
          <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: `1px solid var(--divider-l)` }}>
            <div style={{ fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Das koennte dir auch gefallen</div>
            <div className="flex gap-2 overflow-x-auto scrollbar-gold pb-1">
              {relatedItems.slice(0, 4).map(r => (
                <button key={r.id} onClick={() => onSelectRelated?.(r)} className="flex items-center gap-2 border-none cursor-pointer flex-shrink-0 rounded-[8px] p-2" style={{ background: 'var(--glass)', border: `1px solid var(--glass-border)`, minWidth: 180 }}>
                  <div className="flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--gold-bg)' }}>
                    <Icon name={(({ video: 'video', audio: 'microphone', pdf: 'file-text', ebook: 'book', image: 'photo' } as Record<string, string>)[r.content_type] ?? 'file-text') as any} size={14} style={{ color: 'var(--gold)' }} />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="truncate" style={{ fontSize: 11, color: 'var(--text-h)' }}>{r.title}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{r.content_type}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Tags + Stats Footer ────────────────────── */}
        <div className="px-4 py-2 flex items-center justify-between flex-shrink-0" style={{ borderTop: `1px solid var(--divider-l)`, background: 'var(--glass)' }}>
          <div className="flex items-center gap-2">
            {item.tags?.map(tag => (
              <span key={tag} style={{ padding: '2px 6px', borderRadius: 4, fontSize: 8, background: 'var(--card-bg)', color: 'var(--text-muted)', border: '1px solid var(--glass-border)' }}>{tag}</span>
            ))}
          </div>
          <div className="flex items-center gap-3" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {item.rating_avg > 0 && <span className="flex items-center gap-0.5"><Icon name="star-filled" size={10} style={{ color: 'var(--gold)' }} /> {item.rating_avg.toFixed(1)}</span>}
            {item.download_count > 0 && <span>{item.download_count} Downloads</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
