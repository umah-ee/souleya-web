'use client';

import { useId } from 'react';


// ══════════════════════════════════════════════════════════════
// SOULEYA ENSO RING – Soul Level System v3
// Level 1–5 mit progressiv schliessendem Kreis
// First Light (Halo + Kern) + Mentor-Kompassstern
// Gold Farbschema
// Quelle: Mockups/Souleya_EnsoRing_Levels.html
// ══════════════════════════════════════════════════════════════

// ── Soul Level Ring Konfiguration (aus Mockup) ─────────────
// strokeWidth = 8 fuer alle Level, keine Opacity-Variation
const LEVEL_CONFIG: Record<number, { dasharray: string }> = {
  1: { dasharray: '45 181' },    // Soul Spark
  2: { dasharray: '83 143' },    // Awakened Soul
  3: { dasharray: '120 106' },   // Harmony Keeper
  4: { dasharray: '158 68' },    // Zen Master
  5: { dasharray: '196 30' },    // Soul Mentor
};

// ── Farbschema-Konfiguration ─────────────────────────────────
const COLOR_CONFIG = {
  gradientStart: '#A8894E',
  gradientEnd: '#D4BC8B',
  glowColor: '#D4BC8B',
  dotColor: '#D4BC8B',
} as const;

// ── Groessen-Varianten ───────────────────────────────────────
const SIZE_CONFIG = {
  'profile': { svgSize: 88, avatarSize: 56, avatarOffset: 16 },
  'profile-large': { svgSize: 112, avatarSize: 72, avatarOffset: 20 },
  'header': { svgSize: 65, avatarSize: 45, avatarOffset: 10 },
  'feed': { svgSize: 44, avatarSize: 28, avatarOffset: 8 },
  'standalone': { svgSize: 48, avatarSize: 0, avatarOffset: 0 },
} as const;

interface EnsoRingProps {
  /** Soul Level 1–5 */
  soulLevel: number;
  /** First Light – Pulsierender Halo + Leuchtpunkt bei ~2 Uhr */
  isFirstLight?: boolean;
  /** Mentor – Kompassstern bei ~12:30 Uhr (nur Level 5) */
  isMentor?: boolean;
  /** Groesse: profile (88px), profile-large (112px), header (65px), feed (44px), standalone (48px) */
  size?: 'profile' | 'profile-large' | 'header' | 'feed' | 'standalone';
  /** Avatar oder anderer Inhalt, zentriert im Ring */
  children?: React.ReactNode;
  /** Zusaetzliche CSS-Klassen */
  className?: string;
}

export default function EnsoRing({
  soulLevel,
  isFirstLight = false,
  isMentor = false,
  size = 'standalone',
  children,
  className = '',
}: EnsoRingProps) {
  const uid = useId();
  const level = Math.max(1, Math.min(5, soulLevel));
  const config = LEVEL_CONFIG[level] ?? LEVEL_CONFIG[1];
  const { svgSize, avatarSize, avatarOffset } = SIZE_CONFIG[size];
  const colors = COLOR_CONFIG;
  const gradientId = `enso-g${uid}`;
  const flGlowId = `fl-glow${uid}`;
  const mentorGlowId = `mentor-glow${uid}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: svgSize, height: svgSize }}
    >
      {/* ─── SVG Enso Ring ────────────────────────── */}
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 100 100"
        className="absolute inset-0 pointer-events-none"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.gradientStart} />
            <stop offset="100%" stopColor={colors.gradientEnd} />
          </linearGradient>
          {/* First Light Glow Filter */}
          <filter id={flGlowId}>
            <feGaussianBlur stdDeviation="5" />
          </filter>
          {/* Mentor Kompassstern Glow Filter */}
          <filter id={mentorGlowId}>
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* Level 5: Blur-Glow-Ring (Doppelring-Effekt) */}
        {level === 5 && (
          <circle
            cx="50" cy="50" r="36" fill="none"
            stroke={colors.glowColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="196 30"
            strokeDashoffset="15"
            opacity=".12"
            style={{ filter: 'blur(4px)' }}
          />
        )}

        {/* Haupt-Ring */}
        <circle
          cx="50" cy="50" r="36" fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={config.dasharray}
          strokeDashoffset="15"
        />

        {/* ─── First Light ───────────────────────────── */}
        {/* Pulsierender Halo + Leucht-Kern bei ~2 Uhr */}
        {isFirstLight && (
          <>
            <circle
              cx="82.8" cy="35.2" r="10"
              fill={colors.dotColor}
              className="fl-halo"
            />
            <circle
              cx="82.8" cy="35.2" r="5"
              fill={colors.dotColor}
              filter={`url(#${flGlowId})`}
            />
          </>
        )}

        {/* ─── Mentor-Kompassstern ───────────────────── */}
        {/* 4-zackiger Stern bei ~12:30 Uhr (nur Level 5) */}
        {isMentor && (
          <g transform="translate(61.2, 15.8)">
            <path
              d="M 0,-8 L 1.8,-1.8 L 8,0 L 1.8,1.8 L 0,8 L -1.8,1.8 L -8,0 L -1.8,-1.8 Z"
              fill={colors.dotColor}
              filter={`url(#${mentorGlowId})`}
            />
            <circle r="2.5" fill={colors.dotColor} />
          </g>
        )}
      </svg>

      {/* ─── Avatar (zentriert im Ring) ───────────── */}
      {children && size !== 'standalone' && (
        <div
          className="absolute rounded-full overflow-hidden"
          style={{
            top: avatarOffset,
            left: avatarOffset,
            width: avatarSize,
            height: avatarSize,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
