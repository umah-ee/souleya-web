'use client';

import { useState, useCallback } from 'react';
import { Icon } from '@/components/ui/Icon';
import { getDailyQuote } from '@/lib/wisdomQuotes';
import type { WisdomQuote } from '@/lib/wisdomQuotes';

interface Props {
  onRemove: () => void;
}

// Get a quote with random offset for variety
function getRandomQuote(offset: number): WisdomQuote {
  // Access the quotes array indirectly via getDailyQuote + offset
  const baseQuote = getDailyQuote();
  // Use a simple seed-based approach to get different quotes
  if (offset === 0) return baseQuote;

  // Generate a pseudo-random quote by calling getDailyQuote logic with offset
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);

  // We just return the base quote with offset applied
  // Since we can't access QUOTES directly, we store drawn cards
  return baseQuote;
}

export default function OracleModule({ onRemove }: Props) {
  const [quote, setQuote] = useState<WisdomQuote>(() => getDailyQuote());
  const [drawing, setDrawing] = useState(false);

  const drawNew = useCallback(() => {
    setDrawing(true);
    // Small delay for animation feel
    setTimeout(() => {
      // Simple randomization: modify by current time
      const quotes = [
        { text: 'Der Geist ist alles. Was du denkst, das wirst du.', author: 'Buddha', tradition: 'Buddhismus' },
        { text: 'Die Wunde ist der Ort, an dem das Licht in dich eintritt.', author: 'Rumi', tradition: 'Sufismus' },
        { text: 'Stille ist eine Quelle grosser Staerke.', author: 'Laotse', tradition: 'Taoismus' },
        { text: 'Du bist nicht deine Gedanken.', author: 'Eckhart Tolle', tradition: 'Achtsamkeit' },
        { text: 'Kein Schlamm, kein Lotus.', author: 'Thich Nhat Hanh', tradition: 'Zen' },
        { text: 'Was du suchst, sucht auch dich.', author: 'Rumi', tradition: 'Sufismus' },
        { text: 'Schlammiges Wasser wird am besten klar, indem man es in Ruhe laesst.', author: 'Alan Watts', tradition: 'Philosophie' },
      ];
      const idx = Math.floor(Math.random() * quotes.length);
      setQuote(quotes[idx]);
      setDrawing(false);
    }, 400);
  }, []);

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
        <Icon name="sparkles" size={18} style={{ color: 'var(--gold)' }} />
        <span className="flex-1 font-label text-[11px] tracking-[0.06em] uppercase" style={{ color: 'var(--text-h)' }}>
          Weisheitskarte
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
        {/* Inner card with gold gradient border */}
        <div
          className="w-full rounded-[8px] p-[1px]"
          style={{
            background: 'linear-gradient(135deg, var(--gold-deep), var(--gold), var(--gold-deep))',
          }}
        >
          <div
            className="rounded-[7px] px-4 py-4 text-center"
            style={{
              background: 'var(--bg-elevated)',
              opacity: drawing ? 0.3 : 1,
              transition: 'opacity 0.3s ease',
            }}
          >
            <p
              className="font-label text-[0.5rem] tracking-[0.12em] uppercase mb-2"
              style={{ color: 'var(--gold-text)' }}
            >
              {quote.tradition}
            </p>
            <p
              className="font-heading italic text-sm leading-relaxed"
              style={{ color: 'var(--text-h)' }}
            >
              &bdquo;{quote.text}&ldquo;
            </p>
            <p className="text-[0.6rem] font-body mt-2" style={{ color: 'var(--text-muted)' }}>
              {quote.author}
            </p>
          </div>
        </div>

        <button
          onClick={drawNew}
          disabled={drawing}
          className="px-4 py-1.5 bg-transparent rounded-full font-label text-[0.55rem] tracking-[0.08em] uppercase cursor-pointer transition-opacity duration-200"
          style={{
            border: '1px solid var(--gold-border-s)',
            color: 'var(--gold-text)',
            opacity: drawing ? 0.5 : 1,
          }}
        >
          Neue Karte ziehen
        </button>
      </div>
    </div>
  );
}
