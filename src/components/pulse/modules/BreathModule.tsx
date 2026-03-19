'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';

interface Props {
  onRemove: () => void;
}

type BreathMode = 'box' | '478' | 'wimhof';

const MODES: { key: BreathMode; label: string; duration: string }[] = [
  { key: 'box', label: 'Box', duration: '3 Min' },
  { key: '478', label: '4-7-8', duration: '4 Min' },
  { key: 'wimhof', label: 'Wim Hof', duration: '5 Min' },
];

export default function BreathModule({ onRemove }: Props) {
  const [mode, setMode] = useState<BreathMode>('box');
  const currentMode = MODES.find((m) => m.key === mode)!;

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
        <Icon name="droplet" size={18} style={{ color: 'var(--gold)' }} />
        <span className="flex-1 font-label text-[11px] tracking-[0.06em] uppercase" style={{ color: 'var(--text-h)' }}>
          Atemuebung
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
        {/* Animated Circle */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            border: '3px solid var(--gold)',
            animation: 'breathe-circle 8s ease-in-out infinite',
          }}
        >
          <Icon name="droplet" size={24} style={{ color: 'var(--gold-text)' }} />
        </div>

        {/* Mode Pills */}
        <div className="flex gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className="px-2.5 py-1 rounded-full font-label text-[0.5rem] tracking-[0.05em] uppercase cursor-pointer border-none transition-all duration-150"
              style={{
                background: mode === m.key ? 'var(--gold-bg)' : 'transparent',
                color: mode === m.key ? 'var(--gold-text)' : 'var(--text-muted)',
                border: mode === m.key ? '1px solid var(--gold-border-s)' : '1px solid var(--glass-border)',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => alert(`${currentMode.label} Atemuebung startet bald`)}
          className="px-4 py-1.5 border-none rounded-full font-label text-[0.55rem] tracking-[0.08em] uppercase cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
            color: 'var(--text-on-gold)',
          }}
        >
          Starten · {currentMode.duration}
        </button>
      </div>
    </div>
  );
}
