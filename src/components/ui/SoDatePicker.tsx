'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';

interface Props {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;
  className?: string;
  style?: React.CSSProperties;
}

const WEEKDAYS = ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'];
const MONTHS = [
  'Januar', 'Februar', 'Maerz', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Mo=0, So=6
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function SoDatePicker({ value, onChange, placeholder = 'Datum waehlen ...', className = '', style }: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  // Calendar view month/year
  const now = new Date();
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;
  const [viewYear, setViewYear] = useState(selectedDate?.getFullYear() ?? now.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate?.getMonth() ?? now.getMonth());

  // Position berechnen
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 300),
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

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const selectDay = (day: number) => {
    const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
    onChange(dateStr);
    setOpen(false);
  };

  const days = daysInMonth(viewYear, viewMonth);
  const startDay = firstDayOfMonth(viewYear, viewMonth);
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  // Grid: leere Zellen vor dem 1. + Tage
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  const calendarDropdown = open ? createPortal(
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

      {/* Header: Monat + Jahr + Navigation */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <button
          type="button"
          onClick={prevMonth}
          className="w-7 h-7 rounded-[6px] flex items-center justify-center cursor-pointer transition-colors"
          style={{ color: 'var(--text-muted)', background: 'var(--glass)' }}
        >
          <Icon name="arrow-left" size={14} />
        </button>

        <span className="font-heading text-sm" style={{ color: 'var(--text-h)' }}>
          {MONTHS[viewMonth]} {viewYear}
        </span>

        <button
          type="button"
          onClick={nextMonth}
          className="w-7 h-7 rounded-[6px] flex items-center justify-center cursor-pointer transition-colors"
          style={{ color: 'var(--text-muted)', background: 'var(--glass)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
            <path d="M9 6l6 6l-6 6" />
          </svg>
        </button>
      </div>

      {/* Wochentage */}
      <div className="grid grid-cols-7 px-3 pb-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[0.5rem] font-label tracking-[0.1em] uppercase py-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Tage-Grid – kompakter */}
      <div className="grid grid-cols-7 px-3 pb-2.5 gap-y-0">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;
          const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
          const isSelected = dateStr === value;
          const isToday = dateStr === todayStr;
          const isPast = dateStr < todayStr;

          return (
            <button
              key={day}
              type="button"
              disabled={isPast}
              onClick={() => selectDay(day)}
              className="flex items-center justify-center rounded-[6px] text-[13px] font-body transition-all duration-200"
              style={{
                width: '100%',
                height: '32px',
                background: isSelected
                  ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))'
                  : isToday
                    ? 'var(--gold-bg)'
                    : 'transparent',
                color: isSelected
                  ? 'var(--text-on-gold)'
                  : isPast
                    ? 'var(--text-muted)'
                    : isToday
                      ? 'var(--gold-text)'
                      : 'var(--text-h)',
                cursor: isPast ? 'default' : 'pointer',
                opacity: isPast ? 0.35 : 1,
                boxShadow: isSelected ? '0 0 10px rgba(200,169,110,0.3)' : 'none',
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>,
    document.body,
  ) : null;

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Input */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full py-2.5 px-4 rounded-[8px] text-sm font-body outline-none text-left flex items-center gap-2 cursor-pointer"
        style={{
          background: 'var(--glass)',
          border: '1px solid var(--gold-border-s)',
          color: value ? 'var(--text-h)' : 'var(--text-muted)',
          ...style,
        }}
      >
        <Icon name="calendar" size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />
        <span className="flex-1 truncate">{value ? formatDisplay(value) : placeholder}</span>
      </button>

      {calendarDropdown}
    </div>
  );
}
