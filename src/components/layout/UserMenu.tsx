'use client';

import Link from 'next/link';
import EnsoRing from '@/components/ui/EnsoRing';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useCurrentProfile } from '@/hooks/useCurrentProfile';
import { Icon } from '@/components/ui/Icon';

export default function UserMenu() {
  const { profile, isLoading } = useCurrentProfile();

  if (isLoading || !profile) return null;

  const initials = (profile.display_name ?? profile.username ?? '').slice(0, 1).toUpperCase();

  return (
    <div
      className="hidden md:flex items-center gap-3 fixed top-3 right-4 z-30"
    >
      {/* Notification Bell */}
      <NotificationBell />

      {/* Profile with EnsoRing */}
      <Link href="/profile" className="no-underline block cursor-pointer" title="Profil">
        <EnsoRing
          soulLevel={profile.soul_level ?? 1}
          isFirstLight={profile.is_first_light ?? false}
          size="header"
        >
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span
              className="w-full h-full flex items-center justify-center text-xs"
              style={{ background: 'var(--avatar-bg)', color: 'var(--gold-text)' }}
            >
              {initials || <Icon name="user" size={14} />}
            </span>
          )}
        </EnsoRing>
      </Link>
    </div>
  );
}
