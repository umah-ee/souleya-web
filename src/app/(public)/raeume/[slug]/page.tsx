import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { findRaum, getRaumComments } from '@/lib/raeume-db';
import { readSessionCookie, SESSION_COOKIE } from '@/lib/raeume-auth';
import { getCallSeatsTaken } from '@/lib/raeume-mail';
import RaumDetailClient from './RaumDetailClient';

type Params = { slug: string };

export const revalidate = 30;

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { slug } = await params;
  const raum = await findRaum(slug);
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
  const raum = await findRaum(slug);
  if (!raum) notFound();

  const store = await cookies();
  const session = readSessionCookie(store.get(SESSION_COOKIE)?.value);

  const [comments, liveTakenSlots] = await Promise.all([
    getRaumComments(raum.id),
    raum.type === 'call' && !raum.ended ? getCallSeatsTaken() : Promise.resolve(null),
  ]);

  return (
    <RaumDetailClient
      raum={raum}
      comments={comments}
      sessionEmail={session?.email ?? null}
      liveTakenSlots={liveTakenSlots}
    />
  );
}
