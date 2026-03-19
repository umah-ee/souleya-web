'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';

interface Props {
  onRemove: () => void;
}

const STORAGE_KEY = 'souleya_gratitude';

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function GratitudeModule({ onRemove }: Props) {
  const [entries, setEntries] = useState(['', '', '']);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.date === getTodayKey()) {
          setEntries(parsed.entries);
          setSaved(true);
        }
      }
    } catch { /* noop */ }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: getTodayKey(), entries }));
      setSaved(true);
    } catch { /* noop */ }
  };

  const hasContent = entries.some((e) => e.trim().length > 0);

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
        <Icon name="heart" size={18} style={{ color: 'var(--gold)' }} />
        <span className="flex-1 font-label text-[11px] tracking-[0.06em] uppercase" style={{ color: 'var(--text-h)' }}>
          Dankbarkeit
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
      <div className="px-4 pb-4 pt-3 flex flex-col gap-3">
        <p className="font-heading italic text-sm" style={{ color: 'var(--text-sec)' }}>
          Wofuer bist du heute dankbar?
        </p>

        {entries.map((entry, i) => (
          <input
            key={i}
            type="text"
            value={entry}
            onChange={(e) => {
              const next = [...entries];
              next[i] = e.target.value;
              setEntries(next);
              setSaved(false);
            }}
            placeholder={`${i + 1}. \u2026`}
            className="w-full px-3 py-2 rounded-[8px] text-xs font-body outline-none"
            style={{
              background: 'var(--input-bg, var(--glass))',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-h)',
            }}
          />
        ))}

        <button
          onClick={handleSave}
          disabled={!hasContent || saved}
          className="self-start px-4 py-1.5 border-none rounded-full font-label text-[0.55rem] tracking-[0.08em] uppercase cursor-pointer transition-opacity duration-200"
          style={{
            background: saved
              ? 'var(--gold-bg)'
              : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
            color: saved ? 'var(--gold-text)' : 'var(--text-on-gold)',
            opacity: !hasContent ? 0.4 : 1,
          }}
        >
          {saved ? 'Gespeichert' : 'Speichern'}
        </button>
      </div>
    </div>
  );
}
