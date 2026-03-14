export default function CtaFinal() {
  return (
    <section className="py-20 px-6 text-center">
      {/* Enso */}
      <svg viewBox="0 0 100 100" className="w-12 h-12 mx-auto mb-6">
        <defs>
          <linearGradient id="cta-enso" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A8894E" />
            <stop offset="50%" stopColor="#D4BC8B" />
            <stop offset="100%" stopColor="#A8894E" />
          </linearGradient>
        </defs>
        <circle
          cx="50" cy="50" r="38"
          fill="none"
          stroke="url(#cta-enso)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="196 30"
          transform="rotate(-30 50 50)"
        />
      </svg>

      <h2 className="font-heading text-2xl md:text-3xl italic mb-3" style={{ color: 'var(--text-h)' }}>
        Dein Platz wartet
      </h2>
      <p className="text-sm max-w-md mx-auto mb-8" style={{ color: 'var(--text-sec)' }}>
        Werde einer der ersten 1.000 Origin Souls und forme Souleya von Anfang an mit.
      </p>
      <a
        href="#anmeldung"
        className="inline-block px-10 py-3.5 rounded-full font-medium text-sm transition-all hover:shadow-lg"
        style={{ background: 'var(--gold-text)', color: '#fff' }}
      >
        Jetzt Origin Soul werden
      </a>
    </section>
  );
}
