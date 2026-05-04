import type { Metadata } from 'next';
import Link from 'next/link';
import { sortedRaeume, commentCount, type Raum } from '@/lib/raeume';
import { getCallSeatsTaken } from '@/lib/raeume-mail';

// Plätze-Zähler 60s cachen damit nicht jeder Page-Load Resend hits
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Räume – Gespräche die bleiben · Souleya',
  description:
    'Jeder Impuls öffnet einen Raum. Manche mit Gespräch, manche mit einer Frage die bleibt.',
};

export default async function RaeumePage() {
  const raeume = sortedRaeume();
  const liveTakenSlots = await getCallSeatsTaken();

  return (
    <div className="raum-container">
      <header className="raum-site-header">
        <h1>Gespräche die bleiben</h1>
        <p>
          Jeder Impuls öffnet einen Raum. Manche mit Gespräch, manche mit einer Frage die bleibt.
        </p>
      </header>

      <section className="raum-grid">
        {raeume.map((raum) => (
          <RaumCard
            key={raum.slug}
            raum={raum}
            liveTakenSlots={raum.type === 'call' && !raum.ended ? liveTakenSlots : null}
          />
        ))}
      </section>
    </div>
  );
}

function RaumCard({
  raum,
  liveTakenSlots,
}: {
  raum: Raum;
  liveTakenSlots: number | null;
}) {
  const isLiveCall = raum.type === 'call' && !raum.ended;
  const count = commentCount(raum);
  const taken = isLiveCall && raum.type === 'call'
    ? liveTakenSlots ?? raum.callTakenSlots
    : 0;
  const slotsLeft = raum.type === 'call' ? Math.max(0, raum.callMaxSlots - taken) : 0;

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
      {isLiveCall && raum.type === 'call' && (
        <div className="raum-call-info">
          {slotsLeft > 0
            ? `Noch ${slotsLeft} Plätze frei · ${raum.callDurationMin} Minuten · ${raum.callTime}`
            : `Voll — Warteliste offen · ${raum.callDurationMin} Minuten · ${raum.callTime}`}
        </div>
      )}
      <div className="raum-meta">
        <span>{count === 0 ? 'Noch keine Gedanken' : `${count} ${count === 1 ? 'Gedanke' : 'Gedanken'}`}</span>
        <span className="raum-meta-read">Lesen →</span>
      </div>
    </Link>
  );
}
