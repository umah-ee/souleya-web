'use client';

import { Icon } from '@/components/ui/Icon';
import type { WisdomQuote } from '@/lib/wisdomQuotes';

// ── Traditions-Bilder (Unsplash, lizenzfrei) ─────────────────
// Passende Stimmungsbilder pro Tradition fuer die Wisdom Card
const TRADITION_IMAGES: Record<string, string> = {
  'Buddhismus': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=1000&fit=crop',
  'Taoismus': 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&h=1000&fit=crop',
  'Sufismus': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop',
  'Yoga': 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&h=1000&fit=crop',
  'Philosophie': 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800&h=1000&fit=crop',
  'Stoizismus': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=1000&fit=crop',
  'Hinduismus': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1000&fit=crop',
  'Achtsamkeit': 'https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=800&h=1000&fit=crop',
  'Psychologie': 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&h=1000&fit=crop',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=1000&fit=crop';

interface Props {
  quote: WisdomQuote;
  onShare?: () => void;
  onSave?: () => void;
  shareState?: 'idle' | 'sharing' | 'shared';
  copied?: boolean;
}

export default function WisdomCard({ quote, onShare, onSave, shareState = 'idle', copied = false }: Props) {
  const bgImage = TRADITION_IMAGES[quote.tradition] ?? DEFAULT_IMAGE;

  return (
    <div
      className="rounded-[8px] relative overflow-hidden"
      style={{ aspectRatio: '4 / 5', maxHeight: '420px' }}
    >
      {/* Hintergrundbild */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bgImage}
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover block"
      />

      {/* Dunkler Gradient-Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.75) 100%)',
        }}
      />

      {/* Inhalt am unteren Rand */}
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        {/* Tradition Label */}
        <p
          className="font-label text-[9px] tracking-[0.12em] uppercase mb-2.5"
          style={{ color: 'var(--gold)' }}
        >
          {quote.tradition}
        </p>

        {/* Zitat */}
        <p
          className="font-heading italic text-[22px] leading-[1.4]"
          style={{ color: '#fff' }}
        >
          &bdquo;{quote.text}&ldquo;
        </p>

        {/* Autor */}
        <p
          className="font-body text-xs mt-2 mb-4"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          {quote.author}
        </p>

        {/* Teilen-Button rechts, ueber dem Branding */}
        {onShare && (
          <div className="flex justify-end" style={{ marginBottom: '30px' }}>
            <button
              onClick={onShare}
              disabled={shareState !== 'idle'}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full font-body text-xs font-semibold cursor-pointer transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                opacity: shareState === 'sharing' ? 0.5 : 1,
              }}
            >
              <Icon name="share" size={14} style={{ color: '#fff' }} />
              {shareState === 'shared' ? 'Geteilt' : 'Teilen'}
            </button>
          </div>
        )}
      </div>

      {/* Souleya Branding am unteren Rand */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 py-2.5"
        style={{
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="9" strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15" />
        </svg>
        <span
          className="font-heading"
          style={{ fontSize: '13px', letterSpacing: '3px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}
        >
          Souleya
        </span>
      </div>
    </div>
  );
}
