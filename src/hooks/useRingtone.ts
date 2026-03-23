'use client';

import { useEffect, useRef } from 'react';

/**
 * Erzeugt Klingeltoene via Web Audio API.
 * - incoming: Sanfter Dreiklang (wie Klangschale), wiederholt alle 3s
 * - outgoing: Einzelner Ton alle 4s (wie Telefonklingeln)
 */
export function useRingtone(type: 'incoming' | 'outgoing' | null) {
  const ctxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!type) return;

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const playTone = () => {
      if (ctx.state === 'suspended') ctx.resume();

      if (type === 'incoming') {
        // Sanfter Dreiklang (C-E-G) — Klangschale-artig
        const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
          gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.15 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.15);
          osc.stop(ctx.currentTime + i * 0.15 + 1.5);
        });
      } else {
        // Ausgehender Ton — kurzer Doppelton
        [0, 0.2].forEach(offset => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = 440; // A4
          gain.gain.setValueAtTime(0, ctx.currentTime + offset);
          gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + offset + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + offset);
          osc.stop(ctx.currentTime + offset + 0.5);
        });
      }
    };

    // Sofort abspielen
    playTone();
    // Wiederholen
    const interval = type === 'incoming' ? 3000 : 4000;
    intervalRef.current = setInterval(playTone, interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      ctx.close().catch(() => {});
      ctxRef.current = null;
      intervalRef.current = null;
    };
  }, [type]);
}
