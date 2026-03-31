'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminArticle } from '@/lib/ebooks';
import ArticleContentTab from '@/components/admin/blog/ArticleContentTab';
import ArticleSeoTab from '@/components/admin/blog/ArticleSeoTab';
import ArticleEbookTab from '@/components/admin/blog/ArticleEbookTab';

type Tab = 'content' | 'seo' | 'ebook';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'content', label: 'Inhalt', icon: 'M4 20h4l10.5-10.5a2.828 2.828 0 1 0-4-4L4 16v4M13.5 6.5l4 4' },
  { key: 'seo', label: 'SEO', icon: 'M10 10l-6 6M21 21l-6.5-6.5M3.268 12.043a7.017 7.017 0 0 0 6.69 4.957a7.012 7.012 0 0 0 7.042-7 7.012 7.012 0 0 0-7-7.042a7.017 7.017 0 0 0-4.957 6.69' },
  { key: 'ebook', label: 'eBook', icon: 'M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0M3 6v13M12 6v13M21 6v13' },
];

export default function AdminBlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('content');

  useEffect(() => {
    loadArticle();
  }, [id]);

  async function loadArticle() {
    try {
      const data = await getAdminArticle(id);
      setArticle(data);
    } catch (err) {
      console.error('Artikel laden fehlgeschlagen:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '24px 32px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Lade Artikel …</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ padding: '24px 32px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Artikel nicht gefunden.</p>
        <button
          onClick={() => router.push('/admin/blog')}
          style={{ marginTop: 12, padding: '8px 16px', borderRadius: 20, background: 'var(--gold-bg)', color: '#fff', border: 'none', fontSize: 12, cursor: 'pointer' }}
        >
          Zurück zur Übersicht
        </button>
      </div>
    );
  }

  const title = article.translations?.[0]?.title || article.slug;

  return (
    <div style={{ padding: '24px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => router.push('/admin/blog')}
          style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid var(--glass-border)',
            background: 'var(--glass)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="var(--text-muted)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l14 0M5 12l6 6M5 12l6-6" />
          </svg>
        </button>
        <div>
          <h1 style={{ fontSize: 20, fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400, fontStyle: 'italic', color: 'var(--text-h)', margin: 0 }}>
            {title}
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            /{article.slug} · {article.status} · {article.views_count} Aufrufe
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--glass-border)', paddingBottom: 0 }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              borderRadius: '8px 8px 0 0', border: 'none', cursor: 'pointer',
              fontSize: 12, letterSpacing: '0.3px',
              background: activeTab === tab.key ? 'var(--glass)' : 'transparent',
              color: activeTab === tab.key ? 'var(--gold-text)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.key ? '2px solid var(--gold-text)' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'content' && <ArticleContentTab article={article} onUpdate={loadArticle} />}
      {activeTab === 'seo' && <ArticleSeoTab article={article} onUpdate={loadArticle} />}
      {activeTab === 'ebook' && <ArticleEbookTab article={article} onUpdate={loadArticle} />}
    </div>
  );
}
