'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/', icon: '◎', label: 'Home' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="hidden md:flex flex-col items-center w-16 h-screen fixed left-0 top-0 bg-dark-er border-r border-gold-1/10 z-20">
      {/* Enso Logo */}
      <div className="py-5">
        <svg width="28" height="28" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="sidebar-enso" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A8894E" />
              <stop offset="100%" stopColor="#D4BC8B" />
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
              className={`
                flex flex-col items-center justify-center w-12 h-12 rounded-xl
                transition-colors duration-200
                ${isActive
                  ? 'text-gold-1 bg-gold-1/10'
                  : 'text-[#5A5450] hover:text-gold-1/60 hover:bg-white/[0.02]'
                }
              `}
              title={item.label}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[8px] font-label uppercase tracking-[0.15em] mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Avatar → Profil */}
      <Link
        href="/profile"
        className={`
          w-9 h-9 rounded-full flex items-center justify-center mb-2
          border transition-colors duration-200
          ${pathname.startsWith('/profile')
            ? 'bg-gold-1/15 border-gold-1/50 text-gold-1'
            : 'bg-gold-1/10 border-gold-1/20 text-gold-1/60 hover:border-gold-1/40'
          }
        `}
        title="Profil"
      >
        <span className="font-heading text-sm">◯</span>
      </Link>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex flex-col items-center justify-center w-12 h-12 mb-6 rounded-xl text-[#5A5450] hover:text-gold-1/60 hover:bg-white/[0.02] transition-colors duration-200"
        title="Abmelden"
      >
        <span className="text-base">⏻</span>
        <span className="text-[7px] font-label uppercase tracking-[0.1em] mt-0.5">
          Aus
        </span>
      </button>
    </aside>
  );
}
