'use client';

interface Props {
  article: any;
  onUpdate: () => void;
}

export default function ArticleContentTab({ article }: Props) {
  const translation = article.translations?.[0];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {/* Left: Content */}
      <div>
        <h3 style={{ fontSize: 14, color: 'var(--text-h)', marginBottom: 12 }}>Artikel-Inhalt</h3>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Titel</label>
          <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)', fontSize: 13, color: 'var(--text-h)' }}>
            {translation?.title || '–'}
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Kurzfassung</label>
          <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)', fontSize: 12, color: 'var(--text-body)', lineHeight: 1.6 }}>
            {translation?.excerpt || '–'}
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Inhalt (HTML)</label>
          <div
            style={{
              padding: '12px', borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)',
              fontSize: 12, color: 'var(--text-body)', lineHeight: 1.7, maxHeight: 400, overflowY: 'auto',
            }}
            className="scrollbar-gold"
            dangerouslySetInnerHTML={{ __html: translation?.content || '<p>Kein Inhalt</p>' }}
          />
        </div>
      </div>

      {/* Right: Metadata */}
      <div>
        <h3 style={{ fontSize: 14, color: 'var(--text-h)', marginBottom: 12 }}>Metadaten</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: 2 }}>STATUS</div>
            <div style={{ fontSize: 13, color: 'var(--text-h)' }}>{article.status}</div>
          </div>
          <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: 2 }}>KATEGORIE</div>
            <div style={{ fontSize: 13, color: 'var(--text-h)' }}>{article.category || '–'}</div>
          </div>
          <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: 2 }}>AUFRUFE</div>
            <div style={{ fontSize: 13, color: 'var(--text-h)' }}>{article.views_count}</div>
          </div>
          <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: 2 }}>SLUG</div>
            <div style={{ fontSize: 13, color: 'var(--text-h)' }}>{article.slug}</div>
          </div>
        </div>

        {/* Cover */}
        {article.og_image_url && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Cover-Bild</label>
            <img
              src={article.og_image_url}
              alt=""
              style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--glass-border)' }}
            />
          </div>
        )}

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div>
            <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {article.tags.map((tag: string) => (
                <span key={tag} style={{
                  padding: '3px 10px', borderRadius: 8, fontSize: 10,
                  background: 'var(--glass)', border: '1px solid var(--glass-border)',
                  color: 'var(--text-muted)',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
