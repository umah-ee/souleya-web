import FadeUp from './FadeUp';

const BENEFITS = [
  {
    icon: '',
    glowDot: true,
    heading: 'Dein Profil leuchtet.',
    text: 'Der goldene Lichtpunkt am Enso-Ring zeigt allen: Du warst von Anfang an dabei. Dieses Zeichen kann man nicht kaufen – nur verdienen.',
  },
  {
    icon: '☀',
    heading: 'Du gestaltest mit.',
    text: 'Als First Light hast du direkten Einfluss auf Features, Circles und die Richtung der Plattform. Deine Stimme zählt ab Tag 1.',
  },
  {
    icon: '♡',
    heading: 'Du bist nicht allein.',
    text: 'Eine kleine Gruppe, die gemeinsam startet. Keine anonyme Masse – sondern echte Verbindungen, noch bevor die Türen für alle öffnen.',
  },
  {
    icon: '∞',
    heading: 'Für immer sichtbar.',
    text: 'First Light bleibt dauerhaft in deinem Profil. Egal wohin dein Weg dich führt – dieser Moment gehört dir.',
  },
];

function ProfileMockup() {
  return (
    <div
      className="rounded-2xl border overflow-hidden max-w-xs mx-auto"
      style={{
        background: 'var(--bg-elevated)',
        borderColor: 'var(--glass-border)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}
    >
      {/* Banner */}
      <div className="h-24 relative" style={{ background: 'linear-gradient(135deg, #D8CFBE, #C8A96E 60%, #B08840)' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg-elevated) 0%, transparent 70%)' }} />
      </div>

      {/* Avatar + Enso Ring */}
      <div className="flex justify-center -mt-10 relative">
        <div className="relative">
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-20 h-20 -m-1" style={{ filter: 'drop-shadow(0 0 6px rgba(200, 169, 110, 0.4))' }}>
            <circle
              cx="50" cy="50" r="38"
              fill="none"
              stroke="var(--gold-text)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="196 30"
              transform="rotate(-30 50 50)"
            />
            {/* First Light Glow */}
            <circle cx="83" cy="31" r="5" fill="var(--gold-text)" opacity="0.6" style={{ animation: 'soft-pulse 2s ease-in-out infinite' }} />
            <circle cx="83" cy="31" r="3" fill="var(--gold-text)" opacity="0.9" />
          </svg>
          <img
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face"
            alt="Maya Lindström"
            className="w-[72px] h-[72px] rounded-full object-cover border-4"
            style={{ borderColor: 'var(--bg-elevated)' }}
          />
        </div>
      </div>

      {/* Info */}
      <div className="text-center px-5 pt-3 pb-5">
        <p className="font-medium" style={{ color: 'var(--text-h)' }}>Maya Lindström</p>
        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>@maya.lindstroem</p>

        {/* Level Badge */}
        <span
          className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full mb-3"
          style={{ background: 'var(--gold-bg)', color: 'var(--gold-text)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold-text)' }} />
          First Light
        </span>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center mb-3">
          {['Beiträge', 'Kontakte', 'Circles'].map((label) => (
            <div key={label}>
              <p className="font-medium text-sm" style={{ color: 'var(--text-h)' }}>–</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap justify-center gap-1 mb-3">
          {['Wachstum', 'Resilienz', 'Mindset', 'Achtsamkeit'].map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full border"
              style={{ borderColor: 'var(--glass-border)', color: 'var(--text-muted)' }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* First Light Badge */}
        <div
          className="flex items-center justify-center gap-2 text-[10px] py-1.5 rounded-full"
          style={{ background: 'var(--gold-bg)', color: 'var(--gold-text)' }}
        >
          <svg viewBox="0 0 100 100" className="w-3.5 h-3.5">
            <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="196 30" transform="rotate(-30 50 50)" />
          </svg>
          <span className="font-medium">First Light</span>
          <span className="opacity-70">· Dabei seit Stunde Null</span>
        </div>
      </div>
    </div>
  );
}

export default function FirstLightSection() {
  return (
    <section id="first-light" className="section--apricot py-20 px-6">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--gold-text)' }}>
            First Light
          </p>
          <h2 className="font-heading text-2xl md:text-3xl italic mb-4" style={{ color: 'var(--text-h)' }}>
            Sei dabei, bevor<br />alles beginnt.
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-body)' }}>
            Souleya startet in Kürze – eine Plattform für persönliches Wachstum und echte
            Verbindung. Als First Light gehörst du zu den Ersten, die diese Community
            mitgestalten. Kein Beobachter. Ein Wegbereiter.
          </p>

          <div className="space-y-5">
            {BENEFITS.map((b, i) => (
              <FadeUp key={b.heading} delay={i * 100}>
                <div className="flex gap-3">
                  {b.glowDot ? (
                    <span className="relative flex-shrink-0 mt-1.5" style={{ width: 20, height: 20 }}>
                      <span
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: '#E8D5A8',
                          opacity: 0.5,
                          animation: 'soft-pulse 2s ease-in-out infinite',
                        }}
                      />
                      <span
                        className="absolute rounded-full"
                        style={{
                          width: 10,
                          height: 10,
                          top: 5,
                          left: 5,
                          background: '#C8A96E',
                          boxShadow: '0 0 14px rgba(232,213,168,0.8), 0 0 6px rgba(232,213,168,0.5)',
                        }}
                      />
                    </span>
                  ) : (
                    <span className="text-lg mt-0.5 flex-shrink-0" style={{ color: 'var(--gold-text)' }}>{b.icon}</span>
                  )}
                  <div>
                    <p className="font-medium mb-1" style={{ color: 'var(--text-h)' }}>{b.heading}</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>{b.text}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>

          <a
            href="#anmeldung"
            className="cta-btn inline-block mt-8 px-10 py-4 rounded-full font-label text-sm font-semibold uppercase tracking-widest transition-all hover:opacity-90 hover:-translate-y-px"
            style={{
              background: 'linear-gradient(135deg, #A8894E, #C8A96E, #D4BC8B)',
              color: 'var(--dark, #1a1a1a)',
              boxShadow: '0 0 30px rgba(200,169,110,.3)',
            }}
          >
            Jetzt First Light werden
          </a>
        </div>

        {/* Profile Mockup */}
        <FadeUp delay={300}>
          <ProfileMockup />
        </FadeUp>
      </div>
    </section>
  );
}
