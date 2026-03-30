'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminArticles } from '@/lib/ebooks';

interface Article {
  id: string;
  slug: string;
  status: string;
  category: string;
  tags: string[];
  og_image_url?: string;
  views_count: number;
  published_at?: string;
  created_at: string;
  translations?: { locale: string; title: string }[];
  ebook?: { status: string } | null;
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadArticles();
  }, []);

  async function loadArticles() {
    try {
      const data = await getAdminArticles();
      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Artikel laden fehlgeschlagen:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = articles.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const title = a.translations?.[0]?.title?.toLowerCase() || '';
    return title.includes(q) || a.slug.includes(q) || a.category?.includes(q);
  });

  const statusLabel = (s: string) => {
    switch (s) {
      case 'published': return 'Veröffentlicht';
      case 'draft': return 'Entwurf';
      case 'archived': return 'Archiviert';
      default: return s;
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'published': return 'var(--gold-text)';
      case 'draft': return 'var(--text-muted)';
      case 'archived': return 'var(--text-muted)';
      default: return 'var(--text-muted)';
    }
  };

  const ebookBadge = (ebook: any) => {
    if (!ebook) return null;
    const labels: Record<string, string> = {
      draft: 'eBook: Entwurf',
      generating: 'eBook: Generiert …',
      review: 'eBook: Review',
      approved: 'eBook: Bereit',
      published: 'eBook: Live',
    };
    return (
      <span style={{
        fontSize: 8, padding: '2px 8px', borderRadius: 8,
        background: ebook.status === 'published' ? 'var(--gold-bg)' : 'var(--glass)',
        color: ebook.status === 'published' ? 'var(--gold-text)' : 'var(--text-muted)',
        border: '1px solid var(--glass-border)',
      }}>
        {labels[ebook.status] || ebook.status}
      </span>
    );
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400, fontStyle: 'italic', color: 'var(--text-h)', margin: 0 }}>
            Blog & eBooks
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {articles.length} Artikel · Verwalte Inhalte, SEO und eBooks
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Artikel suchen …"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%', maxWidth: 400, padding: '8px 14px', borderRadius: 8,
            border: '1px solid var(--glass-border)', background: 'var(--glass)',
            color: 'var(--text-body)', fontSize: 13, outline: 'none',
          }}
        />
      </div>

      {/* Articles Table */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Lade Artikel …</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          {search ? 'Keine Artikel gefunden.' : 'Noch keine Artikel vorhanden.'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((article) => {
            const title = article.translations?.[0]?.title || article.slug;
            return (
              <div
                key={article.id}
                onClick={() => router.push(`/admin/blog/${article.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                  borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gold-bg)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
              >
                {/* Cover Thumbnail */}
                <div style={{
                  width: 56, height: 40, borderRadius: 6, overflow: 'hidden', flexShrink: 0,
                  background: 'var(--bg-elevated)',
                }}>
                  {article.og_image_url && (
                    <img src={article.og_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>

                {/* Title + Meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-h)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {title}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                    {article.category || '–'} · {article.views_count} Aufrufe · {article.slug}
                  </div>
                </div>

                {/* eBook Badge */}
                <div style={{ flexShrink: 0 }}>
                  {ebookBadge(article.ebook)}
                </div>

                {/* Status */}
                <div style={{
                  fontSize: 9, padding: '3px 10px', borderRadius: 8, flexShrink: 0,
                  border: '1px solid var(--glass-border)',
                  color: statusColor(article.status),
                  letterSpacing: '0.5px',
                }}>
                  {statusLabel(article.status)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
