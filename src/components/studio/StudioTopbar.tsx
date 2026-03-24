'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/components/ThemeProvider';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

const PAGE_TITLES: Record<string, string> = {
  '/studio': 'Dashboard',
  '/studio/courses': 'Kurse',
  '/studio/content': 'Content & Mediathek',
  '/studio/calendar': 'Kalender',
  '/studio/f2f': 'Face2Face',
  '/studio/circle': 'Circle',
  '/studio/finance': 'Finanzen',
  '/studio/analytics': 'Analytics',
};

export default function StudioTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Avatar + Name laden
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase
          .from('profiles')
          .select('avatar_url, display_name')
          .eq('id', data.user.id)
          .single()
          .then(({ data: p }) => {
            if (p?.avatar_url) setAvatar(p.avatar_url);
            if (p?.display_name) setDisplayName(p.display_name);
          });
      }
    });
  }, []);

  // Dropdown schliessen bei Klick ausserhalb
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

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
        href="/pulse"
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
        href="/chat"
        className="relative flex items-center justify-center no-underline transition-all duration-200"
        style={btnStyle}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gold-bg-hover)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass)'; }}
        title="Chat"
      >
        <Icon name="message-circle" size={18} style={{ color: 'var(--text-sec)' }} />
      </Link>

      {/* Profile Avatar mit Dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(s => !s)}
          className="flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-200 border-none"
          style={{
            ...btnStyle,
            background: avatar ? 'transparent' : 'var(--glass)',
            border: showMenu ? '1.5px solid var(--gold)' : '1px solid var(--glass-border)',
          }}
          title="Mein Profil"
        >
          {avatar ? (
            <img src={avatar} alt="" className="w-full h-full object-cover" style={{ borderRadius: 8 }} />
          ) : (
            <Icon name="user" size={18} style={{ color: 'var(--text-sec)' }} />
          )}
        </button>

        {showMenu && (
          <div
            className="absolute right-0 top-full mt-2 w-[200px] rounded-[8px] overflow-hidden z-[100]"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', boxShadow: '0 8px 32px rgba(0,0,0,.15)' }}
          >
            {/* User Info */}
            <div className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--divider-l)' }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-h)' }}>{displayName ?? 'Mein Profil'}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Mentor</div>
            </div>
            {/* Links */}
            <div className="py-1">
              <button
                onClick={() => { setShowMenu(false); window.open('/profile', '_blank'); }}
                className="w-full flex items-center gap-2 px-3 py-2 border-none cursor-pointer text-left"
                style={{ background: 'transparent', fontSize: 11, color: 'var(--text-sec)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon name="user" size={14} style={{ color: 'var(--text-muted)' }} /> Profil ansehen
              </button>
              <button
                onClick={() => { setShowMenu(false); router.push('/pulse'); }}
                className="w-full flex items-center gap-2 px-3 py-2 border-none cursor-pointer text-left"
                style={{ background: 'transparent', fontSize: 11, color: 'var(--text-sec)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon name="arrow-left" size={14} style={{ color: 'var(--text-muted)' }} /> Zurueck zur Community
              </button>
              <button
                onClick={async () => {
                  setShowMenu(false);
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  router.push('/login');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 border-none cursor-pointer text-left"
                style={{ background: 'transparent', fontSize: 11, color: 'var(--danger)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon name="logout" size={14} /> Abmelden
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
