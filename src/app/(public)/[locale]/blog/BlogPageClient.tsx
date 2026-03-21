'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import PhotoCredit from '@/components/shared/PhotoCredit';

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

type SortMode = 'newest' | 'popular' | 'quick';

export default function BlogPageClient({
  articles,
  locale,
}: {
  articles: Article[];
  locale: string;
}) {
  const t = locale === 'de';
  const [search, setSearch] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sort, setSort] = useState<SortMode>('newest');
  const [tagsExpanded, setTagsExpanded] = useState(false);

  const TAG_PREVIEW_COUNT = 8;

  // Tags nach Views der verknuepften Artikel sortieren (meistgelesen zuerst)
  const allTags = useMemo(() => {
    const tagViews: Record<string, number> = {};
    articles.forEach(a => a.tags?.forEach(tag => {
      tagViews[tag] = (tagViews[tag] || 0) + (a.views_count || 0);
    }));
    return Object.entries(tagViews)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);
  }, [articles]);

  // Filtern + Sortieren
  const filtered = useMemo(() => {
    let result = [...articles];

    // Textsuche
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        (a.excerpt || '').toLowerCase().includes(q) ||
        a.tags?.some(tag => tag.toLowerCase().includes(q))
      );
    }

    // Tag-Filter
    if (activeTags.length > 0) {
      result = result.filter(a =>
        activeTags.some(tag => a.tags?.includes(tag))
      );
    }

    // Sortierung
    switch (sort) {
      case 'popular':
        result.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
        break;
      case 'quick':
        result.sort((a, b) => (a.reading_time_min || 99) - (b.reading_time_min || 99));
        break;
      default: // newest
        result.sort((a, b) => new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime());
    }

    return result;
  }, [articles, search, activeTags, sort]);

  const toggleTag = (tag: string) => {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Featured = erster Artikel (neuester)
  const featured = articles[0];
  const rest = filtered.filter(a => sort !== 'newest' || a.id !== featured?.id);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <h1 className="font-serif text-3xl md:text-4xl italic mb-2" style={{ color: 'var(--text-h)' }}>
        Blog
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
        {t ? 'Gedanken, Impulse und Wissen fuer deinen Weg.' : 'Thoughts, insights and knowledge for your journey.'}
      </p>

      {/* Featured Article Hero (nur bei Neueste-Sortierung) */}
      {sort === 'newest' && featured && (
        <Link
          href={`/${locale}/blog/${featured.slug}`}
          className="group block rounded-[8px] border overflow-hidden mb-10 transition-all hover:shadow-lg hover:-translate-y-0.5"
          style={{ background: 'var(--glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderColor: 'var(--glass-border)' }}
        >
          <div className="md:flex">
            {featured.og_image_url && (
              <div className="md:w-1/2 aspect-[16/9] md:aspect-auto overflow-hidden relative group/img">
                <img src={featured.og_image_url} alt={featured.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                {featured.og_image_photographer && featured.og_image_photographer_url && (() => {
                  const m = featured.og_image_photographer_url!.match(/@([^/?]+)/);
                  return m ? <PhotoCredit credit={{ name: featured.og_image_photographer!, username: m[1] }} /> : null;
                })()}
              </div>
            )}
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                {featured.category && (
                  <span className="px-2 py-0.5 rounded-full" style={{ background: 'var(--gold-bg)', color: 'var(--gold-text)' }}>
                    {featured.category}
                  </span>
                )}
                {featured.reading_time_min && <span>{featured.reading_time_min} Min.</span>}
              </div>
              <h2 className="font-serif text-2xl md:text-3xl leading-tight mb-3 group-hover:text-[var(--gold-text)] transition-colors" style={{ color: 'var(--text-h)' }}>
                {featured.title}
              </h2>
              {featured.excerpt && (
                <p className="text-sm mb-4 line-clamp-3" style={{ color: 'var(--text-body)' }}>{featured.excerpt}</p>
              )}
              {featured.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {featured.tags.slice(0, 4).map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--gold-softer)', color: 'var(--gold-text)', border: '1px solid var(--gold-border-s)' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--gold-text)' }}>
                {t ? 'Jetzt lesen' : 'Read now'} →
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Such- und Filterleiste */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Suchfeld */}
          <div className="relative flex-1">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t ? 'Artikel durchsuchen …' : 'Search articles …'}
              className="w-full pl-10 pr-4 py-2.5 rounded-[8px] border text-sm"
              style={{ background: 'var(--glass)', borderColor: 'var(--glass-border)', color: 'var(--text-body)' }}
            />
          </div>

          {/* Sortierung */}
          <div className="flex items-center gap-1 shrink-0">
            {([
              { key: 'newest', label: t ? 'Neueste' : 'Newest' },
              { key: 'popular', label: t ? 'Beliebteste' : 'Popular' },
              { key: 'quick', label: t ? 'Schnell gelesen' : 'Quick reads' },
            ] as { key: SortMode; label: string }[]).map(s => (
              <button
                key={s.key}
                onClick={() => setSort(s.key)}
                className="px-3 py-2 rounded-[8px] text-xs font-medium transition-colors"
                style={{
                  background: sort === s.key ? 'var(--gold-bg)' : 'transparent',
                  color: sort === s.key ? 'var(--gold-text)' : 'var(--text-muted)',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tag-Cloud — erste Zeile + aufklappbar */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {(tagsExpanded ? allTags : allTags.slice(0, TAG_PREVIEW_COUNT)).map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className="text-xs px-2.5 py-1 rounded-full border transition-colors"
                style={{
                  background: activeTags.includes(tag) ? 'var(--gold-bg)' : 'transparent',
                  borderColor: activeTags.includes(tag) ? 'var(--gold)' : 'var(--glass-border)',
                  color: activeTags.includes(tag) ? 'var(--gold-text)' : 'var(--text-muted)',
                }}
              >
                #{tag}
              </button>
            ))}
            {allTags.length > TAG_PREVIEW_COUNT && (
              <button
                onClick={() => setTagsExpanded(!tagsExpanded)}
                className="text-xs px-2.5 py-1 rounded-full border transition-colors"
                style={{ borderColor: 'var(--glass-border)', color: 'var(--gold-text)' }}
              >
                {tagsExpanded ? (t ? 'Weniger' : 'Less') : `+${allTags.length - TAG_PREVIEW_COUNT} ${t ? 'weitere' : 'more'}`}
              </button>
            )}
            {activeTags.length > 0 && (
              <button
                onClick={() => setActiveTags([])}
                className="text-xs px-2.5 py-1 rounded-full transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                {t ? 'Alle anzeigen' : 'Show all'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Artikelliste */}
      {rest.length === 0 ? (
        <div className="text-center py-20 rounded-[8px] border" style={{ background: 'var(--glass)', borderColor: 'var(--glass-border)', color: 'var(--text-muted)' }}>
          <p className="text-lg mb-1">{search || activeTags.length ? (t ? 'Keine Treffer' : 'No results') : (t ? 'Noch keine Artikel' : 'No articles yet')}</p>
          <p className="text-sm">{search || activeTags.length ? (t ? 'Probier andere Suchbegriffe oder Tags.' : 'Try different search terms or tags.') : (t ? 'Schau bald wieder vorbei.' : 'Check back soon.')}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {rest.map((article) => (
            <Link
              key={article.id}
              href={`/${locale}/blog/${article.slug}`}
              className="group block rounded-[8px] border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: 'var(--glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderColor: 'var(--glass-border)' }}
            >
              {article.og_image_url && (
                <div className="aspect-[2/1] overflow-hidden relative group/img">
                  <img src={article.og_image_url} alt={article.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  {/* Lesezeit-Badge oben rechts */}
                  {article.reading_time_min && (
                    <span className="absolute top-3 right-3 text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,.5)', color: '#F0E8D8', backdropFilter: 'blur(8px)' }}>
                      {article.reading_time_min} Min.
                    </span>
                  )}
                  {article.og_image_photographer && article.og_image_photographer_url && (() => {
                    const m = article.og_image_photographer_url!.match(/@([^/?]+)/);
                    return m ? <PhotoCredit credit={{ name: article.og_image_photographer!, username: m[1] }} /> : null;
                  })()}
                </div>
              )}

              <div className="p-5">
                {/* Kategorie */}
                <div className="flex items-center gap-3 mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {article.category && (
                    <span className="px-2 py-0.5 rounded-full" style={{ background: 'var(--gold-bg)', color: 'var(--gold-text)' }}>
                      {article.category}
                    </span>
                  )}
                  {article.views_count > 0 && (
                    <span className="flex items-center gap-1">
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                      {article.views_count}
                    </span>
                  )}
                </div>

                {/* Titel */}
                <h2 className="font-serif text-lg mb-2 group-hover:text-[var(--gold-text)] transition-colors" style={{ color: 'var(--text-h)' }}>
                  {article.title}
                </h2>

                {/* Excerpt */}
                {article.excerpt && (
                  <p className="text-sm line-clamp-3 mb-3" style={{ color: 'var(--text-body)' }}>
                    {article.excerpt}
                  </p>
                )}

                {/* Tag Bubbles */}
                {article.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {article.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--gold-softer)', color: 'var(--gold-text)', border: '1px solid var(--gold-border-s)' }}>
                        #{tag}
                      </span>
                    ))}
                    {article.tags.length > 3 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ color: 'var(--text-muted)' }}>
                        +{article.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Datum */}
                {article.published_at && (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
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
