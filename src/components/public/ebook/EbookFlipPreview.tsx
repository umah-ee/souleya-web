'use client';

import { useState } from 'react';
import EbookLeadForm from './EbookLeadForm';

interface Props {
  articleId: string;
  coverUrl?: string;
  previewUrls?: string[];
  pageCount?: number;
}

export default function EbookFlipPreview({ articleId, coverUrl, previewUrls = [], pageCount }: Props) {
  const [currentPage, setCurrentPage] = useState(0);

  // Build pages: Cover + up to 2 preview pages + CTA page
  const pages = [
    coverUrl || null,
    previewUrls[0] || null,
    previewUrls[1] || null,
  ].filter(Boolean);

  const totalPages = pages.length + 1; // +1 for CTA page
  const isLastPage = currentPage === totalPages - 1;

  function nextPage() {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  }

  function prevPage() {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  }

  return (
    <div style={{ margin: '32px 0', textAlign: 'center' }}>
      <div style={{ fontSize: 8, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold-text)', marginBottom: 8 }}>
        Kostenloser eBook-Einblick
      </div>

      {/* Flip Container */}
      <div style={{
        width: 240, height: 340, margin: '0 auto', perspective: '1000px', position: 'relative',
      }}>
        <div style={{
          width: '100%', height: '100%', position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s ease',
        }}>
          {/* Current Page */}
          {!isLastPage && pages[currentPage] ? (
            <div
              onClick={nextPage}
              style={{
                width: '100%', height: '100%', borderRadius: 8, overflow: 'hidden',
                cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,.2)',
                position: 'relative',
              }}
            >
              <img
                src={pages[currentPage]!}
                alt={`Seite ${currentPage + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Page number */}
              <div style={{
                position: 'absolute', bottom: 8, right: 10,
                fontSize: 9, color: 'rgba(255,255,255,.7)',
                background: 'rgba(0,0,0,.35)', padding: '2px 8px', borderRadius: 4,
              }}>
                {currentPage + 1} / {totalPages}
              </div>
              {/* Tap hint */}
              <div style={{
                position: 'absolute', bottom: 8, left: 10,
                fontSize: 8, color: 'rgba(255,255,255,.5)',
              }}>
                Tippen zum Blaettern →
              </div>
            </div>
          ) : (
            /* CTA Page (last) */
            <div style={{
              width: '100%', height: '100%', borderRadius: 8,
              background: 'var(--glass)', border: '1px solid var(--glass-border)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: 20, boxShadow: '0 8px 32px rgba(0,0,0,.15)',
            }}>
              {/* Enso */}
              <svg viewBox="0 0 100 100" width={32} height={32} style={{ marginBottom: 10 }}>
                <defs>
                  <linearGradient id="fp-enso" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A8894E" />
                    <stop offset="100%" stopColor="#D4BC8B" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="36" fill="none" stroke="url(#fp-enso)" strokeWidth="8" strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15" />
              </svg>

              <div style={{
                fontSize: 14, fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 400, fontStyle: 'italic', color: 'var(--text-h)', marginBottom: 6,
              }}>
                Das vollstaendige eBook
              </div>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>
                {pageCount ? `${pageCount} Seiten mit Uebungen, Checklisten und Reflexionsfragen.` : 'Mit Uebungen, Checklisten und Reflexionsfragen.'}
              </p>

              <div style={{ width: '100%' }}>
                <EbookLeadForm articleId={articleId} source="flip_preview" compact />
              </div>

              {/* Page number */}
              <div style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 9, color: 'var(--text-muted)' }}>
                {currentPage + 1} / {totalPages}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Dots */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12 }}>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            style={{
              width: currentPage === i ? 16 : 6, height: 6, borderRadius: 3,
              background: currentPage === i ? 'var(--gold-text)' : 'var(--glass-border)',
              border: 'none', cursor: 'pointer', transition: 'all 0.3s',
            }}
          />
        ))}
      </div>

      {/* Arrow Navigation */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8 }}>
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          style={{
            width: 28, height: 28, borderRadius: 8, border: '1px solid var(--glass-border)',
            background: 'var(--glass)', cursor: currentPage === 0 ? 'default' : 'pointer',
            opacity: currentPage === 0 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="var(--text-muted)" strokeWidth={1.5} strokeLinecap="round">
            <path d="M15 6l-6 6l6 6" />
          </svg>
        </button>
        <button
          onClick={nextPage}
          disabled={isLastPage}
          style={{
            width: 28, height: 28, borderRadius: 8, border: '1px solid var(--glass-border)',
            background: 'var(--glass)', cursor: isLastPage ? 'default' : 'pointer',
            opacity: isLastPage ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="var(--text-muted)" strokeWidth={1.5} strokeLinecap="round">
            <path d="M9 6l6 6l-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
