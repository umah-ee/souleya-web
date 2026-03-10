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
 * Generisches Slide-Up Panel mit opakem Hintergrund.
 * Style Guide v2.1: KEIN Glasmorphism, opaker --bg-elevated Hintergrund.
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
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* ─── Backdrop ─── */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ background: 'rgba(0,0,0,.55)' }}
        onClick={onClose}
      />

      {/* ─── Panel ─── */}
      <div
        ref={panelRef}
        className="relative w-full max-w-[480px] max-h-[88vh] overflow-y-auto animate-slide-up"
        style={{
          background: 'var(--bg-solid)',
          borderRadius: '32px 32px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,.25)',
        }}
      >
        {/* ─── Handle + Header ─── */}
        <div className="sticky top-0 z-10 pt-3 pb-2 px-6" style={{ background: 'var(--bg-solid)', borderRadius: '32px 32px 0 0' }}>
          {/* Drag Handle */}
          <div
            className="mx-auto mb-4 rounded-full"
            style={{ width: 36, height: 4, background: 'var(--divider)' }}
          />

          {/* Title + Close */}
          <div className="flex items-center justify-between mb-2">
            <h2
              className="text-[18px] font-heading italic"
              style={{ color: 'var(--text-h)' }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
              style={{
                background: 'var(--glass)',
                color: 'var(--text-sec)',
                border: 'none',
              }}
            >
              <Icon name="x" size={16} />
            </button>
          </div>

          {/* Divider */}
          <div
            className="h-px"
            style={{ background: 'var(--divider-l)' }}
          />
        </div>

        {/* ─── Content ─── */}
        <div className="px-6 pb-8 pt-4">
          {children}
        </div>
      </div>
    </div>
  );
}
