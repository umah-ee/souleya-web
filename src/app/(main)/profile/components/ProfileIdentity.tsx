'use client';

import type { Profile } from '@/types/profile';
import { SOUL_LEVEL_NAMES } from '@/types/profile';
import EnsoRing from '@/components/ui/EnsoRing';

interface ProfileIdentityProps {
  profile: Profile;
}

export default function ProfileIdentity({ profile }: ProfileIdentityProps) {
  const initials = (profile.display_name ?? profile.username ?? profile.email ?? '?')
    .slice(0, 1)
    .toUpperCase();
  const vipName = SOUL_LEVEL_NAMES[profile.soul_level] ?? `Level ${profile.soul_level}`;

  return (
    <div className="flex flex-col items-center -mt-[56px] relative z-10">
      {/* ─── EnsoRing 112px mit Avatar 72px ─── */}
      <EnsoRing
        soulLevel={profile.soul_level}
        isFirstLight={profile.is_first_light}
        size="profile-large"
      >
        <div
          className="w-full h-full rounded-full flex items-center justify-center font-heading text-[28px] overflow-hidden"
          style={{
            background: 'var(--avatar-bg)',
            color: 'var(--gold-text)',
          }}
        >
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
      </EnsoRing>

      {/* ─── Name (32px Serif italic) ─── */}
      <h1
        className="mt-3 text-[32px] font-heading italic leading-tight"
        style={{ color: 'var(--text-h)' }}
      >
        {profile.display_name ?? profile.email}
      </h1>

      {/* ─── Handle ─── */}
      <p
        className="text-[13px] mt-0.5"
        style={{ color: 'var(--text-sec)' }}
      >
        {profile.username ? `@${profile.username}` : profile.email}
      </p>

      {/* ─── Level + Badges ─── */}
      <div
        className="flex items-center gap-2 mt-1.5"
      >
        <span
          className="text-[10px] font-label tracking-[1.2px] uppercase"
          style={{ color: 'var(--text-muted)' }}
        >
          {vipName}
        </span>
        {profile.is_admin && (
          <span
            className="text-[10px] font-label tracking-[0.8px] uppercase px-[8px] py-[3px] rounded-full"
            style={{ background: 'var(--gold-bg)', color: 'var(--gold-text)', border: '1px solid var(--gold-border-s)' }}
          >
            Admin
          </span>
        )}
        {profile.is_mentor && !profile.is_admin && (
          <span
            className="text-[10px] font-label tracking-[0.8px] uppercase px-[8px] py-[3px] rounded-full"
            style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)' }}
          >
            Mentor
          </span>
        )}
      </div>
    </div>
  );
}
