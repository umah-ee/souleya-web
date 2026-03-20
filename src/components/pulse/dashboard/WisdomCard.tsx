'use client';

import { useRef, useCallback, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { WisdomQuote } from '@/lib/wisdomQuotes';

// ── Kuratierte Hintergrundbilder (Unsplash) ───────────────────
// Hell, freundlich, lebendig — keine dunklen/finsteren Bilder.
const QUOTE_BACKGROUNDS: string[] = [
  // Goldene Stunde ueber Wiese
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=1000&fit=crop',
  // Tuerkises Meer von oben
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=1000&fit=crop',
  // Sonnenaufgang ueber Wolken
  'https://images.unsplash.com/photo-1502481851512-e9e2529b8c7c?w=800&h=1000&fit=crop',
  // Kirschblueten rosa
  'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&h=1000&fit=crop',
  // Lavendelfeld in der Sonne
  'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=800&h=1000&fit=crop',
  // Sonnenblumenfeld
  'https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=800&h=1000&fit=crop',
  // Bergsee tuerkis
  'https://images.unsplash.com/photo-1439853949127-fa647821eba0?w=800&h=1000&fit=crop',
  // Goldener Herbstwald
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop',
  // Tropischer Strand mit Palmen
  'https://images.unsplash.com/photo-1476673160081-cf065607f449?w=800&h=1000&fit=crop',
  // Sonnenuntergang ueber dem Meer
  'https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?w=800&h=1000&fit=crop',
  // Wildblumenwiese
  'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=800&h=1000&fit=crop',
  // Helle Berglandschaft
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1000&fit=crop',
  // Lotus Bluete
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=1000&fit=crop',
  // Nebel ueber gruenem Tal — weich, hell
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=1000&fit=crop',
  // Warmer Sonnenuntergang Feld
  'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800&h=1000&fit=crop',
  // Hellgruener Wald mit Licht
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=1000&fit=crop',
  // Pastellfarbener Himmel
  'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=800&h=1000&fit=crop',
  // Fruehling Blueten Baum
  'https://images.unsplash.com/photo-1462275646964-a0e3c11f18a6?w=800&h=1000&fit=crop',
  // Klarer Bergsee Spiegelung
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=1000&fit=crop',
  // Warmes Licht durch Blaetter
  'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&h=1000&fit=crop',
];

function getQuoteBackground(quote: WisdomQuote): string {
  let hash = 0;
  const str = quote.text + quote.author;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return QUOTE_BACKGROUNDS[Math.abs(hash) % QUOTE_BACKGROUNDS.length];
}

// ── Hilfsfunktion: Bild laden ─────────────────────────────────
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Bild konnte nicht geladen werden'));
    img.src = src;
  });
}

