'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProgression, checkOnboarding, type ProgressionStatus } from '@/lib/progression';

// ══════════════════════════════════════════════════════════════
// ONBOARDING WIZARD – Soul 1 → 2 (Variante B: Horizontal Journey)
// Horizontale Reise-Leiste (Start → Ziel) mit Fokus-Karte
// Wird auf der Profil-Seite angezeigt solange soul_level === 1
// ══════════════════════════════════════════════════════════════

interface StepMeta {
  icon: string;
  title: string;
  description: string;
  link: string;
  shortLabel: string;
}

const STEP_META: Record<string, StepMeta> = {
  avatar: {
    icon: 'M12 2a5 5 0 1 1 -5 5l0 .001a5 5 0 0 1 10 0l0 -.001a5 5 0 0 1 -5 -5z M2 19.875c0 -2.399 3.385 -4.375 10 -4.375s10 1.976 10 4.375v.625a1 1 0 0 1 -1 1h-18a1 1 0 0 1 -1 -1v-.625z',
    title: 'Zeig dich',
    description: 'Lade ein Profilbild hoch, damit andere dich erkennen und sich mit dir verbinden koennen.',
    link: '/profile',
    shortLabel: 'Bild',
  },
  bio: {
    icon: 'M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4 M13.5 6.5l4 4',
    title: 'Erzaehl etwas ueber dich',
    description: 'Ein paar Worte ueber dich helfen anderen, Gemeinsamkeiten zu entdecken – schreib einfach drauf los.',
    link: '/profile',
    shortLabel: 'Bio',
  },
  interests: {
    icon: 'M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z',
    title: 'Was interessiert dich?',
    description: 'Waehle mindestens 3 Interessen aus. So finden wir passende Events, Beitraege und Gleichgesinnte fuer dich.',
    link: '/profile',
    shortLabel: 'Interessen',
  },
  location: {
    icon: 'M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0 M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z',
    title: 'Wo bist du zuhause?',
    description: 'Dein Standort hilft uns, dir Events und Gleichgesinnte in deiner Naehe zu zeigen. Wir nutzen nur die Stadt – deine genaue Adresse bleibt privat.',
    link: '/profile',
    shortLabel: 'Standort',
  },
  connection: {
    icon: 'M7 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M5 22v-5l-1 -1v-4a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4l-1 1v5 M17 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M15 22v-4h-2l2 -6a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1l2 6h-2v4',
    title: 'Deine erste Verbindung',
    description: 'Schick eine Verbindungsanfrage an jemanden, der dich inspiriert. Gemeinsam wachsen macht mehr Spass.',
    link: '/circles',
    shortLabel: 'Verbindung',
  },
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

  // Finde den naechsten offenen Schritt
  const nextStep = status.requirements.find((r) => !r.completed);
  const nextStepMeta = nextStep ? STEP_META[nextStep.key] : null;

  // Fortschritts-Breite fuer die Journey-Linie (prozentual)
  const progressWidth = totalCount > 1
    ? Math.round((completedCount / (totalCount - 1)) * 100)
    : 0;

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
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3
            className="font-heading text-xl"
            style={{ color: 'var(--text-primary)' }}
          >
            Deine Reise
          </h3>
          <p
            className="font-body text-sm mt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            {allCompleted
              ? 'Alle Schritte erledigt – schalte jetzt frei'
              : `Noch ${totalCount - completedCount} ${totalCount - completedCount === 1 ? 'Schritt' : 'Schritte'} bis Awakened Soul`}
          </p>
        </div>
        <span
          className="font-label text-xs px-3 py-1 rounded-full"
          style={{
            background: 'var(--accent-muted)',
            color: 'var(--accent)',
          }}
        >
          {completedCount} / {totalCount}
        </span>
      </div>

      {/* ── Horizontale Journey-Leiste ── */}
      <div className="flex items-center gap-0 mb-6 px-1">
        {/* Start Label */}
        <span
          className="font-label text-[0.5rem] tracking-[0.08em] uppercase flex-shrink-0"
          style={{ color: 'var(--text-muted)' }}
        >
          Start
        </span>

        {/* Track mit Nodes */}
        <div className="flex-1 relative mx-2.5" style={{ height: '20px' }}>
          {/* Hintergrund-Linie */}
          <div
            className="absolute left-0 right-0 top-1/2 -translate-y-1/2 rounded-full"
            style={{ height: '2px', background: 'var(--bg-tertiary)' }}
          />
          {/* Fortschritts-Linie */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full transition-all duration-700 ease-out"
            style={{
              height: '2px',
              width: `${Math.min(progressWidth, 100)}%`,
              background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
            }}
          />

          {/* Nodes */}
          <div className="relative flex justify-between items-center h-full">
            {status.requirements.map((req) => {
              const meta = STEP_META[req.key];
              const isActive = nextStep?.key === req.key;

              return (
                <div key={req.key} className="group relative flex flex-col items-center">
                  {/* Node */}
                  <button
                    onClick={() => {
                      if (meta?.link) router.push(meta.link);
                    }}
                    className="w-5 h-5 rounded-full flex items-center justify-center z-[2] transition-all"
                    style={{
                      background: req.completed
                        ? 'var(--accent)'
                        : isActive
                          ? 'var(--bg-elevated)'
                          : 'var(--bg-elevated)',
                      border: req.completed
                        ? 'none'
                        : isActive
                          ? '2px solid var(--accent)'
                          : '1.5px solid rgba(255,255,255,0.08)',
                      animation: isActive ? 'wizard-pulse 2s infinite' : 'none',
                    }}
                  >
                    {req.completed && (
                      <svg
                        viewBox="0 0 24 24"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="var(--text-on-gold, #1A1714)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12l5 5l10 -10" />
                      </svg>
                    )}
                    {isActive && (
                      <svg
                        viewBox="0 0 24 24"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d={meta?.icon ?? ''} />
                      </svg>
                    )}
                  </button>

                  {/* Hover-Tooltip */}
                  <div
                    className="absolute bottom-full mb-2 px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-body)',
                    }}
                  >
                    {meta?.shortLabel ?? req.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ziel: Enso */}
        <span
          className="font-label text-[0.5rem] tracking-[0.08em] uppercase flex-shrink-0 flex items-center gap-1"
          style={{ color: 'var(--accent)' }}
        >
          <svg viewBox="0 0 100 100" width="16" height="16">
            <defs>
              <linearGradient id="wizard-enso" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A8894E" />
                <stop offset="100%" stopColor="#D4BC8B" />
              </linearGradient>
            </defs>
            <circle
              cx="50" cy="50" r="36" fill="none"
              stroke="url(#wizard-enso)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray="196 30" strokeDashoffset="15"
            />
          </svg>
          Ziel
        </span>
      </div>

      {/* ── Fokus-Karte: Naechster Schritt ── */}
      {nextStepMeta && !allCompleted && (
        <div
          className="rounded-xl p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(200,169,110,0.08), rgba(200,169,110,0.02))',
            border: '1px solid rgba(200,169,110,0.12)',
          }}
        >
          <div className="flex items-start gap-3.5 mb-4">
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--accent-muted)' }}
            >
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={nextStepMeta.icon} />
              </svg>
            </div>
            {/* Text */}
            <div className="flex-1">
              <h4
                className="font-heading text-lg mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                {nextStepMeta.title}
              </h4>
              <p
                className="font-body text-[12.5px] leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                {nextStepMeta.description}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push(nextStepMeta.link)}
              className="font-label text-[0.63rem] tracking-[0.1em] uppercase px-6 py-2.5 rounded-full transition-all hover:-translate-y-px"
              style={{
                background: 'linear-gradient(135deg, #A8894E, #C8A96E)',
                color: 'var(--text-on-gold, #1A1714)',
                boxShadow: '0 4px 16px rgba(200,169,110,0.25)',
              }}
            >
              {nextStep?.key === 'connection' ? 'Verbindung senden' : nextStepMeta.shortLabel + ' setzen'}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="font-body text-[11.5px] transition-colors hover:opacity-80"
              style={{ color: 'var(--text-muted)' }}
            >
              Spaeter
            </button>
          </div>
        </div>
      )}

      {/* ── Bonus: Geburtsdatum ── */}
      {!allCompleted && (
        <button
          onClick={() => router.push('/profile')}
          className="w-full mt-3 flex items-center gap-2.5 p-2.5 px-3.5 rounded-xl transition-all hover:opacity-90"
          style={{
            background: 'rgba(200,169,110,0.04)',
            border: '1px dashed rgba(200,169,110,0.15)',
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--accent-muted)' }}
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
            </svg>
          </div>
          <p
            className="font-body text-[11.5px] text-left flex-1 leading-snug"
            style={{ color: 'var(--text-muted)' }}
          >
            <strong style={{ color: 'var(--accent)' }}>Wann hast du Geburtstag?</strong>
            <br />
            Du bekommst dein Sternzeichen am Profil und persoenliche Impulse.
          </p>
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flex-shrink-0"
          >
            <path d="M9 6l6 6l-6 6" />
          </svg>
        </button>
      )}

      {/* ── CTA: Alles erledigt ── */}
      {allCompleted && (
        <button
          onClick={handleCheckOnboarding}
          disabled={isChecking}
          className="w-full mt-4 py-3 rounded-full font-label text-sm tracking-wide transition-all hover:-translate-y-px"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
            color: 'var(--text-on-gold, #1A1714)',
            boxShadow: '0 4px 16px rgba(200,169,110,0.25)',
            opacity: isChecking ? 0.7 : 1,
          }}
        >
          {isChecking ? 'Wird geprueft …' : 'Awakened Soul freischalten'}
        </button>
      )}
    </div>
  );
}
