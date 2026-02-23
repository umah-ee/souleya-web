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
    const checkAuth = async () => {
      const supabase = createClient();

      // getUser() prueft den Token serverseitig und refresht wenn noetig
      const { data: { user }, error } = await supabase.auth.getUser();

      if (user && !error) {
        setAuthenticated(true);
      } else {
        console.warn('[AuthGuard] Keine gueltige Session – Redirect zu /login');
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      setChecked(true);
    };

    checkAuth();

    // Auth-State-Changes lauschen (Login/Logout)
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_OUT') {
          router.replace('/login');
        }
      },
    );

    return () => subscription.unsubscribe();
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
