'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function MobileHeader() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('profiles')
          .select('avatar_url, display_name, username')
          .eq('id', user.id)
          .single();

        if (data) {
          setAvatarUrl(data.avatar_url);
          const name = data.display_name ?? data.username ?? '';
          setInitials(name.slice(0, 1).toUpperCase());
        }
      } catch {
        // Nicht eingeloggt oder Fehler
      }
    };
    loadProfile();
  }, []);

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-3">
      {/* Gradient-Overlay fuer Floating-Effekt */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-est/90 via-dark-est/70 to-transparent pointer-events-none" />

      {/* Logo + Schriftzug */}
      <Link href="/" className="relative flex items-center gap-3">
        <svg width="36" height="36" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="mobile-enso" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A8894E" />
              <stop offset="100%" stopColor="#D4BC8B" />
            </linearGradient>
          </defs>
          <circle
            cx="50" cy="50" r="36" fill="none" stroke="url(#mobile-enso)"
            strokeWidth="8" strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15"
          />
        </svg>
        <span className="font-heading text-[1.25rem] font-normal tracking-[0.3em] uppercase text-gold-1">
          Souleya
        </span>
      </Link>

      {/* Profilbild */}
      <Link
        href="/profile"
        className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gold-1/30 flex items-center justify-center hover:border-gold-1/50 transition-colors bg-gold-1/10"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="font-heading text-base text-gold-1/70">
            {initials || '◯'}
          </span>
        )}
      </Link>
    </header>
  );
}
