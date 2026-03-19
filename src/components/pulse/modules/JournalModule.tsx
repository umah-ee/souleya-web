'use client';

import { useState, useEffect, useMemo } from 'react';
import { Icon } from '@/components/ui/Icon';

interface Props {
  onRemove: () => void;
}

const QUESTIONS = [
  'Was beschaeftigt dich gerade?',
  'Wofuer bist du heute besonders dankbar?',
  'Was hast du heute ueber dich gelernt?',
  'Was wuerdest du deinem juengeren Ich sagen?',
  'Welcher Moment hat dich heute beruehrt?',
  'Was brauchst du gerade am meisten?',
  'Was macht dich gerade gluecklich?',
  'Welche Gewohnheit moechtest du veraendern?',
  'Was hat dich heute inspiriert?',
  'Wie moechtest du dich morgen fuehlen?',
];

const STORAGE_KEY = 'souleya_journal';

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function JournalModule({ onRemove }: Props) {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  const question = useMemo(() => {
    const dayOfYear = Math.floor(
      (new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return QUESTIONS[dayOfYear % QUESTIONS.length];
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.date === getTodayKey()) {
          setText(parsed.text);
          setSaved(true);
        }
      }
    } catch { /* noop */ }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: getTodayKey(), text, question }));
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
        <Icon name="book" size={18} style={{ color: 'var(--gold)' }} />
        <span className="flex-1 font-label text-[11px] tracking-[0.06em] uppercase" style={{ color: 'var(--text-h)' }}>
          Journal
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
          {question}
        </p>

        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value.slice(0, 300)); setSaved(false); }}
          rows={3}
          maxLength={300}
          placeholder="Schreib, was dir in den Sinn kommt \u2026"
          className="w-full px-3 py-2 rounded-[8px] text-xs font-body outline-none resize-none"
          style={{
            background: 'var(--input-bg, var(--glass))',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-h)',
          }}
        />

        <div className="flex items-center justify-between">
          <span className="text-[0.5rem] font-label" style={{ color: 'var(--text-muted)' }}>
            {text.length}/300
          </span>
          <button
            onClick={handleSave}
            disabled={!text.trim() || saved}
            className="px-4 py-1.5 border-none rounded-full font-label text-[0.55rem] tracking-[0.08em] uppercase cursor-pointer transition-opacity duration-200"
            style={{
              background: saved
                ? 'var(--gold-bg)'
                : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
              color: saved ? 'var(--gold-text)' : 'var(--text-on-gold)',
              opacity: !text.trim() ? 0.4 : 1,
            }}
          >
            {saved ? 'Eingetragen' : 'Eintragen'}
          </button>
        </div>
      </div>
    </div>
  );
}
