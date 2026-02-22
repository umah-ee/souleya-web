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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

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
    <form onSubmit={handleSubmit} style={{
      backgroundColor: '#2C2A35',
      border: '1px solid rgba(200,169,110,0.15)',
      borderRadius: 16,
      padding: '1.25rem',
      marginBottom: '1.5rem',
    }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Teile einen Gedanken, eine Erfahrung, einen Impuls …"
        maxLength={maxLen}
        rows={3}
        style={{
          width: '100%', background: 'none', border: 'none', resize: 'none',
          color: '#F0EDE8', fontFamily: 'var(--font-body)', fontSize: '0.95rem',
          fontWeight: 300, lineHeight: 1.8, outline: 'none',
        }}
      />
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 12, borderTop: '1px solid rgba(200,169,110,0.08)',
        marginTop: 8,
      }}>
        <span style={{
          fontSize: '0.7rem', color: content.length > maxLen * 0.9 ? '#F4A261' : '#5A5450',
          fontFamily: 'var(--font-label)',
        }}>
          {content.length} / {maxLen}
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {error && <span style={{ color: '#E63946', fontSize: '0.75rem' }}>{error}</span>}
          <button
            type="submit"
            disabled={!content.trim() || loading}
            style={{
              padding: '8px 20px',
              background: !content.trim() || loading
                ? 'rgba(200,169,110,0.2)'
                : 'linear-gradient(135deg, #A8894E, #D4BC8B)',
              border: 'none', borderRadius: 99,
              color: !content.trim() || loading ? '#5A5450' : '#2C2A35',
              fontFamily: 'var(--font-label)', fontSize: '0.7rem',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: !content.trim() || loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loading ? '…' : 'Teilen'}
          </button>
        </div>
      </div>
    </form>
  );
}
