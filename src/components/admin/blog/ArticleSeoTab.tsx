'use client';

interface Props {
  article: any;
  onUpdate: () => void;
}

export default function ArticleSeoTab({ article }: Props) {
  const translation = article.translations?.[0];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {/* Left: SEO Fields */}
      <div>
        <h3 style={{ fontSize: 14, color: 'var(--text-h)', marginBottom: 12 }}>SEO-Einstellungen</h3>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Meta Description</label>
          <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)', fontSize: 12, color: 'var(--text-body)', lineHeight: 1.6 }}>
            {translation?.meta_description || 'Nicht gesetzt'}
          </div>
          {translation?.meta_description && (
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
              {translation.meta_description.length} / 160 Zeichen
            </div>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>SEO Keywords</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {(translation?.seo_keywords || []).map((kw: string, i: number) => (
              <span key={i} style={{
                padding: '3px 10px', borderRadius: 8, fontSize: 10,
                background: 'var(--gold-bg)', border: '1px solid var(--glass-border)',
                color: 'var(--gold-text)',
              }}>
                {kw}
              </span>
            ))}
            {(!translation?.seo_keywords || translation.seo_keywords.length === 0) && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Keine Keywords gesetzt</span>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Lesezeit</label>
          <div style={{ fontSize: 13, color: 'var(--text-h)' }}>
            {translation?.reading_time_min ? `${translation.reading_time_min} Min.` : 'Nicht gesetzt'}
          </div>
        </div>
      </div>

      {/* Right: Longtail Keywords + Social Snippets */}
      <div>
        <h3 style={{ fontSize: 14, color: 'var(--text-h)', marginBottom: 12 }}>Longtail Keywords</h3>

        {translation?.longtail_keywords ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(translation.longtail_keywords).map(([intent, keywords]) => (
              <div key={intent} style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: 9, color: 'var(--gold-text)', letterSpacing: '0.5px', marginBottom: 4, textTransform: 'uppercase' }}>
                  {intent}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {(keywords as string[]).map((kw, i) => (
                    <span key={i} style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, background: 'var(--bg-elevated)', color: 'var(--text-body)' }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Keine Longtail Keywords vorhanden.</p>
        )}

        {/* Social Snippets Preview */}
        {translation?.social_snippets && (
          <div style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 14, color: 'var(--text-h)', marginBottom: 12 }}>Social Snippets</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(translation.social_snippets).map(([platform, snippet]) => (
                <div key={platform} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
                  <div style={{ fontSize: 9, color: 'var(--gold-text)', letterSpacing: '0.5px', marginBottom: 2, textTransform: 'uppercase' }}>
                    {platform}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-body)', lineHeight: 1.5 }}>
                    {typeof snippet === 'string' ? snippet : JSON.stringify(snippet, null, 2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
