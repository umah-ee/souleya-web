'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Auth Callback – verarbeitet drei Flows:
 *
 * 1) Landing Page OTP-Redirect: ?email=xxx&otp=12345678&next=/profile
 *    → verifyOtp() direkt hier → Session entsteht auf circle.souleya.com
 *
 * 2) PKCE Flow (souleya-web Login Magic Links): ?code=xxx&next=/profile
 *    → exchangeCodeForSession(code)
 *
 * 3) Magic Link Klick (Fallback): #access_token=...
 *    → Hash-Fragmente parsen + setSession()
 */
function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const next = searchParams.get('next') ?? '/profile';
    const code = searchParams.get('code');
    const email = searchParams.get('email');
    const otp = searchParams.get('otp');
    let done = false;

    function go(path: string) {
      if (done) return;
      done = true;
      router.replace(path);
    }

    async function handle() {
      // ── 1) Landing Page OTP: ?email=...&otp=... ──
      // OTP-Verifikation findet hier statt → Session entsteht auf dieser Domain
      if (email && otp) {
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: 'email',
        });
        if (!error) {
          go(next);
          return;
        }
        console.error('OTP verification error:', error);
        setError('Code ungültig oder abgelaufen. Bitte erneut versuchen.');
        // Nach 3 Sekunden zurück zur Landing Page
        setTimeout(() => {
          window.location.href = 'https://souleya.com';
        }, 3000);
        return;
      }

      // ── 2) PKCE Flow: ?code=xxx ──
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          go(next);
          return;
        }
        console.error('PKCE exchange error:', error);
      }

      // ── 3) Implicit Flow: #access_token=... (Magic Link Klick) ──
      const hash = window.location.hash.substring(1);
      if (hash) {
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!error) {
            go(next);
            return;
          }
          console.error('Implicit flow setSession error:', error);
        }
      }

      // ── 4) Fallback: onAuthStateChange ──
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (session) {
            subscription.unsubscribe();
            go(next);
          }
        },
      );

      // Timeout nach 5 Sekunden → zurück zum Login
      setTimeout(() => {
        subscription.unsubscribe();
        go('/login?error=auth_callback_error');
      }, 5000);
    }

    handle();
  }, [router, searchParams]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'var(--font-body, system-ui)',
        gap: '1rem',
      }}
    >
      {error ? (
        <p style={{ color: 'var(--error, #e74c3c)', textAlign: 'center', padding: '0 2rem' }}>
          {error}
        </p>
      ) : (
        <p style={{ color: 'var(--text-secondary, #888)' }}>Einen Moment…</p>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
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
          <p>…</p>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
