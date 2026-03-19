'use client';

import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';

export type DashboardMode = 'morning' | 'evening' | 'still';

interface Props {
  mode: DashboardMode;
  onModeChange: (mode: DashboardMode) => void;
}

const MODES: { key: DashboardMode; icon: IconName; label: string }[] = [
  { key: 'morning', icon: 'sun', label: 'Morgen' },
  { key: 'evening', icon: 'moon', label: 'Abend' },
  { key: 'still', icon: 'clock', label: 'Stille' },
];

export default function ModeToggle({ mode, onModeChange }: Props) {
  return (
    <div
      className="inline-flex rounded-full p-1 gap-1"
      style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
      }}
    >
      {MODES.map((m) => {
        const isActive = mode === m.key;
        return (
          <button
            key={m.key}
            onClick={() => onModeChange(m.key)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-label text-[0.6rem] tracking-[0.06em] uppercase cursor-pointer transition-all duration-200 border-none"
            style={{
              background: isActive
                ? m.key === 'morning'
                  ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))'
                  : m.key === 'evening'
                    ? 'linear-gradient(135deg, rgba(120, 80, 160, 0.4), rgba(80, 60, 130, 0.3))'
                    : 'var(--glass)'
                : 'transparent',
              color: isActive
                ? m.key === 'morning'
                  ? 'var(--text-on-gold)'
                  : 'var(--text-h)'
                : 'var(--text-muted)',
              border: isActive && m.key === 'still' ? '1px solid var(--glass-border)' : '1px solid transparent',
            }}
          >
            <Icon name={m.icon} size={14} />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
