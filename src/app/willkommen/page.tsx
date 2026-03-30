'use client';

import { useEffect, useState } from 'react';
import { trackSignup } from '@/lib/analytics';

export default function WillkommenPage() {
  const [countdown, setCountdown] = useState(5);

  // Conversion-Tracking: Vercel Analytics + Google Analytics sign_up Event
  useEffect(() => {
    trackSignup('signup_form');
  }, []);

  // Countdown + Redirect
  useEffect(() => {
    if (countdown <= 0) {
      window.location.href = '/profile';
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6 font-body"
      style={{ background: 'var(--bg-gradient)', backgroundAttachment: 'fixed' }}
    >
      <div className="max-w-md w-full text-center">
        {/* Enso */}
        <svg viewBox="0 0 100 100" className="w-20 h-20 mx-auto mb-6">
          <defs>
            <linearGradient id="welcome-enso" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A8894E" />
              <stop offset="100%" stopColor="#D4BC8B" />
            </linearGradient>
          </defs>
          <circle
            cx="50" cy="50" r="36" fill="none"
            stroke="url(#welcome-enso)" strokeWidth="8"
            strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15"
          />
        </svg>

        <h1
          className="font-heading text-3xl italic mb-3"
          style={{ color: 'var(--text-h)' }}
        >
          Willkommen bei Souleya
        </h1>

        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-body)' }}>
          Dein Platz ist gesichert. Du gehörst jetzt zu den Ersten, die diese
          Community mitgestalten – und das bleibt für immer.
        </p>

        <p className="text-xs mb-8" style={{ color: 'var(--text-muted)' }}>
          Du wirst in {countdown} Sekunden weitergeleitet …
        </p>

        <a
          href="/profile"
          className="inline-block px-8 py-3 rounded-full font-label text-sm font-semibold uppercase tracking-widest transition-all hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #A8894E, #C8A96E, #D4BC8B)',
            color: 'var(--dark, #1a1a1a)',
            boxShadow: '0 0 30px rgba(200,169,110,.3)',
          }}
        >
          Zum Profil
        </a>
      </div>
    </main>
  );
}
