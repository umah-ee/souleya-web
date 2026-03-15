'use client';

import { useLightbox } from './LightboxProvider';

interface Props {
  images: string[];
  onImageClick?: (index: number) => void;
  maxHeight?: number;
}

export default function ImageGrid({ images, onImageClick, maxHeight }: Props) {
  const { openLightbox } = useLightbox();
  const count = images.length;

  if (count === 0) return null;

  const handleClick = (index: number) => {
    if (onImageClick) {
      onImageClick(index);
    } else {
      openLightbox(images, index);
    }
  };

  // ── 1 Bild: volle Breite ─────────────────────────────────
  if (count === 1) {
    return (
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
    );
  }

  // ── 2 Bilder: nebeneinander ───────────────────────────────
  if (count === 2) {
    return (
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
    );
  }

  // ── 3 Bilder: erstes links 2/3, restliche rechts 1/3 gestapelt ──
  if (count === 3) {
    return (
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
    );
  }

  // ── 4+ Bilder: 2x2 Grid, letztes Feld zeigt "+N" Overlay ─
  const visibleImages = images.slice(0, 4);
  const remaining = count - 4;

  return (
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
  );
}
