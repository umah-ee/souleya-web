'use client';

import { useState } from 'react';
import { createPulse } from '@/lib/pulse';
import type { Pulse } from '@/types/pulse';

interface Props {
  onCreated: (pulse: Pulse) => void;
}

export default function CreatePulseForm({ onCreated }: Props) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const maxLen = 1000;
  const isEmpty = !content.trim();
  const isDisabled = isEmpty || loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled) return;

    setLoading(true);
    setError('');
    try {
      const pulse = await createPulse(content.trim());
      setContent('');
      onCreated(pulse);
    } catch {
      setError('Fehler beim Erstellen. Bitte erneut versuchen.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-5 mb-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Teile einen Gedanken, eine Erfahrung, einen Impuls …"
        maxLength={maxLen}
        rows={3}
        className="w-full bg-transparent border-none resize-none font-body text-[0.95rem] leading-[1.8] outline-none"
        style={{
          color: 'var(--text-h)',
        }}
      />
      <div className="flex items-center justify-between pt-3 mt-2" style={{ borderTop: '1px solid var(--divider-l)' }}>
        <span
          className="text-[0.7rem] font-label"
          style={{ color: content.length > maxLen * 0.9 ? 'var(--warning)' : 'var(--text-muted)' }}
        >
          {content.length} / {maxLen}
        </span>
        <div className="flex gap-2 items-center">
          {error && <span className="text-xs" style={{ color: 'var(--error)' }}>{error}</span>}
          <button
            type="submit"
            disabled={isDisabled}
            className="px-5 py-2 border-none rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase transition-all duration-200"
            style={{
              background: isDisabled ? 'var(--gold-bg)' : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
              color: isDisabled ? 'var(--text-muted)' : 'var(--text-on-gold)',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '…' : 'Teilen'}
          </button>
        </div>
      </div>
    </form>
  );
}
