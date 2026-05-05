import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { sortedRaeume } from '@/lib/raeume-db';
import type { Raum } from '@/lib/raeume';
import { getCallSeatsTaken } from '@/lib/raeume-mail';

// Plätze-Zähler 60s cachen damit nicht jeder Page-Load Resend hits
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Räume – Gespräche die bleiben · Souleya',
  description:
    'Jeder Impuls öffnet einen Raum. Manche mit Gespräch, manche mit einer Frage die bleibt.',
};

async function getCommentCounts(roomIds: string[]): Promise<Record<string, number>> {
  if (roomIds.length === 0) return {};
  const supabase = await createClient();
  const { data } = await supabase
    .from('room_comments')
    .select('room_id')
    .in('room_id', roomIds);
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.room_id] = (counts[row.room_id] ?? 0) + 1;
  }
  return counts;
}

export default async function RaeumePage() {
  const raeume = await sortedRaeume();
  const [liveTakenSlots, commentCounts] = await Promise.all([
    getCallSeatsTaken(),
    getCommentCounts(raeume.map((r) => r.id)),
  ]);

  return (
    <div className="raum-container">
      <header className="raum-site-header">
        <h1>Gespräche die bleiben</h1>
        <p>
          Jeder Impuls öffnet einen Raum. Manche mit Gespräch, manche mit einer Frage die bleibt.
        </p>
      </header>

      {raeume.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px 80px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-body, "Quicksand", sans-serif)',
            fontSize: 16,
          }}
        >
          Bald geht's los. Der erste Raum öffnet in Kürze.
        </div>
      ) : (
        <section className="raum-grid">
          {raeume.map((raum) => (
            <RaumCard
              key={raum.slug}
              raum={raum}
              liveTakenSlots={raum.type === 'call' && !raum.ended ? liveTakenSlots : null}
              commentCount={commentCounts[raum.id] ?? 0}
            />
          ))}
        </section>
      )}
    </div>
  );
}

function RaumCard({
  raum,
  liveTakenSlots,
  commentCount,
}: {
  raum: Raum;
  liveTakenSlots: number | null;
  commentCount: number;
}) {
  const isLiveCall = raum.type === 'call' && !raum.ended;
  const taken = isLiveCall && raum.type === 'call' ? liveTakenSlots ?? 0 : 0;
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
        <span>{commentCount === 0 ? 'Noch keine Gedanken' : `${commentCount} ${commentCount === 1 ? 'Gedanke' : 'Gedanken'}`}</span>
        <span className="raum-meta-read">Lesen →</span>
      </div>
    </Link>
  );
}
