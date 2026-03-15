'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

// ── Context ────────────────────────────────────────────────
interface LightboxContextType {
  openLightbox: (images: string[], startIndex?: number) => void;
}

const LightboxContext = createContext<LightboxContextType | null>(null);

export function useLightbox() {
  const ctx = useContext(LightboxContext);
  if (!ctx) throw new Error('useLightbox muss innerhalb von LightboxProvider verwendet werden');
  return ctx;
}

// ── Provider ───────────────────────────────────────────────
export default function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const openLightbox = useCallback((imgs: string[], startIndex = 0) => {
    setImages(imgs);
    setCurrentIndex(startIndex);
    setIsOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Body-Scroll sperren wenn Lightbox offen
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard-Navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeLightbox, goToNext, goToPrev]);

  return (
    <LightboxContext.Provider value={{ openLightbox }}>
      {children}
      {isOpen && typeof window !== 'undefined' &&
        createPortal(
          <LightboxOverlay
            images={images}
            currentIndex={currentIndex}
            onClose={closeLightbox}
            onNext={goToNext}
            onPrev={goToPrev}
          />,
          document.body,
        )
      }
    </LightboxContext.Provider>
  );
}

// ── Lightbox UI ────────────────────────────────────────────
function LightboxOverlay({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center animate-fade-in"
      style={{
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
      }}
      onClick={onClose}
      role="dialog"
      aria-label="Bildvorschau"
    >
      {/* Schliessen */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer z-20 transition-opacity hover:opacity-80"
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: '2px solid rgba(255,255,255,0.5)',
          color: '#ffffff',
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <path d="M18 6l-12 12" />
          <path d="M6 6l12 12" />
        </svg>
      </button>

      {/* Vorheriges Bild */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer z-20 transition-opacity hover:opacity-80"
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.5)',
            color: '#ffffff',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <path d="M15 6l-6 6l6 6" />
          </svg>
        </button>
      )}

      {/* Bild */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[currentIndex]}
        alt=""
        className="max-w-[85vw] max-h-[80vh] object-contain rounded-lg"
        style={{ boxShadow: '0 0 60px rgba(0,0,0,0.5)' }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Naechstes Bild */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer z-20 transition-opacity hover:opacity-80"
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.5)',
            color: '#ffffff',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <path d="M9 6l6 6l-6 6" />
          </svg>
        </button>
      )}

      {/* Zaehler */}
      {images.length > 1 && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full font-label text-[0.7rem] tracking-[0.1em]"
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.4)',
            color: '#ffffff',
          }}
        >
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
