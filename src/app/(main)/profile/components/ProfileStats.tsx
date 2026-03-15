'use client';

import type { Profile } from '@/types/profile';
import type { PublicProfile } from '@/lib/users';

interface ProfileStatsProps {
  profile: Profile | PublicProfile;
  onBeitraegeClick?: () => void;
  beitraegeActive?: boolean;
  onCircleClick?: () => void;
  circleActive?: boolean;
}

/**
 * Stats: Beitraege + Circle
 * Glasmorphism-Container mit Blur-Hintergrund
 */
export default function ProfileStats({ profile, onBeitraegeClick, beitraegeActive, onCircleClick, circleActive }: ProfileStatsProps) {
  return (
    <div className="px-6" style={{ marginTop: '40px' }}>
      {/* ─── Gradient Divider ─── */}
      <div
        className="h-px"
        style={{
          margin: '0 60px 40px',
          background: 'linear-gradient(90deg, transparent, var(--gold-border-s), transparent)',
        }}
      />

      {/* ─── Stats Container — Glasmorphism ─── */}
      <div
        className="flex justify-center rounded-2xl py-6"
        style={{
          gap: '48px',
          background: 'var(--glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
        }}
      >
        {/* Beitraege */}
        {onBeitraegeClick ? (
          <button
            onClick={onBeitraegeClick}
            className="text-center transition-colors duration-200"
            style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
          >
            <span
              className="block font-heading"
              style={{
                fontSize: '26px', fontWeight: 500, lineHeight: 1,
                color: beitraegeActive ? 'var(--gold)' : 'var(--text-h)',
              }}
            >
              {profile.pulses_count ?? 0}
            </span>
            <span
              className="font-label uppercase block"
              style={{
                fontSize: '10px', fontWeight: 500, letterSpacing: '1.2px',
                color: beitraegeActive ? 'var(--gold)' : 'var(--text-muted)',
                marginTop: '6px',
              }}
            >
              Beitraege
            </span>
          </button>
        ) : (
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
        )}

        {/* Circle */}
        {onCircleClick ? (
          <button
            onClick={onCircleClick}
            className="text-center transition-colors duration-200"
            style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
          >
            <span
              className="block font-heading"
              style={{
                fontSize: '26px', fontWeight: 500, lineHeight: 1,
                color: circleActive ? 'var(--gold)' : 'var(--text-h)',
              }}
            >
              {profile.connections_count}
            </span>
            <span
              className="font-label uppercase block"
              style={{
                fontSize: '10px', fontWeight: 500, letterSpacing: '1.2px',
                color: circleActive ? 'var(--gold)' : 'var(--text-muted)',
                marginTop: '6px',
              }}
            >
              Circle
            </span>
          </button>
        ) : (
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
              Circle
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
