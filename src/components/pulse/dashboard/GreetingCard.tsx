'use client';

interface Props {
  displayName: string;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Guten Morgen';
  if (h < 17) return 'Guten Tag';
  if (h < 21) return 'Guten Abend';
  return 'Gute Nacht';
}

function formatDateLong(d: Date): string {
  return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function GreetingCard({ displayName }: Props) {
  const firstName = displayName?.split(' ')[0] ?? '';

  return (
    <div className="pt-2">
      <h1
        className="font-heading text-2xl md:text-3xl"
        style={{ color: 'var(--text-h)' }}
      >
        {getGreeting()}
        {firstName ? (
          <span className="font-heading italic" style={{ color: 'var(--gold-text)' }}>
            , {firstName}
          </span>
        ) : ''}
      </h1>
      <p
        className="text-sm font-body mt-1"
        style={{ color: 'var(--text-muted)' }}
      >
        {formatDateLong(new Date())}
      </p>
    </div>
  );
}
