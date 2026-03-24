'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/components/ui/Icon';

interface NavItem {
  label: string;
  icon: IconName;
  href: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'layout-dashboard', href: '/studio' },
  { label: 'Kurse', icon: 'school', href: '/studio/courses' },
  { label: 'Content', icon: 'library', href: '/studio/content' },
  { label: 'Kalender', icon: 'calendar-event', href: '/studio/calendar' },
  { label: 'Face2Face', icon: 'video', href: '/studio/f2f' },
  { label: 'Circle', icon: 'users-group', href: '/studio/circle' },
  { label: 'Finanzen', icon: 'wallet', href: '/studio/finance' },
  { label: 'Analytics', icon: 'chart-line', href: '/studio/analytics' },
  { label: 'Nachrichten', icon: 'mail', href: '/studio/messages' },
  { label: 'Profil', icon: 'id-badge', href: '/studio/profile' },
];

export default function StudioSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === '/studio') return pathname === '/studio';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="hidden md:flex flex-col flex-shrink-0 h-screen transition-all duration-300 z-[100] overflow-hidden"
      style={{
        width: collapsed ? 64 : 240,
        background: 'var(--sidebar-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid var(--divider-l)',
      }}
    >
      {/* Logo */}
      <Link
        href="/studio"
        className="flex items-center gap-[10px] h-14 px-4 flex-shrink-0 no-underline"
        style={{ borderBottom: '1px solid var(--divider-l)' }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 32, height: 32,
            background: 'var(--gold)',
            borderRadius: 8,
          }}
        >
          <Icon name="sparkles" size={18} style={{ color: 'var(--text-on-gold)' }} />
        </div>
        {!collapsed && (
          <span
            className="text-sm italic whitespace-nowrap overflow-hidden"
            style={{ color: 'var(--text-h)' }}
          >
            Coach Studio
          </span>
        )}
      </Link>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden studio-scrollbar">
        {NAV_ITEMS.map((item) => {
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
                  style={{
                    width: 3, height: 20,
                    background: 'var(--gold)',
                    borderRadius: '0 3px 3px 0',
                  }}
                />
              )}
              <span className="flex-shrink-0 flex items-center justify-center" style={{ width: 20, height: 20 }}>
                <Icon
                  name={item.icon}
                  size={20}
                  style={{ color: active ? 'var(--gold)' : 'var(--text-sec)' }}
                />
              </span>
              {!collapsed && (
                <span
                  className="text-xs transition-colors"
                  style={{ color: active ? 'var(--gold-text)' : 'var(--text-sec)' }}
                >
                  {item.label}
                </span>
              )}
              {!collapsed && item.badge && (
                <span
                  className="ml-auto flex-shrink-0"
                  style={{
                    background: 'var(--gold)',
                    color: 'var(--text-on-gold)',
                    fontSize: 8,
                    padding: '2px 6px',
                    borderRadius: 8,
                    letterSpacing: '0.5px',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle – ueber dem Strich */}
      <div className="flex-shrink-0 px-2 pt-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 rounded-[8px] w-full transition-all duration-200 border-none cursor-pointer"
          style={{
            padding: collapsed ? '8px 0' : '8px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: 'transparent',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sidebar-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          {/* Doppel-Chevron Icon (<<) */}
          <span
            className="flex items-center justify-center"
            style={{
              transform: collapsed ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s',
            }}
          >
            <Icon
              name="chevrons-left"
              size={18}
              style={{ color: 'var(--text-muted)' }}
            />
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

      {/* Zurueck zur Community */}
      <div className="flex-shrink-0 px-2 py-2">
        <Link
          href="/pulse"
          className="flex items-center gap-3 rounded-[8px] w-full transition-all duration-200 no-underline"
          style={{
            padding: collapsed ? '10px 0' : '10px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: 'transparent',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sidebar-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Icon name="arrow-left" size={18} style={{ color: 'var(--gold)' }} />
          {!collapsed && (
            <span style={{ fontSize: 10, color: 'var(--gold-text)', letterSpacing: '0.5px', whiteSpace: 'nowrap', fontWeight: 500 }}>
              Zurueck zur Community
            </span>
          )}
        </Link>
      </div>
    </aside>
  );
}
