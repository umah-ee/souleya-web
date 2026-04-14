'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from '@/components/ui/Icon';
import EnsoRing from '@/components/ui/EnsoRing';
import {
  fetchDailyMeditation, fetchNextMeditation, fetchMeditationStreak,
  completeMeditation, skipMeditation, rateMeditation,
} from '@/lib/studio';
import type { MediaItem, MeditationStreak } from '@/types/studio';

interface Props {
  onRemove: () => void;
}

type Phase = 'loading' | 'ready' | 'playing' | 'rating' | 'empty';

function getTimeOfDay(): 'morning' | 'evening' {
  const hour = new Date().getHours();
  return hour < 14 ? 'morning' : 'evening';
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MeditationModule({ onRemove }: Props) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [meditation, setMeditation] = useState<MediaItem | null>(null);
  const [streak, setStreak] = useState<MeditationStreak>({ streak: 0, total: 0 });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showMentorPref, setShowMentorPref] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Meditation laden ──────────────────────────────────────
  const loadMeditation = useCallback(async () => {
    setPhase('loading');
    try {
      const [med, str] = await Promise.all([
        fetchDailyMeditation(getTimeOfDay()),
        fetchMeditationStreak(),
      ]);
      if (med) {
        setMeditation(med);
        setDuration(med.duration_seconds ?? 0);
        setStreak(str);
        setPhase('ready');
      } else {
        setPhase('empty');
      }
    } catch {
      setPhase('empty');
    }
  }, []);

  useEffect(() => { loadMeditation(); }, [loadMeditation]);

  // ── Audio Controls ────────────────────────────────────────
  const play = () => {
    if (!meditation) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(meditation.file_url);
      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current) setDuration(Math.floor(audioRef.current.duration));
      });
      audioRef.current.addEventListener('ended', () => handleComplete());
    }
    audioRef.current.play();
    setPhase('playing');
    progressInterval.current = setInterval(() => {
      if (audioRef.current) setCurrentTime(Math.floor(audioRef.current.currentTime));
    }, 500);
  };

  const pause = () => {
    audioRef.current?.pause();
    if (progressInterval.current) clearInterval(progressInterval.current);
    setPhase('ready');
  };

  const cleanup = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (progressInterval.current) clearInterval(progressInterval.current);
    setCurrentTime(0);
  };

  // ── Interaktionen ─────────────────────────────────────────
  const handleComplete = async () => {
    cleanup();
    setPhase('rating');
    if (meditation) {
      await completeMeditation(meditation.id, duration).catch(() => {});
      const str = await fetchMeditationStreak().catch(() => streak);
      setStreak(str);
    }
  };

  const handleSkip = async () => {
    if (!meditation) return;
    const listened = currentTime;
    cleanup();
    await skipMeditation(meditation.id, listened).catch(() => {});
    // Naechste Meditation laden
    try {
      const next = await fetchNextMeditation(meditation.id, getTimeOfDay());
      if (next) {
        setMeditation(next);
        setDuration(next.duration_seconds ?? 0);
        setPhase('ready');
      } else {
        setPhase('empty');
      }
    } catch {
      setPhase('empty');
    }
  };

  const handleLike = async () => {
    if (!meditation) return;
    await rateMeditation(meditation.id, 'like', duration).catch(() => {});
    setShowMentorPref(true);
  };

  const handleMentorPref = async (type: 'more_mentor' | 'less_mentor') => {
    if (!meditation) return;
    await rateMeditation(meditation.id, type, duration).catch(() => {});
    setShowMentorPref(false);
    setPhase('ready');
    setCurrentTime(0);
  };

  const handleDismissRating = () => {
    setShowMentorPref(false);
    setPhase('ready');
    setCurrentTime(0);
  };

  // Cleanup on unmount
  useEffect(() => () => cleanup(), []);

  const mentor = meditation?.mentor;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="rounded-[8px] overflow-hidden"
      style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-3">
        <Icon name="music" size={18} style={{ color: 'var(--gold)' }} />
        <span className="flex-1 font-label text-[11px] tracking-[0.06em] uppercase" style={{ color: 'var(--text-h)' }}>
          Meditation
        </span>
        {streak.streak > 0 && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ fontSize: 9, background: 'var(--gold-bg)', color: 'var(--gold-text)', border: '1px solid var(--gold-border-s)' }}>
            <Icon name="flame" size={10} style={{ color: 'var(--gold)' }} />
            {streak.streak} Tage
          </span>
        )}
        <button
          onClick={onRemove}
          className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
          style={{ border: '1px solid var(--glass-border)', color: 'var(--text-muted)', background: 'transparent' }}
        >
          <Icon name="x" size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 pb-4 pt-3">
        {phase === 'loading' && (
          <div className="flex items-center justify-center py-6">
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Laden …</span>
          </div>
        )}

        {phase === 'empty' && (
          <div className="flex flex-col items-center gap-2 py-4">
            <Icon name="music-off" size={24} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
              Noch keine Meditationen verfuegbar.
            </span>
          </div>
        )}

        {(phase === 'ready' || phase === 'playing') && meditation && (
          <>
            {/* Mentor-Card */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-shrink-0">
                <EnsoRing
                  soulLevel={mentor?.soul_level ?? 1}
                  isFirstLight={mentor?.is_first_light ?? false}
                  size="small"
                >
                  {mentor?.avatar_url ? (
                    <img src={mentor.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="flex items-center justify-center w-full h-full text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {(mentor?.display_name ?? '?').slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </EnsoRing>
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-h)' }}>
                  {mentor?.display_name ?? 'Mentor'}
                </div>
                <div className="flex items-center gap-2" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  <span>{meditation.meditation_type ?? 'Meditation'}</span>
                  <span>·</span>
                  <span>{Math.round((meditation.duration_seconds ?? 0) / 60)} Min</span>
                </div>
              </div>
              {/* Skip (Swipe-Alternative) */}
              <button
                onClick={handleSkip}
                className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0"
                style={{ border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-muted)' }}
                title="Naechste Meditation"
              >
                <Icon name="player-skip-forward" size={14} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: 'var(--glass-border)' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--gold)', borderRadius: 9999, transition: 'width 0.5s linear' }} />
              </div>
              <div className="flex justify-between mt-1" style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Play/Pause */}
            <div className="flex justify-center">
              <button
                onClick={phase === 'playing' ? pause : play}
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer border-none transition-transform duration-150"
                style={{ background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <Icon
                  name={phase === 'playing' ? 'player-pause' : 'player-play'}
                  size={18}
                  style={{ color: 'var(--text-on-gold)' }}
                />
              </button>
            </div>
          </>
        )}

        {/* Rating Phase */}
        {phase === 'rating' && meditation && !showMentorPref && (
          <div className="flex flex-col items-center gap-3 py-2">
            <span style={{ fontSize: 12, color: 'var(--text-h)', fontWeight: 500 }}>
              Wie war die Meditation?
            </span>
            <div className="flex gap-3">
              {/* Like */}
              <button
                onClick={handleLike}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-[8px] cursor-pointer border-none transition-all"
                style={{ background: 'var(--gold-bg)', border: '1px solid var(--gold-border-s)' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <Icon name="heart" size={20} style={{ color: 'var(--gold)' }} />
                <span style={{ fontSize: 9, color: 'var(--gold-text)' }}>Gefaellt mir</span>
              </button>
              {/* Skip / Neutral */}
              <button
                onClick={handleDismissRating}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-[8px] cursor-pointer border-none transition-all"
                style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}
              >
                <Icon name="arrow-right" size={20} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Weiter</span>
              </button>
            </div>
          </div>
        )}

        {/* Mentor Preference (after Like) */}
        {phase === 'rating' && showMentorPref && meditation && (
          <div className="flex flex-col items-center gap-3 py-2">
            <span style={{ fontSize: 12, color: 'var(--text-h)', fontWeight: 500 }}>
              Mehr von {mentor?.display_name ?? 'diesem Mentor'}?
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => handleMentorPref('more_mentor')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full cursor-pointer border-none"
                style={{ background: 'var(--gold-bg)', border: '1px solid var(--gold-border-s)', color: 'var(--gold-text)', fontSize: 11 }}
              >
                <Icon name="check" size={14} /> Ja, gerne
              </button>
              <button
                onClick={() => handleMentorPref('less_mentor')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full cursor-pointer border-none"
                style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: 11 }}
              >
                <Icon name="x" size={14} /> Lieber nicht
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
