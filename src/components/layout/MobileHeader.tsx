'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/components/ThemeProvider';

export default function MobileHeader() {
  const { theme, toggleTheme } = useTheme();
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
    <header className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-3 glass-nav" style={{ borderBottom: '1px solid var(--glass-nav-b)' }}>
      {/* Logo + Schriftzug */}
      <Link href="/" className="flex items-center gap-3">
        <svg width="36" height="36" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="mobile-enso" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--gold-deep)" />
              <stop offset="100%" stopColor="var(--gold)" />
            </linearGradient>
          </defs>
          <circle
            cx="50" cy="50" r="36" fill="none" stroke="url(#mobile-enso)"
            strokeWidth="8" strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15"
          />
        </svg>
        <span className="text-[13px] font-normal tracking-[5px] uppercase" style={{ color: 'var(--gold-deep)', fontFamily: 'Georgia, serif' }}>
          Souleya
        </span>
      </Link>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors"
          style={{ background: 'var(--gold-bg)', border: '1px solid var(--gold-border-s)' }}
          title={theme === 'dark' ? 'Hell' : 'Dunkel'}
        >
          <span className="text-sm" style={{ color: 'var(--gold-text)' }}>
            {theme === 'dark' ? '☀' : '☾'}
          </span>
        </button>

        {/* Profilbild */}
        <Link
          href="/profile"
          className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center"
          style={{ background: 'var(--avatar-bg)', border: '1.5px solid var(--gold-border)' }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm" style={{ color: 'var(--gold-text)' }}>
              {initials || '◯'}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
