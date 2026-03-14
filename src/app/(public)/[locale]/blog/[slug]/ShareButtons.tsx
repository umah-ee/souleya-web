'use client';

import { useState } from 'react';

export function ShareButtons({
  url,
  title,
  locale,
}: {
  url: string;
  title: string;
  locale: string;
}) {
  const [copied, setCopied] = useState(false);
  const t = locale === 'de';

  const utm = (platform: string) =>
    `${url}?utm_source=${platform}&utm_medium=social&utm_campaign=blog`;

  const encodedUrl = (platform: string) => encodeURIComponent(utm(platform));
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl('whatsapp')}`,
      color: '#25D366',
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl('facebook')}`,
      color: '#1877F2',
    },
    {
      label: 'Pinterest',
      href: `https://pinterest.com/pin/create/button/?url=${encodedUrl('pinterest')}&description=${encodedTitle}`,
      color: '#E60023',
    },
    {
      label: 'X',
      href: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl('x')}`,
      color: '#000',
    },
  ];

  function copyLink() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-10 pt-8 border-t" style={{ borderColor: 'var(--divider, var(--glass-border))' }}>
      <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
        {t ? 'Teilen' : 'Share'}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {shareLinks.map(link => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:opacity-80"
            style={{
              borderColor: 'var(--glass-border)',
              color: 'var(--text-body)',
            }}
          >
            {link.label}
          </a>
        ))}
        <button
          onClick={copyLink}
          className="text-xs px-3 py-1.5 rounded-full border transition-colors"
          style={{
            borderColor: copied ? 'var(--gold)' : 'var(--glass-border)',
            color: copied ? 'var(--gold-text)' : 'var(--text-body)',
            background: copied ? 'var(--gold-bg)' : 'transparent',
          }}
        >
          {copied ? (t ? 'Kopiert' : 'Copied') : (t ? 'Link kopieren' : 'Copy link')}
        </button>
      </div>
    </div>
  );
}
