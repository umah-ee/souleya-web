'use client';

import { useState } from 'react';

// ══════════════════════════════════════════════════════════════
// SHARE BUTTONS – Social Icons im Souleya-Design
// WhatsApp, Facebook, Instagram, TikTok, Pinterest, X, Link kopieren
// ══════════════════════════════════════════════════════════════

/* SVG path data for each platform icon (Tabler-style, viewBox 0 0 24 24) */
const ICONS: Record<string, string> = {
  whatsapp:
    'M16.6 14c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.2-.5-.5-1-1.1-1.4-1.7-.1-.2 0-.4.1-.5.1-.1.2-.3.4-.4.1-.1.2-.3.2-.4.1-.1.1-.3 0-.4-.1-.1-.6-1.3-.8-1.8-.1-.7-.3-.7-.5-.7h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.1.9 2.3c.1.1 1.5 2.3 3.6 3.2.5.2.9.3 1.2.4.5.2 1 .1 1.4-.1.4-.2 1.2-.5 1.4-1 .2-.5.2-.9.1-1-.1-.1-.3-.2-.5-.3m-4.6 6.3c-1.7 0-3.3-.5-4.8-1.3l-.3-.2-3.5.9.9-3.4-.2-.3c-2-3.2-1.5-7.3 1.1-10C7.7 3.5 12 2.8 15.5 5c3.4 2.2 4.7 6.5 3 10.2-.9 1.8-2.3 3.3-4.1 4.2-1.2.6-2.5.9-3.9.9m0-18.6c-2 0-3.9.5-5.6 1.5C4 4.4 2.3 6.4 1.4 8.7c-1.2 3-1 6.4.5 9.2l-1.8 6.8 6.9-1.8c1.3.7 2.8 1.1 4.3 1.1 2.5 0 5-.9 6.8-2.7 1.9-1.7 3.1-4.2 3.4-6.8.4-3.1-.5-6.2-2.5-8.6C17.5 3.4 14.6 1.7 11.5 1.5h-.5',
  facebook: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
  instagram:
    'M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6m4.5-1.5h.01',
  tiktok:
    'M21 7.917v4.034A9.948 9.948 0 0 1 16 10v5a6 6 0 1 1-6-6v4a2 2 0 1 0 2 2V3h4a4 4 0 0 0 4 4z',
  pinterest:
    'M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.182-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.852 0 1.264.64 1.264 1.408 0 .858-.546 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.331 1.781.745 2.282a.3.3 0 0 1 .069.288l-.278 1.133c-.044.183-.145.222-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.527-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2',
  x: 'M4 4l7.07 9.573L4.06 20h2.55l5.27-6.12L16.07 20H20l-7.38-9.972L19.28 4h-2.55l-4.98 5.78L7.93 4z',
  link: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
};

interface ShareItem {
  key: string;
  label: string;
  /** If set, opens this URL. If null, triggers a custom action. */
  href: string | null;
}

export function ShareButtons({
  url,
  title,
  locale,
}: {
  url: string;
  title: string;
  locale: string;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const t = locale === 'de';

  const utm = (platform: string) =>
    `${url}?utm_source=${platform}&utm_medium=social&utm_campaign=blog`;

  const encodedUrl = (platform: string) => encodeURIComponent(utm(platform));
  const encodedTitle = encodeURIComponent(title);

  const items: ShareItem[] = [
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl('whatsapp')}`,
    },
    {
      key: 'facebook',
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl('facebook')}`,
    },
    {
      key: 'instagram',
      label: 'Instagram',
      href: null, // copy-to-clipboard
    },
    {
      key: 'tiktok',
      label: 'TikTok',
      href: null, // copy-to-clipboard
    },
    {
      key: 'pinterest',
      label: 'Pinterest',
      href: `https://pinterest.com/pin/create/button/?url=${encodedUrl('pinterest')}&description=${encodedTitle}`,
    },
    {
      key: 'x',
      label: 'X',
      href: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl('x')}`,
    },
    {
      key: 'link',
      label: t ? 'Link' : 'Link',
      href: null, // copy-to-clipboard
    },
  ];

  function handleClick(item: ShareItem) {
    if (item.href) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
      return;
    }
    // Instagram, TikTok, Link — copy URL to clipboard
    const shareUrl = item.key === 'link' ? url : utm(item.key);
    navigator.clipboard.writeText(shareUrl);
    setCopied(item.key);
    setTimeout(() => setCopied(null), 2000);
  }

  function getCopiedLabel(key: string): string {
    if (key === 'link') return t ? 'Kopiert' : 'Copied';
    return t ? 'Link kopiert' : 'Link copied';
  }

  return (
    <div className="mt-10 pt-8 border-t" style={{ borderColor: 'var(--divider, var(--glass-border))' }}>
      <p
        className="font-label mb-4"
        style={{ fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)' }}
      >
        {t ? 'Teilen' : 'Share'}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        {items.map((item) => {
          const isCopied = copied === item.key;

          return (
            <button
              key={item.key}
              onClick={() => handleClick(item)}
              className="group flex flex-col items-center gap-1.5 bg-transparent border-none cursor-pointer transition-transform hover:scale-105 active:scale-95"
              title={isCopied ? getCopiedLabel(item.key) : item.label}
              style={{ minWidth: 52 }}
            >
              {/* Icon circle */}
              <div
                className="flex items-center justify-center rounded-full transition-all duration-200"
                style={{
                  width: 44,
                  height: 44,
                  background: isCopied ? 'var(--gold-bg)' : 'var(--glass, rgba(255,255,255,0.06))',
                  border: `1px solid ${isCopied ? 'var(--gold)' : 'var(--glass-border, rgba(255,255,255,0.08))'}`,
                  boxShadow: isCopied ? '0 0 12px var(--gold-glow, rgba(200,169,110,0.25))' : 'none',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke={isCopied ? 'var(--gold-text, #C8A96E)' : 'var(--text-body)'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transition: 'stroke 0.2s' }}
                >
                  {item.key === 'link' && isCopied ? (
                    <path d="M5 12l5 5l10 -10" />
                  ) : (
                    <path d={ICONS[item.key]} />
                  )}
                </svg>
              </div>

              {/* Label */}
              <span
                className="font-body"
                style={{
                  fontSize: 10,
                  color: isCopied ? 'var(--gold-text, #C8A96E)' : 'var(--text-muted)',
                  transition: 'color 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {isCopied ? getCopiedLabel(item.key) : item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
