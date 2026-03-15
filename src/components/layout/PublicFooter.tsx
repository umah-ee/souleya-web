import Link from 'next/link';

export default function PublicFooter() {
  return (
    <footer
      className="border-t py-12"
      style={{
        borderColor: 'var(--glass-border)',
        color: 'var(--text-muted)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo + Tagline */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2.5">
              <svg width="24" height="24" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="footer-enso" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--gold-deep, #A8894E)" />
                    <stop offset="100%" stopColor="var(--gold, #C8A96E)" />
                  </linearGradient>
                </defs>
                <circle
                  cx="50" cy="50" r="36" fill="none" stroke="url(#footer-enso)"
                  strokeWidth="9" strokeLinecap="round"
                  strokeDasharray="196 30" strokeDashoffset="15"
                />
              </svg>
              <span
                className="font-heading text-base italic"
                style={{ color: 'var(--gold-text)' }}
              >
                Souleya
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Deine Community für Wachstum
            </p>
          </div>

          {/* Legal Links */}
          <nav className="flex items-center gap-5 text-xs flex-wrap justify-center">
            <Link
              href="/impressum"
              className="hover:text-[var(--gold-text)] transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              Impressum
            </Link>
            <Link
              href="/datenschutz"
              className="hover:text-[var(--gold-text)] transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              Datenschutz
            </Link>
            <Link
              href="/agb"
              className="hover:text-[var(--gold-text)] transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              AGB
            </Link>
            <Link
              href="/mentor"
              className="hover:text-[var(--gold-text)] transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              Als Mentor bewerben
            </Link>
          </nav>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/joinsouleya"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--gold-text)]"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Instagram"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" />
                <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                <path d="M16.5 7.5v.01" />
              </svg>
            </a>
            <a
              href="https://www.pinterest.com/joinsouleya"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--gold-text)]"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Pinterest"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 20l4 -9" />
                <path d="M10.7 14c.437 1.263 1.43 2 2.55 2c2.071 0 3.75 -1.554 3.75 -4a5 5 0 1 0 -9.7 1.7" />
                <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@joinsouleya"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--gold-text)]"
              style={{ color: 'var(--text-muted)' }}
              aria-label="TikTok"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 7.917v4.034a9.948 9.948 0 0 1 -5 -1.951v4.5a6.5 6.5 0 1 1 -8 -6.326v4.326a2.5 2.5 0 1 0 4 2v-11.5h4.083a6.005 6.005 0 0 0 4.917 4.917z" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/joinsouleya"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--gold-text)]"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Facebook"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" />
              </svg>
            </a>
            <a
              href="https://x.com/joinsouleya"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--gold-text)]"
              style={{ color: 'var(--text-muted)' }}
              aria-label="X"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
              </svg>
            </a>
          </div>
        </div>

        {/* Copyright + Cookie Settings */}
        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ borderColor: 'var(--divider)' }}>
          <span>© {new Date().getFullYear()} umah.ee OÜ. Alle Rechte vorbehalten.</span>
          <button
            data-cookie-settings
            className="hover:text-[var(--gold-text)] transition-colors cursor-pointer"
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', padding: 0, font: 'inherit' }}
          >
            Cookie-Einstellungen
          </button>
        </div>
      </div>
    </footer>
  );
}
