import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Über uns | Souleya',
  description: 'Lerne die Menschen hinter Souleya kennen – Andreas und Steffi bauen eine Community für echtes Wachstum.',
};

export default function UeberUnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {/* ── Hero ── */}
      <div className="text-center mb-16">
        <h1
          className="font-heading text-3xl md:text-4xl italic mb-4"
          style={{ color: 'var(--text-h)' }}
        >
          Wer steckt hinter Souleya?
        </h1>
        <p className="text-base leading-relaxed max-w-xl mx-auto" style={{ color: 'var(--text-sec)' }}>
          Zwei Menschen, eine Vision: Ein Ort, an dem echte Verbindungen entstehen –
          nicht für den Algorithmus, sondern für dich.
        </p>
      </div>

      {/* ── Geschichte ── */}
      <section className="mb-14">
        <h2 className="font-heading text-2xl italic mb-4" style={{ color: 'var(--text-h)' }}>
          Warum Souleya?
        </h2>
        <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
          <p>
            Du kennst das Gefühl: Du warst auf einem wunderbaren Retreat, einem Workshop oder
            einer Meditations-Session. Es war intensiv, berührend, transformierend. Und dann?
            Du fährst nach Hause und die Verbindung – zu den Menschen, zur Energie, zum Gelernten
            – löst sich langsam auf.
          </p>
          <p>
            Genau dieses Problem wollen wir lösen. Souleya ist der Ort, an dem die Verbindung
            bleibt. Wo du Gleichgesinnte findest, die den gleichen Weg gehen. Wo du von Mentoren
            lernst, die dich wirklich verstehen. Und wo du deine Reise in deinem Tempo gehen
            kannst – begleitet von einer Community, die dich trägt.
          </p>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="mb-14">
        <h2 className="font-heading text-2xl italic mb-6" style={{ color: 'var(--text-h)' }}>
          Das Team
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Andreas */}
          <div
            className="rounded-2xl border p-6"
            style={{
              background: 'var(--glass)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderColor: 'var(--glass-border)',
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-heading italic"
                style={{ background: 'var(--gold-bg)', color: 'var(--gold-text)' }}
              >
                A
              </div>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-h)' }}>Andreas</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Founder &amp; Entwickler</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
              Seit über einem Jahrzehnt in der Tech-Welt unterwegs. Irgendwann hat er gemerkt,
              dass die besten Produkte die sind, die echte Probleme lösen – nicht die mit den
              meisten Features. Souleya ist sein Herzensprojekt.
            </p>
          </div>

          {/* Steffi */}
          <div
            className="rounded-2xl border p-6"
            style={{
              background: 'var(--glass)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderColor: 'var(--glass-border)',
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-heading italic"
                style={{ background: 'var(--gold-bg)', color: 'var(--gold-text)' }}
              >
                S
              </div>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-h)' }}>Steffi</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Community &amp; Onboarding</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
              Steffis Superpower: Menschen zusammenbringen und ihnen das Gefühl geben,
              angekommen zu sein. Sie kümmert sich darum, dass jeder neue Souleya-Mensch
              sich willkommen fühlt – vom ersten Moment an.
            </p>
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="mb-14">
        <h2 className="font-heading text-2xl italic mb-6" style={{ color: 'var(--text-h)' }}>
          Mission &amp; Vision
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div
            className="rounded-2xl border p-6"
            style={{
              background: 'var(--glass)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderColor: 'var(--glass-border)',
            }}
          >
            <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--gold-text)' }}>
              Mission
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
              Menschen auf ihrem Weg der persönlichen Entwicklung verbinden – mit Gleichgesinnten,
              Mentoren und Wissen. Alles an einem Ort, ohne dass die Verbindung nach dem letzten
              Workshop verloren geht.
            </p>
          </div>
          <div
            className="rounded-2xl border p-6"
            style={{
              background: 'var(--glass)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderColor: 'var(--glass-border)',
            }}
          >
            <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--gold-text)' }}>
              Vision
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
              Eine Welt, in der persönliches Wachstum keine einsame Reise ist, sondern ein
              gemeinsamer Weg. Souleya soll der Ort werden, an dem du dich traust, du selbst
              zu sein – und dabei Menschen findest, die dich sehen.
            </p>
          </div>
        </div>
      </section>

      {/* ── Werte ── */}
      <section>
        <h2 className="font-heading text-2xl italic mb-6" style={{ color: 'var(--text-h)' }}>
          Unsere Werte
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { title: 'Echtheit', desc: 'Keine Filter, keine Fassade. Wir glauben an echte Verbindungen und ehrliche Kommunikation.' },
            { title: 'Wachstum', desc: 'Jeder Mensch hat das Potenzial zu wachsen – in seinem eigenen Tempo, auf seinem eigenen Weg.' },
            { title: 'Gemeinschaft', desc: 'Alleine geht vieles. Zusammen geht mehr. Wir bauen Brücken, keine Mauern.' },
          ].map(({ title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border p-5"
              style={{
                background: 'var(--glass)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderColor: 'var(--glass-border)',
              }}
            >
              <p className="font-medium mb-2" style={{ color: 'var(--text-h)' }}>{title}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-body)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
