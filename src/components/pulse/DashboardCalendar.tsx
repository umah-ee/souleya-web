'use client';

import { useState, useMemo } from 'react';
import { Icon } from '@/components/ui/Icon';

interface Props {
  /** Dates that have events (ISO strings) */
  eventDates: string[];
  /** Called when user clicks a day that has events */
  onDayClick?: (date: string) => void;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  // 0 = Sunday, we want Monday = 0
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

export default function DashboardCalendar({ eventDates, onDayClick }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // Build set of event day keys: "YYYY-MM-DD"
  const eventDaySet = useMemo(() => {
    const set = new Set<string>();
    for (const iso of eventDates) {
      set.add(iso.slice(0, 10));
    }
    return set;
  }, [eventDates]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const handlePrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handlePrev}
          className="w-6 h-6 flex items-center justify-center rounded-full cursor-pointer transition-colors duration-200"
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Icon name="chevron-left" size={14} />
        </button>
        <span
          className="font-label text-[0.6rem] tracking-[0.12em] uppercase"
          style={{ color: 'var(--text-h)' }}
        >
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={handleNext}
          className="w-6 h-6 flex items-center justify-center rounded-full cursor-pointer transition-colors duration-200"
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Icon name="chevron-right" size={14} />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-0 mb-1">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="text-center font-label text-[0.5rem] tracking-[0.1em] uppercase py-1"
            style={{ color: 'var(--text-muted)' }}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Day Grid */}
      <div className="grid grid-cols-7 gap-0">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="h-8" />;
          }

          const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateKey === todayKey;
          const hasEvent = eventDaySet.has(dateKey);

          return (
            <button
              key={dateKey}
              onClick={() => hasEvent && onDayClick?.(dateKey)}
              className="relative flex flex-col items-center justify-center h-8 rounded-full transition-colors duration-150"
              style={{
                background: isToday ? 'var(--gold-bg)' : 'transparent',
                border: 'none',
                cursor: hasEvent ? 'pointer' : 'default',
              }}
            >
              <span
                className="text-xs font-body leading-none"
                style={{
                  color: isToday ? 'var(--gold-text)' : 'var(--text-sec)',
                  fontWeight: isToday ? 600 : 400,
                }}
              >
                {day}
              </span>
              {/* Event dot */}
              {hasEvent && (
                <span
                  className="absolute bottom-0.5 w-1 h-1 rounded-full"
                  style={{ background: 'var(--gold)' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
