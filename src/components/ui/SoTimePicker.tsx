'use client';

import { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';

interface Props {
  value: string; // HH:MM
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export default function SoTimePicker({ value, onChange, placeholder = 'Uhrzeit waehlen', className = '', style }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'hour' | 'minute'>('hour');
  const ref = useRef<HTMLDivElement>(null);
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  const [selectedHour, setSelectedHour] = useState<number | null>(
    value ? parseInt(value.split(':')[0], 10) : null,
  );
  const [selectedMinute, setSelectedMinute] = useState<number | null>(
    value ? parseInt(value.split(':')[1], 10) : null,
  );

  // Click outside schließt
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Auto-scroll zur ausgewaehlten Stunde/Minute
  useEffect(() => {
    if (!open) return;
    const container = mode === 'hour' ? hoursRef.current : minutesRef.current;
    if (!container) return;
    const selected = container.querySelector('[data-selected="true"]') as HTMLElement | null;
    if (selected) {
      selected.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
  }, [open, mode]);

  const handleSelectHour = (h: number) => {
    setSelectedHour(h);
    setMode('minute');
  };

  const handleSelectMinute = (m: number) => {
    setSelectedMinute(m);
    const hour = selectedHour ?? 0;
    onChange(`${pad(hour)}:${pad(m)}`);
    setOpen(false);
    setMode('hour');
  };

  const handleOpen = () => {
    setMode('hour');
    setOpen(!open);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger Input */}
      <button
        type="button"
        onClick={handleOpen}
        className="w-full py-2.5 px-4 rounded-[8px] text-sm font-body outline-none text-left flex items-center gap-2 cursor-pointer"
        style={{
          background: 'var(--glass)',
          border: '1px solid var(--gold-border-s)',
          color: value ? 'var(--text-h)' : 'var(--text-muted)',
          ...style,
        }}
      >
        <Icon name="clock" size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />
        <span className="flex-1">{value || placeholder}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl overflow-hidden"
          style={{
            background: 'var(--bg-solid)',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            minWidth: '180px',
          }}
        >
          {/* Gold-Leiste */}
          <div
            className="h-[2px]"
            style={{ background: 'linear-gradient(to right, transparent, var(--gold-glow), transparent)' }}
          />

          {/* Tab Header */}
          <div className="flex px-2 pt-2 gap-1">
            <button
              type="button"
              onClick={() => setMode('hour')}
              className="flex-1 py-1.5 rounded-lg text-center font-label text-[0.6rem] tracking-[0.1em] uppercase cursor-pointer transition-all"
              style={{
                background: mode === 'hour' ? 'var(--gold-bg)' : 'transparent',
                color: mode === 'hour' ? 'var(--gold-text)' : 'var(--text-muted)',
              }}
            >
              Stunde
            </button>
            <button
              type="button"
              onClick={() => setMode('minute')}
              className="flex-1 py-1.5 rounded-lg text-center font-label text-[0.6rem] tracking-[0.1em] uppercase cursor-pointer transition-all"
              style={{
                background: mode === 'minute' ? 'var(--gold-bg)' : 'transparent',
                color: mode === 'minute' ? 'var(--gold-text)' : 'var(--text-muted)',
              }}
            >
              Minute
            </button>
          </div>

          {/* Hours Grid */}
          {mode === 'hour' && (
            <div ref={hoursRef} className="grid grid-cols-4 gap-1 p-3 max-h-[200px] overflow-y-auto">
              {HOURS.map((h) => {
                const isSelected = h === selectedHour;
                return (
                  <button
                    key={h}
                    type="button"
                    data-selected={isSelected}
                    onClick={() => handleSelectHour(h)}
                    className="py-2 rounded-lg text-sm font-body text-center cursor-pointer transition-all duration-200"
                    style={{
                      background: isSelected
                        ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))'
                        : 'var(--glass)',
                      color: isSelected ? 'var(--text-on-gold)' : 'var(--text-h)',
                      boxShadow: isSelected ? '0 0 8px rgba(200,169,110,0.3)' : 'none',
                    }}
                  >
                    {pad(h)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Minutes Grid */}
          {mode === 'minute' && (
            <div ref={minutesRef} className="grid grid-cols-4 gap-1 p-3">
              {MINUTES.map((m) => {
                const isSelected = m === selectedMinute;
                return (
                  <button
                    key={m}
                    type="button"
                    data-selected={isSelected}
                    onClick={() => handleSelectMinute(m)}
                    className="py-2 rounded-lg text-sm font-body text-center cursor-pointer transition-all duration-200"
                    style={{
                      background: isSelected
                        ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))'
                        : 'var(--glass)',
                      color: isSelected ? 'var(--text-on-gold)' : 'var(--text-h)',
                      boxShadow: isSelected ? '0 0 8px rgba(200,169,110,0.3)' : 'none',
                    }}
                  >
                    {pad(m)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
