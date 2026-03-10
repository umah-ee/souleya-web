'use client';

import type { Profile } from '@/types/profile';
import Panel from '@/components/ui/Panel';
import { Icon, type IconName } from '@/components/ui/Icon';

interface SeedsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
}

export default function SeedsPanel({ isOpen, onClose, profile }: SeedsPanelProps) {
  // Placeholder-Transaktionen (spaeter durch API ersetzen)
  const transactions: { id: number; icon: IconName; title: string; date: string; amount: number }[] = [
    { id: 1, icon: 'gift', title: 'Willkommensbonus', date: 'Maerz 2026', amount: +50 },
    { id: 2, icon: 'users', title: 'Einladung angenommen', date: 'Maerz 2026', amount: +25 },
  ];

  return (
    <Panel isOpen={isOpen} onClose={onClose} title="Seeds">
      {/* ─── Balance ─── */}
      <div className="text-center mb-8">
        <span
          className="text-[48px] font-heading leading-none"
          style={{ color: 'var(--text-h)' }}
        >
          {profile.seeds_balance}
        </span>
        <p
          className="text-[13px] mt-1"
          style={{ color: 'var(--text-sec)' }}
        >
          Seeds
        </p>
        <p
          className="text-[11px] mt-0.5"
          style={{ color: 'var(--text-muted)' }}
        >
          ≈ {(profile.seeds_balance * 0.10).toFixed(2)} EUR
        </p>
      </div>

      {/* ─── Divider ─── */}
      <div
        className="h-px mx-auto max-w-[200px] mb-6"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--gold-border-s), transparent)',
        }}
      />

      {/* ─── Transaktionsverlauf ─── */}
      <p
        className="text-[10px] font-label tracking-[1.2px] uppercase mb-3"
        style={{ color: 'var(--text-muted)' }}
      >
        Verlauf
      </p>

      <div className="space-y-2">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center gap-3 px-3 py-3 rounded-[12px]"
            style={{ background: 'var(--glass)' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--gold-bg)' }}
            >
              <Icon name={tx.icon} size={14} style={{ color: 'var(--gold-text)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] truncate" style={{ color: 'var(--text-h)' }}>{tx.title}</p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{tx.date}</p>
            </div>
            <span
              className="text-[14px] font-heading flex-shrink-0"
              style={{ color: tx.amount > 0 ? 'var(--success)' : 'var(--error)' }}
            >
              {tx.amount > 0 ? '+' : ''}{tx.amount}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
