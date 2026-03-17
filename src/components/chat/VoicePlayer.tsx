'use client';

import { useState, useRef, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';

interface Props {
  src: string;
  durationMs?: number;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export default function VoicePlayer({ src, durationMs }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationMs ? durationMs / 1000 : 0);
  const [loadError, setLoadError] = useState(false);

  // Audio als Blob fetchen und Object URL erstellen
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let cancelled = false;

    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        // Blob mit korrektem MIME-Type erstellen
        const mimeType = src.includes('.mp4') ? 'audio/mp4' : 'audio/webm';
        const typedBlob = new Blob([blob], { type: mimeType });
        const url = URL.createObjectURL(typedBlob);
        objectUrlRef.current = url;
        audio.src = url;
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Audio laden fehlgeschlagen:', err);
        setLoadError(true);
      });

    return () => {
      cancelled = true;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [src]);

  // Audio-Events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && isFinite(audio.duration)) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const onLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    const onError = () => {
      console.error('Audio-Wiedergabe fehlgeschlagen:', audio.error?.message);
      setIsPlaying(false);
      setLoadError(true);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || loadError) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Audio-Wiedergabe fehlgeschlagen:', err));
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  };

  return (
    <div className="flex items-center gap-2 min-w-[180px]">
      <audio ref={audioRef} preload="auto" />

      <button
        onClick={togglePlay}
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
        style={{
          background: loadError ? 'var(--text-muted)' : 'var(--gold-bg)',
          color: loadError ? 'var(--bg)' : 'var(--gold-text)',
          opacity: loadError ? 0.5 : 1,
        }}
      >
        <Icon name={isPlaying ? 'player-pause' : 'player-play'} size={14} />
      </button>

      <div className="flex-1 flex flex-col gap-0.5">
        {/* Progress Bar */}
        <div
          className="h-1 rounded-full cursor-pointer relative"
          style={{ background: 'rgba(200,169,110,0.15)' }}
          onClick={handleProgressClick}
        >
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all"
            style={{ width: `${progress}%`, background: 'var(--gold)' }}
          />
        </div>

        {/* Duration */}
        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
          {loadError
            ? 'Nicht abspielbar'
            : isPlaying || currentTime > 0
              ? formatDuration(currentTime * 1000)
              : formatDuration(duration * 1000)
          }
        </span>
      </div>
    </div>
  );
}
