'use client';

import type { Profile } from '@/types/profile';

interface ProfileStatsProps {
  profile: Profile;
}

export default function ProfileStats({ profile }: ProfileStatsProps) {
  return (
    <div className="px-6 mt-10">
      {/* ─── Gradient Divider ─── */}
      <div
        className="h-px mx-auto max-w-[200px] mb-10"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--gold-border-s), transparent)',
        }}
      />

      {/* ─── Stats Row ─── */}
      <div className="flex justify-center gap-10">
        <div className="text-center">
          <span
            className="block text-[26px] font-heading"
            style={{ color: 'var(--text-h)' }}
          >
            {profile.pulses_count ?? 0}
          </span>
          <span
            className="text-[10px] font-label tracking-[1.2px] uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            Beitraege
          </span>
        </div>
        <div className="text-center">
          <span
            className="block text-[26px] font-heading"
            style={{ color: 'var(--text-h)' }}
          >
            {profile.connections_count}
          </span>
          <span
            className="text-[10px] font-label tracking-[1.2px] uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            Kontakte
          </span>
        </div>
        <div className="text-center">
          <span
            className="block text-[26px] font-heading"
            style={{ color: 'var(--text-h)' }}
          >
            0
          </span>
          <span
            className="text-[10px] font-label tracking-[1.2px] uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            Circles
          </span>
        </div>
      </div>
    </div>
  );
}
