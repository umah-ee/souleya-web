'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { PasswordStrengthBar } from '@/components/auth/PasswordStrengthBar';
import { logActivity } from '@/lib/activity';

function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [success, setSuccess] = useState(false);

  // Supabase setzt die Recovery-Session automatisch via URL-Hash
  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });

    // Fallback: pruefen ob schon eine Session aktiv ist
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isValid = password.length >= 8 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message || 'Fehler beim Aendern des Passworts.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    logActivity('auth.password_changed', 'Passwort geaendert');
    setTimeout(() => router.replace('/profile'), 2000);
  };

  if (success) {
    return (
      <main
        className="min-h-screen flex items-center justify-center p-6 font-body"
        style={{ background: 'var(--bg-gradient)', backgroundAttachment: 'fixed' }}
      >
        <div className="glass-card rounded-3xl py-12 px-10 max-w-[420px] w-full text-center">
          <div className="mb-6">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
              <path d="M5 12l5 5l10 -10" />
            </svg>
          </div>
          <h1 className="font-heading text-[1.5rem] mb-2" style={{ color: 'var(--gold-text)' }}>
            Passwort geändert!
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Du wirst weitergeleitet...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6 font-body"
      style={{ background: 'var(--bg-gradient)', backgroundAttachment: 'fixed' }}
    >
      <div className="glass-card rounded-3xl py-12 px-10 max-w-[420px] w-full text-center">
        {/* Enso Logo */}
        <div className="mb-6">
          <svg width="64" height="64" viewBox="0 0 100 100" className="mx-auto">
            <defs>
              <linearGradient id="enso-reset" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--gold-deep)" />
                <stop offset="100%" stopColor="var(--gold)" />
              </linearGradient>
            </defs>
            <circle
              cx="50" cy="50" r="36"
              fill="none" stroke="url(#enso-reset)" strokeWidth="8"
              strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15"
            />
          </svg>
        </div>

        <h1
          className="font-heading text-[1.8rem] mb-2"
          style={{ color: 'var(--gold-text)' }}
        >
          Neues Passwort
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          Lege dein neues Passwort fest.
        </p>

        {!ready ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Einen Moment, Session wird geladen...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="Neues Passwort (mind. 8 Zeichen)"
              disabled={loading}
            />

            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Passwort bestätigen"
              disabled={loading}
            />

            <PasswordStrengthBar password={password} />

            {confirmPassword && password !== confirmPassword && (
              <p className="text-[0.75rem]" style={{ color: 'var(--error)' }}>
                Die Passwörter stimmen nicht überein.
              </p>
            )}

            {error && (
              <p className="text-[0.8rem]" style={{ color: 'var(--error)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!isValid || loading}
              className="py-3 px-8 border-none rounded-full font-label text-xs tracking-[0.1em] uppercase transition-all duration-300 mt-2"
              style={{
                background:
                  !isValid || loading
                    ? 'var(--gold-bg-hover)'
                    : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                color:
                  !isValid || loading
                    ? 'var(--text-muted)'
                    : 'var(--text-on-gold)',
                cursor: !isValid || loading ? 'not-allowed' : 'pointer',
                boxShadow: !isValid || loading ? 'none' : '0 0 30px var(--gold-glow)',
              }}
            >
              {loading ? 'Wird gespeichert...' : 'Passwort speichern'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
          }}
        >
          <p style={{ color: 'var(--text-muted)' }}>...</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
