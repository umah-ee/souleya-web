import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findRaum, RAEUME } from '@/lib/raeume';
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

  return <RaumDetailClient raum={raum} />;
}
