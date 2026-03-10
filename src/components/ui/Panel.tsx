'use client';

import { useEffect, useCallback, useRef } from 'react';
import { Icon } from '@/components/ui/Icon';

interface PanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/**
 * Generisches zentriertes Overlay-Panel mit opakem Hintergrund.
 * Style Guide v2.1: KEIN Glasmorphism, opaker --bg-elevated Hintergrund.
 * Mockup: var(--bg-elevated), border-radius 32px, max-height 88vh.
 */
export default function Panel({ isOpen, onClose, title, children }: PanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // ESC-Taste schliesst Panel
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 md:pl-20">
      {/* ─── Backdrop ─── */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ background: 'rgba(0,0,0,.50)' }}
        onClick={onClose}
      />

      {/* ─── Panel ─── */}
      <div
        ref={panelRef}
        className="relative w-full max-w-[600px] max-h-[88vh] overflow-y-auto animate-scale-in"
        style={{
          background: 'var(--bg-elevated)',
          borderRadius: '32px',
          border: '1px solid var(--divider-l)',
          boxShadow: '0 20px 60px rgba(0,0,0,.35)',
        }}
      >
        {/* ─── Header ─── */}
        <div className="sticky top-0 z-10" style={{ background: 'var(--bg-elevated)', borderRadius: '32px 32px 0 0' }}>
          {/* Drag Handle — Mockup: 36×4px, radius 2px, centered, top 10px */}
          <div className="flex justify-center" style={{ paddingTop: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '4px',
                borderRadius: '2px',
                background: 'var(--divider-l)',
              }}
            />
          </div>

          {/* Close Button — Mockup: absolute right 16px top 10px, 32px circle */}
          <button
            onClick={onClose}
            className="absolute flex items-center justify-center cursor-pointer transition-colors"
            style={{
              right: '16px',
              top: '10px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--glass)',
              color: 'var(--text-sec)',
              border: '1px solid var(--divider-l)',
            }}
          >
            <Icon name="x" size={14} />
          </button>

          {/* Title — Mockup: 24px, serif italic, centered, padding 8px 32px 20px */}
          <div
            className="font-heading italic text-center"
            style={{
              fontSize: '24px',
              fontWeight: 500,
              color: 'var(--text-h)',
              padding: '8px 32px 20px',
            }}
          >
            {title}
          </div>
        </div>

        {/* ─── Content — kein generisches Padding, jedes Panel steuert selbst ─── */}
        <div className="px-7 pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}
