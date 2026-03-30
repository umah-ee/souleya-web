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
  locale_slug: string;
  locale_slugs: Record<string, string>;
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
      canonical: `https://souleya.com/${locale}/blog/${article.locale_slug || slug}`,
      languages: Object.fromEntries(
        (article.available_locales ?? []).map(l => [
          l,
          `/${l}/blog/${article.locale_slugs?.[l] || slug}`,
        ]),
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
  const articleUrl = `https://souleya.com/${locale}/blog/${article.locale_slug || slug}`;

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
                  href={`/${l}/blog/${article.locale_slugs?.[l] || slug}`}
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
          <div className="rounded-[8px] overflow-hidden mb-10">
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
          className="mt-16 p-8 rounded-[8px] border text-center"
          style={{
            background: 'var(--glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'var(--glass-border)',
          }}
        >
          <h3 className="font-serif text-xl italic mb-2" style={{ color: 'var(--text-h)' }}>
            {article.cta_type === 'signup'
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
            {article.cta_type === 'signup'
              ? (t ? 'Jetzt registrieren' : 'Sign Up Now')
              : (t ? 'Kostenlos starten' : 'Get Started Free')}
          </a>
        </div>

        {/* ── Share Buttons ── */}
        <ShareButtons
          url={articleUrl}
          title={article.title}
          locale={locale}
        />

        {/* ── Tags (klickbar → Blog-Filter) ── */}
        {article.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map(tag => (
              <Link
                key={tag}
                href={`/${locale}/blog?tag=${encodeURIComponent(tag)}`}
                className="text-xs px-3 py-1 rounded-full transition-colors hover:opacity-80"
                style={{
                  background: 'var(--gold-softer)',
                  color: 'var(--gold-text)',
                  border: '1px solid var(--gold-border-s)',
                }}
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* ── Verwandte Artikel ── */}
        <RelatedArticles
          currentSlug={slug}
          tags={article.tags}
          category={article.category}
          locale={locale}
        />

        {/* View-Counter (Client Component) */}
        <ViewCounter articleId={article.id} />
      </article>
    </>
  );
}

/* ── Verwandte Artikel Sektion ── */
async function RelatedArticles({
  currentSlug, tags, category, locale,
}: {
  currentSlug: string; tags: string[]; category: string | null; locale: string;
}) {
  const t = locale === 'de';
  let articles: RelatedArticle[] = [];

  try {
    // Erst nach Tags suchen, dann nach Kategorie
    const params = new URLSearchParams({ locale, limit: '4' });
    if (tags.length) params.set('tags', tags.slice(0, 3).join(','));
    else if (category) params.set('category', category);

    const res = await fetch(`${API_URL}/articles?${params}`, { next: { revalidate: 300 } });
    if (res.ok) {
      const data = await res.json();
      articles = (data.data || []).filter((a: RelatedArticle) => a.slug !== currentSlug).slice(0, 3);
    }
  } catch { /* noop */ }

  if (articles.length === 0) return null;

  return (
    <div className="mt-16 pt-8 border-t" style={{ borderColor: 'var(--divider)' }}>
      <h3 className="font-serif text-xl italic mb-6" style={{ color: 'var(--text-h)' }}>
        {t ? 'Das koennte dich auch interessieren' : 'You might also like'}
      </h3>
      <div className="grid gap-4 sm:grid-cols-3">
        {articles.map((a: RelatedArticle) => (
          <Link
            key={a.id}
            href={`/${locale}/blog/${a.slug}`}
            className="group block rounded-[8px] border overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5"
            style={{ background: 'var(--glass)', borderColor: 'var(--glass-border)' }}
          >
            {a.og_image_url && (
              <div className="aspect-[2/1] overflow-hidden">
                <img src={a.og_image_url} alt={a.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              </div>
            )}
            <div className="p-3">
              <h4 className="font-serif text-sm leading-snug group-hover:text-[var(--gold-text)] transition-colors line-clamp-2" style={{ color: 'var(--text-h)' }}>
                {a.title}
              </h4>
              <div className="flex items-center gap-2 mt-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {a.reading_time_min && <span>{a.reading_time_min} Min.</span>}
                {a.category && <span>· {a.category}</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

interface RelatedArticle {
  id: string;
  slug: string;
  category: string | null;
  tags: string[];
  og_image_url: string | null;
  views_count: number;
  published_at: string | null;
  title: string;
  excerpt: string;
  reading_time_min: number | null;
}
