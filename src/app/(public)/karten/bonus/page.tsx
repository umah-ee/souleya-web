import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bonus · Souleya',
  description: 'Hier kommt bald was.',
  robots: { index: false, follow: false },
};

export default function KartenBonusPage() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-heading, "Cormorant Garamond", serif)',
          fontSize: 'clamp(24px, 4vw, 32px)',
          fontStyle: 'italic',
          color: 'var(--text-h)',
          textAlign: 'center',
        }}
      >
        Hier kommt bald was.
      </p>
    </div>
  );
}
