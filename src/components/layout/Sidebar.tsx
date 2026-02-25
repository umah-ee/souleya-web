'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/components/ThemeProvider';
import { Icon, type IconName } from '@/components/ui/Icon';

const navItems: { href: string; icon: IconName; label: string }[] = [
  { href: '/', icon: 'sparkles', label: 'Pulse' },
  { href: '/discover', icon: 'compass', label: 'Discover' },
  { href: '/circles', icon: 'users', label: 'Circle' },
  { href: '/chat', icon: 'message-circle', label: 'Chat' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="hidden md:flex flex-col items-center w-16 h-screen fixed left-0 top-0 z-20 glass-nav" style={{ borderRight: '1px solid var(--glass-nav-b)' }}>
      {/* Enso Logo */}
      <div className="py-5">
        <svg width="28" height="28" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="sidebar-enso" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--gold-deep)" />
              <stop offset="100%" stopColor="var(--gold)" />
            </linearGradient>
          </defs>
          <circle
            cx="50" cy="50" r="36" fill="none" stroke="url(#sidebar-enso)"
            strokeWidth="9" strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15"
          />
        </svg>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col items-center gap-1 flex-1 pt-4">
        {navItems.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center w-12 h-12 rounded-sm transition-colors duration-200"
              style={{
                color: isActive ? 'var(--gold-text)' : 'var(--text-muted)',
                background: isActive ? 'var(--gold-bg)' : 'transparent',
              }}
              title={item.label}
            >
              <Icon name={item.icon} size={20} />
              <span className="text-[8px] font-label uppercase tracking-[0.15em] mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="w-9 h-9 rounded-full flex items-center justify-center mb-2 cursor-pointer transition-colors duration-200"
        style={{ background: 'var(--gold-bg)', border: '1px solid var(--gold-border-s)', color: 'var(--gold-text)' }}
        title={theme === 'dark' ? 'Hell' : 'Dunkel'}
      >
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={14} />
      </button>

      {/* Avatar → Profil */}
      <Link
        href="/profile"
        className="w-9 h-9 rounded-full flex items-center justify-center mb-2 transition-colors duration-200"
        style={{
          background: pathname.startsWith('/profile') ? 'var(--gold-bg-hover)' : 'var(--avatar-bg)',
          border: `1.5px solid ${pathname.startsWith('/profile') ? 'var(--gold-border)' : 'var(--gold-border-s)'}`,
          color: 'var(--gold-text)',
        }}
        title="Profil"
      >
        <Icon name="user" size={16} />
      </Link>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex flex-col items-center justify-center w-12 h-12 mb-6 rounded-sm transition-colors duration-200 cursor-pointer"
        style={{ color: 'var(--text-muted)' }}
        title="Abmelden"
      >
        <Icon name="logout" size={16} />
        <span className="text-[7px] font-label uppercase tracking-[0.1em] mt-0.5">
          Aus
        </span>
      </button>
    </aside>
  );
}
