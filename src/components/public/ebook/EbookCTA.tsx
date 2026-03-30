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
      margin: '32px 0', padding: 24, borderRadius: 8,
      background: 'var(--glass)', border: '1px solid var(--glass-border)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      display: 'flex', gap: 20, alignItems: 'center',
    }}>
      {/* Cover Preview */}
      {coverUrl && (
        <div style={{
          width: 100, height: 140, borderRadius: 6, overflow: 'hidden', flexShrink: 0,
          boxShadow: '0 4px 16px rgba(0,0,0,.15)',
        }}>
          <img src={coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ flex: 1 }}>
        {/* Enso + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <svg viewBox="0 0 100 100" width={20} height={20}>
            <defs>
              <linearGradient id="cta-enso" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A8894E" />
                <stop offset="100%" stopColor="#D4BC8B" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="36" fill="none" stroke="url(#cta-enso)" strokeWidth="8" strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15" />
          </svg>
          <span style={{ fontSize: 8, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold-text)' }}>
            Kostenloses eBook
          </span>
        </div>

        <h3 style={{
          fontSize: 18, fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 400, fontStyle: 'italic', color: 'var(--text-h)',
          margin: '0 0 4px',
        }}>
          {headline || 'Tauche tiefer ein.'}
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>
          {description || 'Lade dir das kostenlose eBook herunter und erhalte praktische Uebungen, Checklisten und Reflexionsfragen.'}
          {pageCount ? ` ${pageCount} Seiten.` : ''}
        </p>

        <EbookLeadForm articleId={articleId} source="blog_cta" />
      </div>
    </div>
  );
}
