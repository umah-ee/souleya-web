'use client';

import { useState } from 'react';
import { updateProfile } from '@/lib/profile';

interface Props {
  currentBirthday?: string | null;
  onComplete: () => void;
  onBack: () => void;
  isFirst: boolean;
}

// Sternzeichen berechnen
function getZodiacSign(date: string): { sign: string; emoji: string } | null {
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const month = d.getMonth() + 1;
  const day = d.getDate();

  const signs: Array<{ sign: string; emoji: string; from: [number, number]; to: [number, number] }> = [
    { sign: 'Steinbock', emoji: '\u2651', from: [12, 22], to: [1, 19] },
    { sign: 'Wassermann', emoji: '\u2652', from: [1, 20], to: [2, 18] },
    { sign: 'Fische', emoji: '\u2653', from: [2, 19], to: [3, 20] },
    { sign: 'Widder', emoji: '\u2648', from: [3, 21], to: [4, 19] },
    { sign: 'Stier', emoji: '\u2649', from: [4, 20], to: [5, 20] },
    { sign: 'Zwillinge', emoji: '\u264A', from: [5, 21], to: [6, 20] },
    { sign: 'Krebs', emoji: '\u264B', from: [6, 21], to: [7, 22] },
    { sign: 'Loewe', emoji: '\u264C', from: [7, 23], to: [8, 22] },
    { sign: 'Jungfrau', emoji: '\u264D', from: [8, 23], to: [9, 22] },
    { sign: 'Waage', emoji: '\u264E', from: [9, 23], to: [10, 22] },
    { sign: 'Skorpion', emoji: '\u264F', from: [10, 23], to: [11, 21] },
    { sign: 'Schuetze', emoji: '\u2650', from: [11, 22], to: [12, 21] },
  ];

  for (const s of signs) {
    if (s.from[0] === 12 && s.to[0] === 1) {
      // Steinbock: Dezember oder Januar
      if ((month === 12 && day >= s.from[1]) || (month === 1 && day <= s.to[1])) return { sign: s.sign, emoji: s.emoji };
    } else {
      if ((month === s.from[0] && day >= s.from[1]) || (month === s.to[0] && day <= s.to[1])) return { sign: s.sign, emoji: s.emoji };
    }
  }
  return null;
}

export default function StepBirthday({ currentBirthday, onComplete, onBack, isFirst }: Props) {
  const [birthday, setBirthday] = useState(currentBirthday ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const zodiac = birthday ? getZodiacSign(birthday) : null;
  const isValid = !!birthday;

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    setError('');
    try {
      await updateProfile({ birthday });
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <input
        type="date"
        value={birthday}
        onChange={(e) => setBirthday(e.target.value)}
        className="w-full px-3.5 py-3 text-[13px] rounded-lg outline-none"
        style={{
          background: 'var(--bg-tertiary, rgba(255,255,255,0.04))',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'var(--text-body, #D0C8B8)',
          fontFamily: "'Quicksand', sans-serif",
          borderRadius: '8px',
        }}
        onFocus={(e) => e.target.style.borderColor = 'rgba(200,169,110,0.3)'}
        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
      />

      {/* Sternzeichen-Vorschau */}
      {zodiac && (
        <div
          className="flex items-center gap-2.5 mt-3 px-3.5 py-2.5 rounded-xl"
          style={{
            background: 'var(--accent-muted, rgba(200,169,110,0.08))',
            border: '1px solid rgba(200,169,110,0.12)',
          }}
        >
          <span className="text-[22px]">{zodiac.emoji}</span>
          <div>
            <p className="text-[13px] font-medium" style={{ color: 'var(--accent, #C8A96E)' }}>
              {zodiac.sign}
            </p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted, #807870)' }}>
              Dein Sternzeichen wird auf deinem Profil angezeigt
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-[12px] mt-3" style={{ color: '#E57373' }}>{error}</p>
      )}

      {/* Buttons */}
      <div className="flex items-center justify-between mt-5">
        {!isFirst ? (
          <button
            onClick={onBack}
            className="text-[12.5px] border-none bg-transparent cursor-pointer px-3 py-2 rounded-lg transition-colors"
            style={{
              color: 'var(--text-body, #D0C8B8)',
              fontFamily: "'Quicksand', sans-serif",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            ← Zurueck
          </button>
        ) : <span />}
        <button
          onClick={handleSave}
          disabled={!isValid || saving}
          className="font-label text-[0.7rem] tracking-[0.1em] uppercase px-7 py-3 rounded-full border-none cursor-pointer transition-all hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          style={{
            background: isValid && !saving ? 'linear-gradient(135deg, #A8894E, #C8A96E)' : 'var(--bg-tertiary)',
            color: isValid && !saving ? 'var(--text-on-gold, #1A1714)' : 'var(--text-muted)',
            boxShadow: isValid && !saving ? '0 4px 16px rgba(200,169,110,0.25)' : 'none',
            fontWeight: 600,
          }}
        >
          {saving ? '…' : 'Weiter →'}
        </button>
      </div>
    </div>
  );
}
