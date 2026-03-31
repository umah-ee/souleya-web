'use client';

import EbookLeadForm from './EbookLeadForm';

interface Props {
  articleId: string;
  coverUrl?: string;
  headline?: string;
  description?: string;
  pageCount?: number;
}

export default function EbookCTA({ articleId, coverUrl, headline, description, pageCount }: Props) {
  return (
    <div style={{
      margin: '32px 0', padding: '20px 24px', borderRadius: 8,
      background: 'var(--glass)', border: '1px solid var(--glass-border)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    }}>

      {/* Top row: GRATIS + Kostenloses eBook + Titel */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        marginBottom: 16,
      }}>
        <span style={{
          display: 'inline-block', padding: '4px 14px', borderRadius: 16,
          background: 'linear-gradient(135deg, #A8894E, #D4BC8B)', color: '#fff',
          fontSize: 12, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase',
          flexShrink: 0,
        }}>
          Gratis
        </span>
        <span style={{
          fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase',
          color: 'var(--gold-text)', fontWeight: 500, flexShrink: 0,
        }}>
          Kostenloses eBook
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'line-through', flexShrink: 0 }}>
          19,90 &euro;
        </span>
        <span style={{
          fontSize: 16, fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 400, fontStyle: 'italic', color: 'var(--text-h)',
          flex: 1, minWidth: 0,
        }}>
          {headline || 'Tauche tiefer ein.'}
        </span>
      </div>

      {/* Bottom row: Cover left + Form right */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* Cover */}
        {coverUrl && (
          <div style={{
            width: 120, height: 160, borderRadius: 6, overflow: 'hidden', flexShrink: 0,
            boxShadow: '0 4px 16px rgba(0,0,0,.15)',
          }}>
            <img src={coverUrl} alt="eBook Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {/* Right: Description + Form */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6,
            margin: '0 0 12px',
          }}>
            {description || 'Praktische Uebungen, Checklisten und Reflexionsfragen.'}
            {pageCount ? ` ${pageCount} Seiten.` : ''}
          </p>
          <EbookLeadForm articleId={articleId} source="blog_cta" />
        </div>
      </div>
    </div>
  );
}
