'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchProgression, checkOnboarding, type ProgressionStatus } from '@/lib/progression';
import { track } from '@vercel/analytics';
import type { Profile } from '@/types/profile';
import StepAvatar from './steps/StepAvatar';
import StepBio from './steps/StepBio';
import StepInterests from './steps/StepInterests';
import StepLocation from './steps/StepLocation';
import StepBirthday from './steps/StepBirthday';

// ══════════════════════════════════════════════════════════════
// ONBOARDING WIZARD – Soul 1 → 2 (Fullscreen Overlay, Inline)
// Alle Eingaben passieren direkt im Overlay — der User verlässt
// den Wizard nie. Jeder Schritt hat sein eigenes Formular.
// ══════════════════════════════════════════════════════════════

interface StepMeta {
  icon: string;
  title: string;
  description: string;
  shortLabel: string;
}

const STEP_META: Record<string, StepMeta> = {
  avatar: {
    icon: 'M12 2a5 5 0 1 1 -5 5l0 .001a5 5 0 0 1 10 0l0 -.001a5 5 0 0 1 -5 -5z M2 19.875c0 -2.399 3.385 -4.375 10 -4.375s10 1.976 10 4.375v.625a1 1 0 0 1 -1 1h-18a1 1 0 0 1 -1 -1v-.625z',
    title: 'Zeig dich',
    description: 'Lade ein Profilbild hoch, damit andere dich erkennen.',
    shortLabel: 'Profilbild',
  },
  bio: {
    icon: 'M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4 M13.5 6.5l4 4',
    title: 'Erzaehl etwas ueber dich',
    description: 'Ein paar Worte helfen anderen, Gemeinsamkeiten zu entdecken.',
    shortLabel: 'Bio',
  },
  interests: {
    icon: 'M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z',
    title: 'Was interessiert dich?',
    description: 'Waehle mindestens 3 Interessen fuer passende Empfehlungen.',
    shortLabel: 'Interessen',
  },
  location: {
    icon: 'M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0 M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z',
    title: 'Wo bist du zuhause?',
    description: 'Fuer Events und Gleichgesinnte in deiner Naehe. Nur die Stadt – keine genaue Adresse.',
    shortLabel: 'Standort',
  },
  birthday: {
    icon: 'M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z',
    title: 'Wann hast du Geburtstag?',
    description: 'Du bekommst dein Sternzeichen am Profil und persoenliche Impulse.',
    shortLabel: 'Geburtstag',
  },
};

const STEP_KEYS = ['avatar', 'bio', 'interests', 'location', 'birthday'];

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
  profile: Profile;
  onLevelUp?: () => void;
  onProfileUpdated?: (p: Profile) => void;
}

