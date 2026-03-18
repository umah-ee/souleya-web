'use client';

import { useEffect, useState } from 'react';

// ── Soul Level Namen ─────────────────────────────────────────
const LEVEL_NAMES: Record<number, string> = {
  1: 'Soul Spark',
  2: 'Awakened Soul',
  3: 'Harmony Keeper',
  4: 'Zen Master',
  5: 'Soul Mentor',
};

const LEVEL_UNLOCKS: Record<number, string[]> = {
  2: ['Profil fuer alle sichtbar', 'Pulse-Feed aktiv', 'Events beitreten'],
  3: ['Eigene Events erstellen', 'Goldener Rahmen im Feed'],
  4: ['Empfohlen-Badge', 'Community-Post', 'Prominentere Sichtbarkeit'],
  5: ['Mentor-Status', 'Kompassstern am Enso-Ring', 'Mentor-Sessions anbieten'],
};

interface LevelUpModalProps {
  newLevel: number | null;
  onClose: () => void;
}

export default function LevelUpModal({ newLevel, onClose }: LevelUpModalProps) {
  const [visible, setVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (newLevel && newLevel >= 3) {
      setVisible(true);
      // Konfetti nur ab Level 3
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    } else if (newLevel === 2) {
      setVisible(true);
    }
  }, [newLevel]);

  if (!newLevel || !visible) return null;

  const levelName = LEVEL_NAMES[newLevel] ?? `Soul ${newLevel}`;
  const unlocks = LEVEL_UNLOCKS[newLevel] ?? [];

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      {/* Konfetti (CSS-only) */}
      {showConfetti && (
        <div className="confetti-container" aria-hidden="true">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                backgroundColor: ['var(--gold)', 'var(--gold-deep)', '#D4BC8B', '#F0E8D8', '#C8A96E'][i % 5],
                width: `${6 + Math.random() * 6}px`,
                height: `${6 + Math.random() * 6}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <div
        className="relative rounded-2xl p-8 md:p-10 max-w-sm w-[90%] text-center animate-level-up-enter"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--gold-border-s)',
          boxShadow: '0 0 60px rgba(200, 169, 110, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Enso Ring Animation */}
        <div className="flex justify-center mb-6">
          <svg viewBox="0 0 100 100" width="80" height="80" className="animate-enso-close">
            <defs>
              <linearGradient id="levelup-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A8894E" />
                <stop offset="100%" stopColor="#D4BC8B" />
              </linearGradient>
            </defs>
            <circle
              cx="50" cy="50" r="36" fill="none"
              stroke="url(#levelup-grad)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray="196 30" strokeDashoffset="15"
            />
          </svg>
        </div>

        <p
          className="font-label text-[0.6rem] tracking-[0.2em] uppercase mb-2"
          style={{ color: 'var(--gold-text)' }}
        >
          Aufgestiegen
        </p>

        <h2
          className="font-heading text-2xl md:text-3xl mb-2"
          style={{ color: 'var(--text-h)' }}
        >
          {levelName}
        </h2>

        <p
          className="font-heading text-lg mb-6"
          style={{ color: 'var(--gold-text)' }}
        >
          Soul {newLevel}
        </p>

        {unlocks.length > 0 && (
          <div className="mb-6">
            <p
              className="font-label text-[0.55rem] tracking-[0.15em] uppercase mb-3"
              style={{ color: 'var(--text-muted)' }}
            >
              Freigeschaltet
            </p>
            <div className="space-y-2">
              {unlocks.map((u) => (
                <div key={u} className="flex items-center gap-2 justify-center">
                  <span style={{ color: 'var(--gold-text)' }}>✦</span>
                  <span className="text-sm font-body" style={{ color: 'var(--text-sec)' }}>
                    {u}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="px-6 py-2.5 border-none rounded-full font-label text-[0.6rem] tracking-[0.1em] uppercase cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
            color: 'var(--text-on-gold)',
          }}
        >
          Weiter
        </button>
      </div>
    </div>
  );
}
