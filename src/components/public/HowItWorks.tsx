import FadeUp from './FadeUp';

const STEPS = [
  {
    number: 1,
    heading: 'Registriere dich mit deiner E-Mail',
    text: 'Kein Passwort nötig. Du erhältst einen Magic Link – ein Klick und du bist drin.',
  },
  {
    number: 2,
    heading: 'Verdiene Seeds durch Engagement',
    text: 'Lies Impulse, folge uns auf Social Media, teile Souleya mit Freunden – und sammle dabei unsere In-App-Währung.',
  },
  {
    number: 3,
    heading: 'Starte am Launch-Tag mit Vorsprung',
    text: 'Deine Seeds, dein Status und dein Netzwerk warten auf dich, wenn die App live geht. Du bist nicht irgendwer – du bist First Light.',
  },
];

export default function HowItWorks() {
  return (
    <section id="so-funktionierts" className="section--dark py-20 px-6" style={{ paddingTop: 0 }}>
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Image */}
        <FadeUp>
          <div className="rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1525026198548-4baa812f1183?w=600&h=800&fit=crop"
              alt="Menschen in der Community"
              className="w-full h-auto object-cover photo-gold-wash"
              loading="lazy"
            />
          </div>
        </FadeUp>

        {/* Steps */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--gold-text)' }}>
            So funktioniert es
          </p>
          <h2 className="font-heading text-2xl md:text-3xl italic mb-8" style={{ color: 'var(--text-h)' }}>
            In drei Schritten<br />Teil der Community
          </h2>

          <div className="space-y-6">
            {STEPS.map((s, i) => (
              <FadeUp key={s.number} delay={i * 150}>
                <div className="flex gap-4">
                  <div
                    className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-heading text-lg italic"
                    style={{ background: 'var(--gold-bg)', color: 'var(--gold-text)' }}
                  >
                    {s.number}
                  </div>
                  <div>
                    <h3 className="font-medium mb-1" style={{ color: 'var(--text-h)' }}>
                      {s.heading}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
                      {s.text}
                    </p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
