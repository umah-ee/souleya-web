'use client';

import { Icon } from '@/components/ui/Icon';
import type { WisdomQuote } from '@/lib/wisdomQuotes';

interface Props {
  quote: WisdomQuote;
  onShare?: () => void;
  onSave?: () => void;
  shareState?: 'idle' | 'sharing' | 'shared';
  copied?: boolean;
}

export default function WisdomCard({ quote, onShare, onSave, shareState = 'idle', copied = false }: Props) {
  return (
    <div
      className="rounded-[8px] px-6 py-7 md:px-8 md:py-9 relative overflow-hidden"
      style={{
        background: 'var(--gold-bg)',
        border: '1px solid var(--gold-border-s)',
      }}
    >
      <p
        className="font-label text-[0.55rem] tracking-[0.15em] uppercase mb-3"
        style={{ color: 'var(--gold-text)' }}
      >
        {quote.tradition}
      </p>
      <p
        className="font-heading italic text-xl leading-relaxed"
        style={{ color: 'var(--text-h)' }}
      >
        &bdquo;{quote.text}&ldquo;
      </p>
      <p
        className="font-body text-xs mt-3"
        style={{ color: 'var(--text-muted)' }}
      >
        {quote.author}
      </p>

      <div className="flex items-center gap-2 mt-5">
        {onShare && (
          <button
            onClick={onShare}
            disabled={shareState !== 'idle'}
            className="flex items-center gap-1.5 px-3.5 py-1.5 border-none rounded-full font-label text-[0.55rem] tracking-[0.08em] uppercase cursor-pointer transition-opacity duration-200"
            style={{
              background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
              color: 'var(--text-on-gold)',
              opacity: shareState === 'sharing' ? 0.5 : 1,
            }}
          >
            <Icon name="edit" size={12} />
            {shareState === 'shared' ? 'Geteilt' : 'Im Feed teilen'}
          </button>
        )}
        {onSave && (
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-transparent rounded-full font-label text-[0.55rem] tracking-[0.08em] uppercase cursor-pointer transition-opacity duration-200"
            style={{
              border: '1px solid var(--gold-border-s)',
              color: 'var(--gold-text)',
            }}
          >
            <Icon name={copied ? 'check' : 'share'} size={12} />
            {copied ? 'Kopiert' : 'Teilen'}
          </button>
        )}
      </div>
    </div>
  );
}
