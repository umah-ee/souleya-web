'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Auth Callback – verarbeitet drei Flows:
 *
 * 1) Landing Page OTP-Redirect: ?at=ACCESS_TOKEN&rt=REFRESH_TOKEN&next=/profile
 *    → setSession() mit übergebenen Tokens
 *
 * 2) PKCE Flow (souleya-web Login Magic Links): ?code=xxx&next=/profile
 *    → exchangeCodeForSession(code)
 *
 * 3) Implicit Flow (Landing Page Magic Link Klick): #access_token=...
 *    → Hash-Fragmente parsen + setSession()
 */
function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    const next = searchParams.get('next') ?? '/profile';
    const code = searchParams.get('code');
    const at = searchParams.get('at');
    const rt = searchParams.get('rt');
    let done = false;

    function go(path: string) {
      if (done) return;
      done = true;
      router.replace(path);
    }

    async function handle() {
      // ── 1) Landing Page OTP-Redirect: ?at=...&rt=... ──
      // Tokens kommen als Query-Parameter von der Landing Page nach OTP-Verifikation
      if (at && rt) {
        const { error } = await supabase.auth.setSession({
          access_token: at,
          refresh_token: rt,
        });
        if (!error) {
          go(next);
          return;
        }
        console.error('Token transfer error:', error);
      }

      // ── 2) PKCE Flow: ?code=xxx ──
      // Wird von souleya-web Login Magic Links genutzt (@supabase/ssr → PKCE)
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          go(next);
          return;
        }
        console.error('PKCE exchange error:', error);
      }

      // ── 3) Implicit Flow: #access_token=...&refresh_token=... ──
      // Wird von Landing Page Magic Link Klick genutzt (Fallback)
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
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'var(--font-body, system-ui)',
      }}
    >
      <p style={{ color: 'var(--text-secondary, #888)' }}>Einen Moment…</p>
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
