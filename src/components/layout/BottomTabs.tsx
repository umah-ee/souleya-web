'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', icon: '◎', label: 'Pulse' },
  { href: '/discover', icon: '◈', label: 'Discover' },
  { href: '/circles', icon: '⊕', label: 'Circle' },
  { href: '/profile', icon: '◯', label: 'Profil' },
];

export default function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around h-16 glass-nav" style={{ borderTop: '1px solid var(--glass-nav-b)' }}>
      {tabs.map((tab) => {
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
            <span className={`text-lg ${isActive ? 'opacity-100' : 'opacity-50'}`}>
              {tab.icon}
            </span>
            <span className="text-[9px] font-label uppercase tracking-[2px] -mt-0.5">
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
