'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchProgression, type ProgressionStatus } from '@/lib/progression';

// ══════════════════════════════════════════════════════════════
// SOUL PROGRESS CARD – Fortschritt zum naechsten Level
// Glasmorphism-Card auf der Profil-Seite
// Zeigt Requirements, Fortschrittsbalken und Unlocks
// ══════════════════════════════════════════════════════════════

interface Props {
  soulLevel: number;
}

export default function SoulProgressCard({ soulLevel }: Props) {
  const [status, setStatus] = useState<ProgressionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStatus = useCallback(async () => {
    try {
      const data = await fetchProgression();
      setStatus(data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Soul 1 = Overlay-Wizard, Soul 5 = Maximum
  if (soulLevel < 2 || soulLevel >= 5 || isLoading || !status || !status.nextLevel) return null;

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
      }}
    >
      {/* Header */}
      <h3
        className="font-heading text-base mb-1"
        style={{ color: 'var(--text-primary)' }}
      >
        Dein Weg zu {status.nextLevelName}
      </h3>
      <p
        className="font-body text-xs mb-4"
        style={{ color: 'var(--text-muted)' }}
      >
        Soul {status.currentLevel} · {status.currentLevelName}
      </p>

      {/* Fortschrittsbalken */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span
            className="font-label text-[0.65rem] tracking-wide uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            Fortschritt
          </span>
          <span
            className="font-body text-xs font-semibold"
            style={{ color: 'var(--accent)' }}
          >
            {status.overallProgress}%
          </span>
        </div>
        <div
          className="h-2.5 rounded-full overflow-hidden"
          style={{ background: 'var(--bg-tertiary)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${status.overallProgress}%`,
              background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
            }}
          />
        </div>
      </div>

      {/* Requirements */}
      <div className="space-y-2.5 mb-4">
        {status.requirements.map((req) => (
          <div key={req.key} className="flex items-center gap-2.5">
            {/* Checkbox */}
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
              style={{
                background: req.completed ? 'var(--accent)' : 'transparent',
                border: req.completed ? 'none' : '1.5px solid var(--text-muted)',
              }}
            >
              {req.completed && (
                <svg
                  viewBox="0 0 24 24"
                  width="12"
                  height="12"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12l5 5l10 -10" />
                </svg>
              )}
            </div>

            {/* Label + Progress */}
            <div className="flex-1 min-w-0">
              <span
                className="font-body text-sm"
                style={{
                  color: req.completed ? 'var(--accent)' : 'var(--text-primary)',
                }}
              >
                {req.label}
              </span>
            </div>

            {/* Zaehler */}
            <span
              className="font-body text-xs flex-shrink-0"
              style={{
                color: req.completed ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              {typeof req.current === 'number' && typeof req.target === 'number'
                ? `${req.current} / ${req.target}`
                : req.completed
                  ? '✓'
                  : '–'}
            </span>
          </div>
        ))}
      </div>

      {/* Unlocks Preview */}
      {status.unlocksAtNextLevel.length > 0 && (
        <div
          className="rounded-xl p-3"
          style={{ background: 'var(--bg-secondary)' }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 11m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z" />
              <path d="M12 16m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
              <path d="M8 11v-4a4 4 0 0 1 8 0v4" />
            </svg>
            <span
              className="font-label text-[0.6rem] tracking-wide uppercase"
              style={{ color: 'var(--accent)' }}
            >
              Schaltet frei
            </span>
          </div>
          <div className="space-y-1">
            {status.unlocksAtNextLevel.map((unlock, i) => (
              <p
                key={i}
                className="font-body text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                · {unlock}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
