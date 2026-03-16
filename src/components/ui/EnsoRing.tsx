'use client';

import { useId } from 'react';
import { useTheme } from '@/components/ThemeProvider';

// ══════════════════════════════════════════════════════════════
// SOULEYA ENSO RING – VIP-Stufen-Konzept v2
// Level 1–5 mit progressiv schliessendem Kreis
// First Light + Ritterschlag Sonderstatus
// Farbschema-aware: Gold + Dusk
// ══════════════════════════════════════════════════════════════

// ── VIP Level Ring Konfiguration ─────────────────────────────
const LEVEL_CONFIG: Record<number, { dasharray: string; strokeWidth: number; opacity: number }> = {
  1: { dasharray: '90 136.5', strokeWidth: 5, opacity: 0.7 },     // Soul Spark
  2: { dasharray: '140 86.5', strokeWidth: 5.5, opacity: 0.8 },   // Awakened Soul
  3: { dasharray: '180 46.5', strokeWidth: 6, opacity: 0.85 },    // Harmony Keeper
  4: { dasharray: '206 20.5', strokeWidth: 7, opacity: 0.92 },    // Zen Master
  5: { dasharray: '216 10.5', strokeWidth: 7.5, opacity: 1 },     // Soul Mentor
};

// ── Farbschema-Konfiguration ─────────────────────────────────
const COLOR_CONFIG = {
  gold: {
    gradientStart: '#A8894E',
    gradientEnd: '#D4BC8B',
    glowColor: '#D4BC8B',
    dotColor: '#D4BC8B',
  },
  dusk: {
    gradientStart: '#8B5CF6',
    gradientEnd: '#F472B6',
    glowColor: '#A78BFA',
    dotColor: '#A78BFA',
  },
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
  /** VIP Level 1–5 */
  soulLevel: number;
  /** First Light – Leuchtpunkt am Kreisanfang */
  isFirstLight?: boolean;
  /** Ritterschlag – Leuchtpunkt an der Oeffnung */
  hasRitterschlag?: boolean;
  /** Groesse: profile (88px), profile-large (112px), header (48px), feed (44px), standalone (48px) */
  size?: 'profile' | 'profile-large' | 'header' | 'feed' | 'standalone';
  /** Avatar oder anderer Inhalt, zentriert im Ring */
  children?: React.ReactNode;
  /** Zusaetzliche CSS-Klassen */
  className?: string;
}

export default function EnsoRing({
  soulLevel,
  isFirstLight = false,
  hasRitterschlag = false,
  size = 'standalone',
  children,
  className = '',
}: EnsoRingProps) {
  const uid = useId();
  const { colorScheme } = useTheme();
  const level = Math.max(1, Math.min(5, soulLevel));
  const config = LEVEL_CONFIG[level] ?? LEVEL_CONFIG[1];
  const { svgSize, avatarSize, avatarOffset } = SIZE_CONFIG[size];
  const colors = COLOR_CONFIG[colorScheme] ?? COLOR_CONFIG.gold;
  const gradientId = `enso-g${uid}`;

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
        </defs>

        {/* Level 5: Blur-Glow-Ring (Doppelring-Effekt) */}
        {level === 5 && (
          <circle
            cx="50" cy="50" r="36" fill="none"
            stroke={colors.glowColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="216 10.5"
            strokeDashoffset="15"
            opacity=".12"
            style={{ filter: 'blur(4px)' }}
          />
        )}

        {/* Haupt-Ring */}
        <circle
          cx="50" cy="50" r="36" fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={config.dasharray}
          strokeDashoffset="15"
          opacity={level === 5 ? undefined : config.opacity}
        />

        {/* ─── First Light ───────────── */}
        {/* Leuchtender Lichtpunkt am Anfang des Kreises */}
        {isFirstLight && (
          <>
            <circle
              cx="83" cy="35" r="4" fill={colors.dotColor}
              opacity=".12" className="first-light-glow"
              style={{ filter: 'blur(3px)' }}
            />
            <circle
              cx="83" cy="35" r="2" fill={colors.dotColor}
              opacity=".6" className="first-light-glow"
            />
            <circle cx="83" cy="35" r=".8" fill="#fff" opacity=".9" />
          </>
        )}

        {/* ─── Ritterschlag ────────────────────────── */}
        {/* Leuchtender Stern an der Oeffnung des Kreises */}
        {hasRitterschlag && (
          <>
            <circle
              cx="18.5" cy="35" r="4" fill={colors.dotColor}
              opacity=".15" className="ritter-glow"
              style={{ filter: 'blur(3px)' }}
            />
            <circle
              cx="18.5" cy="35" r="2" fill={colors.dotColor}
              opacity=".7" className="ritter-glow"
            />
            <circle cx="18.5" cy="35" r=".8" fill="#fff" opacity=".9" />
          </>
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
