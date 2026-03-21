'use client';

import { useEffect } from 'react';
import SignupForm from './SignupForm';

export default function SignupModal({ onClose }: { onClose: () => void }) {
  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-4"
      style={{ zIndex: 210, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="su-modal relative w-full max-w-md p-7 rounded-[8px] border"
        style={{
          borderColor: 'var(--gold-border-s)',
          boxShadow: '0 8px 40px rgba(0,0,0,.25), var(--glass-inset)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full transition-colors hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Enso Logo */}
        <svg viewBox="0 0 100 100" className="w-14 h-14 mx-auto mb-3">
          <defs>
            <linearGradient id="signup-modal-enso" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A8894E" />
              <stop offset="100%" stopColor="#D4BC8B" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="36" fill="none" stroke="url(#signup-modal-enso)" strokeWidth="9" strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15" />
        </svg>

        <h2 className="font-heading text-xl italic text-center mb-1" style={{ color: 'var(--text-h)' }}>
          Werde Teil von Souleya
        </h2>
        <p className="text-xs text-center mb-5" style={{ color: 'var(--text-muted)' }}>
          Sichere dir deinen Platz in der Community.
        </p>

        <SignupForm />
      </div>
    </div>
  );
}