export default function OnboardingWizard({ soulLevel, isFirstLight, avatarUrl, profile, onLevelUp, onProfileUpdated }: Props) {
  const [status, setStatus] = useState<ProgressionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [activeStepKey, setActiveStepKey] = useState<string | null>(null);
  const [completedLevel, setCompletedLevel] = useState<number>(2);
  const [completedLevelName, setCompletedLevelName] = useState<string>('Awakened Soul');
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(avatarUrl ?? null);

  const isLevel1 = soulLevel === 1;

  const loadStatus = useCallback(async () => {
    if (!isLevel1) return;
    try {
      const data = await fetchProgression();
      setStatus(data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [isLevel1]);

  // Initial load
  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleCheckOnboarding = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await checkOnboarding();
      if (result.leveled_up) {
        setCompletedLevel(result.new_level);
        setCompletedLevelName(result.new_level_name);
        track('onboarding_complete', { new_level: result.new_level });
        setShowComplete(true);
      } else {
        await loadStatus();
      }
    } catch {
      // silent
    } finally {
      setIsChecking(false);
    }
  }, [loadStatus]);

  // Auto-check wenn alle Steps erledigt
  useEffect(() => {
    if (status && status.requirements.every((r) => r.completed) && !showComplete && !isChecking) {
      handleCheckOnboarding();
    }
  }, [status, showComplete, isChecking, handleCheckOnboarding]);

  const handleCompleteClose = () => {
    onLevelUp?.();
    setShowComplete(false);
    setHidden(true);
  };

  // Step-Navigation
  const handleStepComplete = useCallback(async (updatedAvatarUrl?: string) => {
    if (updatedAvatarUrl) setCurrentAvatarUrl(updatedAvatarUrl);
    await loadStatus();
    setActiveStepKey(null); // auto-advance to next incomplete
  }, [loadStatus]);

  const handleStepBack = useCallback(() => {
    if (!status) return;
    const keys = status.requirements.map((r) => r.key);
    const currentKey = activeStepKey ?? status.requirements.find((r) => !r.completed)?.key;
    const currentIdx = keys.indexOf(currentKey ?? '');
    if (currentIdx > 0) {
      setActiveStepKey(keys[currentIdx - 1]);
    }
  }, [status, activeStepKey]);

  if (!isLevel1 || isLoading || !status) return null;

  const completedCount = status.requirements.filter((r) => r.completed).length;
  const totalCount = status.requirements.length;
  const allCompleted = completedCount === totalCount;
  const remaining = totalCount - completedCount;

  // Aktiver Schritt: explizit gesetzt oder erster unerledigter
  const nextStep = status.requirements.find((r) => !r.completed);
  const activeKey = activeStepKey ?? nextStep?.key ?? null;
  const activeStepMeta = activeKey ? STEP_META[activeKey] : null;
  const activeStepIdx = activeKey ? STEP_KEYS.indexOf(activeKey) : -1;

  // Fortschritts-Breite fuer die Journey-Linie
  const progressWidth = totalCount > 1
    ? Math.round((completedCount / (totalCount - 1)) * 100)
    : 0;

  // Floating-Button wenn Wizard versteckt ist
  if (hidden && !showComplete) {
    return (
      <button
        onClick={() => setHidden(false)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[180] flex items-center gap-2 px-5 py-2.5 rounded-full border-none cursor-pointer transition-all hover:-translate-y-0.5"
        style={{
          background: 'linear-gradient(135deg, #A8894E, #C8A96E)',
          color: 'var(--text-on-gold, #1A1714)',
          boxShadow: '0 4px 20px rgba(200,169,110,0.35)',
          fontFamily: "'Josefin Sans', sans-serif",
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
          fontWeight: 500,
          animation: 'wizard-card-in 0.4s ease-out',
        }}
      >
        <svg viewBox="0 0 100 100" width="16" height="16">
          <circle
            cx="50" cy="50" r="36" fill="none"
            stroke="currentColor" strokeWidth="10" strokeLinecap="round"
            strokeDasharray={LEVEL_DASHARRAY[2]} strokeDashoffset="15"
          />
        </svg>
        Weiter mit Onboarding
        <span
          className="ml-1 px-1.5 py-0.5 rounded-full text-[0.55rem]"
          style={{ background: 'rgba(0,0,0,0.15)' }}
        >
          {completedCount}/{totalCount}
        </span>
      </button>
    );
  }

  // Fertig-State
  if (showComplete) {
    return (
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-5"
        style={{ animation: 'wizard-overlay-in 0.4s ease-out' }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'var(--wizard-backdrop, rgba(0,0,0,0.6))',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
          }}
        />
        <div
          className="relative z-[1] w-full max-w-[480px] rounded-[20px] overflow-hidden text-center py-10 px-6"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow, 0 24px 80px rgba(0,0,0,0.3))',
            animation: 'wizard-card-in 0.5s ease-out 0.1s both',
          }}
        >
          {/* Enso-Ring mit dynamischem Level + Avatar */}
          <div className="relative w-[120px] h-[120px] mx-auto mb-5">
            <svg
              viewBox="0 0 100 100" width="120" height="120"
              className="absolute inset-0"
              style={{ animation: 'wizard-enso-glow 2s ease-in-out infinite alternate' }}
            >
              <defs>
                <linearGradient id="wizard-complete-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A8894E" />
                  <stop offset="100%" stopColor="#D4BC8B" />
                </linearGradient>
              </defs>
              <circle
                cx="50" cy="50" r="36" fill="none"
                stroke="url(#wizard-complete-grad)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={LEVEL_DASHARRAY[completedLevel] ?? LEVEL_DASHARRAY[2]} strokeDashoffset="15"
              />
              {isFirstLight && (
                <>
                  <circle cx="82.8" cy="35.2" r="10" fill="#D4BC8B" opacity="0.35" className="wizard-fl-halo" />
                  <circle cx="82.8" cy="35.2" r="5" fill="#D4BC8B" opacity="0.9" />
                </>
              )}
            </svg>
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[76px] h-[76px] rounded-full overflow-hidden flex items-center justify-center"
              style={{ background: 'var(--bg-elevated)', border: '2px solid var(--glass-border)' }}
            >
              {currentAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentAvatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-[28px]" style={{ color: 'var(--text-muted)' }}>?</span>
              )}
            </div>
          </div>

          <h2 className="font-heading text-[26px] mb-1" style={{ color: 'var(--text-h)' }}>
            Du bist {completedLevelName === 'Harmony Keeper' ? 'ein' : 'eine'} {completedLevelName}
          </h2>
          <div className="font-label text-[0.6rem] tracking-[0.12em] uppercase mb-2" style={{ color: 'var(--accent)' }}>
            Soul Level {completedLevel}{isFirstLight ? ' · First Light' : ''}
          </div>
          <p className="text-[13px] leading-relaxed mb-6" style={{ color: 'var(--text-body)' }}>
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

  // ── Haupt-Wizard ──
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-5"
      style={{ animation: 'wizard-overlay-in 0.4s ease-out' }}
    >
      {/* Backdrop — Theme-konform */}
      <div
        className="absolute inset-0"
        style={{
          background: 'var(--wizard-backdrop, rgba(0,0,0,0.6))',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
        }}
      />

      {/* Card — nutzt Theme-Tokens */}
      <div
        className="relative z-[1] w-full max-w-[480px] rounded-[20px] overflow-hidden"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--glass-shadow, 0 24px 80px rgba(0,0,0,0.3))',
          animation: 'wizard-card-in 0.5s ease-out 0.1s both',
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto',
        }}
        onScroll={undefined}
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
            <h2 className="font-heading text-[26px] mb-1.5" style={{ color: 'var(--text-h)' }}>
              Willkommen bei Souleya
            </h2>
            <p className="text-[13px] leading-relaxed max-w-[340px] mx-auto" style={{ color: 'var(--text-body)' }}>
              Mach dein Profil komplett und werde zur Awakened Soul. Es dauert nur einen Moment.
            </p>
          </div>
        )}

        {/* ── Header mit Counter ── */}
        <div className="px-6 pt-6 flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg" style={{ color: 'var(--text-h)' }}>
              Deine Reise
            </h3>
            <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {allCompleted
                ? 'Alle Schritte erledigt'
                : `Noch ${remaining} ${remaining === 1 ? 'Schritt' : 'Schritte'} bis Awakened Soul`}
            </p>
          </div>
          <span
            className="font-label text-[0.65rem] tracking-[0.08em] px-3.5 py-1 rounded-full"
            style={{
              background: 'var(--accent-muted)',
              color: 'var(--accent)',
            }}
          >
            {completedCount} / {totalCount}
          </span>
        </div>

        {/* ── Horizontale Journey-Leiste ── */}
        <div className="flex items-center px-6 pt-5">
          <span
            className="font-label text-[0.5rem] tracking-[0.08em] uppercase flex-shrink-0"
            style={{ color: 'var(--text-muted)' }}
          >
            Start
          </span>

          <div className="flex-1 relative mx-2.5" style={{ height: '22px' }}>
            <div
              className="absolute left-0 right-0 top-1/2 -translate-y-1/2 rounded-full"
              style={{ height: '2px', background: 'var(--bg-tertiary)' }}
            />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full transition-all duration-700 ease-out"
              style={{
                height: '2px',
                width: `${Math.min(progressWidth, 100)}%`,
                background: 'linear-gradient(90deg, var(--accent, #C8A96E), var(--accent-light, #D4BC8B))',
              }}
            />

            <div className="relative flex justify-between items-center h-full">
              {status.requirements.map((req) => {
                const meta = STEP_META[req.key];
                const isActive = activeKey === req.key;

                return (
                  <div key={req.key} className="group relative flex flex-col items-center">
                    <button
                      onClick={() => setActiveStepKey(req.key)}
                      className="w-[22px] h-[22px] rounded-full flex items-center justify-center z-[2] transition-all cursor-pointer border-none"
                      style={{
                        background: req.completed
                          ? 'var(--accent, #C8A96E)'
                          : 'var(--bg-elevated)',
                        border: req.completed
                          ? 'none'
                          : isActive
                            ? '2px solid var(--accent, #C8A96E)'
                            : '1.5px solid var(--glass-border)',
                        animation: isActive && !req.completed ? 'wizard-node-pulse 2s infinite' : 'none',
                      }}
                    >
                      {req.completed && (
                        <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="var(--text-on-gold, #1A1714)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12l5 5l10 -10" />
                        </svg>
                      )}
                    </button>

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

          <span
            className="font-label text-[0.5rem] tracking-[0.08em] uppercase flex-shrink-0 flex items-center gap-1"
            style={{ color: 'var(--accent)' }}
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

        {/* ── Inline Step-Formular ── */}
        {activeStepMeta && !allCompleted && (
          <div className="px-6 pt-5 pb-5">
            <div
              className="rounded-[14px] p-5"
              style={{
                background: 'linear-gradient(135deg, rgba(200,169,110,0.1), rgba(200,169,110,0.03))',
                border: '1px solid rgba(200,169,110,0.18)',
                animation: 'wizard-step-in 0.3s ease-out',
              }}
              key={activeKey}
            >
              {/* Step Header */}
              <div className="flex items-start gap-3.5 mb-4">
                <div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--accent-muted)' }}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--accent, #C8A96E)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={activeStepMeta.icon} />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-heading text-[18px] mb-0.5" style={{ color: 'var(--text-h)' }}>
                    {activeStepMeta.title}
                  </h4>
                  <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-body)' }}>
                    {activeStepMeta.description}
                  </p>
                </div>
              </div>

              {/* Step Content */}
              {activeKey === 'avatar' && (
                <StepAvatar
                  currentAvatarUrl={profile.avatar_url}
                  onComplete={handleStepComplete}
                  onBack={handleStepBack}
                  isFirst={activeStepIdx === 0}
                />
              )}
              {activeKey === 'bio' && (
                <StepBio
                  currentBio={profile.bio}
                  onComplete={handleStepComplete}
                  onBack={handleStepBack}
                  isFirst={activeStepIdx === 0}
                />
              )}
              {activeKey === 'interests' && (
                <StepInterests
                  currentInterests={profile.interests}
                  onComplete={handleStepComplete}
                  onBack={handleStepBack}
                  isFirst={activeStepIdx === 0}
                />
              )}
              {activeKey === 'location' && (
                <StepLocation
                  currentLocation={profile.location}
                  onComplete={handleStepComplete}
                  onBack={handleStepBack}
                  isFirst={activeStepIdx === 0}
                />
              )}
              {activeKey === 'birthday' && (
                <StepBirthday
                  currentBirthday={profile.birthday}
                  onComplete={handleStepComplete}
                  onBack={handleStepBack}
                  isFirst={activeStepIdx === 0}
                />
              )}
            </div>
          </div>
        )}

        {/* ── Spaeter-Button ── */}
        {!allCompleted && (
          <div className="px-6 pb-5 text-center">
            <button
              onClick={() => setHidden(true)}
              className="text-[12.5px] border-none bg-transparent cursor-pointer px-4 py-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-body)', fontFamily: "'Quicksand', sans-serif" }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Spaeter weitermachen
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
