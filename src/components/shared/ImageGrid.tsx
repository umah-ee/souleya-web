'use client';

import { useState } from 'react';

interface Props {
  images: string[];
  onImageClick?: (index: number) => void;
  maxHeight?: number;
}

export default function ImageGrid({ images, onImageClick, maxHeight }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const count = images.length;

  if (count === 0) return null;

  const handleClick = (index: number) => {
    if (onImageClick) {
      onImageClick(index);
    } else {
      setLightboxIndex(index);
    }
  };

  const closeLightbox = () => setLightboxIndex(null);

  const goToNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % count);
    }
  };

  const goToPrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + count) % count);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'ArrowLeft') goToPrev();
  };

  // ── 1 Bild: volle Breite ─────────────────────────────────
  if (count === 1) {
    return (
      <>
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--glass-border)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[0]}
            alt=""
            className="w-full object-cover cursor-pointer transition-opacity duration-200 hover:opacity-90"
            style={{ maxHeight: maxHeight ?? 400, display: 'block' }}
            onClick={() => handleClick(0)}
          />
        </div>
        {lightboxIndex !== null && (
          <Lightbox
            images={images}
            currentIndex={lightboxIndex}
            onClose={closeLightbox}
            onNext={goToNext}
            onPrev={goToPrev}
            onKeyDown={handleKeyDown}
          />
        )}
      </>
    );
  }

  // ── 2 Bilder: nebeneinander ───────────────────────────────
  if (count === 2) {
    return (
      <>
        <div
          className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden"
          style={{ maxHeight: maxHeight ?? 300, border: '1px solid var(--glass-border)' }}
        >
          {images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt=""
              className="w-full h-full object-cover cursor-pointer transition-opacity duration-200 hover:opacity-90"
              style={{ maxHeight: maxHeight ?? 300 }}
              onClick={() => handleClick(i)}
            />
          ))}
        </div>
        {lightboxIndex !== null && (
          <Lightbox
            images={images}
            currentIndex={lightboxIndex}
            onClose={closeLightbox}
            onNext={goToNext}
            onPrev={goToPrev}
            onKeyDown={handleKeyDown}
          />
        )}
      </>
    );
  }

  // ── 3 Bilder: erstes links 2/3, restliche rechts 1/3 gestapelt ──
  if (count === 3) {
    return (
      <>
        <div
          className="grid gap-1 rounded-lg overflow-hidden"
          style={{
            gridTemplateColumns: '2fr 1fr',
            maxHeight: maxHeight ?? 300,
            border: '1px solid var(--glass-border)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[0]}
            alt=""
            className="w-full h-full object-cover cursor-pointer transition-opacity duration-200 hover:opacity-90"
            style={{ gridRow: '1 / 3', maxHeight: maxHeight ?? 300 }}
            onClick={() => handleClick(0)}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[1]}
            alt=""
            className="w-full h-full object-cover cursor-pointer transition-opacity duration-200 hover:opacity-90"
            onClick={() => handleClick(1)}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[2]}
            alt=""
            className="w-full h-full object-cover cursor-pointer transition-opacity duration-200 hover:opacity-90"
            onClick={() => handleClick(2)}
          />
        </div>
        {lightboxIndex !== null && (
          <Lightbox
            images={images}
            currentIndex={lightboxIndex}
            onClose={closeLightbox}
            onNext={goToNext}
            onPrev={goToPrev}
            onKeyDown={handleKeyDown}
          />
        )}
      </>
    );
  }

  // ── 4+ Bilder: 2x2 Grid, letztes Feld zeigt "+N" Overlay ─
  const visibleImages = images.slice(0, 4);
  const remaining = count - 4;

  return (
    <>
      <div
        className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden"
        style={{ maxHeight: maxHeight ?? 300, border: '1px solid var(--glass-border)' }}
      >
        {visibleImages.map((src, i) => (
          <div key={i} className="relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover cursor-pointer transition-opacity duration-200 hover:opacity-90"
              style={{ minHeight: 100, maxHeight: (maxHeight ?? 300) / 2 }}
              onClick={() => handleClick(i)}
            />
            {i === 3 && remaining > 0 && (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                style={{ background: 'rgba(0, 0, 0, 0.5)' }}
                onClick={() => handleClick(i)}
              >
                <span className="font-heading text-2xl" style={{ color: '#F0E8D8' }}>
                  +{remaining}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={goToNext}
          onPrev={goToPrev}
          onKeyDown={handleKeyDown}
        />
      )}
    </>
  );
}

// ── Lightbox-Komponente ─────────────────────────────────────
function Lightbox({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
  onKeyDown,
}: {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.9)' }}
      onClick={onClose}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="dialog"
      aria-label="Bildvorschau"
    >
      {/* Schliessen */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer z-10"
        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#F0E8D8' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
          <path d="M18 6l-12 12" />
          <path d="M6 6l12 12" />
        </svg>
      </button>

      {/* Vorheriges Bild */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer z-10"
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#F0E8D8' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <path d="M15 6l-6 6l6 6" />
          </svg>
        </button>
      )}

      {/* Bild */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[currentIndex]}
        alt=""
        className="max-w-[90vw] max-h-[90vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Naechstes Bild */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer z-10"
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#F0E8D8' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <path d="M9 6l6 6l-6 6" />
          </svg>
        </button>
      )}

      {/* Zaehler */}
      {images.length > 1 && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full font-label text-[0.7rem] tracking-[0.1em]"
          style={{ background: 'rgba(255,255,255,0.1)', color: '#F0E8D8' }}
        >
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
