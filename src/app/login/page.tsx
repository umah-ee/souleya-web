'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError('Fehler beim Senden. Bitte versuche es erneut.');
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-dark-est flex items-center justify-center p-6 font-body">
      <div className="bg-dark border border-gold-1/15 rounded-3xl py-12 px-10 max-w-[420px] w-full text-center">
        {/* Enso Logo */}
        <div className="mb-6">
          <svg width="64" height="64" viewBox="0 0 100 100" className="mx-auto">
            <defs>
              <linearGradient id="enso-login" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A8894E" />
                <stop offset="100%" stopColor="#D4BC8B" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="36"
              fill="none" stroke="url(#enso-login)" strokeWidth="8"
              strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15" />
          </svg>
        </div>

        {/* Wordmark */}
        <h1 className="font-heading text-[2rem] font-light tracking-[0.36em] uppercase text-gold-1 mb-2">
          Souleya
        </h1>

        {!sent ? (
          <>
            <p className="font-label text-xs tracking-[0.2em] uppercase text-[#a09a90] mb-8">
              Dein Zugang
            </p>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Deine E-Mail-Adresse"
                required
                className="py-3 px-6 bg-white/[0.06] border border-gold-1/20 rounded-full text-[#F0EDE8] text-sm text-center font-body outline-none transition-all duration-300 focus:border-gold-1 focus:shadow-[0_0_20px_rgba(200,169,110,0.15)] placeholder:text-[#5A5450]"
              />

              {error && (
                <p className="text-[#E63946] text-[0.8rem]">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`
                  py-3 px-8 border-none rounded-full font-label text-xs tracking-[0.1em] uppercase transition-all duration-300
                  ${loading
                    ? 'bg-gold-1/30 text-dark cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-br from-gold-3 to-gold-2 text-dark cursor-pointer shadow-[0_0_30px_rgba(200,169,110,0.3)] hover:opacity-90'
                  }
                `}
              >
                {loading ? '...' : 'Magic Link senden'}
              </button>
            </form>

            <p className="mt-6 text-xs text-[#5A5450]">
              Du erhältst einen einmaligen Login-Link per E-Mail.
              <br />Kein Passwort nötig.
            </p>
          </>
        ) : (
          /* Success State */
          <>
            <div className="w-12 h-12 rounded-full bg-[rgba(82,183,136,0.15)] border border-[rgba(82,183,136,0.3)] flex items-center justify-center mx-auto mb-6 text-xl">
              ✓
            </div>
            <p className="font-label text-xs tracking-[0.2em] uppercase text-[#52B788] mb-4">
              Magic Link gesendet
            </p>
            <p className="text-[#a09a90] text-sm leading-[1.8]">
              Prüfe dein Postfach für <strong className="text-gold-2">{email}</strong>.
              <br />Klicke den Link um dich anzumelden.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              className="mt-6 bg-transparent border border-gold-1/30 rounded-full py-2 px-6 text-gold-1 font-label text-xs tracking-[0.1em] uppercase cursor-pointer hover:border-gold-1/50 transition-colors duration-200"
            >
              Andere E-Mail
            </button>
          </>
        )}
      </div>
    </main>
  );
}
