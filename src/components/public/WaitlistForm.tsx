'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/* ── Gmail-Normalisierung ── */
function normalizeEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    return `${local.replace(/\./g, '')}@gmail.com`;
  }
  return email;
}

/* ── Email-Validierung mit Tippfehler-Erkennung ── */
const TYPO_MAP: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'outlok.com': 'outlook.com',
  'hotmal.com': 'hotmail.com',
  'yahooo.com': 'yahoo.com',
  'gmx.ed': 'gmx.de',
  'web.dr': 'web.de',
  'iclod.com': 'icloud.com',
  'tonline.de': 't-online.de',
};

function validateEmail(email: string): { valid: boolean; error?: string; suggestion?: string } {
  const re = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  if (!re.test(email)) {
    return { valid: false, error: 'Bitte gib eine gültige E-Mail-Adresse ein.' };
  }
  const domain = email.split('@')[1];
  if (TYPO_MAP[domain]) {
    const corrected = email.replace(domain, TYPO_MAP[domain]);
    return { valid: false, error: `Meintest du ${corrected}?`, suggestion: corrected };
  }
  return { valid: true };
}

/* ── Referral-Code aus URL ── */
function getReferralFromURL(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('ref');
}

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState(Array(8).fill(''));
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [isReturning, setIsReturning] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [hasSession, setHasSession] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* ── Session-Check ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setHasSession(true);
    });
  }, []);

  /* ── Resend Cooldown Timer ── */
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  /* ── Submit Email ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasSession) {
      window.location.href = '/profile';
      return;
    }

    setError('');
    const raw = email.trim().toLowerCase();
    const normalized = normalizeEmail(raw);
    const validation = validateEmail(normalized);

    if (!validation.valid) {
      setError(validation.error!);
      if (validation.suggestion) setEmail(validation.suggestion);
      return;
    }

    setLoading(true);
    try {
      // Erst prüfen ob User existiert (shouldCreateUser: false)
      const { error: loginError } = await supabase.auth.signInWithOtp({
        email: normalized,
        options: { shouldCreateUser: false },
      });

      if (!loginError) {
        // User existiert → Returning User
        setIsReturning(true);
      } else {
        // Neuer User → Account erstellen
        const { error: signupError } = await supabase.auth.signInWithOtp({
          email: normalized,
          options: {
            shouldCreateUser: true,
            data: { referred_by: getReferralFromURL() },
          },
        });
        if (signupError) {
          if (signupError.status === 429) {
            setError('Bitte warte einen Moment und versuche es dann erneut.');
          } else {
            setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
          }
          setLoading(false);
          return;
        }
        setIsReturning(false);
      }

      setPendingEmail(normalized);
      setShowOtp(true);
      setResendCooldown(60);
      setEmail('');
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    } catch {
      setError('Verbindungsfehler. Bitte versuche es erneut.');
    }
    setLoading(false);
  };

  /* ── OTP Input Handler ── */
  const handleOtpChange = useCallback((index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    setOtpCode((prev) => {
      const next = [...prev];
      next[index] = digit;

      // Auto-Submit wenn alle 8 Stellen gefüllt
      if (next.every((d) => d) && digit) {
        submitOtp(next.join(''));
      }
      return next;
    });

    if (digit && index < 7) {
      otpRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }, [otpCode]);

  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
    const next = Array(8).fill('');
    digits.split('').forEach((d, i) => { next[i] = d; });
    setOtpCode(next);
    if (digits.length === 8) submitOtp(digits);
    else otpRefs.current[digits.length]?.focus();
  }, []);

  /* ── OTP Verifizierung ── */
  const submitOtp = async (code: string) => {
    if (!pendingEmail || code.length !== 8) return;
    setVerifying(true);
    setOtpError('');

    // Redirect to verify endpoint (sets server-side session cookies)
    window.location.href = `/api/auth/verify?next=/profile&email=${encodeURIComponent(pendingEmail)}&otp=${encodeURIComponent(code)}`;
  };

  /* ── Resend ── */
  const handleResend = async () => {
    if (resendCooldown > 0 || !pendingEmail) return;
    try {
      await supabase.auth.signInWithOtp({
        email: pendingEmail,
        options: {
          shouldCreateUser: !isReturning,
          ...(isReturning ? {} : { data: { referred_by: getReferralFromURL() } }),
        },
      });
      setOtpCode(Array(8).fill(''));
      setOtpError('');
      setResendCooldown(60);
      otpRefs.current[0]?.focus();
    } catch {
      setOtpError('Erneutes Senden fehlgeschlagen.');
    }
  };

  /* ── Session-Redirect Button ── */
  if (hasSession) {
    return (
      <div className="mt-4">
        <p className="text-sm text-white/70 mb-3">
          Du bist bereits eingeloggt – klicke auf „Zum Circle" um weiterzumachen.
        </p>
        <a
          href="/profile"
          className="inline-block px-8 py-3 rounded-full font-medium text-sm transition-all hover:shadow-lg"
          style={{ background: 'var(--gold-text)', color: '#fff' }}
        >
          Zum Circle
        </a>
      </div>
    );
  }

  return (
    <>
      {/* ── Email Form ── */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          placeholder="Deine E-Mail-Adresse"
          className="flex-1 px-4 py-3 rounded-lg text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:outline-none focus:border-[var(--gold-text)]"
          required
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 rounded-full font-medium text-sm transition-all hover:shadow-lg disabled:opacity-50"
          style={{ background: 'var(--gold-text)', color: '#fff' }}
        >
          {loading ? '…' : 'Sei dabei'}
        </button>
      </form>
      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}

      {/* ── OTP Modal ── */}
      {showOtp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div
            className="rounded-2xl border p-8 max-w-sm w-full text-center"
            style={{
              background: 'var(--bg-elevated)',
              borderColor: 'var(--glass-border)',
            }}
          >
            {/* Enso */}
            <svg viewBox="0 0 100 100" className="w-20 h-20 mx-auto mb-4" style={{ animation: 'enso-draw 2s ease-out forwards' }}>
              <defs>
                <linearGradient id="otp-enso" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A8894E" />
                  <stop offset="50%" stopColor="#D4BC8B" />
                  <stop offset="100%" stopColor="#A8894E" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="38" fill="none" stroke="url(#otp-enso)" strokeWidth="3" strokeLinecap="round" strokeDasharray="196 30" transform="rotate(-30 50 50)" />
            </svg>

            <h2 className="font-heading text-xl italic mb-1" style={{ color: 'var(--text-h)' }}>
              {isReturning ? 'Schön, dass du wieder da bist' : 'Check deine E-Mails.'}
            </h2>
            <p className="text-xs uppercase tracking-wide mb-4" style={{ color: 'var(--gold-text)' }}>
              Zugangscode
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              {isReturning
                ? 'Dein Account existiert bereits – wir schicken dir einen Code und bringen dich direkt in deinen Circle.'
                : 'Gib den 8-stelligen Code aus deiner E-Mail ein:'}
            </p>

            {/* OTP Inputs */}
            <div className="flex justify-center gap-1.5 mb-4">
              {otpCode.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  disabled={verifying}
                  className="w-9 h-11 text-center text-lg font-medium rounded-lg border transition-colors focus:outline-none focus:border-[var(--gold-text)]"
                  style={{
                    background: 'var(--bg-input, var(--glass))',
                    borderColor: digit ? 'var(--gold-text)' : 'var(--glass-border)',
                    color: 'var(--text-h)',
                  }}
                />
              ))}
            </div>

            {otpError && <p className="text-sm text-red-400 mb-3">{otpError}</p>}
            {verifying && <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>Wird verifiziert …</p>}

            {/* Resend */}
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="text-sm mb-4 transition-colors disabled:opacity-50"
              style={{ color: 'var(--gold-text)' }}
            >
              {resendCooldown > 0 ? `Code erneut senden (${resendCooldown}s)` : 'Code erneut senden'}
            </button>

            <br />
            <button
              onClick={() => { setShowOtp(false); setOtpCode(Array(8).fill('')); setOtpError(''); }}
              className="text-sm px-6 py-2 rounded-full border transition-colors"
              style={{ borderColor: 'var(--glass-border)', color: 'var(--text-muted)' }}
            >
              Schliessen
            </button>
          </div>
        </div>
      )}
    </>
  );
}
