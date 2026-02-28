'use client';

import { useState } from 'react';
import { createChallenge } from '@/lib/challenges';
import type { Challenge, CreateChallengeData } from '@/types/challenges';
import { Icon } from '@/components/ui/Icon';

interface Props {
  onClose: () => void;
  onCreated: (challenge: Challenge) => void;
  channelId?: string;
}

const PRESET_EMOJIS = [
  '\u{1F9D8}', '\u{1F3C3}', '\u{1F4AA}', '\u{1F343}', '\u{1F4D6}',
  '\u270D\uFE0F', '\u{1F9E0}', '\u{1F4A4}', '\u{1F957}', '\u{1F3AF}',
  '\u{1F525}', '\u{1F54A}\uFE0F', '\u{1F49B}', '\u2728', '\u{1F30A}', '\u{1FAC1}',
];

const DURATION_PRESETS = [7, 14, 21, 30, 90];

export default function CreateChallengeModal({ onClose, onCreated, channelId }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('\u{1F3AF}');
  const [selectedDuration, setSelectedDuration] = useState<number | null>(21);
  const [customDuration, setCustomDuration] = useState('');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [maxParticipants, setMaxParticipants] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const effectiveDuration =
    selectedDuration ?? (customDuration ? parseInt(customDuration, 10) : 0);

  const canSubmit = title.trim().length > 0 && effectiveDuration > 0 && !saving;

  const handleSubmit = async () => {
    setError('');

    if (!title.trim()) {
      setError('Bitte gib einen Titel ein.');
      return;
    }
    if (title.trim().length > 200) {
      setError('Der Titel darf maximal 200 Zeichen lang sein.');
      return;
    }
    if (!effectiveDuration || effectiveDuration < 1) {
      setError('Bitte waehle eine Dauer.');
      return;
    }
    if (effectiveDuration > 365) {
      setError('Die Dauer darf maximal 365 Tage betragen.');
      return;
    }

    const data: CreateChallengeData = {
      title: title.trim(),
      description: description.trim() || undefined,
      emoji: selectedEmoji,
      duration_days: effectiveDuration,
      starts_at: startDate || undefined,
      max_participants: maxParticipants
        ? parseInt(maxParticipants, 10)
        : undefined,
      channel_id: channelId,
    };

    setSaving(true);
    try {
      const challenge = await createChallenge(data);
      onCreated(challenge);
      onClose();
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error
          ? e.message
          : 'Challenge konnte nicht erstellt werden. Bitte versuche es erneut.',
      );
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--glass)',
    border: '1px solid var(--glass-border)',
    borderRadius: 8,
    color: 'var(--text-h)',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,.55)' }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl overflow-hidden mx-4 max-w-lg w-full max-h-[90vh] flex flex-col"
        style={{
          background: 'var(--bg-solid)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold-Leiste */}
        <div
          className="h-[2px] flex-shrink-0"
          style={{
            background:
              'linear-gradient(to right, transparent, var(--gold-glow), transparent)',
          }}
        />

        {/* Header */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between flex-shrink-0">
          <h2
            className="font-heading text-lg"
            style={{ color: 'var(--text-h)' }}
          >
            Neue Challenge
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0"
            style={{ background: 'var(--glass)', color: 'var(--text-muted)' }}
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Scrollbarer Body */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-5">
          {/* Titel */}
          <div>
            <label
              className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              Titel *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 200))}
              placeholder="z.B. 21 Tage Meditation"
              maxLength={200}
              className="w-full py-2.5 px-4 text-sm font-body outline-none"
              style={inputStyle}
            />
            <span
              className="block text-right text-[0.55rem] font-label mt-0.5"
              style={{ color: 'var(--text-muted)' }}
            >
              {title.length}/200
            </span>
          </div>

          {/* Beschreibung */}
          <div>
            <label
              className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              Beschreibung
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 3000))}
              placeholder="Worum geht es bei dieser Challenge?"
              rows={3}
              maxLength={3000}
              className="w-full py-2.5 px-4 text-sm font-body outline-none resize-none"
              style={inputStyle}
            />
            <span
              className="block text-right text-[0.55rem] font-label mt-0.5"
              style={{ color: 'var(--text-muted)' }}
            >
              {description.length}/3000
            </span>
          </div>

          {/* Emoji Picker */}
          <div>
            <label
              className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              Emoji
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_EMOJIS.map((emoji) => {
                const isSelected = selectedEmoji === emoji;
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl cursor-pointer transition-all duration-150"
                    style={{
                      background: isSelected ? 'var(--gold-bg)' : 'var(--glass)',
                      border: isSelected
                        ? '1.5px solid var(--gold)'
                        : '1px solid var(--glass-border)',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dauer */}
          <div>
            <label
              className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              Dauer *
            </label>
            <div className="flex flex-wrap gap-2">
              {DURATION_PRESETS.map((d) => {
                const isSelected = selectedDuration === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setSelectedDuration(d);
                      setCustomDuration('');
                    }}
                    className="px-4 py-2 font-label text-[0.7rem] tracking-[0.08em] uppercase cursor-pointer transition-all duration-150"
                    style={{
                      borderRadius: 9999,
                      background: isSelected
                        ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))'
                        : 'var(--glass)',
                      color: isSelected
                        ? 'var(--text-on-gold)'
                        : 'var(--text-muted)',
                      border: isSelected
                        ? 'none'
                        : '1px solid var(--glass-border)',
                    }}
                  >
                    {d} Tage
                  </button>
                );
              })}
              {/* Benutzerdefinierte Dauer */}
              <div
                className="flex items-center gap-1.5 px-3 py-1.5"
                style={{
                  borderRadius: 9999,
                  background:
                    selectedDuration === null
                      ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))'
                      : 'var(--glass)',
                  border:
                    selectedDuration === null
                      ? 'none'
                      : '1px solid var(--glass-border)',
                }}
              >
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={customDuration}
                  onChange={(e) => {
                    setCustomDuration(e.target.value);
                    setSelectedDuration(null);
                  }}
                  onFocus={() => setSelectedDuration(null)}
                  placeholder="Eigene"
                  className="w-16 bg-transparent font-label text-[0.7rem] outline-none text-center"
                  style={{
                    color:
                      selectedDuration === null
                        ? 'var(--text-on-gold)'
                        : 'var(--text-muted)',
                  }}
                />
                <span
                  className="font-label text-[0.65rem]"
                  style={{
                    color:
                      selectedDuration === null
                        ? 'var(--text-on-gold)'
                        : 'var(--text-muted)',
                  }}
                >
                  Tage
                </span>
              </div>
            </div>
          </div>

          {/* Startdatum */}
          <div>
            <label
              className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              Startdatum
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full py-2.5 px-4 text-sm font-body outline-none"
              style={{
                ...inputStyle,
                colorScheme: 'dark',
              }}
            />
          </div>

          {/* Max Teilnehmer */}
          <div>
            <label
              className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              Max. Teilnehmer (optional)
            </label>
            <input
              type="number"
              min={2}
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              placeholder="Unbegrenzt"
              className="w-full py-2.5 px-4 text-sm font-body outline-none"
              style={inputStyle}
            />
          </div>

          {/* Fehlermeldung */}
          {error && (
            <div
              className="text-sm font-body px-3 py-2 rounded-lg"
              style={{
                background: 'rgba(220,38,38,0.1)',
                color: 'var(--error)',
                border: '1px solid rgba(220,38,38,0.2)',
              }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-3 rounded-full font-label text-[0.7rem] tracking-[0.12em] uppercase transition-all duration-200"
            style={{
              background: canSubmit
                ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))'
                : 'var(--glass)',
              color: canSubmit ? 'var(--text-on-gold)' : 'var(--text-muted)',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              border: canSubmit ? 'none' : '1px solid var(--glass-border)',
            }}
          >
            {saving ? 'Wird erstellt ...' : 'Challenge starten'}
          </button>
        </div>
      </div>
    </div>
  );
}
