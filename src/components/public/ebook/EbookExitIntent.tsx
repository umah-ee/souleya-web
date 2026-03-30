'use client';

import { useState, useEffect, useCallback } from 'react';
import EbookLeadForm from './EbookLeadForm';

interface Props {
  articleId: string;
  coverUrl?: string;
  headline?: string;
  description?: string;
}

export default function EbookExitIntent({ articleId, coverUrl, headline, description }: Props) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Only trigger when mouse leaves through the top of the viewport
    if (e.clientY <= 5 && !dismissed) {
      setVisible(true);
    }
  }, [dismissed]);

  useEffect(() => {
    // Desktop only — mouseleave doesn't work on mobile
    if ('ontouchstart' in window) return;

    // Delay before activating (avoid triggering immediately)
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseLeave]);

  function handleClose() {
    setVisible(false);
    setDismissed(true);
  }

  if (!visible) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,.55)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <div style={{
        width: '90%', maxWidth: 440, padding: 28, borderRadius: 8,
        background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)',
        position: 'relative',
      }}>
        {/* Close */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: 8,
            border: '1px solid var(--glass-border)', background: 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="var(--text-muted)" strokeWidth={1.5} strokeLinecap="round">
            <path d="M18 6l-12 12M6 6l12 12" />
          </svg>
        </button>

        <div style={{ textAlign: 'center' }}>
          {/* Enso */}
          <svg viewBox="0 0 100 100" width={36} height={36} style={{ margin: '0 auto 10px', display: 'block' }}>
            <defs>
              <linearGradient id="ei-enso" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A8894E" />
                <stop offset="100%" stopColor="#D4BC8B" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="36" fill="none" stroke="url(#ei-enso)" strokeWidth="8" strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15" />
          </svg>

          <div style={{ fontSize: 8, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold-text)', marginBottom: 6 }}>
            Bevor du gehst …
          </div>
          <h3 style={{
            fontSize: 20, fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 400, fontStyle: 'italic', color: 'var(--text-h)', marginBottom: 6,
          }}>
            {headline || 'Dein kostenloses eBook wartet'}
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>
            {description || 'Tauche tiefer in das Thema ein — mit praktischen Uebungen, Checklisten und Reflexionsfragen. Kostenlos.'}
          </p>

          {/* Cover */}
          {coverUrl && (
            <div style={{
              width: 100, height: 140, margin: '0 auto 16px', borderRadius: 6, overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,.2)',
            }}>
              <img src={coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          <div style={{ maxWidth: 300, margin: '0 auto' }}>
            <EbookLeadForm articleId={articleId} source="exit_intent" />
          </div>
        </div>
      </div>
    </div>
  );
}
