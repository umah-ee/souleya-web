'use client';

import type { Profile } from '@/types/profile';
import { Icon } from '@/components/ui/Icon';

interface ProfileBioProps {
  profile: Profile;
}

export default function ProfileBio({ profile }: ProfileBioProps) {
  const hasContent = profile.bio || profile.location || profile.created_at;
  if (!hasContent) return null;

  return (
    <div className="text-center px-6" style={{ marginTop: '40px' }}>
      {/* ─── Bio Text — Mockup: 15px, line-height 1.85 ─── */}
      {profile.bio && (
        <p
          className="mx-auto max-w-[340px]"
          style={{ fontSize: '15px', lineHeight: 1.85, color: 'var(--text-body)' }}
        >
          {profile.bio}
        </p>
      )}

      {/* ─── Location + Member-Since — Mockup: 12px, gap 20px, icon opacity .65 ─── */}
      <div
        className="flex flex-wrap justify-center"
        style={{ gap: '20px', marginTop: '16px', fontSize: '12px', color: 'var(--text-sec)' }}
      >
        {profile.location && (
          <span className="flex items-center gap-1.5">
            <Icon name="map-pin" size={13} style={{ opacity: 0.65 }} />
            {profile.location}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Icon name="calendar" size={13} style={{ opacity: 0.65 }} />
          Seit {new Date(profile.created_at).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
}
