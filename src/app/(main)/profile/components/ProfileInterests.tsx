'use client';

import { useState } from 'react';
import type { Profile } from '@/types/profile';
import type { PublicProfile } from '@/lib/users';
import { Icon } from '@/components/ui/Icon';

interface ProfileInterestsProps {
  profile: Profile | PublicProfile;
}

/** Anzahl sichtbarer Tags vor dem Expand */
const VISIBLE_COUNT = 6;

/**
 * Interests Tags — exakt nach Mockup
 *
 * Kein "Interessen" Label
 * Tags: padding 7px 16px, radius 20px, letter-spacing 1px, bg var(--gold-softer)
 * Expand: Separater Button mit Chevron
 */
export default function ProfileInterests({ profile }: ProfileInterestsProps) {
  const interests = profile.interests ?? [];
  const [expanded, setExpanded] = useState(false);

  if (interests.length === 0) return null;

  const visible = expanded ? interests : interests.slice(0, VISIBLE_COUNT);
  const hiddenCount = interests.length - VISIBLE_COUNT;

  return (
    <div className="px-6" style={{ marginTop: '40px' }}>
      {/* ─── Tags — Mockup: kein Label, padding 7px 16px, radius 20px ─── */}
      <div className="flex flex-wrap justify-center gap-[8px]">
        {visible.map((tag) => (
          <span
            key={tag}
            className="font-label uppercase inline-block"
            style={{
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '1px',
              padding: '7px 16px',
              borderRadius: '20px',
              color: 'var(--gold-text)',
              border: '1px solid var(--gold-border)',
              background: 'var(--gold-softer)',
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Expand Button — Mockup: separater Button mit Chevron */}
      {!expanded && hiddenCount > 0 && (
        <div className="flex justify-center" style={{ marginTop: '12px' }}>
          <button
            onClick={() => setExpanded(true)}
            className="font-label uppercase flex items-center cursor-pointer transition-colors"
            style={{
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '1px',
              gap: '4px',
              padding: '6px 14px',
              borderRadius: '20px',
              color: 'var(--text-sec)',
              border: '1px solid var(--divider-l)',
              background: 'transparent',
            }}
          >
            +{hiddenCount} weitere
            <Icon name="chevron-down" size={10} />
          </button>
        </div>
      )}
    </div>
  );
}
