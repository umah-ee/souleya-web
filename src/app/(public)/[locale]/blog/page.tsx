import type { Metadata } from 'next';
import Link from 'next/link';
import PhotoCredit from '@/components/shared/PhotoCredit';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// ISR: alle 5 Minuten revalidieren
export const revalidate = 300;

interface Article {
  id: string;
  slug: string;
  category: string | null;
  tags: string[];
  og_image_url: string | null;
  og_image_photographer: string | null;
  og_image_photographer_url: string | null;
  views_count: number;
  published_at: string | null;
  title: string;
  excerpt: string;
  reading_time_min: number | null;
}

async function getArticles(locale: string, category?: string) {
  try {
    const params = new URLSearchParams({ locale, limit: '20' });
    if (category) params.set('category', category);

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
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  const { data: articles } = await getArticles(locale, category);
  const t = locale === 'de';

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1
        className="font-serif text-3xl md:text-4xl italic mb-2"
        style={{ color: 'var(--text-h)' }}
      >
        {t ? 'Blog' : 'Blog'}
      </h1>
      <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>
        {t
          ? 'Gedanken, Impulse und Wissen für deinen Weg.'
          : 'Thoughts, insights and knowledge for your journey.'}
      </p>

      {/* ── Artikelliste ── */}
      {articles.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl border"
          style={{
            background: 'var(--glass)',
            borderColor: 'var(--glass-border)',
            color: 'var(--text-muted)',
          }}
        >
          <p className="text-lg mb-1">{t ? 'Noch keine Artikel' : 'No articles yet'}</p>
          <p className="text-sm">{t ? 'Schau bald wieder vorbei.' : 'Check back soon.'}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {articles.map((article: Article) => (
            <Link
              key={article.id}
              href={`/${locale}/blog/${article.slug}`}
              className="group block rounded-2xl border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5"
              style={{
                background: 'var(--glass)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderColor: 'var(--glass-border)',
              }}
            >
              {/* OG Image */}
              {article.og_image_url && (
                <div className="aspect-[2/1] overflow-hidden relative group/img">
                  <img
                    src={article.og_image_url}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {article.og_image_photographer && article.og_image_photographer_url && (() => {
                    const m = article.og_image_photographer_url!.match(/@([^/?]+)/);
                    const username = m ? m[1] : '';
                    return username ? (
                      <PhotoCredit credit={{ name: article.og_image_photographer!, username }} />
                    ) : null;
                  })()}
                </div>
              )}

              <div className="p-5">
                {/* Kategorie + Lesezeit */}
                <div className="flex items-center gap-3 mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {article.category && (
                    <span
                      className="px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--gold-bg)', color: 'var(--gold-text)' }}
                    >
                      {article.category}
                    </span>
                  )}
                  {article.reading_time_min && (
                    <span>{article.reading_time_min} Min.</span>
                  )}
                </div>

                {/* Titel */}
                <h2
                  className="font-serif text-lg mb-2 group-hover:text-[var(--gold-text)] transition-colors"
                  style={{ color: 'var(--text-h)' }}
                >
                  {article.title}
                </h2>

                {/* Excerpt */}
                {article.excerpt && (
                  <p className="text-sm line-clamp-3" style={{ color: 'var(--text-body)' }}>
                    {article.excerpt}
                  </p>
                )}

                {/* Datum */}
                {article.published_at && (
                  <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                    {new Date(article.published_at).toLocaleDateString(
                      locale === 'de' ? 'de-DE' : 'en-US',
                      { day: 'numeric', month: 'long', year: 'numeric' },
                    )}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
