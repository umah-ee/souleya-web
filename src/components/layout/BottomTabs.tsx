'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/components/ui/Icon';

const tabs: { href: string; icon: IconName; label: string }[] = [
  { href: '/', icon: 'home', label: 'Home' },
  { href: '/discover', icon: 'compass', label: 'Discover' },
  { href: '/circles', icon: 'users', label: 'Circle' },
  { href: '/chat', icon: 'message-circle', label: 'Chat' },
  { href: '/profile', icon: 'user', label: 'Profil' },
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
            <Icon name={tab.icon} size={20} style={{ opacity: isActive ? 1 : 0.5 }} />
            <span className="text-[9px] font-label uppercase tracking-[2px] -mt-0.5">
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
