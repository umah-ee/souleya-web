'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoursRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  const [selectedHour, setSelectedHour] = useState<number | null>(
    value ? parseInt(value.split(':')[0], 10) : null,
  );
  const [selectedMinute, setSelectedMinute] = useState<number | null>(
    value ? parseInt(value.split(':')[1], 10) : null,
  );

  // Position berechnen
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 200),
    });
  }, []);

  // Click outside schliesst
  useEffect(() => {
    if (!open) return;
    updatePosition();
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  // Auto-scroll zur ausgewaehlten Stunde
  useEffect(() => {
    if (!open || mode !== 'hour') return;
    const container = hoursRef.current;
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

  const dropdown = open ? createPortal(
    <div
      ref={dropdownRef}
      className="rounded-[8px] overflow-hidden"
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        width: pos.width,
        zIndex: 9999,
        background: 'var(--bg-solid)',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
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
          className="flex-1 py-1.5 rounded-[6px] text-center font-label text-[0.6rem] tracking-[0.1em] uppercase cursor-pointer transition-all"
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
          className="flex-1 py-1.5 rounded-[6px] text-center font-label text-[0.6rem] tracking-[0.1em] uppercase cursor-pointer transition-all"
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
        <div ref={hoursRef} className="grid grid-cols-4 gap-1 p-2.5 max-h-[200px] overflow-y-auto">
          {HOURS.map((h) => {
            const isSelected = h === selectedHour;
            return (
              <button
                key={h}
                type="button"
                data-selected={isSelected}
                onClick={() => handleSelectHour(h)}
                className="py-1.5 rounded-[6px] text-sm font-body text-center cursor-pointer transition-all duration-200"
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
        <div className="grid grid-cols-4 gap-1 p-2.5">
          {MINUTES.map((m) => {
            const isSelected = m === selectedMinute;
            return (
              <button
                key={m}
                type="button"
                data-selected={isSelected}
                onClick={() => handleSelectMinute(m)}
                className="py-1.5 rounded-[6px] text-sm font-body text-center cursor-pointer transition-all duration-200"
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
    </div>,
    document.body,
  ) : null;

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Input */}
      <button
        ref={triggerRef}
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

      {dropdown}
    </div>
  );
}
