'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const TOTAL = 500;
const EARLY_LIMIT = 200;
const URGENCY_THRESHOLD = 450;

// ── Compare-Daten (integriert in die Fortschrittsbox) ────────
interface CompareFeature { text: string; included: boolean; }
interface CompareTier { key: string; spots: string; title: string; soulBadge: string; highlight?: boolean; muted?: boolean; features: CompareFeature[]; }

const TIERS: CompareTier[] = [
  {
    key: 'early', spots: '1 – 200', title: 'First Light Early', soulBadge: 'Soul 3', highlight: true,
    features: [
      { included: true, text: 'Sofort Event-Recht ab Launch' },
      { included: true, text: 'Sichtbarkeit im Feed ab Tag 1' },
      { included: true, text: 'Permanenter First-Light-Status' },
      { included: true, text: '33 Seeds + Referral-Link sofort' },
      { included: true, text: 'Reputation vor allen anderen' },
    ],
  },
  {
    key: 'firstlight', spots: '201 – 500', title: 'First Light', soulBadge: 'Soul 2',
    features: [
      { included: true, text: 'Event-Recht nach 1 Monat' },
      { included: true, text: 'Permanenter First-Light-Status' },
      { included: true, text: '33 Seeds + Referral-Link' },
      { included: true, text: 'Vor dem Ansturm dabei' },
      { included: false, text: 'Kein sofortiges Event-Recht' },
    ],
  },
  {
    key: 'regular', spots: 'Ab Launch', title: 'Regulär', soulBadge: 'Soul 1', muted: true,
    features: [
      { included: false, text: 'Kein First-Light-Status' },
      { included: false, text: 'Event-Recht erst ueber Soul 3' },
      { included: false, text: 'Kein Startbonus' },
      { included: false, text: 'Kein Sonderstatus' },
    ],
  },
];

