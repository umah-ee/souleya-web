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
    <form onSubmit={handleSubmit} className="bg-dark rounded-2xl border border-gold-1/15 p-5 mb-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Teile einen Gedanken, eine Erfahrung, einen Impuls …"
        maxLength={maxLen}
        rows={3}
        className="w-full bg-transparent border-none resize-none text-[#F0EDE8] font-body text-[0.95rem] font-light leading-[1.8] outline-none placeholder:text-[#5A5450]"
      />
      <div className="flex items-center justify-between pt-3 border-t border-gold-1/[0.08] mt-2">
        <span className={`text-[0.7rem] font-label ${content.length > maxLen * 0.9 ? 'text-[#F4A261]' : 'text-[#5A5450]'}`}>
          {content.length} / {maxLen}
        </span>
        <div className="flex gap-2 items-center">
          {error && <span className="text-[#E63946] text-xs">{error}</span>}
          <button
            type="submit"
            disabled={isDisabled}
            className={`
              px-5 py-2 border-none rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase transition-all duration-200
              ${isDisabled
                ? 'bg-gold-1/20 text-[#5A5450] cursor-not-allowed'
                : 'bg-gradient-to-br from-gold-3 to-gold-2 text-dark cursor-pointer hover:opacity-90'
              }
            `}
          >
            {loading ? '…' : 'Teilen'}
          </button>
        </div>
      </div>
    </form>
  );
}
