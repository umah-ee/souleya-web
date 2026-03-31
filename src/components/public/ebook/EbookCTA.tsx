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
      margin: '48px 0', padding: '32px 28px', borderRadius: 8,
      background: 'var(--glass)', border: '1px solid var(--glass-border)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      textAlign: 'center',
    }}>

      {/* Enso */}
      <svg viewBox="0 0 100 100" width={36} height={36} style={{ margin: '0 auto 12px' }}>
        <defs>
          <linearGradient id="cta-enso" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A8894E" />
            <stop offset="100%" stopColor="#D4BC8B" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="36" fill="none" stroke="url(#cta-enso)" strokeWidth="8" strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15" />
      </svg>

      {/* GRATIS Badge + Price Anchor */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
        <span style={{
          display: 'inline-block', padding: '6px 20px', borderRadius: 20,
          background: 'linear-gradient(135deg, #A8894E, #D4BC8B)', color: '#fff',
          fontSize: 16, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase',
        }}>
          Gratis
        </span>
        <span style={{
          fontSize: 16, color: 'var(--text-muted)', textDecoration: 'line-through',
        }}>
          19,90 &euro;
        </span>
      </div>

      {/* Label */}
      <div style={{
        fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase',
        color: 'var(--gold-text)', marginBottom: 8, fontWeight: 500,
      }}>
        Kostenloses eBook
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: 26, fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontWeight: 400, fontStyle: 'italic', color: 'var(--text-h)',
        margin: '0 0 8px', lineHeight: 1.3,
      }}>
        {headline || 'Tauche tiefer ein.'}
      </h3>

      {/* Description */}
      <p style={{
        fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6,
        marginBottom: 20, maxWidth: 460, marginLeft: 'auto', marginRight: 'auto',
      }}>
        {description || 'Lade dir das kostenlose eBook herunter und erhalte praktische Uebungen, Checklisten und Reflexionsfragen.'}
        {pageCount ? ` ${pageCount} Seiten.` : ''}
      </p>

      {/* Cover Image */}
      {coverUrl && (
        <div style={{
          width: 180, height: 240, borderRadius: 8, overflow: 'hidden',
          margin: '0 auto 24px',
          boxShadow: '0 8px 32px rgba(0,0,0,.2), 0 2px 8px rgba(0,0,0,.1)',
        }}>
          <img src={coverUrl} alt="eBook Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* Lead Form */}
      <div style={{ maxWidth: 400, margin: '0 auto' }}>
        <EbookLeadForm articleId={articleId} source="blog_cta" />
      </div>
    </div>
  );
}
