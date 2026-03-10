'use client';

import { useState } from 'react';
import type { Profile } from '@/types/profile';

interface ProfileInterestsProps {
  profile: Profile;
}

/** Anzahl sichtbarer Tags vor dem Expand */
const VISIBLE_COUNT = 6;

export default function ProfileInterests({ profile }: ProfileInterestsProps) {
  const interests = profile.interests ?? [];
  const [expanded, setExpanded] = useState(false);

  if (interests.length === 0) return null;

  const visible = expanded ? interests : interests.slice(0, VISIBLE_COUNT);
  const hiddenCount = interests.length - VISIBLE_COUNT;

  return (
    <div className="px-6 mt-10">
      {/* ─── Section Label ─── */}
      <p
        className="text-[10px] font-label tracking-[1.2px] uppercase mb-3 text-center"
        style={{ color: 'var(--text-muted)' }}
      >
        Interessen
      </p>

      {/* ─── Tags ─── */}
      <div className="flex flex-wrap justify-center gap-[8px]">
        {visible.map((tag) => (
          <span
            key={tag}
            className="text-[10px] font-label tracking-[0.8px] uppercase px-[12px] py-[5px] rounded-full inline-block"
            style={{
              color: 'var(--gold-text)',
              border: '1px solid var(--gold-border)',
              background: 'var(--gold-bg)',
            }}
          >
            {tag}
          </span>
        ))}

        {/* "+N weitere" Button */}
        {!expanded && hiddenCount > 0 && (
          <button
            onClick={() => setExpanded(true)}
            className="text-[10px] font-label tracking-[0.8px] uppercase px-[12px] py-[5px] rounded-full cursor-pointer transition-colors"
            style={{
              color: 'var(--text-sec)',
              border: '1px solid var(--divider)',
              background: 'transparent',
            }}
          >
            +{hiddenCount} weitere
          </button>
        )}
      </div>
    </div>
  );
}
