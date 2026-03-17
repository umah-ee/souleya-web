'use client';

import type { UnsplashCredit } from '@/lib/unsplash-credits';

interface PhotoCreditProps {
  credit: UnsplashCredit;
  variant?: 'hover' | 'inline' | 'mini';
}

const UTM = '?utm_source=souleya&utm_medium=referral';

/**
 * Unsplash-Attribution-Komponente.
 *
 * - **hover** (default): Halbtransparentes Overlay am unteren Rand, sichtbar bei Hover.
 *   Der umgebende Container braucht `position: relative` und `overflow: hidden`.
 * - **inline**: Statischer Text unter dem Bild (z.B. Blog-Detail).
 * - **mini**: Kamera-Icon mit Tooltip (z.B. kleine Avatare).
 */
export default function PhotoCredit({ credit, variant = 'hover' }: PhotoCreditProps) {
  const profileUrl = `https://unsplash.com/@${credit.username}${UTM}`;
  const unsplashUrl = `https://unsplash.com/${UTM}`;

  if (variant === 'inline') {
    return (
      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
        Foto von{' '}
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
          style={{ color: 'var(--gold-text)' }}
        >
          {credit.name}
        </a>
        {' '}auf{' '}
        <a
          href={unsplashUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
          style={{ color: 'var(--gold-text)' }}
        >
          Unsplash
        </a>
      </p>
    );
  }

  if (variant === 'mini') {
    return (
      <a
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-70 transition-opacity"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        title={`Foto von ${credit.name} auf Unsplash`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
          <path d="M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2" />
          <path d="M12 13m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
        </svg>
      </a>
    );
  }

  // variant === 'hover'
  return (
    <div
      className="absolute bottom-0 left-0 right-0 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)' }}
    >
      <p
        className="text-[10px] pointer-events-auto"
        style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
      >
        Foto von{' '}
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white"
        >
          {credit.name}
        </a>
        {' '}auf{' '}
        <a
          href={unsplashUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white"
        >
          Unsplash
        </a>
      </p>
    </div>
  );
}
