'use client';

import { useRef, useCallback } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { WisdomQuote } from '@/lib/wisdomQuotes';

// ── Kuratierte Hintergrundbilder (Unsplash) ───────────────────
// Jedes Zitat bekommt deterministisch ein eigenes passendes Bild.
// Die Bilder sind nach Stimmung sortiert: Natur, Stille, Licht, Wasser, Nebel, etc.
const QUOTE_BACKGROUNDS: string[] = [
  // Nebel ueber Bergen
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=1000&fit=crop',
  // Sonnenaufgang ueber dem Meer
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=1000&fit=crop',
  // Stiller Bergsee
  'https://images.unsplash.com/photo-1439853949127-fa647821eba0?w=800&h=1000&fit=crop',
  // Wald mit Lichtstrahlen
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=1000&fit=crop',
  // Lotus auf Wasser
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=1000&fit=crop',
  // Goldene Stunde Wiese
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=1000&fit=crop',
  // Nebel im Wald
  'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&h=1000&fit=crop',
  // Meereswellen sanft
  'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&h=1000&fit=crop',
  // Sternenhimmel
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=1000&fit=crop',
  // Bambus-Wald
  'https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=800&h=1000&fit=crop',
  // Berggipfel Nebel
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=1000&fit=crop',
  // Ruhiger Fluss
  'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800&h=1000&fit=crop',
  // Sand-Duenen
  'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&h=1000&fit=crop',
  // Herbstlaub Wasser
  'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&h=1000&fit=crop',
  // Morgennebel See
  'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&h=1000&fit=crop',
  // Schneebedeckte Berge
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1000&fit=crop',
  // Lavendelfeld
  'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=800&h=1000&fit=crop',
  // Sonnenuntergang Ozean
  'https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?w=800&h=1000&fit=crop',
  // Nebel Tal
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=1000&fit=crop',
  // Kirschblueten
  'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&h=1000&fit=crop',
];

// Deterministisch ein Bild pro Zitat waehlen (basierend auf Text-Hash)
function getQuoteBackground(quote: WisdomQuote): string {
  let hash = 0;
  const str = quote.text + quote.author;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return QUOTE_BACKGROUNDS[Math.abs(hash) % QUOTE_BACKGROUNDS.length];
}

// ── Canvas-basierte Bild-Generierung ──────────────────────────
async function generateCardImage(quote: WisdomQuote, bgUrl: string): Promise<Blob> {
  const W = 1080;
  const H = 1350; // 4:5 Instagram
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Hintergrundbild laden
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Bild konnte nicht geladen werden'));
    img.src = bgUrl;
  });

  // Bild zeichnen (cover)
  const scale = Math.max(W / img.width, H / img.height);
  const sw = W / scale;
  const sh = H / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);

  // Dunkler Gradient-Overlay
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(0,0,0,0.15)');
  grad.addColorStop(0.35, 'rgba(0,0,0,0.35)');
  grad.addColorStop(1, 'rgba(0,0,0,0.82)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Text-Bereich (untere Haelfte)
  const padX = 72;
  const maxW = W - padX * 2;
  let y = H - 260;

  // Tradition Label
  ctx.font = '500 22px "Josefin Sans", sans-serif';
  ctx.fillStyle = '#C8A96E';
  ctx.letterSpacing = '3px';
  ctx.fillText(quote.tradition.toUpperCase(), padX, y);
  y += 42;

  // Zitat (mit Zeilenumbruch)
  ctx.font = 'italic 44px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = '#FFFFFF';
  const quoteText = `\u201E${quote.text}\u201C`;
  const words = quoteText.split(' ');
  let line = '';
  const lines: string[] = [];
  for (const word of words) {
    const test = line + (line ? ' ' : '') + word;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  for (const l of lines) {
    ctx.fillText(l, padX, y);
    y += 58;
  }

  // Autor
  y += 8;
  ctx.font = '500 24px "Quicksand", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText(quote.author, padX, y);

  // Branding Bar oben
  const barH = 64;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, 0, W, barH);

  // Enso-Ring (simplifiziert als Arc) — oben zentriert
  const ensoX = W / 2 - 60;
  const ensoY = barH / 2;
  ctx.beginPath();
  ctx.arc(ensoX, ensoY, 14, -Math.PI * 0.15, Math.PI * 1.7);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.stroke();

  // "SOULEYA" Text — groesser
  ctx.font = '400 24px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.letterSpacing = '5px';
  ctx.fillText('SOULEYA', ensoX + 24, ensoY + 8);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png', 1);
  });
}

interface Props {
  quote: WisdomQuote;
  onShare?: () => void;
  onSave?: () => void;
  shareState?: 'idle' | 'sharing' | 'shared';
  copied?: boolean;
}

export default function WisdomCard({ quote, onShare, onSave, shareState = 'idle', copied = false }: Props) {
  const bgImage = getQuoteBackground(quote);
  const cardRef = useRef<HTMLDivElement>(null);

  // ── Teilen als Karte (Bild) ──────────────────────────────────
  const handleShareAsCard = useCallback(async () => {
    try {
      const blob = await generateCardImage(quote, bgImage);
      const file = new File([blob], 'souleya-impuls.png', { type: 'image/png' });

      // Web Share API (Mobile: Instagram, TikTok, WhatsApp, etc.)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'Tagesimpuls — Souleya',
          text: `\u201E${quote.text}\u201C \u2014 ${quote.author}`,
          files: [file],
        });
        return;
      }

      // Fallback: Download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'souleya-impuls.png';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      // User hat Share-Dialog abgebrochen — kein Fehler
      if ((e as DOMException)?.name === 'AbortError') return;
      console.error('Teilen fehlgeschlagen:', e);
    }
  }, [quote, bgImage]);

  return (
    <div
      ref={cardRef}
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

      {/* Souleya Branding oben */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center gap-2.5 py-3"
        style={{
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="9" strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15" />
        </svg>
        <span
          className="font-heading"
          style={{ fontSize: '15px', letterSpacing: '4px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}
        >
          Souleya
        </span>
      </div>

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

        {/* Teilen-Button */}
        <div className="flex justify-end">
          <button
            onClick={handleShareAsCard}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full font-body text-xs font-semibold cursor-pointer transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
            }}
          >
            <Icon name="share" size={14} style={{ color: '#fff' }} />
            Teilen
          </button>
        </div>
      </div>
    </div>
  );
}
