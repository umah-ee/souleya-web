'use client';

import { Suspense, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { logActivity } from '@/lib/activity';

const SOUL_LEVELS: Record<number, string> = {
  1: 'Soul Spark',
  2: 'Awakened Soul',
  3: 'Harmony Keeper',
  4: 'Zen Master',
  5: 'Soul Mentor',
};

const DEMO_USERS = [
  { email: 'lena@souleya-demo.com', name: 'Lena Sonnenberg', role: 'Yogalehrerin', soul_level: 3, is_first_light: true, is_mentor: true },
  { email: 'sophia@souleya-demo.com', name: 'Sophia Lichtweg', role: 'Reiki-Meisterin', soul_level: 2, is_first_light: true, is_mentor: false },
  { email: 'max@souleya-demo.com', name: 'Max Bergmann', role: 'Achtsamkeitstrainer', soul_level: 1, is_first_light: false, is_mentor: false },
  { email: 'david@souleya-demo.com', name: 'David Goldbach', role: 'Buddhismus-Lehrer', soul_level: 5, is_first_light: false, is_mentor: true },
];

const OTP_LENGTH = 8;

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [verifying, setVerifying] = useState(false);
  const [loginMode, setLoginMode] = useState<'otp' | 'password'>('password');
  const [loginPassword, setLoginPassword] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') ?? '/pulse';

  // ── Schritt 1: OTP-Code per E-Mail senden ──────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true,
        // emailRedirectTo setzt {{ .RedirectTo }} im E-Mail-Template
        // → Button in der E-Mail fuehrt zur Web-App statt Landing Page
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError('Das hat leider nicht geklappt. Versuch es gerne nochmal.');
    } else {
      setStep('otp');
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      // Fokus auf erstes Eingabefeld nach Render
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
    setLoading(false);
  };

  // ── Schritt 2: OTP-Code verifizieren ───────────────────
  const handleVerifyOtp = async (code: string) => {
    if (code.length !== OTP_LENGTH) return;

    setVerifying(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code,
      type: 'email',
    });

    if (error) {
      setError('Der Code war leider nicht richtig. Probier es nochmal.');
      setVerifying(false);
      // Felder leeren und Fokus auf erstes Feld
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } else {
      // Erfolg → zur App weiterleiten
      router.push(nextUrl);
      logActivity('auth.login', 'Login via OTP', 'Magic Link Code verifiziert', { method: 'otp' });
    }
  };

  // ── OTP-Eingabe: einzelne Ziffern ──────────────────────
  const handleOtpChange = (index: number, value: string) => {
    // Nur Zahlen erlauben
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Auto-Fokus auf naechstes Feld
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-Submit wenn alle Felder ausgefuellt
    const code = newDigits.join('');
    if (code.length === OTP_LENGTH && !newDigits.includes('')) {
      handleVerifyOtp(code);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      // Bei Backspace auf leeres Feld → vorheriges Feld fokussieren
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newDigits = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);

    // Fokus auf naechstes leeres Feld oder letztes
    const nextEmpty = newDigits.findIndex((d) => !d);
    const focusIndex = nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty;
    inputRefs.current[focusIndex]?.focus();

    // Auto-Submit wenn komplett
    if (pasted.length === OTP_LENGTH) {
      handleVerifyOtp(pasted);
    }
  };

  // ── Passwort-Login ─────────────────────────────────────
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    if (!loginPassword) {
      setError('Gib bitte noch dein Passwort ein.');
      return;
    }

    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: loginPassword,
    });

    if (error) {
      setError('E-Mail oder Passwort stimmt nicht. Probier es nochmal.');
      setLoading(false);
    } else {
      router.push(nextUrl);
      logActivity('auth.login', 'Login via Passwort', 'Passwort-Anmeldung', { method: 'password' });
    }
  };

  // ── Passwort vergessen ────────────────────────────────
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Gib bitte zuerst deine E-Mail-Adresse ein.');
      return;
    }

    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/auth/reset-password` },
    );

    setLoading(false);
    if (error) {
      setError('Das hat leider nicht geklappt. Versuch es gerne nochmal.');
    } else {
      setForgotSent(true);
      logActivity('auth.password_reset_requested', 'Passwort-Reset angefordert', undefined, { email: email.trim().toLowerCase() });
    }
  };

  // ── Demo-Login (Passwort-basiert, unveraendert) ────────
  const handleDemoLogin = async (demoEmail: string) => {
    setDemoLoading(demoEmail);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: 'Demo1234!',
    });

    if (error) {
      setError('Demo-Login hat nicht geklappt. Versuch es nochmal.');
      setDemoLoading(null);
    } else {
      router.push(nextUrl);
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

        {step === 'email' ? (
          <>
            <p className="font-label text-xs tracking-[0.2em] uppercase mb-6" style={{ color: 'var(--text-sec)' }}>
              Dein Zugang
            </p>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6 justify-center">
              <button
                type="button"
                onClick={() => { setLoginMode('password'); setError(''); setForgotSent(false); }}
                className="px-4 py-1.5 rounded-full font-label text-[0.65rem] tracking-[0.08em] uppercase border-none cursor-pointer transition-all duration-200"
                style={{
                  background: loginMode === 'password' ? 'var(--gold-bg)' : 'transparent',
                  color: loginMode === 'password' ? 'var(--gold-text)' : 'var(--text-muted)',
                  border: loginMode === 'password' ? '1px solid var(--gold-border-s)' : '1px solid var(--glass-border)',
                }}
              >
                Passwort
              </button>
              <button
                type="button"
                onClick={() => { setLoginMode('otp'); setError(''); setForgotSent(false); }}
                className="px-4 py-1.5 rounded-full font-label text-[0.65rem] tracking-[0.08em] uppercase border-none cursor-pointer transition-all duration-200"
                style={{
                  background: loginMode === 'otp' ? 'var(--gold-bg)' : 'transparent',
                  color: loginMode === 'otp' ? 'var(--gold-text)' : 'var(--text-muted)',
                  border: loginMode === 'otp' ? '1px solid var(--gold-border-s)' : '1px solid var(--glass-border)',
                }}
              >
                OTP-Code
              </button>
            </div>

            <form onSubmit={loginMode === 'otp' ? handleSendOtp : handlePasswordLogin} className="flex flex-col gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Deine E-Mail-Adresse"
                required
                className="py-3 px-6 rounded-input text-sm text-center font-body outline-none transition-all duration-300"
                style={{
                  background: 'var(--glass)',
                  border: '1px solid var(--gold-border-s)',
                  color: 'var(--text-h)',
                }}
              />

              {/* Passwort-Feld (nur im Passwort-Modus) */}
              {loginMode === 'password' && (
                <PasswordInput
                  value={loginPassword}
                  onChange={setLoginPassword}
                  placeholder="Dein Passwort"
                  disabled={loading}
                />
              )}

              {error && (
                <p className="text-[0.8rem]" style={{ color: 'var(--error)' }}>{error}</p>
              )}

              {forgotSent && (
                <p className="text-[0.8rem]" style={{ color: 'var(--success)' }}>
                  Wir haben dir einen Link geschickt – schau mal in dein Postfach.
                </p>
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
                {loading ? '...' : loginMode === 'otp' ? 'Login-Code senden' : 'Anmelden'}
              </button>
            </form>

            {/* Info-Text / Passwort vergessen */}
            {loginMode === 'otp' ? (
              <p className="mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
                Du erhältst einen 8-stelligen Code per E-Mail.
              </p>
            ) : (
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="mt-4 bg-transparent border-none cursor-pointer text-xs font-body transition-colors duration-200"
                style={{ color: 'var(--gold-text)' }}
              >
                Passwort vergessen?
              </button>
            )}

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
                        py-2.5 px-4 rounded-[8px] text-left transition-all duration-200
                        ${demoLoading !== null && demoLoading !== user.email ? 'opacity-40' : ''}
                      `}
                      style={{
                        background: demoLoading === user.email ? 'var(--gold-bg)' : 'var(--glass)',
                        border: `1px solid ${demoLoading === user.email ? 'var(--gold-border-s)' : 'var(--glass-border)'}`,
                        cursor: demoLoading !== null ? 'wait' : 'pointer',
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="text-sm block" style={{ color: 'var(--text-h)' }}>{user.name}</span>
                          <span className="text-[0.7rem]" style={{ color: 'var(--text-muted)' }}>{user.role}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {user.is_first_light && (
                            <span
                              className="text-[0.55rem] font-label tracking-[0.05em] uppercase px-1.5 py-0.5 rounded-full"
                              style={{ background: 'rgba(200,169,110,.15)', color: 'var(--gold-text)' }}
                            >
                              ✦ FL
                            </span>
                          )}
                          {user.is_mentor && (
                            <span
                              className="text-[0.55rem] font-label tracking-[0.05em] uppercase px-1.5 py-0.5 rounded-full"
                              style={{ background: 'var(--success-bg)', color: 'var(--success)' }}
                            >
                              Mentor
                            </span>
                          )}
                          <span
                            className="text-[0.55rem] font-label tracking-[0.05em] uppercase px-1.5 py-0.5 rounded-full"
                            style={{ background: 'var(--glass-strong)', color: 'var(--text-sec)' }}
                          >
                            Lv{user.soul_level}
                          </span>
                        </div>
                      </div>
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
          /* OTP-Code Eingabe */
          <>
            <p className="font-label text-xs tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--text-sec)' }}>
              Code eingeben
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              Wir haben einen Code an{' '}
              <strong style={{ color: 'var(--gold-text)' }}>{email}</strong> gesendet.
            </p>

            {/* OTP-Eingabefelder */}
            <div className="grid grid-cols-8 gap-1.5 sm:gap-2 mb-4 w-full max-w-[360px] mx-auto">
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  disabled={verifying}
                  className="w-full aspect-[3/4] rounded-input text-center text-lg sm:text-xl font-heading outline-none transition-all duration-200"
                  style={{
                    background: 'var(--glass)',
                    border: `1px solid ${digit ? 'var(--gold-border-s)' : 'var(--glass-border)'}`,
                    color: 'var(--gold-text)',
                    opacity: verifying ? 0.5 : 1,
                  }}
                />
              ))}
            </div>

            {error && (
              <p className="text-[0.8rem] mb-4" style={{ color: 'var(--error)' }}>{error}</p>
            )}

            {verifying && (
              <p className="text-xs mb-4 font-label tracking-[0.1em] uppercase" style={{ color: 'var(--gold-text)' }}>
                Wird verifiziert...
              </p>
            )}

            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              Prüfe dein Postfach (auch den Spam-Ordner).
            </p>

            {/* Code erneut senden */}
            <button
              onClick={async () => {
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
                  setError('Das hat leider nicht geklappt. Versuch es nochmal.');
                } else {
                  setError('');
                  setOtpDigits(Array(OTP_LENGTH).fill(''));
                  setTimeout(() => inputRefs.current[0]?.focus(), 100);
                }
              }}
              className="mt-4 bg-transparent border-none cursor-pointer text-xs font-label tracking-[0.1em] uppercase transition-colors duration-200"
              style={{ color: 'var(--gold-text)' }}
            >
              Code erneut senden
            </button>

            {/* Zurueck zur E-Mail-Eingabe */}
            <div className="mt-4">
              <button
                onClick={() => { setStep('email'); setError(''); setOtpDigits(Array(OTP_LENGTH).fill('')); }}
                className="bg-transparent rounded-full py-2 px-6 font-label text-xs tracking-[0.1em] uppercase cursor-pointer transition-colors duration-200"
                style={{
                  border: '1px solid var(--gold-border-s)',
                  color: 'var(--gold-text)',
                }}
              >
                Andere E-Mail
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
