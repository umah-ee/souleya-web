'use client';

import type { Profile } from '@/types/profile';
import { Icon } from '@/components/ui/Icon';

interface ProfilePrivateRowProps {
  profile: Profile;
  onSeedsClick: () => void;
  onReferralClick: () => void;
}

/**
 * Private Row — exakt nach Mockup
 *
 * Layout: [icon 14px] [Serif 20px Wert] [Label 9px] [Chevron 10px] | separator | [icon] [Wert] [Label] [Chevron]
 * Tap-Area: padding 6px 12px, radius 20px
 * Separator: 1px × 18px
 * "Nur für dich sichtbar" Hint darunter
 */
export default function ProfilePrivateRow({
  profile,
  onSeedsClick,
  onReferralClick,
}: ProfilePrivateRowProps) {
  return (
    <div className="px-6 mb-8" style={{ marginTop: '40px' }}>
      {/* ─── Gradient Divider — Mockup: margin 0 60px ─── */}
      <div
        className="h-px profile-divider"
        style={{
          margin: '0 60px 32px',
          background: 'linear-gradient(90deg, transparent, var(--gold-border-s), transparent)',
        }}
      />

      {/* ─── Private Row — Mockup: centered, flex ─── */}
      <div className="flex items-center justify-center" style={{ gap: '16px' }}>
        {/* Seeds Tap */}
        <button
          onClick={onSeedsClick}
          className="private-tap flex items-center cursor-pointer transition-all duration-200"
          style={{
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '20px',
            background: 'transparent',
            border: 'none',
          }}
        >
          <Icon name="seed" size={14} style={{ color: 'var(--gold)' }} />
          <span
            className="font-heading"
            style={{ fontSize: '20px', fontWeight: 500, color: 'var(--text-h)' }}
          >
            {profile.seeds_balance}
          </span>
          <span
            className="font-label uppercase"
            style={{ fontSize: '9px', fontWeight: 500, letterSpacing: '1px', color: 'var(--text-muted)' }}
          >
            Seeds
          </span>
          <Icon name="chevron-right" size={10} style={{ color: 'var(--text-muted)' }} />
        </button>

        {/* Separator — Mockup: 1px × 18px */}
        <div
          style={{
            width: '1px',
            height: '18px',
            background: 'var(--divider-l)',
            flexShrink: 0,
          }}
        />

        {/* Einladungen Tap */}
        <button
          onClick={onReferralClick}
          className="private-tap flex items-center cursor-pointer transition-all duration-200"
          style={{
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '20px',
            background: 'transparent',
            border: 'none',
          }}
        >
          <Icon name="users" size={14} style={{ color: 'var(--text-sec)' }} />
          <span
            className="font-heading"
            style={{ fontSize: '20px', fontWeight: 500, color: 'var(--text-h)' }}
          >
            0
          </span>
          <span
            className="font-label uppercase"
            style={{ fontSize: '9px', fontWeight: 500, letterSpacing: '1px', color: 'var(--text-muted)' }}
          >
            Einladungen
          </span>
          <Icon name="chevron-right" size={10} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* ─── Hint — Mockup: "Nur für dich sichtbar" ─── */}
      <div
        className="text-center font-label"
        style={{
          fontSize: '9px',
          fontWeight: 400,
          letterSpacing: '0.8px',
          color: 'var(--text-muted)',
          marginTop: '12px',
          opacity: 0.7,
        }}
      >
        Nur fuer dich sichtbar
      </div>
    </div>
  );
}