// ── Offizielles Enso-Logo als SVG → Canvas-Image ─────────────
function createEnsoSvgUrl(size: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
    <defs>
      <linearGradient id="eg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#A8894E"/>
        <stop offset="100%" stop-color="#D4BC8B"/>
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="36" fill="none" stroke="url(#eg)" stroke-width="8" stroke-linecap="round" stroke-dasharray="196 30" stroke-dashoffset="15"/>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// ── Canvas-basierte Bild-Generierung ──────────────────────────
const S = 3.2; // Skalierungsfaktor Display → Canvas

async function generateCardImage(quote: WisdomQuote, bgUrl: string): Promise<Blob> {
  const W = 1080;
  const H = 1350;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // ─ Hintergrundbild (object-fit: cover) ─
  const bgImg = await loadImage(bgUrl);
  const scale = Math.max(W / bgImg.width, H / bgImg.height);
  const sw = W / scale;
  const sh = H / scale;
  const sx = (bgImg.width - sw) / 2;
  const sy = (bgImg.height - sh) / 2;
  ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, W, H);

  // ─ Dunkler Gradient (etwas weicher fuer helle Bilder) ─
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(0,0,0,0.05)');
  grad.addColorStop(0.4, 'rgba(0,0,0,0.15)');
  grad.addColorStop(0.7, 'rgba(0,0,0,0.45)');
  grad.addColorStop(1, 'rgba(0,0,0,0.8)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // ─ Branding Bar oben ─
  const barH = Math.round(56 * S);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(0, 0, W, barH);

  // ─ Enso-Logo (offizielles SVG) ─
  const ensoSize = Math.round(28 * S);
  const ensoSvg = await loadImage(createEnsoSvgUrl(ensoSize));

  const textSize = Math.round(17 * S);
  const letterSp = Math.round(5 * S);
  ctx.font = `400 ${textSize}px "Cormorant Garamond", Georgia, serif`;
  ctx.letterSpacing = `${letterSp}px`;
  const textW = ctx.measureText('SOULEYA').width;
  const brandGap = Math.round(10 * S);
  const totalW = ensoSize + brandGap + textW;
  const startX = (W - totalW) / 2;

  ctx.drawImage(ensoSvg, startX, (barH - ensoSize) / 2, ensoSize, ensoSize);

  ctx.fillStyle = '#C8A96E';
  ctx.textBaseline = 'middle';
  ctx.fillText('SOULEYA', startX + ensoSize + brandGap, barH / 2 + 2);
  ctx.textBaseline = 'alphabetic';

  // ─ Inhalt unten ─
  const padX = Math.round(24 * S);
  const maxTextW = W - padX * 2;

  // Zitat-Zeilen berechnen
  const quoteSize = Math.round(22 * S);
  ctx.font = `italic ${quoteSize}px "Cormorant Garamond", Georgia, serif`;
  ctx.letterSpacing = '0px';
  const quoteText = `\u201E${quote.text}\u201C`;
  const words = quoteText.split(' ');
  let testLine = '';
  const quoteLines: string[] = [];
  for (const word of words) {
    const test = testLine + (testLine ? ' ' : '') + word;
    if (ctx.measureText(test).width > maxTextW && testLine) {
      quoteLines.push(testLine);
      testLine = word;
    } else {
      testLine = test;
    }
  }
  if (testLine) quoteLines.push(testLine);

  // Groessen
  const tradSize = Math.round(9 * S);
  const authorSize = Math.round(12 * S);
  const lineH = Math.round(22 * 1.5 * S); // etwas mehr leading (1.5 statt 1.4)
  const tradToQuoteGap = Math.round(12 * S);  // Abstand Tradition → Zitat
  const quoteToAuthorGap = Math.round(12 * S); // Abstand Zitat → Autor
  const bottomPad = Math.round(32 * S); // Abstand zum unteren Rand

  // Von unten nach oben berechnen
  const authorY = H - bottomPad;
  const lastQuoteLineY = authorY - quoteToAuthorGap - authorSize;
  const firstQuoteLineY = lastQuoteLineY - (quoteLines.length - 1) * lineH;
  const tradY = firstQuoteLineY - tradToQuoteGap - tradSize;

  // Tradition zeichnen
  ctx.font = `500 ${tradSize}px "Josefin Sans", sans-serif`;
  ctx.letterSpacing = `${Math.round(1.1 * S)}px`;
  ctx.fillStyle = '#C8A96E';
  ctx.fillText(quote.tradition.toUpperCase(), padX, tradY);

  // Zitat zeichnen
  ctx.font = `italic ${quoteSize}px "Cormorant Garamond", Georgia, serif`;
  ctx.letterSpacing = '0px';
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < quoteLines.length; i++) {
    ctx.fillText(quoteLines[i], padX, firstQuoteLineY + i * lineH);
  }

  // Autor zeichnen
  ctx.font = `500 ${authorSize}px "Quicksand", sans-serif`;
  ctx.letterSpacing = '0px';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText(quote.author, padX, authorY);

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
  const [showShareInput, setShowShareInput] = useState(false);
  const [shareText, setShareText] = useState('');
  const [sharing, setSharing] = useState(false);

  const handleShareAsCard = useCallback(async () => {
    setSharing(true);
    try {
      const blob = await generateCardImage(quote, bgImage);
      const file = new File([blob], 'souleya-impuls.png', { type: 'image/png' });

      // Persoenlicher Text + Souleya-Link
      const message = shareText.trim()
        ? `${shareText.trim()}\n\nsouleya.com`
        : `souleya.com`;

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'Tagesimpuls \u2014 Souleya',
          text: message,
          files: [file],
        });
        setShowShareInput(false);
        setShareText('');
        return;
      }

      // Desktop-Fallback: Bild downloaden + Text in Zwischenablage
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'souleya-impuls.png';
      a.click();
      URL.revokeObjectURL(url);

      // Text auch kopieren
      try {
        await navigator.clipboard.writeText(message);
      } catch { /* ignore */ }

      setShowShareInput(false);
      setShareText('');
    } catch (e) {
      if ((e as DOMException)?.name === 'AbortError') return;
      console.error('Teilen fehlgeschlagen:', e);
    } finally {
      setSharing(false);
    }
  }, [quote, bgImage, shareText]);

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

      {/* Dunkler Gradient-Overlay (sanfter fuer helle Bilder) */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.8) 100%)',
        }}
      />

      {/* Souleya Branding oben — Gold, offizielles Enso-Logo */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center gap-2.5 py-3.5"
        style={{
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="enso-card-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A8894E"/>
              <stop offset="100%" stopColor="#D4BC8B"/>
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="36" fill="none" stroke="url(#enso-card-grad)" strokeWidth="8" strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15" />
        </svg>
        <span
          className="font-heading"
          style={{ fontSize: '17px', letterSpacing: '5px', color: '#C8A96E', textTransform: 'uppercase' }}
        >
          Souleya
        </span>
      </div>

      {/* Inhalt am unteren Rand */}
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        {/* Tradition Label */}
        <p
          className="font-label text-[9px] tracking-[0.12em] uppercase mb-3"
          style={{ color: 'var(--gold)' }}
        >
          {quote.tradition}
        </p>

        {/* Zitat */}
        <p
          className="font-heading italic text-[22px] leading-[1.5]"
          style={{ color: '#fff' }}
        >
          &bdquo;{quote.text}&ldquo;
        </p>

        {/* Autor */}
        <p
          className="font-body text-xs mt-3 mb-4"
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          {quote.author}
        </p>

        {/* Teilen-Bereich */}
        {!showShareInput ? (
          <div className="flex justify-end">
            <button
              onClick={() => setShowShareInput(true)}
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
        ) : (
          <div
            className="rounded-[8px] p-3 flex flex-col gap-2.5"
            style={{
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <textarea
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              placeholder="Schreib etwas dazu \u2026"
              maxLength={200}
              rows={2}
              autoFocus
              className="w-full font-body text-xs rounded-[8px] resize-none outline-none"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff',
                padding: '8px 12px',
              }}
            />
            <div className="flex items-center justify-between">
              <span className="font-body text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                souleya.com wird automatisch angehaengt
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowShareInput(false); setShareText(''); }}
                  className="px-3 py-1.5 rounded-full font-body text-[11px] cursor-pointer"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleShareAsCard}
                  disabled={sharing}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full font-body text-[11px] font-semibold cursor-pointer"
                  style={{
                    background: 'var(--gold)',
                    border: 'none',
                    color: '#fff',
                    opacity: sharing ? 0.5 : 1,
                  }}
                >
                  <Icon name="share" size={12} style={{ color: '#fff' }} />
                  {sharing ? 'Wird geteilt \u2026' : 'Teilen'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
