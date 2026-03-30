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
      // Show after scrolling past 30% of the page
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
      padding: '12px 24px',
      background: 'var(--bg-elevated)',
      borderTop: '1px solid var(--glass-border)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center',
      animation: 'slideUp 0.3s ease-out',
    }}>
      {/* Enso */}
      <svg viewBox="0 0 100 100" width={24} height={24} style={{ flexShrink: 0 }}>
        <defs>
          <linearGradient id="sf-enso" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A8894E" />
            <stop offset="100%" stopColor="#D4BC8B" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="36" fill="none" stroke="url(#sf-enso)" strokeWidth="8" strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15" />
      </svg>

      <div style={{ fontSize: 12, color: 'var(--text-h)', fontWeight: 500 }}>
        {headline || 'Kostenloses eBook zu diesem Thema'}
      </div>

      <div style={{ width: 280, flexShrink: 0 }}>
        <EbookLeadForm articleId={articleId} source="sticky_footer" compact />
      </div>

      {/* Close */}
      <button
        onClick={() => setDismissed(true)}
        style={{
          width: 28, height: 28, borderRadius: 8, border: '1px solid var(--glass-border)',
          background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="var(--text-muted)" strokeWidth={1.5} strokeLinecap="round">
          <path d="M18 6l-12 12M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
