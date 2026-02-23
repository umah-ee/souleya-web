'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const DEMO_USERS = [
  { email: 'lena@souleya-demo.com', name: 'Lena Sonnenberg', role: 'Yogalehrerin' },
  { email: 'sophia@souleya-demo.com', name: 'Sophia Lichtweg', role: 'Reiki-Meisterin' },
  { email: 'max@souleya-demo.com', name: 'Max Bergmann', role: 'Achtsamkeitstrainer' },
  { email: 'david@souleya-demo.com', name: 'David Goldbach', role: 'Buddhismus-Lehrer' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true,
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

  const handleDemoLogin = async (demoEmail: string) => {
    setDemoLoading(demoEmail);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: 'Demo1234!',
    });

    if (error) {
      setError('Demo-Login fehlgeschlagen. Bitte versuche es erneut.');
      setDemoLoading(null);
    } else {
      router.push('/');
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6 font-body"
      style={{ background: 'var(--bg-gradient)', backgroundAttachment: 'fixed' }}
    >
      <div
        className="glass-card rounded-3xl py-12 px-10 max-w-[420px] w-full text-center"
      >
        {/* Enso Logo */}
        <div className="mb-6">
          <svg width="64" height="64" viewBox="0 0 100 100" className="mx-auto">
            <defs>
              <linearGradient id="enso-login" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--gold-deep)" />
                <stop offset="100%" stopColor="var(--gold)" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="36"
              fill="none" stroke="url(#enso-login)" strokeWidth="8"
              strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15" />
          </svg>
        </div>

        {/* Wordmark */}
        <h1
          className="font-heading text-[2rem] tracking-[0.36em] uppercase mb-2"
          style={{ color: 'var(--gold-text)' }}
        >
          Souleya
        </h1>

        {!sent ? (
          <>
            <p className="font-label text-xs tracking-[0.2em] uppercase mb-8" style={{ color: 'var(--text-sec)' }}>
              Dein Zugang
            </p>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Deine E-Mail-Adresse"
                required
                className="py-3 px-6 rounded-full text-sm text-center font-body outline-none transition-all duration-300"
                style={{
                  background: 'var(--glass)',
                  border: '1px solid var(--gold-border-s)',
                  color: 'var(--text-h)',
                }}
              />

              {error && (
                <p className="text-[0.8rem]" style={{ color: 'var(--error)' }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="py-3 px-8 border-none rounded-full font-label text-xs tracking-[0.1em] uppercase transition-all duration-300"
                style={{
                  background: loading
                    ? 'var(--gold-bg-hover)'
                    : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                  color: loading ? 'var(--text-muted)' : 'var(--text-on-gold)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 0 30px var(--gold-glow)',
                }}
              >
                {loading ? '...' : 'Magic Link senden'}
              </button>
            </form>

            <p className="mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
              Du erhältst einen einmaligen Login-Link per E-Mail.
              <br />Kein Passwort nötig.
            </p>

            {/* Demo-Zugang */}
            <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--divider-l)' }}>
              <button
                onClick={() => setShowDemo(!showDemo)}
                className="text-xs transition-colors cursor-pointer font-label tracking-[0.1em] uppercase bg-transparent border-none"
                style={{ color: 'var(--text-muted)' }}
              >
                {showDemo ? '▾ Demo-Zugang ausblenden' : '▸ Demo-Zugang'}
              </button>

              {showDemo && (
                <div className="mt-4 flex flex-col gap-2">
                  {DEMO_USERS.map((user) => (
                    <button
                      key={user.email}
                      onClick={() => handleDemoLogin(user.email)}
                      disabled={demoLoading !== null}
                      className={`
                        py-2.5 px-4 rounded-xl text-left transition-all duration-200
                        ${demoLoading !== null && demoLoading !== user.email ? 'opacity-40' : ''}
                      `}
                      style={{
                        background: demoLoading === user.email ? 'var(--gold-bg)' : 'var(--glass)',
                        border: `1px solid ${demoLoading === user.email ? 'var(--gold-border-s)' : 'var(--glass-border)'}`,
                        cursor: demoLoading !== null ? 'wait' : 'pointer',
                      }}
                    >
                      <span className="text-sm block" style={{ color: 'var(--text-h)' }}>{user.name}</span>
                      <span className="text-[0.7rem]" style={{ color: 'var(--text-muted)' }}>{user.role}</span>
                    </button>
                  ))}
                  <p className="text-[0.65rem] mt-1" style={{ color: 'var(--text-muted)' }}>
                    Demo-Accounts mit vordefinierten Testdaten
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Success State */
          <>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl"
              style={{
                background: 'var(--success-bg)',
                border: '1px solid var(--success-border)',
                color: 'var(--success)',
              }}
            >
              ✓
            </div>
            <p className="font-label text-xs tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--success)' }}>
              Magic Link gesendet
            </p>
            <p className="text-sm leading-[1.8]" style={{ color: 'var(--text-sec)' }}>
              Prüfe dein Postfach für <strong style={{ color: 'var(--gold-text)' }}>{email}</strong>.
              <br />Klicke den Link um dich anzumelden.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              className="mt-6 bg-transparent rounded-full py-2 px-6 font-label text-xs tracking-[0.1em] uppercase cursor-pointer transition-colors duration-200"
              style={{
                border: '1px solid var(--gold-border-s)',
                color: 'var(--gold-text)',
              }}
            >
              Andere E-Mail
            </button>
          </>
        )}
      </div>
    </main>
  );
}
