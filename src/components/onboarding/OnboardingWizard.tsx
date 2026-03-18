'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProgression, checkOnboarding, type ProgressionStatus } from '@/lib/progression';
import EnsoRing from '@/components/ui/EnsoRing';

// ══════════════════════════════════════════════════════════════
// ONBOARDING WIZARD – Soul 1 → 2 (Fullscreen Overlay)
// Horizontale Reise-Leiste (Start → Ziel) mit Fokus-Karte
// Erscheint als Overlay ueber dem Profil bei soul_level === 1
// Mockup-Referenz: Mockups/Souleya_OnboardingWizard_Overlay.html
// ══════════════════════════════════════════════════════════════

interface StepMeta {
  icon: string;
  title: string;
  description: string;
  btnLabel: string;
  link: string;
  shortLabel: string;
}

const STEP_META: Record<string, StepMeta> = {
  avatar: {
    icon: 'M12 2a5 5 0 1 1 -5 5l0 .001a5 5 0 0 1 10 0l0 -.001a5 5 0 0 1 -5 -5z M2 19.875c0 -2.399 3.385 -4.375 10 -4.375s10 1.976 10 4.375v.625a1 1 0 0 1 -1 1h-18a1 1 0 0 1 -1 -1v-.625z',
    title: 'Zeig dich',
    description: 'Lade ein Profilbild hoch, damit andere dich erkennen und sich mit dir verbinden koennen.',
    btnLabel: 'Bild setzen',
    link: '/profile',
    shortLabel: 'Profilbild',
  },
  bio: {
    icon: 'M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4 M13.5 6.5l4 4',
    title: 'Erzaehl etwas ueber dich',
    description: 'Ein paar Worte ueber dich helfen anderen, Gemeinsamkeiten zu entdecken – schreib einfach drauf los.',
    btnLabel: 'Bio schreiben',
    link: '/profile',
    shortLabel: 'Bio',
  },
  interests: {
    icon: 'M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z',
    title: 'Was interessiert dich?',
    description: 'Waehle mindestens 3 Interessen aus. So finden wir passende Events, Beitraege und Gleichgesinnte fuer dich.',
    btnLabel: 'Interessen waehlen',
    link: '/profile',
    shortLabel: 'Interessen',
  },
  location: {
    icon: 'M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0 M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z',
    title: 'Wo bist du zuhause?',
    description: 'Dein Standort hilft uns, dir Events und Gleichgesinnte in deiner Naehe zu zeigen. Wir nutzen nur die Stadt – deine genaue Adresse bleibt privat.',
    btnLabel: 'Standort setzen',
    link: '/profile',
    shortLabel: 'Standort',
  },
  connection: {
    icon: 'M7 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M5 22v-5l-1 -1v-4a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4l-1 1v5 M17 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M15 22v-4h-2l2 -6a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1l2 6h-2v4',
    title: 'Deine erste Verbindung',
    description: 'Schick eine Verbindungsanfrage an jemanden, der dich inspiriert. Gemeinsam wachsen macht mehr Spass.',
    btnLabel: 'Jemanden finden',
    link: '/circles',
    shortLabel: 'Verbindung',
  },
};

// Soul Level Dasharrays (aus Souleya_EnsoRing_Levels.html)
const LEVEL_DASHARRAY: Record<number, string> = {
  1: '45 181',
  2: '83 143',
  3: '120 106',
  4: '158 68',
  5: '196 30',
};

interface Props {
  soulLevel: number;
  isFirstLight?: boolean;
  avatarUrl?: string | null;
  onLevelUp?: () => void;
}

