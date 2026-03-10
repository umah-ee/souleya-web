'use client';

import type { Profile } from '@/types/profile';
import { Icon } from '@/components/ui/Icon';

interface ProfilePrivateRowProps {
  profile: Profile;
  onSeedsClick: () => void;
  onReferralClick: () => void;
}

export default function ProfilePrivateRow({
  profile,
  onSeedsClick,
  onReferralClick,
}: ProfilePrivateRowProps) {
  return (
    <div className="px-6 mt-10 mb-8">
      {/* ─── Gradient Divider ─── */}
      <div
        className="h-px mx-auto max-w-[200px] mb-8"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--gold-border-s), transparent)',
        }}
      />

      {/* ─── Chips Row ─── */}
      <div className="flex justify-center gap-3">
        {/* Seeds Chip */}
        <button
          onClick={onSeedsClick}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full cursor-pointer transition-all duration-200 hover:scale-[1.02]"
          style={{
            background: 'var(--gold-bg)',
            border: '1px solid var(--gold-border-s)',
            color: 'var(--gold-text)',
          }}
        >
          <Icon name="seed" size={14} />
          <span className="text-[13px] font-body">{profile.seeds_balance}</span>
          <span
            className="text-[10px] font-label tracking-[0.8px] uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            Seeds
          </span>
        </button>

        {/* Einladungen Chip */}
        <button
          onClick={onReferralClick}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full cursor-pointer transition-all duration-200 hover:scale-[1.02]"
          style={{
            background: 'var(--glass)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-sec)',
          }}
        >
          <Icon name="users" size={14} />
          <span className="text-[10px] font-label tracking-[0.8px] uppercase">
            Einladungen
          </span>
        </button>
      </div>
    </div>
  );
}
