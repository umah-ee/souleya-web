'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';

interface Props {
  onRemove: () => void;
}

interface MoodOption {
  icon: IconName;
  label: string;
  key: string;
}

const MOODS: MoodOption[] = [
  { icon: 'moon', key: 'exhausted', label: 'Erschoepft' },
  { icon: 'clock', key: 'okay', label: 'Okay' },
  { icon: 'face-smile', key: 'good', label: 'Gut' },
  { icon: 'sun', key: 'great', label: 'Super' },
  { icon: 'sparkles', key: 'radiant', label: 'Strahlend' },
];

const STORAGE_KEY = 'souleya_checkin';

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function CheckinModule({ onRemove }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.date === getTodayKey()) {
          setSelected(parsed.mood);
        }
      }
    } catch { /* noop */ }
  }, []);

  const handleSelect = (key: string) => {
    setSelected(key);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: getTodayKey(), mood: key }));
    } catch { /* noop */ }
  };

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
        <Icon name="face-smile" size={18} style={{ color: 'var(--gold)' }} />
        <span className="flex-1 font-label text-[11px] tracking-[0.06em] uppercase" style={{ color: 'var(--text-h)' }}>
          Check-in
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
        <p className="font-heading italic text-sm" style={{ color: 'var(--text-sec)' }}>
          Wie fuehlst du dich gerade?
        </p>

        <div className="flex gap-2 justify-center">
          {MOODS.map((mood) => {
            const isActive = selected === mood.key;
            return (
              <button
                key={mood.key}
                onClick={() => handleSelect(mood.key)}
                className="flex flex-col items-center gap-1 px-2 py-2 rounded-[8px] cursor-pointer transition-all duration-150 border-none"
                style={{
                  background: isActive ? 'var(--gold-bg)' : 'transparent',
                  border: isActive ? '1px solid var(--gold-border-s)' : '1px solid transparent',
                }}
              >
                <Icon
                  name={mood.icon}
                  size={24}
                  style={{ color: isActive ? 'var(--gold)' : 'var(--text-muted)' }}
                />
                <span
                  className="font-label text-[8px] tracking-[0.04em] uppercase"
                  style={{ color: isActive ? 'var(--gold-text)' : 'var(--text-muted)' }}
                >
                  {mood.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
