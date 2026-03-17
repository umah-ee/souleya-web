import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ViewCounter } from './ViewCounter';
import { ShareButtons } from './ShareButtons';
import PhotoCredit from '@/components/shared/PhotoCredit';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// ISR: jede Minute revalidieren
export const revalidate = 60;

interface ArticleData {
  id: string;
  slug: string;
  status: string;
  category: string | null;
  tags: string[];
  og_image_url: string | null;
  og_image_photographer: string | null;
  og_image_photographer_url: string | null;
  cta_type: string;
  views_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  locale: string;
  title: string;
  content: string;
  excerpt: string | null;
  meta_description: string | null;
  seo_keywords: string[];
  reading_time_min: number | null;
  available_locales: string[];
}

async function getArticle(slug: string, locale: string): Promise<ArticleData | null> {
  try {
    const res = await fetch(`${API_URL}/articles/slug/${slug}?locale=${locale}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticle(slug, locale);

  if (!article) {
    return { title: 'Artikel nicht gefunden | Souleya' };
  }

  return {
    title: `${article.title} | Souleya`,
    description: article.meta_description || article.excerpt || undefined,
    keywords: article.seo_keywords,
    openGraph: {
      title: article.title,
      description: article.meta_description || article.excerpt || undefined,
      images: article.og_image_url ? [article.og_image_url] : undefined,
      url: `https://souleya.com/${locale}/blog/${slug}`,
      type: 'article',
      publishedTime: article.published_at || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.meta_description || article.excerpt || undefined,
      images: article.og_image_url ? [article.og_image_url] : undefined,
    },
    alternates: {
      canonical: `https://souleya.com/${locale}/blog/${slug}`,
      languages: Object.fromEntries(
        (article.available_locales ?? []).map(l => [l, `/${l}/blog/${slug}`]),
      ),
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const article = await getArticle(slug, locale);

  if (!article) notFound();

  const t = locale === 'de';
  const articleUrl = `https://souleya.com/${locale}/blog/${slug}`;

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.meta_description || article.excerpt,
    image: article.og_image_url,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: { '@type': 'Organization', name: 'Souleya' },
    publisher: {
      '@type': 'Organization',
      name: 'Souleya',
      url: 'https://souleya.com',
    },
    inLanguage: locale,
    mainEntityOfPage: articleUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* ── Header ── */}
        <div className="mb-8">
          {/* Kategorie + Lesezeit */}
          <div className="flex items-center gap-3 mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            {article.category && (
              <span
                className="px-2.5 py-1 rounded-full"
                style={{ background: 'var(--gold-bg)', color: 'var(--gold-text)' }}
              >
                {article.category}
              </span>
            )}
            {article.reading_time_min && (
              <span>{article.reading_time_min} Min. {t ? 'Lesezeit' : 'read'}</span>
            )}
            {article.published_at && (
              <span>
                {new Date(article.published_at).toLocaleDateString(
                  locale === 'de' ? 'de-DE' : 'en-US',
                  { day: 'numeric', month: 'long', year: 'numeric' },
                )}
              </span>
            )}
          </div>

          {/* Titel */}
          <h1
            className="font-serif text-3xl md:text-4xl leading-tight mb-4"
            style={{ color: 'var(--text-h)' }}
          >
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-lg italic" style={{ color: 'var(--text-muted)' }}>
              {article.excerpt}
            </p>
          )}

          {/* Locale Switch */}
          {article.available_locales.length > 1 && (
            <div className="flex items-center gap-2 mt-4">
              {article.available_locales.map(l => (
                <Link
                  key={l}
                  href={`/${l}/blog/${slug}`}
                  className="text-xs px-2.5 py-1 rounded-md border transition-colors"
                  style={{
                    borderColor: l === locale ? 'var(--gold)' : 'var(--glass-border)',
                    background: l === locale ? 'var(--gold-bg)' : 'transparent',
                    color: l === locale ? 'var(--gold-text)' : 'var(--text-muted)',
                  }}
                >
                  {l.toUpperCase()}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── OG Image ── */}
        {article.og_image_url && (
          <div className="rounded-2xl overflow-hidden mb-10">
            <img
              src={article.og_image_url}
              alt={article.title}
              className="w-full object-cover"
            />
            {article.og_image_photographer && article.og_image_photographer_url && (() => {
              const usernameMatch = article.og_image_photographer_url!.match(/@([^/?]+)/);
              const username = usernameMatch ? usernameMatch[1] : '';
              return username ? (
                <PhotoCredit credit={{ name: article.og_image_photographer!, username }} variant="inline" />
              ) : null;
            })()}
          </div>
        )}

        {/* ── Content ── */}
        <div
          className="prose prose-lg max-w-none
            prose-headings:font-serif prose-headings:text-[var(--text-h)]
            prose-p:text-[var(--text-body)] prose-p:leading-relaxed
            prose-a:text-[var(--gold-text)] prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-[var(--gold)] prose-blockquote:text-[var(--text-muted)]
            prose-strong:text-[var(--text-h)]
            prose-li:text-[var(--text-body)]
          "
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* ── CTA Block ── */}
        <div
          className="mt-16 p-8 rounded-2xl border text-center"
          style={{
            background: 'var(--glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'var(--glass-border)',
          }}
        >
          <h3 className="font-serif text-xl italic mb-2" style={{ color: 'var(--text-h)' }}>
            {article.cta_type === 'waitlist'
              ? (t ? 'Werde Teil unserer Community' : 'Join our community')
              : (t ? 'Jetzt kostenlos beitreten' : 'Join for free')}
          </h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            {t
              ? 'Verbinde dich mit Gleichgesinnten, finde Mentoren und wachse – an einem Ort.'
              : 'Connect with like-minded people, find mentors and grow – all in one place.'}
          </p>
          <a
            href="https://souleya.com"
            className="inline-block px-8 py-3 rounded-full text-sm font-medium transition-transform hover:scale-105"
            style={{ background: 'var(--gold)', color: '#fff' }}
          >
            {article.cta_type === 'waitlist'
              ? (t ? 'Auf die Warteliste' : 'Join Waitlist')
              : (t ? 'Kostenlos starten' : 'Get Started Free')}
          </a>
        </div>

        {/* ── Share Buttons ── */}
        <ShareButtons
          url={articleUrl}
          title={article.title}
          locale={locale}
        />

        {/* ── Tags ── */}
        {article.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map(tag => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  background: 'var(--glass)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* View-Counter (Client Component) */}
        <ViewCounter articleId={article.id} />
      </article>
    </>
  );
}
