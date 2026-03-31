'use client';

import { useState, useEffect } from 'react';
import EbookLeadForm from './EbookLeadForm';

interface Props {
  articleId: string;
  headline?: string;
}

export default function EbookStickyFooter({ articleId, headline }: Props) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrolled > 0.3 && !dismissed) {
        setVisible(true);
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dismissed]);

  if (!visible || dismissed) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      padding: '14px 24px',
      background: 'var(--bg-elevated)',
      borderTop: '1px solid var(--glass-border)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center',
      animation: 'slideUp 0.3s ease-out',
    }}>
      {/* GRATIS Badge */}
      <span style={{
        display: 'inline-block', padding: '5px 14px', borderRadius: 16,
        background: 'linear-gradient(135deg, #A8894E, #D4BC8B)', color: '#fff',
        fontSize: 13, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase',
        flexShrink: 0,
      }}>
        Gratis
      </span>

      {/* Text */}
      <div style={{ flexShrink: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, color: 'var(--text-h)', fontWeight: 500, lineHeight: 1.3 }}>
          {headline || 'Kostenloses eBook zu diesem Thema'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
          Praktische Uebungen, Checklisten und Reflexionsfragen &middot; <span style={{ textDecoration: 'line-through' }}>19,90 &euro;</span> 0 &euro;
        </div>
      </div>

      {/* Form */}
      <div style={{ width: 300, flexShrink: 0 }}>
        <EbookLeadForm articleId={articleId} source="sticky_footer" compact />
      </div>

      {/* Close */}
      <button
        onClick={() => setDismissed(true)}
        style={{
          width: 32, height: 32, borderRadius: 8, border: '1px solid var(--glass-border)',
          background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="var(--text-muted)" strokeWidth={1.5} strokeLinecap="round">
          <path d="M18 6l-12 12M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
