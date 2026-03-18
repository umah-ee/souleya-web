'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProgression, checkOnboarding, type ProgressionStatus } from '@/lib/progression';

// ══════════════════════════════════════════════════════════════
// ONBOARDING WIZARD – Soul 1 → 2 Checklist
// Sichtbar auf dem Dashboard (Pulse-Seite) solange soul_level === 1
// Glasmorphism-Card mit 5 Schritten + Fortschrittsbalken
// ══════════════════════════════════════════════════════════════

const STEP_LINKS: Record<string, string> = {
  avatar: '/profile',
  bio: '/profile',
  interests: '/profile',
  location: '/profile',
  connection: '/circles',
};

const STEP_ICONS: Record<string, string> = {
  avatar: 'M12 2a5 5 0 1 1 -5 5l0 .001a5 5 0 0 1 10 0l0 -.001a5 5 0 0 1 -5 -5z M2 19.875c0 -2.399 3.385 -4.375 10 -4.375s10 1.976 10 4.375v.625a1 1 0 0 1 -1 1h-18a1 1 0 0 1 -1 -1v-.625z', // user
  bio: 'M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4 M13.5 6.5l4 4', // pencil
  interests: 'M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z', // star
  location: 'M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0 M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z', // map-pin
  connection: 'M7 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M5 22v-5l-1 -1v-4a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4l-1 1v5 M17 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M15 22v-4h-2l2 -6a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1l2 6h-2v4', // users
};

interface Props {
  soulLevel: number;
  onLevelUp?: () => void;
}

export default function OnboardingWizard({ soulLevel, onLevelUp }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<ProgressionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Nur anzeigen fuer Soul Level 1
  const shouldShow = soulLevel === 1 && !dismissed;

  const loadStatus = useCallback(async () => {
    if (!shouldShow) return;
    try {
      const data = await fetchProgression();
      setStatus(data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [shouldShow]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleCheckOnboarding = async () => {
    setIsChecking(true);
    try {
      const result = await checkOnboarding();
      if (result.leveled_up) {
        onLevelUp?.();
        setDismissed(true);
      } else {
        // Reload status um aktuelle Daten zu zeigen
        await loadStatus();
      }
    } catch {
      // silent
    } finally {
      setIsChecking(false);
    }
  };

  if (!shouldShow || isLoading || !status) return null;

  const completedCount = status.requirements.filter((r) => r.completed).length;
  const totalCount = status.requirements.length;
  const allCompleted = completedCount === totalCount;

  return (
    <div
      className="rounded-2xl p-5 mb-6"
      style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3
            className="font-heading text-lg"
            style={{ color: 'var(--text-primary)' }}
          >
            Willkommen bei Souleya
          </h3>
          <p
            className="font-body text-sm mt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            Schliesse diese Schritte ab, um dein Profil freizuschalten
          </p>
        </div>
        <span
          className="font-label text-xs px-2.5 py-1 rounded-full"
          style={{
            background: 'var(--accent-muted)',
            color: 'var(--accent)',
          }}
        >
          {completedCount} / {totalCount}
        </span>
      </div>

      {/* Fortschrittsbalken */}
      <div
        className="h-2 rounded-full mb-5 overflow-hidden"
        style={{ background: 'var(--bg-tertiary)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${status.overallProgress}%`,
            background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
          }}
        />
      </div>

      {/* Schritte */}
      <div className="space-y-3">
        {status.requirements.map((req) => (
          <button
            key={req.key}
            onClick={() => {
              const link = STEP_LINKS[req.key];
              if (link) router.push(link);
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.01]"
            style={{
              background: req.completed
                ? 'var(--accent-muted)'
                : 'var(--bg-secondary)',
              border: `1px solid ${req.completed ? 'var(--accent)' : 'transparent'}`,
              opacity: req.completed ? 0.8 : 1,
            }}
          >
            {/* Icon */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: req.completed ? 'var(--accent)' : 'var(--bg-tertiary)',
              }}
            >
              {req.completed ? (
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12l5 5l10 -10" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="var(--text-muted)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={STEP_ICONS[req.key] ?? ''} />
                </svg>
              )}
            </div>

            {/* Text */}
            <span
              className="font-body text-sm text-left flex-1"
              style={{
                color: req.completed ? 'var(--accent)' : 'var(--text-primary)',
                textDecoration: req.completed ? 'line-through' : 'none',
              }}
            >
              {req.label}
            </span>

            {/* Pfeil */}
            {!req.completed && (
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 6l6 6l-6 6" />
              </svg>
            )}
          </button>
        ))}
      </div>

      {/* CTA Button */}
      {allCompleted && (
        <button
          onClick={handleCheckOnboarding}
          disabled={isChecking}
          className="w-full mt-5 py-3 rounded-full font-label text-sm tracking-wide transition-all"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
            color: '#fff',
            opacity: isChecking ? 0.7 : 1,
          }}
        >
          {isChecking ? 'Wird geprueft …' : 'Profil freischalten'}
        </button>
      )}
    </div>
  );
}
