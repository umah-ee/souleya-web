'use client';

import { useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { createClient } from '@/lib/supabase/client';
import { captureUtmParams, markAsInternal, analyticsBeforeSend } from '@/lib/analytics';

/**
 * AnalyticsProvider – einmalig im Root-Layout eingebunden.
 *
 * 1. Liest UTM-Parameter aus der URL und speichert sie in sessionStorage
 * 2. Prueft ob der User Admin oder Beta-Tester ist → markiert Browser als intern
 *    (Vercel Analytics filtert dann via beforeSend alle Events raus)
 */
export default function AnalyticsProvider() {
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    // UTM-Parameter aus URL sichern (einmalig pro Session)
    captureUtmParams();

    // Admin/Tester-Check → internen Traffic markieren
    const checkInternal = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin, is_beta_tester')
          .eq('id', user.id)
          .single();

        if (profile?.is_admin || profile?.is_beta_tester) {
          markAsInternal();
        }
      } catch {
        // Nicht eingeloggt oder Fehler → normaler Traffic
      }
    };

    checkInternal();
  }, []);

  return <Analytics beforeSend={analyticsBeforeSend} />;
}
