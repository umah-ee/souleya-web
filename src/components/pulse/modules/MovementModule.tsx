'use client';

import { Icon } from '@/components/ui/Icon';

interface Props {
  onRemove: () => void;
}

export default function MovementModule({ onRemove }: Props) {
  return (
    <div
      className="rounded-[8px] overflow-hidden"
      style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-3">
        <Icon name="run" size={18} style={{ color: 'var(--gold)' }} />
        <span className="flex-1 font-label text-[11px] tracking-[0.06em] uppercase" style={{ color: 'var(--text-h)' }}>
          Bewegung
        </span>
        <button
          onClick={onRemove}
          className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
          style={{ border: '1px solid var(--glass-border)', color: 'var(--text-muted)', background: 'transparent' }}
        >
          <Icon name="x" size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 pb-4 pt-3 flex flex-col items-center gap-3">
        {/* Icon circle */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: 'var(--gold-bg)' }}
        >
          <Icon name="run" size={28} style={{ color: 'var(--gold-text)' }} />
        </div>

        <div className="text-center">
          <p className="text-sm font-body font-medium" style={{ color: 'var(--text-h)' }}>
            Sonnengruss · 5 Minuten
          </p>
          <p className="text-[0.65rem] font-body mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Sanfter Start in den Tag. Folge dem Flow.
          </p>
        </div>

        <button
          onClick={() => alert('Bewegungsuebung startet bald')}
          className="flex items-center gap-1.5 px-4 py-1.5 border-none rounded-full font-label text-[0.55rem] tracking-[0.08em] uppercase cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
            color: 'var(--text-on-gold)',
          }}
        >
          <Icon name="player-play" size={12} />
          Starten
        </button>
      </div>
    </div>
  );
}
