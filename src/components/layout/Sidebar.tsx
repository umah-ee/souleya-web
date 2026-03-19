'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/components/ThemeProvider';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useUnread } from '@/components/chat/UnreadContext';
import { useSidebar } from './SidebarContext';

const navItems: { href: string; icon: IconName; label: string }[] = [
  { href: '/pulse', icon: 'sparkles', label: 'Pulse' },
  { href: '/circles', icon: 'users', label: 'Circle' },
  { href: '/chat', icon: 'message-circle', label: 'Chat' },
  { href: '/discover', icon: 'compass', label: 'Discover' },
];

const moreItems: { href: string; icon: IconName; label: string }[] = [
  { href: '/studio', icon: 'school', label: 'Studio' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { totalUnread, refreshUnread } = useUnread();
  const { collapsed, toggle } = useSidebar();

  // Unread-Count beim Mount laden
  useEffect(() => {
    const t = setTimeout(refreshUnread, 400);
    return () => clearTimeout(t);
  }, [refreshUnread]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const isActive = (href: string) => {
    if (href === '/pulse') return pathname === '/pulse' || pathname.startsWith('/pulse/');
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="hidden md:flex flex-col flex-shrink-0 h-screen fixed left-0 top-0 z-20 overflow-hidden glass-nav transition-all duration-300"
      style={{
        width: collapsed ? 64 : 240,
        borderRight: '1px solid var(--glass-nav-b)',
      }}
    >
      {/* Enso Logo */}
      <Link
        href="/pulse"
        className="flex items-center gap-[10px] flex-shrink-0 no-underline"
        style={{
          height: 56,
          padding: collapsed ? '0' : '0 16px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid var(--divider-l)',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 100 100" className="flex-shrink-0">
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
        {!collapsed && (
          <span
            className="text-sm italic whitespace-nowrap overflow-hidden font-heading"
            style={{ color: 'var(--text-h)' }}
          >
            Souleya
          </span>
        )}
      </Link>

      {/* Nav Items */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-[8px] transition-all duration-200 relative no-underline whitespace-nowrap"
              style={{
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: active ? 'var(--sidebar-active)' : 'transparent',
              }}
              title={collapsed ? item.label : undefined}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = 'var(--sidebar-hover)';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent';
              }}
            >
              {/* Active Indicator — vertikaler Gold-Strich */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2"
                  style={{
                    width: 3,
                    height: 20,
                    background: 'var(--gold)',
                    borderRadius: '0 3px 3px 0',
                  }}
                />
              )}
              <span className="flex-shrink-0 flex items-center justify-center relative" style={{ width: 20, height: 20 }}>
                <Icon
                  name={item.icon}
                  size={20}
                  style={{ color: active ? 'var(--gold)' : 'var(--text-sec)' }}
                />
                {/* Unread Badge */}
                {item.href === '/chat' && totalUnread > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] flex items-center justify-center rounded-full text-[9px] font-label px-1"
                    style={{
                      background: 'var(--gold)',
                      color: 'var(--text-on-gold)',
                    }}
                  >
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </span>
                )}
              </span>
              {!collapsed && (
                <span
                  className="text-xs transition-colors whitespace-nowrap"
                  style={{ color: active ? 'var(--gold-text)' : 'var(--text-sec)' }}
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}

        {/* Weitere Nav-Items (Studio etc.) — direkt als regulaere Items */}
        {moreItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-[8px] transition-all duration-200 relative no-underline whitespace-nowrap"
              style={{
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: active ? 'var(--sidebar-active)' : 'transparent',
              }}
              title={collapsed ? item.label : undefined}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = 'var(--sidebar-hover)';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent';
              }}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2"
                  style={{ width: 3, height: 20, background: 'var(--gold)', borderRadius: '0 3px 3px 0' }}
                />
              )}
              <span className="flex-shrink-0 flex items-center justify-center" style={{ width: 20, height: 20 }}>
                <Icon name={item.icon} size={20} style={{ color: active ? 'var(--gold)' : 'var(--text-sec)' }} />
              </span>
              {!collapsed && (
                <span className="text-xs transition-colors whitespace-nowrap" style={{ color: active ? 'var(--gold-text)' : 'var(--text-sec)' }}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="flex-shrink-0 px-2 pt-2">
        <button
          onClick={toggle}
          className="flex items-center gap-3 rounded-[8px] w-full transition-all duration-200 border-none cursor-pointer"
          style={{
            padding: collapsed ? '8px 0' : '8px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: 'transparent',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sidebar-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          title={collapsed ? 'Ausklappen' : 'Einklappen'}
        >
          <span
            className="flex items-center justify-center"
            style={{
              transform: collapsed ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s',
            }}
          >
            <Icon name="chevrons-left" size={18} style={{ color: 'var(--text-muted)' }} />
          </span>
          {!collapsed && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
              Einklappen
            </span>
          )}
        </button>
      </div>

      {/* Divider */}
      <div className="mx-2" style={{ height: 1, background: 'var(--divider-l)' }} />

      {/* Bottom: Theme + Profile + Logout */}
      <div className="flex-shrink-0 px-2 py-2 flex flex-col gap-1">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 rounded-[8px] w-full transition-colors duration-200 cursor-pointer"
          style={{
            padding: collapsed ? '8px 0' : '8px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-sec)',
          }}
          title={theme === 'dark' ? 'Hell' : 'Dunkel'}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sidebar-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <span className="flex-shrink-0 flex items-center justify-center" style={{ width: 20, height: 20 }}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
          </span>
          {!collapsed && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
              {theme === 'dark' ? 'Hell' : 'Dunkel'}
            </span>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-[8px] w-full transition-colors duration-200 cursor-pointer mb-2"
          style={{
            padding: collapsed ? '8px 0' : '8px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
          }}
          title="Abmelden"
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sidebar-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <span className="flex-shrink-0 flex items-center justify-center" style={{ width: 20, height: 20 }}>
            <Icon name="logout" size={16} />
          </span>
          {!collapsed && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
              Abmelden
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
