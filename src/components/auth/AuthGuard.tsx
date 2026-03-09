'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Client-seitiger Auth-Guard.
 * Prüft ob eine gueltige Supabase-Session existiert.
 * Wenn nicht → Redirect zu /login.
 *
 * Wird im (main) Layout eingebunden, damit alle
 * geschuetzten Seiten abgesichert sind.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();

    const checkAuth = async () => {
      // getUser() prueft den Token serverseitig und refresht wenn noetig
      const { data: { user }, error } = await supabase.auth.getUser();

      if (user && !error) {
        setAuthenticated(true);

        // Heartbeat: last_seen_at aktualisieren
        supabase
          .from('profiles')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', user.id)
          .then();
      } else {
        console.warn('[AuthGuard] Keine gueltige Session – Redirect zu /login');
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      setChecked(true);
    };

    checkAuth();

    // Heartbeat alle 2 Minuten wiederholen
    const heartbeatInterval = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        supabase
          .from('profiles')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', user.id)
          .then();
      }
    }, 2 * 60 * 1000);

    // Auth-State-Changes lauschen (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_OUT') {
          router.replace('/login');
        }
      },
    );

    return () => {
      subscription.unsubscribe();
      clearInterval(heartbeatInterval);
    };
  }, [router, pathname]);

  // Ladebildschirm waehrend Auth-Check
  if (!checked || !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{
            borderColor: 'var(--gold-border-s)',
            borderTopColor: 'transparent',
          }}
        />
      </div>
    );
  }

  return <>{children}</>;
}
