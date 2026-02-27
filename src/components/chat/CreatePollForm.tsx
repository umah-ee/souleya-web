'use client';

import { useState } from 'react';
import type { Message } from '@/types/chat';
import { createPoll } from '@/lib/chat';
import { Icon } from '@/components/ui/Icon';

interface Props {
  channelId: string;
  onCreated: (msg: Message) => void;
  onCancel: () => void;
}

export default function CreatePollForm({ channelId, onCreated, onCancel }: Props) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [sending, setSending] = useState(false);

  const addOption = () => {
    if (options.length >= 10) return;
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    setOptions(options.map((o, i) => (i === index ? value : o)));
  };

  const canSubmit = question.trim() && options.filter((o) => o.trim()).length >= 2 && !sending;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSending(true);
    try {
      const msg = await createPoll(channelId, {
        question: question.trim(),
        options: options.filter((o) => o.trim()),
        multiple_choice: multipleChoice,
      });
      onCreated(msg);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="px-4 py-3 shrink-0"
      style={{ borderTop: '1px solid var(--divider-l)' }}
    >
      <div
        className="rounded-2xl p-4"
        style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="font-label text-[0.65rem] tracking-[0.15em] uppercase"
            style={{ color: 'var(--gold-text)' }}
          >
            Abstimmung erstellen
          </span>
          <button onClick={onCancel} className="cursor-pointer p-0.5" style={{ color: 'var(--text-muted)' }}>
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Frage */}
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Frage stellen ..."
          maxLength={500}
          className="w-full px-3 py-2 text-sm font-body outline-none mb-3"
          style={{
            background: 'var(--input-bg)',
            border: '1px solid var(--input-border)',
            borderRadius: '8px',
            color: 'var(--text-body)',
          }}
          autoFocus
        />

        {/* Optionen */}
        <div className="space-y-2 mb-3">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                maxLength={200}
                className="flex-1 px-3 py-1.5 text-sm font-body outline-none"
                style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  borderRadius: '8px',
                  color: 'var(--text-body)',
                }}
              />
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(i)}
                  className="p-1 cursor-pointer shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Icon name="x" size={12} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Option hinzufuegen */}
        {options.length < 10 && (
          <button
            onClick={addOption}
            className="flex items-center gap-1.5 mb-3 cursor-pointer"
            style={{ color: 'var(--gold-text)' }}
          >
            <Icon name="plus" size={12} />
            <span className="text-[11px] font-label tracking-[0.05em]">Option hinzufuegen</span>
          </button>
        )}

        {/* Mehrfachauswahl */}
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={multipleChoice}
            onChange={(e) => setMultipleChoice(e.target.checked)}
            className="accent-[#C8A96E]"
          />
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Mehrfachauswahl erlauben</span>
        </label>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--glass-border)' }}
          >
            Abbrechen
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 py-2 rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer transition-all"
            style={{
              background: canSubmit
                ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))'
                : 'var(--gold-bg)',
              color: canSubmit ? 'var(--text-on-gold)' : 'var(--text-muted)',
              opacity: canSubmit ? 1 : 0.5,
            }}
          >
            {sending ? 'Wird erstellt ...' : 'Abstimmung starten'}
          </button>
        </div>
      </div>
    </div>
  );
}
