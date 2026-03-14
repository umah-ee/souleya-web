import Link from 'next/link';

const SUPPORTED_LOCALES = ['de', 'en'];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const otherLocale = locale === 'de' ? 'en' : 'de';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-gradient)' }}>
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: 'var(--glass-nav, var(--glass))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'var(--glass-border)',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href={`/${locale}/blog`}
            className="font-serif text-xl italic tracking-wide"
            style={{ color: 'var(--gold-text)' }}
          >
            Souleya
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href={`/${locale}/blog`}
              className="text-sm font-medium transition-colors hover:text-[var(--gold-text)]"
              style={{ color: 'var(--text-body)' }}
            >
              Blog
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium transition-colors hover:text-[var(--gold-text)]"
              style={{ color: 'var(--text-body)' }}
            >
              {locale === 'de' ? 'Einloggen' : 'Login'}
            </Link>

            {/* Locale Switch */}
            <Link
              href={`/${otherLocale}/blog`}
              className="text-xs px-2 py-1 rounded-md border transition-colors hover:bg-[var(--gold-bg)]"
              style={{
                borderColor: 'var(--glass-border)',
                color: 'var(--text-muted)',
              }}
            >
              {otherLocale.toUpperCase()}
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer
        className="border-t py-10"
        style={{
          borderColor: 'var(--glass-border)',
          color: 'var(--text-muted)',
        }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <span className="font-serif italic" style={{ color: 'var(--gold-text)' }}>
              Souleya
            </span>
            <div className="flex items-center gap-4">
              <a href="https://souleya.com" className="hover:text-[var(--gold-text)] transition-colors">
                souleya.com
              </a>
              <a href="https://souleya.com/impressum.html" className="hover:text-[var(--gold-text)] transition-colors">
                Impressum
              </a>
              <a href="https://souleya.com/datenschutz.html" className="hover:text-[var(--gold-text)] transition-colors">
                {locale === 'de' ? 'Datenschutz' : 'Privacy'}
              </a>
            </div>
            <span>© {new Date().getFullYear()} umah.ee OÜ</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
