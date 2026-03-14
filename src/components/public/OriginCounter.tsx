'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function OriginCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Initial laden
    async function load() {
      try {
        const { data } = await supabase
          .from('public_stats')
          .select('first_light_count')
          .single();
        if (data?.first_light_count != null) {
          setCount(data.first_light_count);
        }
      } catch {
        // Silent fail
      }
    }
    load();

    // Realtime: neue Profile → Counter aktualisieren
    const channel = supabase
      .channel('origin-counter')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => {
        load();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div
      className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full text-sm"
      style={{
        background: 'rgba(200, 169, 110, 0.15)',
        color: 'var(--gold-text)',
        animation: 'counter-glow 3s ease-in-out infinite',
      }}
    >
      <strong>{count}</strong> von 1.000 Origin Soul Plätzen vergeben
    </div>
  );
}
