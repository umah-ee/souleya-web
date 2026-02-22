export default function MobileHeader() {
  return (
    <header className="md:hidden sticky top-0 z-10 flex items-center gap-2.5 px-5 py-3 bg-dark-est/95 backdrop-blur-xl border-b border-gold-1/10">
      <svg width="28" height="28" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="mobile-enso" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A8894E" />
            <stop offset="100%" stopColor="#D4BC8B" />
          </linearGradient>
        </defs>
        <circle
          cx="50" cy="50" r="36" fill="none" stroke="url(#mobile-enso)"
          strokeWidth="9" strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15"
        />
      </svg>
      <span className="font-heading text-[1.1rem] font-normal tracking-[0.3em] uppercase text-gold-1">
        Souleya
      </span>
    </header>
  );
}
