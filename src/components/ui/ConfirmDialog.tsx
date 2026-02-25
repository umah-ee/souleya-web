'use client';

import { useEffect, useRef } from 'react';
import { Icon } from './Icon';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Ja',
  cancelLabel = 'Abbrechen',
  onConfirm,
  onCancel,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Schliessen bei Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onCancel(); }}
    >
      <div
        className="rounded-2xl p-6 mx-4 max-w-sm w-full"
        style={{
          background: 'var(--bg-solid)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
        }}
      >
        {/* Icon */}
        <div className="flex items-center justify-center mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'var(--gold-bg)', border: '1px solid var(--gold-border-s)' }}
          >
            <Icon name="alert-triangle" size={18} style={{ color: 'var(--gold)' }} />
          </div>
        </div>

        {/* Title */}
        <h3
          className="font-heading text-lg text-center mb-2"
          style={{ color: 'var(--text-h)' }}
        >
          {title}
        </h3>

        {/* Message */}
        <p
          className="font-body text-sm text-center mb-6 leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
        >
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase cursor-pointer transition-colors"
            style={{
              background: 'transparent',
              border: '1px solid var(--divider)',
              color: 'var(--text-muted)',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase cursor-pointer transition-colors border-none"
            style={{
              background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
              color: 'var(--text-on-gold)',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