export default function FirstLightProgressBar() {
  const [count, setCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [openTier, setOpenTier] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Supabase: Count laden + Realtime
  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('public_stats')
          .select('first_light_count')
          .single();
        if (data?.first_light_count != null) {
          setCount(data.first_light_count);
        }
      } catch {
        // Silent fail
      }
    }
    load();

    const channel = supabase
      .channel('fl-progress-counter')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => {
        load();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Animation starten sobald Count geladen ist
  // Der Hero ist beim Seitenaufruf immer sichtbar, daher kein IntersectionObserver noetig
  useEffect(() => {
    if (count > 0 && !hasAnimated) {
      // Kurze Verzögerung damit die Transition sichtbar wird
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasAnimated(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [count, hasAnimated]);

  // Count-Up Animation
  useEffect(() => {
    if (!isVisible || count === 0) return;
    const duration = 1800;
    const start = performance.now();
    let raf: number;
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic-bezier-ähnliche Easing
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayCount(Math.round(eased * count));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isVisible, count]);

  // Zone-Berechnungen
  const earlyWidth = isVisible ? Math.min(count, EARLY_LIMIT) / EARLY_LIMIT * 40 : 0;
  const flWidth = isVisible ? Math.max(0, count - EARLY_LIMIT) / (TOTAL - EARLY_LIMIT) * 60 : 0;
  const markerLeft = isVisible ? count / TOTAL * 100 : 0;
  const isUrgency = count >= URGENCY_THRESHOLD;
  const isSoldOut = count >= TOTAL;
  const earlyFull = count >= EARLY_LIMIT;

  // Shimmer clip-path: nur über den gefüllten Bereich
  const filledPct = (earlyWidth + flWidth);
  const shimmerClip = `inset(0 ${100 - filledPct}% 0 0)`;

  // Dynamische Nachricht
  const renderMessage = useCallback(() => {
    if (isSoldOut) {
      return <span>Alle 500 First Light Plätze sind vergeben.</span>;
    }
    if (isUrgency) {
      return (
        <>
          <strong>Letzte {TOTAL - count} Plätze.</strong><br />
          Dieser Status wird nach dem Launch nie wieder vergeben.
        </>
      );
    }
    if (earlyFull) {
      return (
        <>
          <strong>Die ersten 200 Early-Plätze sind vergeben.</strong><br />
          Noch {TOTAL - count} First Light Plätze – starte auf{' '}
          <span className="fl-soul">Soul 2 · Awakened Soul</span>
        </>
      );
    }
    return (
      <>
        <strong>Noch {EARLY_LIMIT - count} von 200 Early-Plätzen.</strong><br />
        Starte direkt auf <span className="fl-soul">Soul 3 · Harmony Keeper</span>
      </>
    );
  }, [count, earlyFull, isUrgency, isSoldOut]);

  return (
    <div
      ref={containerRef}
      className={`fl-progress${isUrgency && !isSoldOut ? ' fl-urgency' : ''}`}
    >
      {/* Bar + Marker Wrapper */}
      <div style={{ position: 'relative' }}>
        <div className="fl-bar">
          {/* Zone 1: Early (1–200) */}
          <div
            className="fl-zone-early"
            style={{ width: `${earlyWidth}%` }}
          />
          {/* Zone 2: First Light (201–500) */}
          <div
            className="fl-zone-fl"
            style={{ width: `${flWidth}%` }}
          />
          {/* Shimmer */}
          <div
            className="fl-shimmer-bar"
            style={{ clipPath: shimmerClip }}
          />
          {/* Divider bei 200 (40%) */}
          <div className="fl-divider" />
        </div>

        {/* Enso Marker */}
        {!isSoldOut && (
          <svg
            className="fl-marker"
            width="28"
            height="28"
            viewBox="0 0 100 100"
            style={{ left: `${markerLeft}%` }}
          >
            <defs>
              <linearGradient id="fl-marker-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A8894E" />
                <stop offset="100%" stopColor="#D4BC8B" />
              </linearGradient>
              <filter id="fl-marker-glow">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle
              cx="50" cy="50" r="36" fill="none"
              stroke="url(#fl-marker-grad)"
              strokeWidth="9" strokeLinecap="round"
              strokeDasharray="196 30" strokeDashoffset="15"
              filter="url(#fl-marker-glow)"
            />
          </svg>
        )}
      </div>

      {/* Labels */}
      <div className="fl-labels">
        <div className="fl-label fl-label-early">
          <span className="fl-dot fl-dot-early" />
          1 – 200 · Early
          {earlyFull && <span className="fl-filled-tag">vergeben</span>}
        </div>
        <div className="fl-label fl-label-fl">
          <span className="fl-dot fl-dot-fl" />
          201 – 500 · First Light
        </div>
      </div>

      {/* Counter */}
      <div className="fl-counter">
        <span className="fl-count-num">{displayCount}</span>
        <span className="fl-count-total"> / {TOTAL} Plätze vergeben</span>
      </div>

      {/* Kontextabhängige Nachricht */}
      <div className="fl-message">
        {renderMessage()}
      </div>

      {/* ── Compare-Akkordeon (integriert) ── */}
      <div className="fl-compare-sep" style={{ marginTop: 14, paddingTop: 10 }}>
        <p className="fl-compare-hint" style={{ fontSize: 10, textAlign: 'center', marginBottom: 8, letterSpacing: '0.05em' }}>
          Was unterscheidet die Plätze?
        </p>
        <div className="flex flex-col" style={{ gap: 4 }}>
          {TIERS.map((tier) => {
            const isOpen = openTier === tier.key;
            return (
              <div key={tier.key}>
                <button
                  onClick={() => setOpenTier(isOpen ? null : tier.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 border-none bg-transparent cursor-pointer rounded-lg transition-colors ${isOpen ? (tier.highlight ? 'fl-compare-row-open' : 'fl-compare-row-open-default') : ''}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`font-label flex-shrink-0 ${tier.muted ? 'fl-compare-spots-muted' : 'fl-compare-spots'}`}
                      style={{ fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}
                    >
                      {tier.spots}
                    </span>
                    <span
                      className={`font-body truncate ${tier.muted ? 'fl-compare-title-muted' : 'fl-compare-title'}`}
                      style={{ fontSize: 12, fontWeight: 500 }}
                    >
                      {tier.title}
                    </span>
                    <span
                      className={`flex-shrink-0 ${tier.muted ? 'fl-compare-soul-muted' : 'fl-compare-soul'}`}
                      style={{ fontSize: 9 }}
                    >
                      {tier.soulBadge}
                    </span>
                  </div>
                  <svg
                    viewBox="0 0 24 24" width="14" height="14" fill="none"
                    className="fl-compare-chevron" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
                  >
                    <path d="M6 9l6 6l6 -6" />
                  </svg>
                </button>

                <div
                  style={{
                    maxHeight: isOpen ? '300px' : '0',
                    opacity: isOpen ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.25s ease-out, opacity 0.25s ease-out',
                  }}
                >
                  <div className="flex flex-col gap-1 px-3 pb-2 pt-0.5">
                    {tier.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span
                          className={f.included ? 'fl-compare-check' : 'fl-compare-dash'}
                          style={{ fontSize: 9, flexShrink: 0, marginTop: 2 }}
                        >
                          {f.included ? '✓' : '–'}
                        </span>
                        <span
                          className={f.included ? 'fl-compare-text' : 'fl-compare-text-ex'}
                          style={{ fontSize: 11, lineHeight: 1.4 }}
                        >
                          {f.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
