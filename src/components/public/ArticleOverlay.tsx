'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArticleCTACard, processArticleCTAs } from './ArticleCTA';

interface ArticleData {
  title: string;
  content: string;
  excerpt: string;
  meta_description: string;
  reading_time_min: number;
  og_image_url: string | null;
  og_image_photographer: string | null;
  og_image_photographer_url: string | null;
  category: string | null;
  slug: string;
  published_at: string | null;
}

export default function ArticleOverlay({
  slug,
  hasSession,
  onClose,
  onSignup,
}: {
  slug: string;
  hasSession: boolean;
  onClose: () => void;
  onSignup: () => void;
}) {
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Load article
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-5821e.up.railway.app';
        const res = await fetch(`${apiUrl}/articles/slug/${slug}?locale=de`);
        if (!res.ok) {
          setError('Artikel konnte nicht geladen werden');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setArticle(data);
      } catch {
        setError('Artikel konnte nicht geladen werden');
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  // Extract CTA markers from content
  const extractCTAs = useCallback((html: string): { cleanHtml: string; ctas: string[] } => {
    const ctas: string[] = [];
    const cleanHtml = html.replace(/<!--\s*CTA:(\w+)\s*-->/g, (_, type) => {
      ctas.push(type);
      return `<div data-cta-marker="${type}" class="article-cta-marker"></div>`;
    }).replace(/<!--\s*CTA_BLOCK\s*-->/g, () => {
      ctas.push('end');
      return `<div data-cta-marker="end" class="article-cta-marker"></div>`;
    });
    // Immer end-CTA am Schluss wenn nicht vorhanden
    if (!ctas.includes('end')) ctas.push('end');
    return { cleanHtml, ctas };
  }, []);

  function formatDate(d: string | null) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  // Split content at CTA markers and render interleaved
  const renderContent = () => {
    if (!article) return null;
    const { ctas } = extractCTAs(article.content);
    // Split content by CTA markers
    const parts = article.content.split(/<!--\s*CTA(?::(\w+)|_BLOCK)\s*-->/);
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part || part.match(/^\w+$/)) continue; // Skip captured group names
      elements.push(
        <div
          key={`content-${i}`}
          className="prose prose-lg max-w-none
            prose-headings:font-heading prose-headings:text-[var(--text-h)] prose-headings:mt-10 prose-headings:mb-4
            prose-h2:text-2xl prose-h3:text-xl
            prose-p:text-[var(--text-body)] prose-p:leading-relaxed prose-p:mb-5
            prose-a:text-[var(--gold-text)] prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-[3px] prose-blockquote:border-l-[var(--gold)]
            prose-blockquote:text-[var(--text-muted)] prose-blockquote:italic prose-blockquote:pl-5 prose-blockquote:my-8
            prose-strong:text-[var(--text-h)]
            prose-li:text-[var(--text-body)] prose-li:leading-relaxed
            prose-ul:my-4 prose-ol:my-4
          "
          dangerouslySetInnerHTML={{ __html: part }}
        />
      );
      // Insert CTA after this part if there's a matching one
      const ctaIdx = Math.floor(i / 2);
      if (ctaIdx < ctas.length && i % 2 === 0 && i < parts.length - 1) {
        elements.push(
          <ArticleCTACard
            key={`cta-${ctaIdx}`}
            type={ctas[ctaIdx]}
            hasSession={hasSession}
            onSignup={onSignup}
          />
        );
      }
    }

    // End CTA immer am Schluss
    elements.push(
      <ArticleCTACard key="cta-end" type="end" hasSession={hasSession} onSignup={onSignup} />
    );

    return elements;
  };

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ zIndex: 200, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-3 shrink-0" style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--divider)' }}>
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Zurueck
        </button>
        {article && (
          <a
            href={`/blog/${article.slug}`}
            className="text-xs transition-colors"
            style={{ color: 'var(--gold-text)' }}
          >
            Im Blog oeffnen
          </a>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-gold">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {loading && (
            <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
              Artikel wird geladen …
            </div>
          )}

          {error && (
            <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
              {error}
            </div>
          )}

          {article && (
            <>
              {/* Hero image */}
              {article.og_image_url && (
                <div className="rounded-[8px] overflow-hidden mb-6 -mx-2">
                  <img
                    src={article.og_image_url}
                    alt={article.title}
                    className="w-full max-h-[360px] object-cover"
                  />
                  {article.og_image_photographer && (
                    <div className="text-xs py-2 px-4 flex items-center gap-1" style={{ background: 'var(--glass)', color: 'var(--text-muted)' }}>
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 8h.01M12 20H7a3 3 0 01-3-3V7a3 3 0 013-3h10a3 3 0 013 3v5" />
                      </svg>
                      Foto von{' '}
                      <a
                        href={`${article.og_image_photographer_url}?utm_source=souleya&utm_medium=referral`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                        style={{ color: 'var(--gold-text)' }}
                      >
                        {article.og_image_photographer}
                      </a>
                      {' '}auf{' '}
                      <a
                        href="https://unsplash.com/?utm_source=souleya&utm_medium=referral"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                        style={{ color: 'var(--gold-text)' }}
                      >
                        Unsplash
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Meta */}
              <div className="flex items-center gap-3 mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                {article.category && (
                  <span className="px-2.5 py-1 rounded-full" style={{ background: 'var(--gold-bg)', color: 'var(--gold-text)' }}>
                    {article.category}
                  </span>
                )}
                {article.reading_time_min && (
                  <span className="flex items-center gap-1">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
                    </svg>
                    {article.reading_time_min} Min. Lesezeit
                  </span>
                )}
                {article.published_at && <span>{formatDate(article.published_at)}</span>}
              </div>

              {/* Title */}
              <h1 className="font-heading text-3xl leading-tight mb-4" style={{ color: 'var(--text-h)' }}>
                {article.title}
              </h1>

              {/* Excerpt */}
              {article.excerpt && (
                <p className="text-base italic mb-8 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {article.excerpt}
                </p>
              )}

              {/* Divider */}
              <div className="w-16 h-px mb-8" style={{ background: 'var(--gold)' }} />

              {/* Content with CTAs */}
              {renderContent()}

              {/* Footer link */}
              <div className="text-center mt-10 pt-6 border-t" style={{ borderColor: 'var(--divider)' }}>
                <a
                  href={`/blog/${article.slug}`}
                  className="text-sm transition-colors"
                  style={{ color: 'var(--gold-text)' }}
                >
                  Ganzen Artikel im Blog lesen →
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
