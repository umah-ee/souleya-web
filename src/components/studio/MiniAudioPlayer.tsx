'use client';

import { useRef, useState, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { MediaItem } from '@/types/studio';

interface Props {
  item: MediaItem;
  onClose: () => void;
  onExpand: () => void;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MiniAudioPlayer({ item, onClose, onExpand }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Fortschritt laden
  useEffect(() => {
    const saved = localStorage.getItem(`media-progress-${item.id}`);
    if (saved && audioRef.current) {
      audioRef.current.currentTime = parseFloat(saved);
    }
  }, [item.id]);

  // Autoplay
  useEffect(() => {
    audioRef.current?.play().catch(() => {});
    setPlaying(true);
  }, [item.id]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[150] flex items-center gap-3 px-4 py-2"
      style={{
        background: 'var(--bg-elevated)',
        borderTop: '1px solid var(--gold-border-s)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <audio
        ref={audioRef}
        src={item.file_url}
        onTimeUpdate={(e) => {
          const t = (e.target as HTMLAudioElement).currentTime;
          setCurrentTime(t);
          if (Math.floor(t) % 5 === 0) localStorage.setItem(`media-progress-${item.id}`, String(t));
        }}
        onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Thumbnail */}
      <div className="flex-shrink-0 rounded-[4px] overflow-hidden cursor-pointer" style={{ width: 36, height: 36, background: 'var(--glass)' }} onClick={onExpand}>
        {item.thumbnail_url ? (
          <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="microphone" size={16} style={{ color: 'var(--gold)' }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onExpand}>
        <div className="truncate" style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-h)' }}>{item.title}</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{formatTime(currentTime)} / {formatTime(duration)}</div>
      </div>

      {/* Progress Bar (mini) */}
      <div className="flex-1 max-w-[200px] hidden md:block">
        <div style={{ height: 3, background: 'var(--glass)', borderRadius: 2 }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--gold)', borderRadius: 2, transition: 'width 0.2s' }} />
        </div>
      </div>

      {/* Controls */}
      <button onClick={togglePlay} className="border-none cursor-pointer p-0 flex-shrink-0" style={{ background: 'none' }}>
        <Icon name={playing ? 'player-pause' : 'player-play'} size={20} style={{ color: 'var(--text-h)' }} />
      </button>
      <button onClick={onClose} className="border-none cursor-pointer p-0 flex-shrink-0" style={{ background: 'none' }}>
        <Icon name="x" size={16} style={{ color: 'var(--text-muted)' }} />
      </button>
    </div>
  );
}
