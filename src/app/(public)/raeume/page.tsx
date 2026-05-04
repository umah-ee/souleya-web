import type { Metadata } from 'next';
import Link from 'next/link';
import { sortedRaeume, commentCount, type Raum } from '@/lib/raeume';

export const metadata: Metadata = {
  title: 'Räume – Gespräche die bleiben · Souleya',
  description:
    'Jeder Impuls öffnet einen Raum. Manche mit Gespräch, manche mit einer Frage die bleibt.',
};

export default function RaeumePage() {
  const raeume = sortedRaeume();

  return (
    <div className="raum-container">
      <header className="raum-site-header">
        <svg
          width="60"
          height="60"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="raum-list-enso" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A8894E" />
              <stop offset="100%" stopColor="#D4BC8B" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="36"
            fill="none"
            stroke="url(#raum-list-enso)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="196 30"
            strokeDashoffset="15"
          />
        </svg>
        <h1>Gespräche die bleiben</h1>
        <p>
          Jeder Impuls öffnet einen Raum. Manche mit Gespräch, manche mit einer Frage die bleibt.
        </p>
      </header>

      <section className="raum-grid">
        {raeume.map((raum) => (
          <RaumCard key={raum.slug} raum={raum} />
        ))}
      </section>
    </div>
  );
}

function RaumCard({ raum }: { raum: Raum }) {
  const isLiveCall = raum.type === 'call' && !raum.ended;
  const count = commentCount(raum);

  return (
    <Link
      href={`/raeume/${raum.slug}`}
      className={`raum-card${isLiveCall ? ' featured' : ''}`}
      aria-label={raum.question}
    >
      <div className="raum-badge">
        {isLiveCall && <span className="raum-badge-dot" aria-hidden="true" />}
        {raum.type === 'call' ? `Call Raum · ${raum.callDate}` : 'Offener Raum'}
      </div>
      <h3>{raum.question}</h3>
      <div className="raum-teaser">{raum.teaser}</div>
      {isLiveCall && (
        <div className="raum-call-info">
          Noch {raum.callMaxSlots - raum.callTakenSlots} Plätze frei · {raum.callDurationMin} Minuten · {raum.callTime}
        </div>
      )}
      <div className="raum-meta">
        <span>{count === 0 ? 'Noch keine Gedanken' : `${count} ${count === 1 ? 'Gedanke' : 'Gedanken'}`}</span>
        <span className="raum-meta-read">Lesen →</span>
      </div>
    </Link>
  );
}
