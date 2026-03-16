export default function CtaFinal() {
  return (
    <section className="py-20 px-6 text-center">
      {/* Enso */}
      <svg width="24" height="24" viewBox="0 0 100 100" className="mx-auto mb-6">
        <defs>
          <linearGradient id="cta-enso" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--gold-deep, #A8894E)" />
            <stop offset="100%" stopColor="var(--gold, #C8A96E)" />
          </linearGradient>
        </defs>
        <circle
          cx="50" cy="50" r="36" fill="none" stroke="url(#cta-enso)"
          strokeWidth="9" strokeLinecap="round"
          strokeDasharray="196 30" strokeDashoffset="15"
        />
      </svg>

      <h2 className="font-heading text-2xl md:text-3xl italic mb-3" style={{ color: 'var(--text-h)' }}>
        Dein Platz wartet
      </h2>
      <p className="text-sm max-w-md mx-auto mb-8" style={{ color: 'var(--text-sec)' }}>
        Werde einer der ersten 1.000 First Lights und forme Souleya von Anfang an mit.
      </p>
      <a
        href="#anmeldung"
        className="cta-btn inline-block px-10 py-4 rounded-full font-label text-sm font-semibold uppercase tracking-widest transition-all hover:opacity-90 hover:-translate-y-px"
        style={{
          background: 'linear-gradient(135deg, #A8894E, #C8A96E, #D4BC8B)',
          color: 'var(--dark, #1a1a1a)',
          boxShadow: '0 0 30px rgba(200,169,110,.3)',
        }}
      >
        Jetzt First Light werden
      </a>
    </section>
  );
}
