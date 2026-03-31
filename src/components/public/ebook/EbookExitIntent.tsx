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
    if (e.clientY <= 5 && !dismissed) {
      setVisible(true);
    }
  }, [dismissed]);

  useEffect(() => {
    if ('ontouchstart' in window) return;
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
        background: 'rgba(0,0,0,.65)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <div style={{
        width: '90%', maxWidth: 480, padding: '36px 32px', borderRadius: 12,
        background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)',
        position: 'relative', textAlign: 'center',
        boxShadow: '0 24px 64px rgba(0,0,0,.3)',
      }}>
        {/* Close */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: 8,
            border: '1px solid var(--glass-border)', background: 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="var(--text-muted)" strokeWidth={1.5} strokeLinecap="round">
            <path d="M18 6l-12 12M6 6l12 12" />
          </svg>
        </button>

        {/* Enso */}
        <svg viewBox="0 0 100 100" width={40} height={40} style={{ margin: '0 auto 14px', display: 'block' }}>
          <defs>
            <linearGradient id="ei-enso" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A8894E" />
              <stop offset="100%" stopColor="#D4BC8B" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="36" fill="none" stroke="url(#ei-enso)" strokeWidth="8" strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15" />
        </svg>

        {/* GRATIS Badge + Price Anchor */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 10 }}>
          <span style={{
            display: 'inline-block', padding: '7px 22px', borderRadius: 20,
            background: 'linear-gradient(135deg, #A8894E, #D4BC8B)', color: '#fff',
            fontSize: 18, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase',
          }}>
            Gratis
          </span>
          <span style={{ fontSize: 18, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
            19,90 &euro;
          </span>
        </div>

        {/* Label */}
        <div style={{
          fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase',
          color: 'var(--text-muted)', marginBottom: 8,
        }}>
          Bevor du gehst &hellip;
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: 28, fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 400, fontStyle: 'italic', color: 'var(--text-h)',
          margin: '0 0 8px', lineHeight: 1.3,
        }}>
          {headline || 'Dein kostenloses eBook wartet'}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20,
          maxWidth: 380, marginLeft: 'auto', marginRight: 'auto',
        }}>
          {description || 'Tauche tiefer in das Thema ein — mit praktischen Uebungen, Checklisten und Reflexionsfragen. Kostenlos.'}
        </p>

        {/* Cover */}
        {coverUrl && (
          <div style={{
            width: 160, height: 210, borderRadius: 8, overflow: 'hidden',
            margin: '0 auto 24px',
            boxShadow: '0 8px 28px rgba(0,0,0,.2)',
          }}>
            <img src={coverUrl} alt="eBook Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {/* Lead Form */}
        <div style={{ maxWidth: 360, margin: '0 auto' }}>
          <EbookLeadForm articleId={articleId} source="exit_intent" />
        </div>
      </div>
    </div>
  );
}
