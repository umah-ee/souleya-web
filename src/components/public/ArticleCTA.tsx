'use client';

/**
 * Kontextuelle CTA-Karten fuer Blog-Artikel.
 * Ersetzt <!-- CTA:community/studio/signup/end --> Platzhalter im HTML-Content.
 */

const CTA_CONFIGS: Record<string, { icon: string; heading: string; text: string; btnLabel: string; href: string }> = {
  community: {
    icon: 'M9 7a4 4 0 100 8 4 4 0 000-8zM3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87',
    heading: 'Finde Gleichgesinnte',
    text: 'Tausch dich mit Menschen aus, die den gleichen Weg gehen wie du.',
    btnLabel: 'Zur Community',
    href: '/circles',
  },
  studio: {
    icon: 'M4 4h16v16H4zM4 9h16M9 4v16',
    heading: 'Entdecke Kurse und Mentoren',
    text: 'Im Studio findest du Workshops, Kurse und persoenliche Begleitung.',
    btnLabel: 'Zum Studio',
    href: '/studio',
  },
  signup: {
    icon: 'M12 12m-9 0a9 9 0 1018 0 9 9 0 10-18 0M12 8v4M12 16h.01',
    heading: 'Starte deinen Weg',
    text: 'Werde Teil einer Gemeinschaft, die dich auf deinem Weg begleitet.',
    btnLabel: 'Jetzt registrieren',
    href: '#signup',
  },
  end: {
    icon: 'M12 12m-9 0a9 9 0 1018 0 9 9 0 10-18 0M12 8v4M12 16h.01',
    heading: 'Bereit fuer den naechsten Schritt?',
    text: 'Souleya verbindet dich mit Gleichgesinnten, Mentoren und Kursen — alles an einem Ort.',
    btnLabel: 'Jetzt registrieren',
    href: '#signup',
  },
};

/**
 * Ersetzt CTA-Platzhalter im HTML-Content durch CTA-Div-Marker.
 * Die Marker werden dann im React-Rendering durch ArticleCTAInline ersetzt.
 */
export function processArticleCTAs(html: string): string {
  // Ersetze alle CTA-Platzhalter durch markierte Divs
  return html
    .replace(/<!--\s*CTA:(\w+)\s*-->/g, '<div data-souleya-cta="$1"></div>')
    .replace(/<!--\s*CTA_BLOCK\s*-->/g, '<div data-souleya-cta="end"></div>');
}

/**
 * Inline CTA-Karte (gerendert als HTML-String fuer dangerouslySetInnerHTML).
 * Wird von processArticleCTAs nicht genutzt — stattdessen rendern wir die CTAs
 * als React-Komponenten nach dem Content.
 */
export function ArticleCTACard({
  type,
  hasSession,
  onSignup,
}: {
  type: string;
  hasSession: boolean;
  onSignup?: () => void;
}) {
  const config = CTA_CONFIGS[type] || CTA_CONFIGS.end;
  const isSignup = type === 'signup' || type === 'end';

  const handleClick = () => {
    if (!hasSession && isSignup && onSignup) {
      onSignup();
    }
  };

  const href = hasSession ? config.href : (isSignup ? undefined : '/login');

  return (
    <div
      className="my-8 p-5 rounded-[8px] border flex items-start gap-4"
      style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(var(--glass-blur, 20px))',
        WebkitBackdropFilter: 'blur(var(--glass-blur, 20px))',
        borderColor: 'var(--gold-border-s)',
        boxShadow: 'var(--glass-shadow)',
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ background: 'var(--gold-bg)' }}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d={config.icon} />
        </svg>
      </div>
      <div className="flex-1">
        <h3 className="font-heading text-base font-medium mb-1" style={{ color: 'var(--text-h)' }}>
          {config.heading}
        </h3>
        <p className="text-sm mb-3" style={{ color: 'var(--text-body)' }}>
          {config.text}
        </p>
        {href ? (
          <a
            href={href}
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide px-4 py-2 rounded-full border transition-colors"
            style={{ color: 'var(--gold-text)', borderColor: 'var(--gold-border-s)' }}
          >
            {config.btnLabel}
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        ) : (
          <button
            onClick={handleClick}
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide px-4 py-2 rounded-full transition-colors"
            style={{ background: 'var(--gold)', color: '#fff' }}
          >
            {config.btnLabel}
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