export default function OnboardingWizard({ soulLevel, isFirstLight, avatarUrl, onLevelUp }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<ProgressionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

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
        setShowComplete(true);
      } else {
        await loadStatus();
      }
    } catch {
      // silent
    } finally {
      setIsChecking(false);
    }
  };

  const handleCompleteClose = () => {
    onLevelUp?.();
    setDismissed(true);
    setShowComplete(false);
  };

  if (!shouldShow || isLoading || !status) return null;

  const completedCount = status.requirements.filter((r) => r.completed).length;
  const totalCount = status.requirements.length;
  const allCompleted = completedCount === totalCount;
  const remaining = totalCount - completedCount;

  // Finde den naechsten offenen Schritt
  const nextStep = status.requirements.find((r) => !r.completed);
  const nextStepMeta = nextStep ? STEP_META[nextStep.key] : null;

  // Fortschritts-Breite fuer die Journey-Linie
  const progressWidth = totalCount > 1
    ? Math.round((completedCount / (totalCount - 1)) * 100)
    : 0;

  // Fertig-State
  if (showComplete) {
    return (
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-5"
        style={{ animation: 'wizard-overlay-in 0.4s ease-out' }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{
            background: 'rgba(10, 10, 10, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        />

        {/* Card */}
        <div
          className="relative z-[1] w-full max-w-[480px] rounded-[20px] overflow-hidden text-center py-10 px-6"
          style={{
            background: 'rgba(30, 30, 30, 0.95)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255, 0.08)',
            boxShadow: '0 24px 80px rgba(0,0,0, 0.6)',
            animation: 'wizard-card-in 0.5s ease-out 0.1s both',
          }}
        >
          {/* Enso-Ring Level 2 mit Avatar */}
          <div className="relative w-[120px] h-[120px] mx-auto mb-5">
            <svg
              viewBox="0 0 100 100"
              width="120"
              height="120"
              className="absolute inset-0"
              style={{ animation: 'wizard-enso-glow 2s ease-in-out infinite alternate' }}
            >
              <defs>
                <linearGradient id="wizard-complete-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A8894E" />
                  <stop offset="100%" stopColor="#D4BC8B" />
                </linearGradient>
              </defs>
              {/* Awakened Soul (Level 2) Ring */}
              <circle
                cx="50" cy="50" r="36" fill="none"
                stroke="url(#wizard-complete-grad)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={LEVEL_DASHARRAY[2]} strokeDashoffset="15"
              />
              {/* First Light Halo + Leuchtpunkt */}
              {isFirstLight && (
                <>
                  <circle cx="82.8" cy="35.2" r="10" fill="#D4BC8B" opacity="0.35" className="wizard-fl-halo" />
                  <circle cx="82.8" cy="35.2" r="5" fill="#D4BC8B" opacity="0.9" />
                </>
              )}
            </svg>
            {/* Profilbild */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[76px] h-[76px] rounded-full overflow-hidden flex items-center justify-center"
              style={{
                background: 'var(--bg-elevated)',
                border: '2px solid rgba(255,255,255,0.06)',
              }}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-[28px]" style={{ color: 'var(--text-muted)' }}>?</span>
              )}
            </div>
          </div>

          <h2
            className="font-heading text-[26px] mb-1"
            style={{ color: 'var(--text-h, #F5F0E6)' }}
          >
            Du bist eine Awakened Soul
          </h2>
          <div
            className="font-label text-[0.6rem] tracking-[0.12em] uppercase mb-2"
            style={{ color: 'var(--accent, #C8A96E)' }}
          >
            Soul Level 2{isFirstLight ? ' · First Light' : ''}
          </div>
          <p
            className="text-[13px] leading-relaxed mb-6"
            style={{ color: 'var(--text-sec, #A09888)' }}
          >
            Dein Profil ist komplett. Willkommen in der Souleya-Gemeinschaft.
          </p>
          <button
            onClick={handleCompleteClose}
            className="font-label text-[0.7rem] tracking-[0.1em] uppercase px-8 py-3 rounded-full border-none cursor-pointer transition-all hover:-translate-y-px"
            style={{
              background: 'linear-gradient(135deg, #A8894E, #C8A96E)',
              color: 'var(--text-on-gold, #1A1714)',
              boxShadow: '0 4px 16px rgba(200,169,110,0.25)',
            }}
          >
            Los geht&apos;s
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-5"
      style={{ animation: 'wizard-overlay-in 0.4s ease-out' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(10, 10, 10, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      />

      {/* Card */}
      <div
        className="relative z-[1] w-full max-w-[480px] rounded-[20px] overflow-hidden"
        style={{
          background: 'rgba(30, 30, 30, 0.95)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255, 0.08)',
          boxShadow: '0 24px 80px rgba(0,0,0, 0.6), 0 0 0 1px rgba(200,169,110, 0.06)',
          animation: 'wizard-card-in 0.5s ease-out 0.1s both',
        }}
      >
        {/* ── Willkommen (nur bei 0 erledigten Schritten) ── */}
        {completedCount === 0 && (
          <div className="text-center pt-7 pb-1 px-6">
            <div className="mb-3 opacity-80">
              <svg viewBox="0 0 100 100" width="48" height="48" className="inline-block">
                <defs>
                  <linearGradient id="wizard-welcome-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A8894E" />
                    <stop offset="100%" stopColor="#D4BC8B" />
                  </linearGradient>
                </defs>
                <circle
                  cx="50" cy="50" r="36" fill="none"
                  stroke="url(#wizard-welcome-grad)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={LEVEL_DASHARRAY[1]} strokeDashoffset="15"
                />
              </svg>
            </div>
            <h2
              className="font-heading text-[26px] mb-1.5"
              style={{ color: 'var(--text-h, #F5F0E6)' }}
            >
              Willkommen bei Souleya
            </h2>
            <p
              className="text-[13px] leading-relaxed max-w-[340px] mx-auto"
              style={{ color: 'var(--text-sec, #A09888)' }}
            >
              Mach dein Profil komplett und werde zur Awakened Soul. Es dauert nur einen Moment.
            </p>
          </div>
        )}

        {/* ── Header mit Counter ── */}
        <div className="px-6 pt-6 flex items-center justify-between">
          <div>
            <h3
              className="font-heading text-lg"
              style={{ color: 'var(--text-h, #F5F0E6)' }}
            >
              Deine Reise
            </h3>
            <p
              className="text-[12.5px] mt-0.5"
              style={{ color: 'var(--text-muted, #807870)' }}
            >
              {allCompleted
                ? 'Alle Schritte erledigt'
                : `Noch ${remaining} ${remaining === 1 ? 'Schritt' : 'Schritte'} bis Awakened Soul`}
            </p>
          </div>
          <span
            className="font-label text-[0.65rem] tracking-[0.08em] px-3.5 py-1 rounded-full"
            style={{
              background: 'var(--accent-muted, rgba(200,169,110,0.12))',
              color: 'var(--accent, #C8A96E)',
            }}
          >
            {completedCount} / {totalCount}
          </span>
        </div>

        {/* ── Horizontale Journey-Leiste ── */}
        <div className="flex items-center px-6 pt-5">
          <span
            className="font-label text-[0.5rem] tracking-[0.08em] uppercase flex-shrink-0"
            style={{ color: 'var(--text-muted, #807870)' }}
          >
            Start
          </span>

          <div className="flex-1 relative mx-2.5" style={{ height: '22px' }}>
            {/* Hintergrund-Linie */}
            <div
              className="absolute left-0 right-0 top-1/2 -translate-y-1/2 rounded-full"
              style={{ height: '2px', background: 'var(--bg-tertiary, rgba(255,255,255,0.06))' }}
            />
            {/* Fortschritts-Linie */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full transition-all duration-700 ease-out"
              style={{
                height: '2px',
                width: `${Math.min(progressWidth, 100)}%`,
                background: 'linear-gradient(90deg, var(--accent, #C8A96E), var(--accent-light, #D4BC8B))',
              }}
            />

            {/* Nodes */}
            <div className="relative flex justify-between items-center h-full">
              {status.requirements.map((req) => {
                const meta = STEP_META[req.key];
                const isActive = nextStep?.key === req.key;

                return (
                  <div key={req.key} className="group relative flex flex-col items-center">
                    <button
                      onClick={() => {
                        if (meta?.link) router.push(meta.link);
                      }}
                      className="w-[22px] h-[22px] rounded-full flex items-center justify-center z-[2] transition-all"
                      style={{
                        background: req.completed
                          ? 'var(--accent, #C8A96E)'
                          : 'var(--bg-elevated, #242424)',
                        border: req.completed
                          ? 'none'
                          : isActive
                            ? '2px solid var(--accent, #C8A96E)'
                            : '1.5px solid rgba(255,255,255,0.08)',
                        animation: isActive ? 'wizard-node-pulse 2s infinite' : 'none',
                      }}
                    >
                      {req.completed && (
                        <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="var(--text-on-gold, #1A1714)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12l5 5l10 -10" />
                        </svg>
                      )}
                    </button>

                    {/* Hover-Tooltip */}
                    <div
                      className="absolute bottom-full mb-2 px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10"
                      style={{
                        background: 'var(--bg-elevated, #242424)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-body, #D0C8B8)',
                      }}
                    >
                      {meta?.shortLabel ?? req.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ziel: Enso (Level 2 = Awakened Soul) */}
          <span
            className="font-label text-[0.5rem] tracking-[0.08em] uppercase flex-shrink-0 flex items-center gap-1"
            style={{ color: 'var(--accent, #C8A96E)' }}
          >
            <svg viewBox="0 0 100 100" width="16" height="16">
              <circle
                cx="50" cy="50" r="36" fill="none"
                stroke="currentColor" strokeWidth="10" strokeLinecap="round"
                strokeDasharray={LEVEL_DASHARRAY[2]} strokeDashoffset="15"
              />
            </svg>
            Ziel
          </span>
        </div>

        {/* ── Fokus-Karte: Naechster Schritt ── */}
        {nextStepMeta && !allCompleted && (
          <div className="px-6 pt-5 pb-5">
            <div
              className="rounded-[14px] p-5"
              style={{
                background: 'linear-gradient(135deg, rgba(200,169,110,0.08), rgba(200,169,110,0.02))',
                border: '1px solid rgba(200,169,110,0.12)',
              }}
            >
              <div className="flex items-start gap-3.5 mb-4">
                <div
                  className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--accent-muted, rgba(200,169,110,0.12))' }}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--accent, #C8A96E)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={nextStepMeta.icon} />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4
                    className="font-heading text-[19px] mb-1"
                    style={{ color: 'var(--text-h, #F5F0E6)' }}
                  >
                    {nextStepMeta.title}
                  </h4>
                  <p
                    className="text-[12.5px] leading-relaxed"
                    style={{ color: 'var(--text-sec, #A09888)' }}
                  >
                    {nextStepMeta.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setDismissed(true);
                    router.push(nextStepMeta.link);
                  }}
                  className="font-label text-[0.65rem] tracking-[0.1em] uppercase px-6 py-2.5 rounded-full border-none cursor-pointer transition-all hover:-translate-y-px"
                  style={{
                    background: 'linear-gradient(135deg, #A8894E, #C8A96E)',
                    color: 'var(--text-on-gold, #1A1714)',
                    boxShadow: '0 4px 16px rgba(200,169,110,0.25)',
                  }}
                >
                  {nextStepMeta.btnLabel}
                </button>
                <button
                  onClick={() => setDismissed(true)}
                  className="text-[12px] border-none bg-transparent cursor-pointer transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-muted, #807870)', fontFamily: "'Quicksand', sans-serif" }}
                >
                  Spaeter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Bonus: Geburtsdatum ── */}
        {!allCompleted && (
          <div className="px-6 pb-6">
            <button
              onClick={() => {
                setDismissed(true);
                router.push('/profile');
              }}
              className="w-full flex items-center gap-2.5 p-3 px-3.5 rounded-xl transition-all hover:opacity-90 border-none text-left cursor-pointer"
              style={{
                background: 'rgba(200,169,110,0.04)',
                border: '1px dashed rgba(200,169,110,0.15)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--accent-muted, rgba(200,169,110,0.12))' }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--accent, #C8A96E)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
                </svg>
              </div>
              <p
                className="text-[11.5px] text-left flex-1 leading-snug"
                style={{ color: 'var(--text-muted, #807870)', fontFamily: "'Quicksand', sans-serif" }}
              >
                <strong style={{ color: 'var(--accent, #C8A96E)' }}>Wann hast du Geburtstag?</strong>
                <br />
                Du bekommst dein Sternzeichen am Profil und persoenliche Impulse.
              </p>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--text-muted, #807870)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d="M9 6l6 6l-6 6" />
              </svg>
            </button>
          </div>
        )}

        {/* ── CTA: Alles erledigt ── */}
        {allCompleted && (
          <div className="px-6 pt-5 pb-6">
            <button
              onClick={handleCheckOnboarding}
              disabled={isChecking}
              className="w-full py-3 rounded-full font-label text-sm tracking-wide border-none cursor-pointer transition-all hover:-translate-y-px"
              style={{
                background: 'linear-gradient(135deg, var(--accent, #C8A96E), var(--accent-light, #D4BC8B))',
                color: 'var(--text-on-gold, #1A1714)',
                boxShadow: '0 4px 16px rgba(200,169,110,0.25)',
                opacity: isChecking ? 0.7 : 1,
              }}
            >
              {isChecking ? 'Wird geprueft …' : 'Awakened Soul freischalten'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
