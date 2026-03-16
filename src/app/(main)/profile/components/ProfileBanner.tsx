'use client';

import { useState, useRef, useCallback } from 'react';
import { Icon } from '@/components/ui/Icon';

interface ProfileBannerProps {
  profile: { banner_url: string | null; banner_position?: number };
  /** Optional: Zeigt Edit-Button nur wenn gesetzt */
  onSettingsClick?: () => void;
  onEditClick?: () => void;
  /** Optional: Aktiviert den Reposition-Modus */
  onRepositionSave?: (position: number) => void;
}

/**
 * Profile Banner — mit Drag-to-Reposition
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
  const [repositioning, setRepositioning] = useState(false);
  const [dragPosition, setDragPosition] = useState<number | null>(null);
  const dragStartY = useRef(0);
  const dragStartPos = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const currentPosition = dragPosition ?? profile.banner_position ?? 50;

  /* ── Drag-Logik ── */
  const handleDragStart = useCallback((clientY: number) => {
    dragStartY.current = clientY;
    dragStartPos.current = dragPosition ?? profile.banner_position ?? 50;
  }, [dragPosition, profile.banner_position]);

  const handleDragMove = useCallback((clientY: number) => {
    if (!containerRef.current || !imgRef.current) return;
    const containerH = containerRef.current.offsetHeight;
    const imgNaturalH = imgRef.current.naturalHeight;
    const imgDisplayW = containerRef.current.offsetWidth;
    const imgDisplayH = (imgNaturalH / imgRef.current.naturalWidth) * imgDisplayW;
    const overflow = Math.max(imgDisplayH - containerH, 1);

    const deltaPixels = clientY - dragStartY.current;
    // Negativer Delta (hoch ziehen) → Position erhöht sich (mehr vom unteren Bereich sichtbar)
    const deltaPct = -(deltaPixels / overflow) * 100;
    const newPos = Math.round(Math.min(100, Math.max(0, dragStartPos.current + deltaPct)));
    setDragPosition(newPos);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!repositioning) return;
    e.preventDefault();
    handleDragStart(e.clientY);

    const onMove = (ev: MouseEvent) => handleDragMove(ev.clientY);
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [repositioning, handleDragStart, handleDragMove]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!repositioning) return;
    handleDragStart(e.touches[0].clientY);
  }, [repositioning, handleDragStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!repositioning) return;
    e.preventDefault();
    handleDragMove(e.touches[0].clientY);
  }, [repositioning, handleDragMove]);

  const startRepositioning = () => {
    setDragPosition(profile.banner_position ?? 50);
    setRepositioning(true);
  };

  const cancelRepositioning = () => {
    setDragPosition(null);
    setRepositioning(false);
  };

  const saveRepositioning = () => {
    if (onRepositionSave && dragPosition != null) {
      onRepositionSave(dragPosition);
    }
    setRepositioning(false);
    setDragPosition(null);
  };

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
    <div
      ref={containerRef}
      className="relative w-full h-[200px] overflow-hidden"
      style={{ cursor: repositioning ? 'grab' : undefined }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      {/* Banner-Bild oder Gradient-Fallback */}
      {profile.banner_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={profile.banner_url}
          alt=""
          className="w-full h-full object-cover select-none"
          draggable={false}
          style={{ objectPosition: `center ${currentPosition}%` }}
        />
      ) : (
        <div
          className="w-full h-full"
          style={{ background: 'linear-gradient(135deg, #D8CFBE 0%, var(--gold) 50%, #B08840 100%)' }}
        />
      )}

      {/* Gradient Overlay — nur wenn NICHT im Reposition-Modus */}
      {!repositioning && (
        <div
          className="absolute inset-0 banner-overlay"
          style={{
            background: 'linear-gradient(to top, var(--bg-card) 0%, rgba(0,0,0,.15) 40%, rgba(0,0,0,.02) 100%)',
          }}
        />
      )}

      {/* ── Reposition-Modus: Hint + Buttons ── */}
      {repositioning && (
        <>
          {/* Hint oben */}
          <div
            className="absolute top-0 left-0 right-0 flex items-center justify-center py-2 z-10"
            style={{
              background: 'rgba(0,0,0,.45)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <Icon name="arrows-vertical" size={14} style={{ color: 'rgba(255,255,255,.8)', marginRight: 6 }} />
            <span className="font-label text-[0.65rem] tracking-[0.12em] uppercase" style={{ color: 'rgba(255,255,255,.8)' }}>
              Bild verschieben
            </span>
          </div>

          {/* Buttons unten */}
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3 z-10">
            <button
              onClick={(e) => { e.stopPropagation(); cancelRepositioning(); }}
              className="font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer transition-all"
              style={{
                padding: '8px 20px',
                borderRadius: '9999px',
                background: 'rgba(0,0,0,.4)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,.15)',
                color: 'rgba(255,255,255,.8)',
              }}
            >
              Abbrechen
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); saveRepositioning(); }}
              className="font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer transition-all"
              style={{
                padding: '8px 20px',
                borderRadius: '9999px',
                background: 'var(--gold)',
                color: '#fff',
                border: 'none',
              }}
            >
              Speichern
            </button>
          </div>
        </>
      )}

      {/* ── Normal-Modus: Action Buttons ── */}
      {!repositioning && (onEditClick || onSettingsClick || (onRepositionSave && profile.banner_url)) && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {/* Reposition-Button (nur wenn Banner vorhanden + eigenes Profil) */}
          {onRepositionSave && profile.banner_url && (
            <button
              onClick={startRepositioning}
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
  );
}
