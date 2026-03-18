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

export default function FirstLightProgressBar() {
  const [count, setCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
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
    </div>
  );
}
