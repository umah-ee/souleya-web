import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { findRaum, RAEUME } from '@/lib/raeume';
import { readSessionCookie, SESSION_COOKIE } from '@/lib/raeume-auth';
import { getCallSeatsTaken } from '@/lib/raeume-mail';
import RaumDetailClient from './RaumDetailClient';

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  return RAEUME.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { slug } = await params;
  const raum = findRaum(slug);
  if (!raum) return { title: 'Raum nicht gefunden · Souleya' };
  return {
    title: `${raum.question} · Souleya`,
    description: raum.teaser,
  };
}

export default async function RaumDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const raum = findRaum(slug);
  if (!raum) notFound();

  const store = await cookies();
  const session = readSessionCookie(store.get(SESSION_COOKIE)?.value);

  // Live-Plätze für aktive Call-Räume aus Resend ziehen — Fallback Mock
  let liveTakenSlots: number | null = null;
  if (raum.type === 'call' && !raum.ended) {
    liveTakenSlots = await getCallSeatsTaken();
  }

  return (
    <RaumDetailClient
      raum={raum}
      sessionEmail={session?.email ?? null}
      liveTakenSlots={liveTakenSlots}
    />
  );
}
