'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';

interface Props {
  onRemove: () => void;
}

const STORAGE_KEY = 'souleya_intention';

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function IntentionModule({ onRemove }: Props) {
  const [intention, setIntention] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.date === getTodayKey()) {
          setIntention(parsed.text);
          setSaved(true);
        }
      }
    } catch { /* noop */ }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: getTodayKey(), text: intention }));
      setSaved(true);
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
        <Icon name="target" size={18} style={{ color: 'var(--gold)' }} />
        <span className="flex-1 font-label text-[11px] tracking-[0.06em] uppercase" style={{ color: 'var(--text-h)' }}>
          Intention
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
        <p className="font-heading italic text-sm text-center" style={{ color: 'var(--text-sec)' }}>
          Was ist deine Intention fuer heute?
        </p>

        <input
          type="text"
          value={intention}
          onChange={(e) => { setIntention(e.target.value); setSaved(false); }}
          placeholder="Heute bin ich \u2026"
          className="w-full px-3 py-2 rounded-[8px] text-xs font-body outline-none text-center"
          style={{
            background: 'var(--input-bg, var(--glass))',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-h)',
          }}
        />

        <button
          onClick={handleSave}
          disabled={!intention.trim() || saved}
          className="px-4 py-1.5 border-none rounded-full font-label text-[0.55rem] tracking-[0.08em] uppercase cursor-pointer transition-opacity duration-200"
          style={{
            background: saved
              ? 'var(--gold-bg)'
              : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
            color: saved ? 'var(--gold-text)' : 'var(--text-on-gold)',
            opacity: !intention.trim() ? 0.4 : 1,
          }}
        >
          {saved ? 'Gesetzt' : 'Setzen'}
        </button>
      </div>
    </div>
  );
}
