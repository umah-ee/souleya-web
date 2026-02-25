'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/components/ui/Icon';

const tabs: { href: string; icon: IconName; label: string }[] = [
  { href: '/', icon: 'sparkles', label: 'Pulse' },
  { href: '/discover', icon: 'compass', label: 'Discover' },
  // (+) wird in der Mitte eingefuegt
  { href: '/chat', icon: 'message-circle', label: 'Chat' },
  { href: '/profile', icon: 'user', label: 'Profil' },
];

const moreItems: { href: string; icon: IconName; label: string }[] = [
  { href: '/places', icon: 'map-pin-heart', label: 'Soul Places' },
  { href: '/circles', icon: 'users', label: 'Circle' },
  { href: '/studio', icon: 'school', label: 'Studio' },
  { href: '/analytics', icon: 'chart-dots', label: 'Analytics' },
];

export default function BottomTabs() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Click outside schliesst
  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [moreOpen]);

  // Route-Wechsel schliesst
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  const isMoreActive = moreItems.some((item) => pathname.startsWith(item.href));
  const firstTabs = tabs.slice(0, 2);
  const lastTabs = tabs.slice(2);

  return (
    <div ref={moreRef} className="md:hidden">
      {/* Flyout-Menue oberhalb der Tabs */}
      {moreOpen && (
        <div
          className="fixed bottom-[72px] left-1/2 -translate-x-1/2 rounded-xl overflow-hidden"
          style={{
            background: 'var(--bg-solid)',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.3)',
            minWidth: '180px',
            zIndex: 30,
          }}
        >
          {/* Gold-Leiste */}
          <div
            className="h-[2px]"
            style={{ background: 'linear-gradient(to right, transparent, var(--gold-glow), transparent)' }}
          />

          {moreItems.map((item, i) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 px-4 py-3 transition-colors duration-200"
                style={{
                  color: isActive ? 'var(--gold-text)' : 'var(--text-h)',
                  background: isActive ? 'var(--gold-bg)' : 'transparent',
                  borderBottom: i < moreItems.length - 1 ? '1px solid var(--divider-l)' : undefined,
                }}
              >
                <Icon name={item.icon} size={18} style={{ color: isActive ? 'var(--gold)' : 'var(--text-muted)' }} />
                <span className="text-sm font-body">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around h-16 glass-nav"
        style={{ borderTop: '1px solid var(--glass-nav-b)' }}
      >
        {/* Erste Tabs */}
        {firstTabs.map((tab) => {
          const isActive = tab.href === '/'
            ? pathname === '/'
            : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200"
              style={{ color: isActive ? 'var(--gold-text)' : 'var(--text-muted)' }}
            >
              <Icon name={tab.icon} size={20} style={{ opacity: isActive ? 1 : 0.5 }} />
              <span className="text-[9px] font-label uppercase tracking-[2px] -mt-0.5">
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* (+) Mehr-Button in der Mitte */}
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className="flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200 cursor-pointer"
          style={{ color: isMoreActive || moreOpen ? 'var(--gold-text)' : 'var(--text-muted)' }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background: moreOpen
                ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))'
                : isMoreActive
                  ? 'var(--gold-bg)'
                  : 'var(--glass)',
              border: `1px solid ${moreOpen ? 'var(--gold)' : 'var(--glass-border)'}`,
              color: moreOpen ? 'var(--text-on-gold)' : isMoreActive ? 'var(--gold-text)' : 'var(--text-muted)',
              boxShadow: moreOpen ? '0 0 12px rgba(200,169,110,0.3)' : 'none',
            }}
          >
            <Icon
              name="plus"
              size={18}
              style={{ transition: 'transform 200ms', transform: moreOpen ? 'rotate(45deg)' : 'none' }}
            />
          </div>
        </button>

        {/* Letzte Tabs */}
        {lastTabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200"
              style={{ color: isActive ? 'var(--gold-text)' : 'var(--text-muted)' }}
            >
              <Icon name={tab.icon} size={20} style={{ opacity: isActive ? 1 : 0.5 }} />
              <span className="text-[9px] font-label uppercase tracking-[2px] -mt-0.5">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
