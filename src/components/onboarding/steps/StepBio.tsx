'use client';

import { useState } from 'react';
import { updateProfile } from '@/lib/profile';

const MAX_BIO = 300;
const MIN_BIO = 10;

interface Props {
  currentBio?: string | null;
  onComplete: () => void;
  onBack: () => void;
  isFirst: boolean;
}

export default function StepBio({ currentBio, onComplete, onBack, isFirst }: Props) {
  const [bio, setBio] = useState(currentBio ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isValid = bio.trim().length >= MIN_BIO;

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    setError('');
    try {
      await updateProfile({ bio: bio.trim() });
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO))}
        placeholder="Erzaehl ein bisschen ueber dich … Was bewegt dich? Was suchst du?"
        rows={4}
        className="w-full rounded-lg px-3.5 py-3 text-[13px] leading-relaxed resize-none outline-none transition-all"
        style={{
          background: 'var(--bg-tertiary, rgba(255,255,255,0.06))',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'var(--text-body, #D0C8B8)',
          fontFamily: "'Quicksand', sans-serif",
          borderRadius: '8px',
        }}
        onFocus={(e) => e.target.style.borderColor = 'rgba(200,169,110,0.3)'}
        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
      />

      <div className="flex items-center justify-between mt-1.5 mb-3">
        <p className="text-[11px]" style={{ color: bio.trim().length < MIN_BIO ? 'var(--text-muted)' : 'var(--accent, #C8A96E)' }}>
          {bio.trim().length < MIN_BIO ? `Mindestens ${MIN_BIO} Zeichen` : ''}
        </p>
        <span className="text-[11px]" style={{ color: 'var(--text-muted, #B0A898)' }}>
          {bio.length}/{MAX_BIO}
        </span>
      </div>

      {error && (
        <p className="text-[12px] mb-3" style={{ color: '#E57373' }}>{error}</p>
      )}

      <div className="flex items-center justify-between mt-2">
        {!isFirst ? (
          <button
            onClick={onBack}
            className="text-[12.5px] border-none bg-transparent cursor-pointer px-3 py-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-body, #D0C8B8)', fontFamily: "'Quicksand', sans-serif" }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
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
