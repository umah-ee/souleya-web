import type { Metadata } from 'next';
import BlogPageClient from './BlogPageClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// ISR: alle 5 Minuten revalidieren
export const revalidate = 300;

async function getArticles(locale: string) {
  try {
    const params = new URLSearchParams({ locale, limit: '50' });
    const res = await fetch(`${API_URL}/articles?${params}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return { data: [], total: 0 };
    return res.json();
  } catch {
    return { data: [], total: 0 };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === 'de'
    ? 'Blog | Souleya – Achtsamkeit, Meditation & persönliche Entwicklung'
    : 'Blog | Souleya – Mindfulness, Meditation & Personal Growth';
  const description = locale === 'de'
    ? 'Inspirierende Artikel über Achtsamkeit, Meditation, Spiritualität und persönliche Entwicklung.'
    : 'Inspiring articles about mindfulness, meditation, spirituality and personal growth.';

  return {
    title,
    description,
    alternates: {
      canonical: `https://souleya.com/${locale}/blog`,
      languages: { de: '/de/blog', en: '/en/blog' },
    },
  };
}

export default async function BlogOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { data: articles } = await getArticles(locale);

  return <BlogPageClient articles={articles} locale={locale} />;
}
