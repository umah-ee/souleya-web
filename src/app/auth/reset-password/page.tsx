'use client';

import { Suspense, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { PasswordStrengthBar } from '@/components/auth/PasswordStrengthBar';
import { logActivity } from '@/lib/activity';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    let sub: { unsubscribe: () => void } | null = null;

    async function init() {
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get('token_hash');
      const type = params.get('type');
      const code = params.get('code');

      // 1. Token-Hash Flow (Cross-Browser kompatibel – kein code_verifier noetig)
      if (tokenHash && type === 'recovery') {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        });
        if (!error && !cancelled) {
          setReady(true);
          return;
        }
      }

      // 2. PKCE-Code austauschen (Fallback, funktioniert nur im gleichen Browser)
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && !cancelled) {
          setReady(true);
          return;
        }
      }

      // 3. Bestehende Session pruefen
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && !cancelled) {
        setReady(true);
        return;
      }

      // 4. Fallback: onAuthStateChange (Implicit Flow / aeltere Supabase-Versionen)
      if (cancelled) return;
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
          if (!cancelled) setReady(true);
          data.subscription.unsubscribe();
        }
      });
      sub = data.subscription;

      // Timeout: nach 8 Sekunden Link als abgelaufen markieren
      setTimeout(() => {
        if (!cancelled) setExpired(true);
      }, 8000);
    }

    init();

    return () => {
      cancelled = true;
      sub?.unsubscribe();
    };
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
      setError(
        updateError.message ||
          'Das hat leider nicht geklappt. Versuch es gerne nochmal.',
      );
      setLoading(false);
      return;
    }

    setSuccess(true);
    logActivity('auth.password_changed', 'Passwort geaendert');
    // Hard Redirect damit proxy.ts die neuen Session-Cookies bekommt
    setTimeout(() => {
      window.location.href = '/profile';
    }, 2000);
  };

  // ── Erfolgs-Ansicht ──
  if (success) {
    return (
      <main
        className="min-h-screen flex items-center justify-center p-6 font-body"
        style={{
          background: 'var(--bg-gradient)',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="glass-card rounded-[8px] py-12 px-10 max-w-[420px] w-full text-center">
          <div className="mb-6">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--success)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto"
            >
              <path d="M5 12l5 5l10 -10" />
            </svg>
          </div>
          <h1
            className="font-heading text-[1.5rem] mb-2"
            style={{ color: 'var(--gold-text)' }}
          >
            Alles klar!
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Dein neues Passwort ist gespeichert. Du wirst gleich
            weitergeleitet&nbsp;…
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6 font-body"
      style={{
        background: 'var(--bg-gradient)',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="glass-card rounded-[8px] py-12 px-10 max-w-[420px] w-full text-center">
        {/* Enso Logo */}
        <div className="mb-6">
          <svg
            width="64"
            height="64"
            viewBox="0 0 100 100"
            className="mx-auto"
          >
            <defs>
              <linearGradient
                id="enso-reset"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="var(--gold-deep)" />
                <stop offset="100%" stopColor="var(--gold)" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="36"
              fill="none"
              stroke="url(#enso-reset)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray="196 30"
              strokeDashoffset="15"
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
          Wähle ein neues Passwort, das du dir gut merken kannst.
        </p>

        {expired && !ready ? (
          /* ── Link abgelaufen ── */
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm" style={{ color: 'var(--error)' }}>
              Der Link ist leider abgelaufen oder ungültig.
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Fordere einfach einen neuen an – das geht ganz schnell.
            </p>
            <a
              href="/login"
              className="py-3 px-8 border-none rounded-full font-label text-xs tracking-[0.1em] uppercase transition-all duration-300 inline-block no-underline"
              style={{
                background:
                  'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                color: 'var(--text-on-gold)',
                boxShadow: '0 0 30px var(--gold-glow)',
              }}
            >
              Zurück zum Login
            </a>
          </div>
        ) : !ready ? (
          /* ── Session wird geladen ── */
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Einen Moment noch&nbsp;…
          </p>
        ) : (
          /* ── Passwort-Formular ── */
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
                boxShadow:
                  !isValid || loading ? 'none' : '0 0 30px var(--gold-glow)',
              }}
            >
              {loading ? 'Wird gespeichert …' : 'Passwort speichern'}
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
          <p style={{ color: 'var(--text-muted)' }}>…</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
