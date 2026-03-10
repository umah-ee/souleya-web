'use client';

import type { Profile } from '@/types/profile';

interface ProfileStatsProps {
  profile: Profile;
}

/**
 * Stats + Divider — exakt nach Mockup
 *
 * Divider: margin 0 60px, gradient gold-border
 * Stats: gap 48px, number 26px serif, label 10px Josefin, margin-top 6px
 */
export default function ProfileStats({ profile }: ProfileStatsProps) {
  return (
    <div className="px-6" style={{ marginTop: '40px' }}>
      {/* ─── Gradient Divider — Mockup: margin 0 60px, class profile-divider ─── */}
      <div
        className="h-px profile-divider"
        style={{
          margin: '0 60px 40px',
          background: 'linear-gradient(90deg, transparent, var(--gold-border-s), transparent)',
        }}
      />

      {/* ─── Stats Row — Mockup: gap 48px ─── */}
      <div className="flex justify-center" style={{ gap: '48px' }}>
        <div className="text-center">
          <span
            className="block font-heading"
            style={{ fontSize: '26px', fontWeight: 500, lineHeight: 1, color: 'var(--text-h)' }}
          >
            {profile.pulses_count ?? 0}
          </span>
          <span
            className="font-label uppercase block"
            style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '1.2px', color: 'var(--text-muted)', marginTop: '6px' }}
          >
            Beitraege
          </span>
        </div>
        <div className="text-center">
          <span
            className="block font-heading"
            style={{ fontSize: '26px', fontWeight: 500, lineHeight: 1, color: 'var(--text-h)' }}
          >
            {profile.connections_count}
          </span>
          <span
            className="font-label uppercase block"
            style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '1.2px', color: 'var(--text-muted)', marginTop: '6px' }}
          >
            Kontakte
          </span>
        </div>
        <div className="text-center">
          <span
            className="block font-heading"
            style={{ fontSize: '26px', fontWeight: 500, lineHeight: 1, color: 'var(--text-h)' }}
          >
            0
          </span>
          <span
            className="font-label uppercase block"
            style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '1.2px', color: 'var(--text-muted)', marginTop: '6px' }}
          >
            Circles
          </span>
        </div>
      </div>
    </div>
  );
}
