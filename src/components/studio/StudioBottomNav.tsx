'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/components/ui/Icon';

interface BottomItem {
  label: string;
  icon: IconName;
  href: string;
}

const BOTTOM_ITEMS: BottomItem[] = [
  { label: 'Dashboard', icon: 'layout-dashboard', href: '/studio' },
  { label: 'Kurse', icon: 'school', href: '/studio/courses' },
  { label: 'Kalender', icon: 'calendar-event', href: '/studio/calendar' },
  { label: 'Nachrichten', icon: 'mail', href: '/studio/messages' },
  { label: 'Mehr', icon: 'dots', href: '/studio/more' },
];

export default function StudioBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    if (href === '/studio') return pathname === '/studio';
    if (href === '/studio/more') {
      // "Mehr" aktiv wenn keiner der anderen Items matcht
      const mainItems = BOTTOM_ITEMS.slice(0, 4);
      const anyMainActive = mainItems.some((item) => {
        if (item.href === '/studio') return pathname === '/studio';
        return pathname.startsWith(item.href);
      });
      return !anyMainActive;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex items-center justify-around md:hidden z-10"
      style={{
        height: 64,
        background: 'var(--topbar-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid var(--divider-l)',
      }}
    >
      {BOTTOM_ITEMS.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-[3px] no-underline"
            style={{
              fontSize: 8,
              letterSpacing: '1px',
              textTransform: 'uppercase' as const,
              color: active ? 'var(--gold)' : 'var(--text-muted)',
            }}
          >
            <Icon
              name={item.icon}
              size={22}
              style={{ color: active ? 'var(--gold)' : 'var(--text-muted)' }}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
