'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/components/ThemeProvider';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const PAGE_TITLES: Record<string, string> = {
  '/studio': 'Dashboard',
  '/studio/courses': 'Kurse',
  '/studio/content': 'Content & Mediathek',
  '/studio/calendar': 'Kalender',
  '/studio/f2f': 'Face2Face',
  '/studio/participants': 'Teilnehmer',
  '/studio/finance': 'Finanzen',
  '/studio/analytics': 'Analytics',
  '/studio/messages': 'Nachrichten',
  '/studio/profile': 'Profil & Branding',
};

export default function StudioTopbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);

  // Avatar laden
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', data.user.id)
          .single()
          .then(({ data: p }) => {
            if (p?.avatar_url) setAvatar(p.avatar_url);
          });
      }
    });
  }, []);

  // Finde den passenden Titel
  const title = Object.entries(PAGE_TITLES).find(
    ([path]) => pathname === path || (path !== '/studio' && pathname.startsWith(path)),
  )?.[1] ?? 'Studio';

  const btnStyle: React.CSSProperties = {
    width: 36, height: 36,
    borderRadius: 8,
    background: 'var(--glass)',
    border: '1px solid var(--glass-border)',
  };

  return (
    <header
      className="flex items-center gap-4 px-6 flex-shrink-0"
      style={{
        height: 56,
        background: 'var(--topbar-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--divider-l)',
      }}
    >
      {/* Mobile: Hamburger + Zurueck */}
      <Link
        href="/"
        className="flex md:hidden items-center gap-1.5 no-underline"
        style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' as const }}
      >
        <Icon name="arrow-left" size={16} style={{ color: 'var(--text-muted)' }} />
        Community
      </Link>

      {/* Title */}
      <h1
        className="flex-1 italic"
        style={{ fontSize: 16, color: 'var(--text-h)', margin: 0 }}
      >
        {title}
      </h1>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center cursor-pointer transition-all duration-200"
        style={btnStyle}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gold-bg-hover)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass)'; }}
        title={theme === 'dark' ? 'Hell' : 'Dunkel'}
      >
        <Icon
          name={theme === 'dark' ? 'sun' : 'moon'}
          size={18}
          style={{ color: 'var(--text-sec)' }}
        />
      </button>

      {/* Notifications Bell */}
      <Link
        href="/studio/messages"
        className="relative flex items-center justify-center no-underline transition-all duration-200"
        style={btnStyle}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gold-bg-hover)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass)'; }}
        title="Nachrichten"
      >
        <Icon name="bell" size={18} style={{ color: 'var(--text-sec)' }} />
        {unread > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full text-[8px] font-label px-1"
            style={{ background: 'var(--gold)', color: 'var(--text-on-gold)' }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Link>

      {/* Profile Avatar */}
      <Link
        href="/studio/profile"
        className="flex items-center justify-center no-underline overflow-hidden transition-all duration-200"
        style={{
          ...btnStyle,
          background: avatar ? 'transparent' : 'var(--glass)',
          border: pathname === '/studio/profile' ? '1.5px solid var(--gold)' : '1px solid var(--glass-border)',
        }}
        onMouseEnter={(e) => { if (!avatar) e.currentTarget.style.background = 'var(--gold-bg-hover)'; }}
        onMouseLeave={(e) => { if (!avatar) e.currentTarget.style.background = 'var(--glass)'; }}
        title="Profil & Branding"
      >
        {avatar ? (
          <img src={avatar} alt="" className="w-full h-full object-cover" style={{ borderRadius: 8 }} />
        ) : (
          <Icon name="user" size={18} style={{ color: 'var(--text-sec)' }} />
        )}
      </Link>
    </header>
  );
}
