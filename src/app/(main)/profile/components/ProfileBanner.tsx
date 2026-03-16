'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/ui/Icon';

interface ProfileBannerProps {
  profile: { banner_url: string | null; banner_pos_x?: number; banner_pos_y?: number };
  /** Optional: Zeigt Edit-Button nur wenn gesetzt */
  onSettingsClick?: () => void;
  onEditClick?: () => void;
  /** Optional: Aktiviert den Reposition-Modus */
  onRepositionSave?: (posX: number, posY: number) => void;
}

/**
 * Profile Banner — mit Crop-Modal für X+Y Repositionierung
 *
 * Buttons: 36px circle, blur(12px), bg rgba(0,0,0,.3), color rgba(255,255,255,.75)
 * Hover: scale(1.05) + bg rgba(0,0,0,.5)
 * Overlay: 3-Stop Gradient (bg-card 0%, rgba 40%, rgba 100%)
 */
export default function ProfileBanner({
  profile,
  onSettingsClick,
  onEditClick,
  onRepositionSave,
}: ProfileBannerProps) {
  const [showCropModal, setShowCropModal] = useState(false);

  const posX = profile.banner_pos_x ?? 50;
  const posY = profile.banner_pos_y ?? 50;

  /* ── Shared Button-Style ── */
  const circleBtn: React.CSSProperties = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'rgba(0,0,0,.3)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,.12)',
    color: 'rgba(255,255,255,.75)',
  };

  const hoverIn = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(1.05)';
    e.currentTarget.style.background = 'rgba(0,0,0,.5)';
  };
  const hoverOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.background = 'rgba(0,0,0,.3)';
  };

  return (
    <>
      <div className="relative w-full h-[300px] overflow-hidden">
        {/* Banner-Bild oder Gradient-Fallback */}
        {profile.banner_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.banner_url}
            alt=""
            className="w-full h-full object-cover select-none"
            draggable={false}
            style={{ objectPosition: `${posX}% ${posY}%` }}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: 'linear-gradient(135deg, #D8CFBE 0%, var(--gold) 50%, #B08840 100%)' }}
          />
        )}

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 banner-overlay"
          style={{
            background: 'linear-gradient(to top, var(--bg-card) 0%, rgba(0,0,0,.15) 40%, rgba(0,0,0,.02) 100%)',
          }}
        />

        {/* Action Buttons */}
        {(onEditClick || onSettingsClick || (onRepositionSave && profile.banner_url)) && (
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {/* Reposition-Button (nur wenn Banner vorhanden + eigenes Profil) */}
            {onRepositionSave && profile.banner_url && (
              <button
                onClick={() => setShowCropModal(true)}
                className="flex items-center justify-center cursor-pointer transition-all duration-200"
                style={circleBtn}
                onMouseEnter={hoverIn}
                onMouseLeave={hoverOut}
                title="Banner ausrichten"
              >
                <Icon name="arrows-vertical" size={16} />
              </button>
            )}
            {onEditClick && (
              <button
                onClick={onEditClick}
                className="flex items-center justify-center cursor-pointer transition-all duration-200"
                style={circleBtn}
                onMouseEnter={hoverIn}
                onMouseLeave={hoverOut}
                title="Profil bearbeiten"
              >
                <Icon name="edit" size={16} />
              </button>
            )}
            {onSettingsClick && (
              <button
                onClick={onSettingsClick}
                className="flex items-center justify-center cursor-pointer transition-all duration-200"
                style={circleBtn}
                onMouseEnter={hoverIn}
                onMouseLeave={hoverOut}
                title="Einstellungen"
              >
                <Icon name="settings" size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Crop-Modal (Portal) */}
      {showCropModal && profile.banner_url && onRepositionSave && (
        <CropModal
          imageUrl={profile.banner_url}
          initialPosX={posX}
          initialPosY={posY}
          onSave={(x, y) => {
            onRepositionSave(x, y);
            setShowCropModal(false);
          }}
          onCancel={() => setShowCropModal(false)}
        />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════
   CROP MODAL — Fullscreen Overlay mit Frame
   ═══════════════════════════════════════════ */

interface CropModalProps {
  imageUrl: string;
  initialPosX: number;
  initialPosY: number;
  onSave: (posX: number, posY: number) => void;
  onCancel: () => void;
}

function CropModal({ imageUrl, initialPosX, initialPosY, onSave, onCancel }: CropModalProps) {
  const FRAME_HEIGHT = 300; // Banner-Höhe
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Position in Pixel (offset des Bildes relativ zum Frame)
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

  const dragActive = useRef(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartOffX = useRef(0);
  const dragStartOffY = useRef(0);

  // Berechne Frame-Breite und initiale Position wenn Bild geladen ist
  useEffect(() => {
    if (!imgLoaded || !imgRef.current || !containerRef.current) return;

    const frameW = containerRef.current.offsetWidth;
    const natW = imgRef.current.naturalWidth;
    const natH = imgRef.current.naturalHeight;

    // Bild wird so skaliert dass es den Frame mindestens ausfüllt
    const scaleW = frameW / natW;
    const scaleH = FRAME_HEIGHT / natH;
    const scale = Math.max(scaleW, scaleH);

    const dispW = natW * scale;
    const dispH = natH * scale;
    setImgSize({ w: dispW, h: dispH });

    // Aus Prozent-Position zu Pixel-Offset umrechnen
    // posX=50 → Bild mittig horizontal: offsetX = -(dispW - frameW) * 0.5
    const maxOffX = dispW - frameW;
    const maxOffY = dispH - FRAME_HEIGHT;
    setOffsetX(-maxOffX * (initialPosX / 100));
    setOffsetY(-maxOffY * (initialPosY / 100));
  }, [imgLoaded, initialPosX, initialPosY]);

  const clampOffset = useCallback((ox: number, oy: number) => {
    if (!containerRef.current) return { x: ox, y: oy };
    const frameW = containerRef.current.offsetWidth;
    const maxOffX = imgSize.w - frameW;
    const maxOffY = imgSize.h - FRAME_HEIGHT;
    return {
      x: Math.round(Math.min(0, Math.max(-maxOffX, ox))),
      y: Math.round(Math.min(0, Math.max(-maxOffY, oy))),
    };
  }, [imgSize]);

  /* ── Drag handlers ── */
  const handlePointerDown = useCallback((clientX: number, clientY: number) => {
    dragActive.current = true;
    dragStartX.current = clientX;
    dragStartY.current = clientY;
    dragStartOffX.current = offsetX;
    dragStartOffY.current = offsetY;
  }, [offsetX, offsetY]);

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!dragActive.current) return;
    const dx = clientX - dragStartX.current;
    const dy = clientY - dragStartY.current;
    const clamped = clampOffset(dragStartOffX.current + dx, dragStartOffY.current + dy);
    setOffsetX(clamped.x);
    setOffsetY(clamped.y);
  }, [clampOffset]);

  const handlePointerUp = useCallback(() => {
    dragActive.current = false;
  }, []);

  // Mouse events
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handlePointerDown(e.clientX, e.clientY);

    const onMove = (ev: MouseEvent) => handlePointerMove(ev.clientX, ev.clientY);
    const onUp = () => {
      handlePointerUp();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  // Touch events
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
  }, [handlePointerDown]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
  }, [handlePointerMove]);

  /* ── Save: Pixel-Offset → Prozent umrechnen ── */
  const handleSave = useCallback(() => {
    if (!containerRef.current) return;
    const frameW = containerRef.current.offsetWidth;
    const maxOffX = imgSize.w - frameW;
    const maxOffY = imgSize.h - FRAME_HEIGHT;

    const pctX = maxOffX > 0 ? Math.round((-offsetX / maxOffX) * 100) : 50;
    const pctY = maxOffY > 0 ? Math.round((-offsetY / maxOffY) * 100) : 50;

    onSave(
      Math.min(100, Math.max(0, pctX)),
      Math.min(100, Math.max(0, pctY)),
    );
  }, [imgSize, offsetX, offsetY, onSave]);

  // ESC zum Schließen
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  return createPortal(
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        zIndex: 300,
        background: 'rgba(0,0,0,.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Header Hint */}
      <div className="flex items-center gap-2 mb-6">
        <Icon name="arrows-vertical" size={16} style={{ color: 'rgba(255,255,255,.7)' }} />
        <span
          className="font-label text-[0.7rem] tracking-[0.12em] uppercase"
          style={{ color: 'rgba(255,255,255,.7)' }}
        >
          Bild verschieben
        </span>
      </div>

      {/* Crop Frame */}
      <div
        ref={containerRef}
        className="relative overflow-hidden w-full max-w-[700px]"
        style={{
          height: `${FRAME_HEIGHT}px`,
          cursor: 'grab',
          border: '2px solid rgba(255,255,255,.25)',
          borderRadius: '8px',
        }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={handlePointerUp}
      >
        {/* Das Bild — wird per transform verschoben */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={imageUrl}
          alt=""
          draggable={false}
          className="select-none"
          onLoad={() => setImgLoaded(true)}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: imgSize.w > 0 ? `${imgSize.w}px` : 'auto',
            height: imgSize.h > 0 ? `${imgSize.h}px` : 'auto',
            transform: `translate(${offsetX}px, ${offsetY}px)`,
            pointerEvents: 'none',
          }}
        />

        {/* Lade-Indikator */}
        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="font-label text-[0.65rem] tracking-[0.15em] uppercase"
              style={{ color: 'rgba(255,255,255,.5)' }}
            >
              Wird geladen …
            </span>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={onCancel}
          className="font-label text-[0.7rem] tracking-[0.1em] uppercase cursor-pointer transition-all"
          style={{
            padding: '10px 28px',
            borderRadius: '9999px',
            background: 'rgba(255,255,255,.1)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,.2)',
            color: 'rgba(255,255,255,.8)',
          }}
        >
          Abbrechen
        </button>
        <button
          onClick={handleSave}
          className="font-label text-[0.7rem] tracking-[0.1em] uppercase cursor-pointer transition-all"
          style={{
            padding: '10px 28px',
            borderRadius: '9999px',
            background: 'var(--gold)',
            color: '#fff',
            border: 'none',
          }}
        >
          Speichern
        </button>
      </div>
    </div>,
    document.body,
  );
}
