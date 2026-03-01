'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/components/ThemeProvider';

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

  // Finde den passenden Titel
  const title = Object.entries(PAGE_TITLES).find(
    ([path]) => pathname === path || (path !== '/studio' && pathname.startsWith(path)),
  )?.[1] ?? 'Studio';

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
        App
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
        style={{
          width: 36, height: 36,
          borderRadius: 10,
          background: 'var(--glass)',
          border: '1px solid var(--glass-border)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gold-bg-hover)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass)'; }}
      >
        <Icon
          name={theme === 'dark' ? 'sun' : 'moon'}
          size={18}
          style={{ color: 'var(--text-sec)' }}
        />
      </button>
    </header>
  );
}
