'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { Icon } from '@/components/ui/Icon';

export default function PublicHeader() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Scroll-Effekt
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Menü schließen bei Route-Wechsel
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Locale-Switch nur auf Blog-Seiten
  const isBlog = pathname.includes('/blog');
  const currentLocale = pathname.startsWith('/en/') ? 'en' : 'de';
  const otherLocale = currentLocale === 'de' ? 'en' : 'de';

  const navLinks = [
    { href: `/${currentLocale}/blog`, label: 'Blog' },
    { href: '/preise', label: 'Preise' },
    { href: '/ueber-uns', label: 'Über uns' },
  ];

  return (
    <header
      className="sticky top-0 z-50 border-b transition-all duration-300"
      style={{
        background: scrolled
          ? 'var(--glass-nav, var(--glass))'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderColor: scrolled ? 'var(--glass-border)' : 'transparent',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <svg width="32" height="32" viewBox="0 0 100 100" className="flex-shrink-0">
            <defs>
              <linearGradient id="pub-enso" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--gold-deep, #A8894E)" />
                <stop offset="100%" stopColor="var(--gold, #C8A96E)" />
              </linearGradient>
            </defs>
            <circle
              cx="50" cy="50" r="36" fill="none" stroke="url(#pub-enso)"
              strokeWidth="9" strokeLinecap="round"
              strokeDasharray="196 30" strokeDashoffset="15"
            />
          </svg>
          <span
            className="font-heading text-lg italic"
            style={{ color: 'var(--text-h)' }}
          >
            Souleya
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-[var(--gold-text)]"
              style={{
                color: pathname.startsWith(link.href)
                  ? 'var(--gold-text)'
                  : 'var(--text-body)',
              }}
            >
              {link.label}
            </Link>
          ))}

          {/* Locale Switch (nur auf Blog-Seiten) */}
          {isBlog && (
            <Link
              href={pathname.replace(`/${currentLocale}/`, `/${otherLocale}/`)}
              className="text-xs px-2 py-1 rounded-md border transition-colors hover:bg-[var(--gold-bg)]"
              style={{
                borderColor: 'var(--glass-border)',
                color: 'var(--text-muted)',
              }}
            >
              {otherLocale.toUpperCase()}
            </Link>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors hover:bg-[var(--gold-bg)]"
            aria-label="Theme wechseln"
          >
            <Icon
              name={theme === 'dark' ? 'sun' : 'moon'}
              size={18}
              style={{ color: 'var(--text-muted)' }}
            />
          </button>

          {/* Login */}
          <Link
            href="/login"
            className="text-sm font-medium px-4 py-2 rounded-full transition-all"
            style={{
              background: 'var(--gold-bg)',
              color: 'var(--gold-text)',
              border: '1px solid var(--gold-border)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--gold-bg-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--gold-bg)';
            }}
          >
            Einloggen
          </Link>
        </nav>

        {/* ── Mobile Hamburger ── */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg transition-colors hover:bg-[var(--gold-bg)]"
          aria-label="Menü"
        >
          <Icon
            name={menuOpen ? 'x' : 'menu-2'}
            size={22}
            style={{ color: 'var(--text-body)' }}
          />
        </button>
      </div>

      {/* ── Mobile Menu ── */}
      {menuOpen && (
        <div
          className="md:hidden border-t"
          style={{
            background: 'var(--glass-nav, var(--glass))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'var(--glass-border)',
          }}
        >
          <nav className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium py-2 transition-colors hover:text-[var(--gold-text)]"
                style={{
                  color: pathname.startsWith(link.href)
                    ? 'var(--gold-text)'
                    : 'var(--text-body)',
                }}
              >
                {link.label}
              </Link>
            ))}

            <div
              className="flex items-center justify-between pt-3 mt-1 border-t"
              style={{ borderColor: 'var(--divider)' }}
            >
              <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg transition-colors hover:bg-[var(--gold-bg)]"
                >
                  <Icon
                    name={theme === 'dark' ? 'sun' : 'moon'}
                    size={18}
                    style={{ color: 'var(--text-muted)' }}
                  />
                </button>

                {/* Locale Switch */}
                {isBlog && (
                  <Link
                    href={pathname.replace(`/${currentLocale}/`, `/${otherLocale}/`)}
                    className="text-xs px-2 py-1 rounded-md border transition-colors hover:bg-[var(--gold-bg)]"
                    style={{
                      borderColor: 'var(--glass-border)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {otherLocale.toUpperCase()}
                  </Link>
                )}
              </div>

              <Link
                href="/login"
                className="text-sm font-medium px-4 py-2 rounded-full transition-all"
                style={{
                  background: 'var(--gold-bg)',
                  color: 'var(--gold-text)',
                  border: '1px solid var(--gold-border)',
                }}
              >
                Einloggen
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
