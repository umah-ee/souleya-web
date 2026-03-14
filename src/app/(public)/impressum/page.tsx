import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Impressum | Souleya',
  description: 'Impressum und rechtliche Angaben von Souleya – betrieben von umah.ee OÜ.',
};

export default function ImpressumPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1
        className="font-heading text-3xl md:text-4xl italic mb-2"
        style={{ color: 'var(--text-h)' }}
      >
        Impressum
      </h1>
      <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>
        Angaben gemäß § 5 DDG
      </p>

      {/* ── Kontakt-Card ── */}
      <div
        className="rounded-2xl border p-6 mb-10"
        style={{
          background: 'var(--glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'var(--glass-border)',
        }}
      >
        <dl className="space-y-2 text-sm" style={{ color: 'var(--text-body)' }}>
          <div className="flex gap-2">
            <dt className="font-medium min-w-[140px]" style={{ color: 'var(--text-h)' }}>Betreiber</dt>
            <dd>umah.ee OÜ</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium min-w-[140px]" style={{ color: 'var(--text-h)' }}>Anschrift</dt>
            <dd>Sakala tn 7-2, 10141 Tallinn, Estland</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium min-w-[140px]" style={{ color: 'var(--text-h)' }}>Geschäftsführer</dt>
            <dd>Andreas Mutz</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium min-w-[140px]" style={{ color: 'var(--text-h)' }}>Registrierungscode</dt>
            <dd>16153774 (Estnisches Handelsregister)</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium min-w-[140px]" style={{ color: 'var(--text-h)' }}>USt-IdNr.</dt>
            <dd>EE102339297</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium min-w-[140px]" style={{ color: 'var(--text-h)' }}>Kontakt</dt>
            <dd>
              <a href="mailto:hello@souleya.com" className="hover:underline" style={{ color: 'var(--gold-text)' }}>
                hello@souleya.com
              </a>
            </dd>
          </div>
        </dl>
      </div>

      {/* ── Sections ── */}
      <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
        <section>
          <h2 className="font-heading text-xl italic mb-3" style={{ color: 'var(--text-h)' }}>
            Haftungsausschluss
          </h2>
          <p className="mb-3">
            Die Inhalte dieser Webseite werden mit grösster Sorgfalt erstellt. Für die Richtigkeit,
            Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
          </p>
          <p>
            Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen
            Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte
            fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine
            rechtswidrige Tätigkeit hinweisen.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl italic mb-3" style={{ color: 'var(--text-h)' }}>
            Haftung für Links
          </h2>
          <p>
            Diese Webseite enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen
            Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
            oder Betreiber verantwortlich. Eine permanente inhaltliche Kontrolle der verlinkten Seiten
            ist ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl italic mb-3" style={{ color: 'var(--text-h)' }}>
            Urheberrecht
          </h2>
          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
            dem Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung
            ausserhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des
            jeweiligen Autors bzw. Erstellers.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl italic mb-3" style={{ color: 'var(--text-h)' }}>
            Online-Streitbeilegung
          </h2>
          <p className="mb-3">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung bereit:{' '}
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: 'var(--gold-text)' }}
            >
              ec.europa.eu/consumers/odr
            </a>
          </p>
          <p>
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>
      </div>
    </div>
  );
}
