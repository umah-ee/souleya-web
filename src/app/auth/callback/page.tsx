'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Auth Callback – verarbeitet beide Flows:
 *
 * 1) Implicit Flow (Landing Page Magic Links):
 *    URL: /auth/callback?next=/profile#access_token=...&refresh_token=...
 *    → Supabase Browser-Client erkennt Hash-Fragmente automatisch
 *
 * 2) PKCE Flow (souleya-web Login Magic Links):
 *    URL: /auth/callback?code=xxx&next=/profile
 *    → exchangeCodeForSession(code)
 */
function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    const next = searchParams.get('next') ?? '/profile';
    const code = searchParams.get('code');
    let done = false;

    function go(path: string) {
      if (done) return;
      done = true;
      router.replace(path);
    }

    async function handle() {
      // ── 1) PKCE Flow: ?code=xxx ──
      // Wird von souleya-web Login Magic Links genutzt (@supabase/ssr → PKCE)
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          go(next);
          return;
        }
        console.error('PKCE exchange error:', error);
      }

      // ── 2) Implicit Flow: #access_token=...&refresh_token=... ──
      // Wird von Landing Page Magic Links genutzt (@supabase/supabase-js → implicit)
      // Hash-Fragmente explizit parsen (robuster als Auto-Detection)
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

      // ── 3) Fallback: onAuthStateChange (falls Auto-Detection greift) ──
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
