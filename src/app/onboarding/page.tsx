'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { PasswordStrengthBar } from '@/components/auth/PasswordStrengthBar';
import { logActivity } from '@/lib/activity';

export default function OnboardingPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid =
    password.length >= 8 &&
    password === confirmPassword &&
    privacyAccepted &&
    termsAccepted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      // 1. Passwort setzen
      const { error: pwError } = await supabase.auth.updateUser({
        password,
      });
      if (pwError) {
        setError(pwError.message || 'Das hat leider nicht geklappt. Versuch es gerne nochmal.');
        setLoading(false);
        return;
      }

      // 2. User laden
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError('Deine Sitzung ist abgelaufen. Melde dich einfach nochmal an.');
        setLoading(false);
        return;
      }

      // 3. Agreements speichern
      await supabase.from('user_agreements').insert([
        { user_id: user.id, agreement_type: 'privacy_policy', version: '1.0' },
        { user_id: user.id, agreement_type: 'terms_of_use', version: '1.0' },
      ]);

      // 4. Onboarding abschliessen
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_completed_at: new Date().toISOString() })
        .eq('id', user.id);

      if (profileError) {
        setError('Das hat leider nicht geklappt. Versuch es gerne nochmal.');
        setLoading(false);
        return;
      }

      // 5. Activity loggen
      logActivity('onboarding.completed', 'Onboarding abgeschlossen');

      // 6. Weiter zum Profil (Hard Redirect damit proxy.ts die neuen Session-Cookies bekommt)
      window.location.href = '/pulse';
    } catch {
      setError('Etwas ist schiefgelaufen. Versuch es gerne nochmal.');
      setLoading(false);
    }
  };

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
              <linearGradient id="enso-onboarding" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--gold-deep)" />
                <stop offset="100%" stopColor="var(--gold)" />
              </linearGradient>
            </defs>
            <circle
              cx="50" cy="50" r="36"
              fill="none" stroke="url(#enso-onboarding)" strokeWidth="8"
              strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1
          className="font-heading text-[1.8rem] mb-2"
          style={{ color: 'var(--gold-text)' }}
        >
          Fast geschafft!
        </h1>
        <p
          className="font-label text-xs tracking-[0.15em] uppercase mb-3"
          style={{ color: 'var(--text-sec)' }}
        >
          Richte jetzt deinen Zugang ein.
        </p>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          Lege ein Passwort fest und bestätige unsere Vereinbarungen –
          dann bist du startklar.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Passwort */}
          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="Passwort (mind. 8 Zeichen)"
            disabled={loading}
          />

          {/* Passwort bestätigen */}
          <PasswordInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Passwort bestätigen"
            disabled={loading}
          />

          {/* Stärke-Anzeige */}
          <PasswordStrengthBar password={password} />

          {/* Passwort-Mismatch Hinweis */}
          {confirmPassword && password !== confirmPassword && (
            <p className="text-[0.75rem]" style={{ color: 'var(--error)' }}>
              Die Passwörter stimmen nicht überein.
            </p>
          )}

          {/* Divider */}
          <div className="my-2" style={{ borderTop: '1px solid var(--divider-l)' }} />

          {/* Datenschutz */}
          <label className="flex items-start gap-3 text-left cursor-pointer">
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              disabled={loading}
              className="mt-0.5 accent-[var(--gold)]"
              style={{ minWidth: 18, minHeight: 18 }}
            />
            <span className="text-sm" style={{ color: 'var(--text-body)' }}>
              Ich akzeptiere die{' '}
              <a
                href="#"
                style={{ color: 'var(--gold-text)', textDecoration: 'underline' }}
                onClick={(e) => e.preventDefault()}
              >
                Datenschutzbestimmungen
              </a>
            </span>
          </label>

          {/* Nutzungsvereinbarungen */}
          <label className="flex items-start gap-3 text-left cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              disabled={loading}
              className="mt-0.5 accent-[var(--gold)]"
              style={{ minWidth: 18, minHeight: 18 }}
            />
            <span className="text-sm" style={{ color: 'var(--text-body)' }}>
              Ich akzeptiere die{' '}
              <a
                href="#"
                style={{ color: 'var(--gold-text)', textDecoration: 'underline' }}
                onClick={(e) => e.preventDefault()}
              >
                Nutzungsvereinbarungen
              </a>
            </span>
          </label>

          {/* Fehler */}
          {error && (
            <p className="text-[0.8rem]" style={{ color: 'var(--error)' }}>
              {error}
            </p>
          )}

          {/* Submit */}
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
            {loading ? 'Wird eingerichtet …' : 'Zugang einrichten'}
          </button>
        </form>
      </div>
    </main>
  );
}
