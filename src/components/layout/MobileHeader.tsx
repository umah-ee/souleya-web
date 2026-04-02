'use client';

import Link from 'next/link';
import EnsoRing from '@/components/ui/EnsoRing';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useCurrentProfile } from '@/hooks/useCurrentProfile';
import { Icon } from '@/components/ui/Icon';

export default function MobileHeader() {
  const { profile } = useCurrentProfile();

  const initials = (profile?.display_name ?? profile?.username ?? '').slice(0, 1).toUpperCase();

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-3 glass-nav" style={{ borderBottom: '1px solid var(--glass-nav-b)' }}>
      {/* Logo + Schriftzug */}
      <Link href="/pulse" className="flex items-center gap-3">
        <svg width="36" height="36" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="mobile-enso" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--gold-deep)" />
              <stop offset="100%" stopColor="var(--gold)" />
            </linearGradient>
          </defs>
          <circle
            cx="50" cy="50" r="36" fill="none" stroke="url(#mobile-enso)"
            strokeWidth="9" strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15"
          />
        </svg>
        <span className="text-[13px] font-normal tracking-[5px] uppercase" style={{ color: 'var(--gold-deep)', fontFamily: 'Georgia, serif' }}>
          Souleya
        </span>
      </Link>

      <div className="flex items-center gap-2.5">
        {/* Notification Bell */}
        <NotificationBell />

        {/* Profilbild mit EnsoRing */}
        <Link href="/profile" className="no-underline block cursor-pointer" title="Profil">
          <EnsoRing
            soulLevel={profile?.soul_level ?? 1}
            isFirstLight={profile?.is_first_light ?? false}
            size="header"
          >
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; if (e.target instanceof HTMLImageElement && e.target.nextElementSibling) (e.target.nextElementSibling as HTMLElement).style.display = 'flex'; }}
              />
            ) : null}
            <span
              className="w-full h-full items-center justify-center text-xs"
              style={{ background: 'var(--avatar-bg)', color: 'var(--gold-text)', display: profile?.avatar_url ? 'none' : 'flex' }}
            >
              {initials || <Icon name="user" size={12} />}
            </span>
          </EnsoRing>
        </Link>
      </div>
    </header>
  );
}
