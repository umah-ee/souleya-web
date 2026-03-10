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
    <div className="text-center px-6 mt-5">
      {/* ─── Bio Text (15px/500) ─── */}
      {profile.bio && (
        <p
          className="text-[15px] leading-[1.7] mx-auto max-w-[340px]"
          style={{ color: 'var(--text-body)' }}
        >
          {profile.bio}
        </p>
      )}

      {/* ─── Location + Member-Since ─── */}
      <div
        className="flex flex-wrap justify-center gap-4 mt-4 text-[11px]"
        style={{ color: 'var(--text-sec)' }}
      >
        {profile.location && (
          <span className="flex items-center gap-1.5">
            <Icon name="map-pin" size={13} />
            {profile.location}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Icon name="heart" size={13} />
          Seit {new Date(profile.created_at).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
}
