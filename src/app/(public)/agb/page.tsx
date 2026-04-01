import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AGB | Souleya',
  description: 'Allgemeine Geschäftsbedingungen von Souleya – Community-Plattform für persönliche Entwicklung.',
};

/* ── Helpers ── */
function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="font-heading text-xl italic mb-3 mt-10"
      style={{ color: 'var(--text-h)', scrollMarginTop: '88px' }}
    >
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-medium text-base mb-2 mt-6" style={{ color: 'var(--text-h)' }}>
      {children}
    </h3>
  );
}

function H4({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="font-medium text-sm mb-2 mt-4" style={{ color: 'var(--text-h)' }}>
      {children}
    </h4>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-3">{children}</p>;
}

function Hinweis({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-[8px] border p-4 mb-4 text-sm leading-relaxed"
      style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'var(--glass-border)',
      }}
    >
      {title && <p className="font-medium mb-2" style={{ color: 'var(--gold-text)' }}>{title}</p>}
      <div style={{ color: 'var(--text-body)' }}>{children}</div>
    </div>
  );
}

export default function AGBPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1
        className="font-heading text-3xl md:text-4xl italic mb-2"
        style={{ color: 'var(--text-h)' }}
      >
        Allgemeine Geschäftsbedingungen
      </h1>
      <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>
        Stand: 13.03.2026
      </p>

      <div className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>

        {/* Inhaltsverzeichnis */}
        <nav
          className="rounded-[8px] border p-6 mb-10"
          style={{
            background: 'var(--glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'var(--glass-border)',
          }}
        >
          <p className="font-medium text-base mb-5" style={{ color: 'var(--text-h)' }}>Inhaltsverzeichnis</p>
          <ol className="space-y-2">
            {([
              [1,  'Geltungsbereich und Vertragsparteien'],
              [2,  'Vertragsgegenstand und Leistungsbeschreibung'],
              [3,  'Registrierung und Zugangsbedingungen'],
              [4,  'Nutzungsrechte und Nutzerpflichten'],
              [5,  'Verbotene Inhalte und Verhaltensregeln'],
              [6,  'Abonnement-Modell und Preise'],
              [7,  'Seeds – Die interne Währung'],
              [8,  'Sabbatical-Modus (Mitgliedschaft pausieren)'],
              [9,  'Empfehlungsprogramm'],
              [10, 'Zahlungsbedingungen'],
              [11, 'Widerrufsrecht'],
              [12, 'Kündigung und Vertragsbeendigung'],
              [13, 'Sperrung und Kündigung durch Souleya'],
              [14, 'Haftungsbeschränkung'],
              [15, 'Geistiges Eigentum und Urheberrecht'],
              [16, 'Datenschutz'],
              [17, 'Änderungen der AGB'],
              [18, 'Schlussbestimmungen'],
            ] as [number, string][]).map(([num, label]) => (
              <li key={num}>
                <a
                  href={`#sec-${num}`}
                  className="group flex items-baseline gap-3 text-sm rounded transition-colors"
                  style={{ color: 'var(--text-body)' }}
                >
                  <span
                    className="flex-shrink-0 font-label text-xs font-semibold tabular-nums"
                    style={{ color: 'var(--gold-text)', minWidth: '1.75rem' }}
                  >
                    {num}.
                  </span>
                  <span
                    className="group-hover:translate-x-1 transition-transform duration-200"
                    style={{ display: 'inline-block' }}
                  >
                    {label}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* 1 */}
        <H2 id="sec-1">1. Geltungsbereich und Vertragsparteien</H2>

        <H3>1.1 Anbieter</H3>
        <P>Souleya ist eine Online-Community-Plattform, betrieben von:</P>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li><strong>Unternehmen:</strong> umah.ee OÜ</li>
          <li><strong>Anschrift:</strong> Sakala tn 7-2, 10141 Tallinn, Estland</li>
          <li><strong>E-Mail:</strong> <a href="mailto:hello@souleya.com" className="hover:underline" style={{ color: 'var(--gold-text)' }}>hello@souleya.com</a></li>
          <li><strong>Website:</strong> souleya.com</li>
          <li><strong>Registrierungscode:</strong> 16153774</li>
          <li><strong>USt-IdNr.:</strong> EE102339297</li>
        </ul>

        <H3>1.2 Geltungsbereich</H3>
        <P>
          Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB") gelten für alle Verträge
          zwischen Souleya und den Nutzern der Plattform souleya.com sowie der dazugehörigen
          mobilen Anwendungen. Mit der Registrierung auf der Plattform erklärt sich der Nutzer
          mit diesen AGB einverstanden. Abweichende Bedingungen des Nutzers finden keine
          Anwendung, es sei denn, Souleya stimmt diesen ausdrücklich schriftlich zu.
        </P>

        <H3>1.3 Nutzergruppen</H3>
        <P>Die Plattform Souleya richtet sich an:</P>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Privatpersonen (Mindestalter: 18 Jahre)</li>
          <li>Unternehmen und gewerbliche Nutzer</li>
        </ul>
        <P>Für die Registrierung ist die Angabe zutreffender und vollständiger Daten erforderlich.</P>

        {/* 2 */}
        <H2 id="sec-2">2. Vertragsgegenstand und Leistungsbeschreibung</H2>

        <H3>2.1 Was ist Souleya?</H3>
        <P>Souleya ist eine Community-Plattform, die es Nutzern ermöglicht, Menschen zu finden und sich mit ihnen zu vernetzen. Die Plattform bietet folgende Kernfunktionen:</P>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Profil erstellen und verwalten (Name, Profilbild, Interessen, Beschreibung)</li>
          <li>Beiträge und Inhalte veröffentlichen und mit der Community teilen</li>
          <li>Direktnachrichten und Chats mit anderen Nutzern</li>
          <li>Events und Gruppen erstellen und daran teilnehmen</li>
          <li>Suche und Entdeckung anderer Nutzer anhand von Interessen</li>
        </ul>

        <H3>2.2 Verfügbarkeit</H3>
        <P>
          Souleya ist bestrebt, die Plattform 24 Stunden am Tag, 7 Tage in der Woche verfügbar
          zu halten. Ein Anspruch auf ständige und unterbrechungsfreie Verfügbarkeit besteht
          jedoch nicht. Wartungsarbeiten werden, soweit möglich, im Voraus angekündigt.
        </P>

        <H3>2.3 Änderungen des Leistungsumfangs</H3>
        <P>
          Souleya ist berechtigt, den Funktionsumfang der Plattform jederzeit anzupassen,
          zu erweitern oder zu reduzieren. Wesentliche Einschränkungen bestehender
          kostenpflichtiger Funktionen werden dem Nutzer rechtzeitig mitgeteilt.
        </P>

        {/* 3 */}
        <H2 id="sec-3">3. Registrierung und Zugangsbedingungen</H2>

        <H3>3.1 Registrierungsvoraussetzungen</H3>
        <P>Für die Nutzung von Souleya ist eine Registrierung erforderlich. Voraussetzungen:</P>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Mindestalter von 18 Jahren</li>
          <li>Angabe einer gültigen E-Mail-Adresse</li>
          <li>Akzeptanz dieser AGB sowie der Datenschutzerklärung</li>
          <li>Bestätigung, dass alle angegebenen Daten der Wahrheit entsprechen</li>
        </ul>

        <H3>3.2 Registrierungsverfahren (Magic Link)</H3>
        <P>
          Die Registrierung und der Login bei Souleya erfolgen über ein sogenanntes
          Magic-Link-Verfahren. Der Nutzer gibt seine E-Mail-Adresse ein und erhält einen
          einmaligen Anmeldelink per E-Mail. Durch Klick auf diesen Link wird der Zugang
          aktiviert. Der Nutzer legt nach dem ersten Login ein persönliches Passwort fest.
        </P>

        <H3>3.3 Nutzerkonto</H3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Jeder Nutzer darf nur ein Konto auf Souleya anlegen</li>
          <li>Die Weitergabe von Zugangsdaten an Dritte ist nicht gestattet</li>
          <li>Der Nutzer ist verpflichtet, seine Zugangsdaten sicher aufzubewahren</li>
          <li>Souleya ist unverzüglich zu informieren, wenn ein unberechtigter Zugriff vermutet wird</li>
        </ul>

        <H3>3.4 Vertragsschluss</H3>
        <P>
          Ein Vertrag mit Souleya kommt mit Abschluss der Registrierung und Bestätigung der
          E-Mail-Adresse zustande. Bei kostenpflichtigen Abonnements kommt der Vertrag mit
          Abschluss des Buchungsvorgangs und der Zahlungsbestätigung zustande.
        </P>

        {/* 4 */}
        <H2 id="sec-4">4. Nutzungsrechte und Nutzerpflichten</H2>

        <H3>4.1 Nutzungsrecht</H3>
        <P>
          Souleya räumt dem Nutzer für die Dauer des Vertragsverhältnisses ein einfaches,
          nicht übertragbares und nicht unterlizenzierbares Recht ein, die Plattform im
          Rahmen dieser AGB zu nutzen.
        </P>

        <H3>4.2 Pflichten des Nutzers</H3>
        <P>Der Nutzer verpflichtet sich:</P>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Nur wahre und vollständige Angaben zu seiner Person zu machen</li>
          <li>Inhalte nur dann zu veröffentlichen, wenn er dazu berechtigt ist</li>
          <li>Die Rechte Dritter (z.B. Urheberrechte, Persönlichkeitsrechte) zu respektieren</li>
          <li>Keine Inhalte zu veröffentlichen, die gegen geltendes Recht verstossen</li>
          <li>Die technische Infrastruktur der Plattform nicht zu beeinträchtigen</li>
          <li>Keine automatisierten Abfragen (Bots, Scraper) zu verwenden</li>
        </ul>

        <H3>4.3 Nutzerinhalte</H3>
        <P>
          Der Nutzer bleibt Rechteinhaber an den von ihm eingestellten Inhalten. Er räumt
          Souleya jedoch ein kostenfreies, nicht-exklusives, weltweites Nutzungsrecht ein,
          diese Inhalte im Rahmen des Plattformbetriebs zu speichern, anzuzeigen und zu
          übertragen. Dieses Nutzungsrecht endet mit der Löschung des Kontos oder der
          jeweiligen Inhalte.
        </P>

        {/* 5 */}
        <H2 id="sec-5">5. Verbotene Inhalte und Verhaltensregeln</H2>

        <H3>5.1 Verbotene Inhalte</H3>
        <P>Auf der Plattform Souleya ist es nicht gestattet, folgende Inhalte zu veröffentlichen oder zu verbreiten:</P>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Inhalte, die gegen gesetzliche Vorschriften verstossen (z.B. strafbare Inhalte)</li>
          <li>Hassbotschaften, Diskriminierung oder Aufstachelung zu Gewalt gegen Personen oder Gruppen</li>
          <li>Belästigungen, Bedrohungen oder Mobbing gegenüber anderen Nutzern</li>
          <li>Sexuell explizite Inhalte oder Inhalte, die Minderjährige in sexuellem Kontext darstellen</li>
          <li>Spam, unerwünschte Werbung oder kommerzielle Massennachrichten ohne Zustimmung</li>
          <li>Falsche Tatsachenbehauptungen oder Inhalte, die gezielt zur Täuschung dienen</li>
          <li>Inhalte, die Schadsoftware enthalten oder zur Verbreitung von Viren dienen</li>
          <li>Inhalte, die Urheberrechte oder andere Schutzrechte Dritter verletzen</li>
        </ul>

        <H3>5.2 Besondere Pflichten für Mentoren</H3>
        <P>Nutzer mit Mentor-Status unterliegen zusätzlichen Inhaltspflichten. Folgendes ist Mentoren auf der Plattform ausdrücklich untersagt:</P>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Souleya als Werbetrichter für externe Angebote zu nutzen (z.B. Verlinkung auf eigene Websites, externe Kurse, andere Plattformen oder Dienstleistungen ausserhalb von Souleya)</li>
          <li>Kostenpflichtige Inhalte, die auf Souleya angeboten werden, zeitgleich oder exklusiv auf anderen Plattformen zu veröffentlichen</li>
          <li>Mitglieder aktiv dazu aufzufordern, Souleya zu verlassen oder andere Plattformen zu nutzen</li>
          <li>Inhalte zu veröffentlichen, die politischer, religiöser oder medizinisch fragwürdiger Natur sind oder nicht zum Themenspektrum von Souleya passen</li>
        </ul>
        <P>Souleya ist berechtigt, bei Verstoss gegen diese Pflichten den Mentor-Status zu entziehen, Inhalte zu entfernen und das Konto zu sperren oder ausserordentlich zu kündigen.</P>

        <H3>5.3 Meldung von Verstössen</H3>
        <P>
          Nutzer können Inhalte, die gegen diese Regeln verstossen, über die entsprechende
          Meldefunktion in der Plattform melden. Souleya prüft gemeldete Inhalte und kann
          diese bei Verstössen entfernen.
        </P>

        {/* 6 */}
        <H2 id="sec-6">6. Abonnement-Modell und Preise</H2>

        <H3>6.1 Kostenpflichtige Mitgliedschaft</H3>
        <P>Die Nutzung von Souleya erfordert den Abschluss eines kostenpflichtigen Abonnements. Souleya bietet folgende Abo-Optionen an:</P>
        <div className="overflow-x-auto mb-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th className="py-2 pr-3 font-medium" style={{ color: 'var(--text-h)' }}>Abo-Modell</th>
                <th className="py-2 pr-3 font-medium" style={{ color: 'var(--text-h)' }}>Preis</th>
                <th className="py-2 pr-3 font-medium" style={{ color: 'var(--text-h)' }}>Laufzeit &amp; Verlängerung</th>
                <th className="py-2 font-medium" style={{ color: 'var(--text-h)' }}>Kündigungsfrist</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--glass-border)' }}>
              <tr>
                <td className="py-2 pr-3">Monatliches Abonnement</td>
                <td className="py-2 pr-3">20,00 EUR / Monat</td>
                <td className="py-2 pr-3">1 Monat, danach automatisch monatlich</td>
                <td className="py-2">Jederzeit zum Monatsende</td>
              </tr>
              <tr>
                <td className="py-2 pr-3">Jährliches Abonnement<br /><span style={{ color: 'var(--gold-text)' }}>= 2 Monate gratis</span></td>
                <td className="py-2 pr-3">200,00 EUR / Jahr</td>
                <td className="py-2 pr-3">12 Monate, danach automatisch jährlich</td>
                <td className="py-2">4 Wochen vor Jahresende</td>
              </tr>
            </tbody>
          </table>
        </div>
        <P>Alle Preise sind Endpreise in Euro. Die gesetzliche Mehrwertsteuer ist, soweit zutreffend, enthalten.</P>

        <H3>6.2 Kein Rückgaberecht beim Jahresabonnement</H3>
        <Hinweis title="Wichtiger Hinweis zum Jahresabonnement">
          <P>
            Mit Buchung des Jahresabonnements wird der Gesamtbetrag von 200,00 EUR fällig und
            sofort in voller Höhe eingezogen.
          </P>
          <P>Der Betrag wird nicht anteilig zurückerstattet, wenn der Nutzer:</P>
          <ul className="list-disc pl-5 space-y-1 mb-3">
            <li>das Abonnement vor Ablauf des Vertragsjahres kündigt,</li>
            <li>die Plattform nicht oder kaum nutzt,</li>
            <li>oder sein Konto vor Ablauf des Jahres löscht.</li>
          </ul>
          <P>
            Der Zugang bleibt in all diesen Fällen bis zum Ende des bezahlten Vertragsjahres
            bestehen. Eine Ausnahme gilt nur bei einer ausserordentlichen Kündigung durch
            Souleya (siehe Punkt 13).
          </P>
          <P>
            Das gesetzliche Widerrufsrecht (14 Tage, siehe Punkt 11) bleibt davon unberührt.
            Nach Ablauf der Widerrufsfrist ist eine Rückerstattung des Jahresbeitrags ausgeschlossen.
          </P>
        </Hinweis>

        <H3>6.3 Automatische Verlängerung</H3>
        <P>
          Beide Abo-Optionen verlängern sich nach Ablauf der Laufzeit automatisch um die
          gleiche Dauer, sofern das Abonnement nicht fristgerecht gekündigt wird. Souleya
          sendet dem Nutzer vor dem Verlängerungsdatum eine Erinnerungs-E-Mail. Beim
          Jahresabonnement erfolgt diese Erinnerung mindestens 4 Wochen vor der Verlängerung.
        </P>

        <H3>6.4 Preisänderungen</H3>
        <P>
          Souleya behält sich das Recht vor, die Preise mit einer Ankündigungsfrist von
          mindestens 60 Tagen per E-Mail anzupassen. Der Nutzer hat das Recht, den Vertrag
          bis zum Zeitpunkt der Preisänderung kostenfrei zu kündigen. Für laufende
          Jahresabonnements gilt die neue Preisgestaltung erst ab der nächsten Verlängerung;
          die Ankündigung erfolgt ebenfalls mindestens 60 Tage vor dem Verlängerungsdatum.
        </P>

        {/* 7 */}
        <H2 id="sec-7">7. Seeds – Die interne Währung</H2>

        <H3>7.1 Was sind Seeds?</H3>
        <P>
          Seeds sind die interne Plattformwährung von Souleya. Sie können durch Aktivität
          auf der Plattform verdient, optional zugekauft und für bestimmte Premium-Inhalte
          eingesetzt werden. Seeds sind keine Geldleistung und haben keinen gesetzlichen
          Zahlungsmittelcharakter.
        </P>

        <H3>7.2 Erwerb von Seeds</H3>
        <P>Seeds können auf zwei Wegen erworben werden:</P>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li><strong>Durch Aktivität auf der Plattform</strong> (z.B. Profil ausfüllen, Community-Beiträge, Empfehlungen) — diese Seeds werden als Bonus-Seeds gutgeschrieben</li>
          <li><strong>Durch direkten Kauf</strong> über die Plattform gegen Zahlung eines Geldbetrags — diese Seeds gelten als gekaufte Seeds</li>
        </ul>
        <P>
          Der aktuelle Richtwert beträgt 1 Seed = 0,01 EUR. Im Rahmen von zeitlich begrenzten
          Aktionen (z.B. Pre-Launch-Bonus, Sonderaktionen) können zusätzliche Seeds vergeben
          werden. Die jeweiligen Bedingungen und Gutschrifthöhen werden gesondert kommuniziert
          und sind nicht Bestandteil dieser AGB.
        </P>

        <H3>7.3 Einsatz von Seeds</H3>
        <P>Seeds können für folgende Zwecke eingesetzt werden:</P>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Premium-Seminare und Intensiv-Workshops</li>
          <li>1:1-Mentor-Sessions</li>
          <li>Strukturierte Premium-Kurse und exklusives Material</li>
          <li>Anteilige oder vollständige Verrechnung des monatlichen Mitgliedsbeitrags (nur beim Monatsabonnement, nicht beim Jahresabonnement)</li>
        </ul>

        <Hinweis title="Seeds zur Beitragszahlung – so funktioniert es">
          <ul className="space-y-1 mb-0">
            <li>Seeds können den fälligen Monatsbeitrag teilweise oder vollständig reduzieren.</li>
            <li>Beispiel: 1.000 Seeds (10,00 EUR Gegenwert) reduzieren den Monatsbeitrag von 20,00 EUR auf 10,00 EUR.</li>
            <li>Beispiel: 2.000 Seeds (20,00 EUR Gegenwert) decken den Monatsbeitrag vollständig — 0,00 EUR Abbuchung.</li>
            <li>Der Überschuss wird nicht ausgezahlt: Wer 2.500 Seeds hat und 2.000 verrechnet, behält 500 Seeds.</li>
            <li>Beim Jahresabonnement ist eine Seeds-Verrechnung nicht möglich.</li>
          </ul>
        </Hinweis>

        <P>Seeds können nicht in Echtgeld zurückgetauscht oder ausgezahlt werden. Eine Barauszahlung von Seeds-Guthaben ist in keinem Fall möglich.</P>

        <H3>7.4 Verfall und Kündigung</H3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li><strong>Bonus-Seeds</strong> (durch Aktivität verdient, Aktionen, Geschenke): Verfallen 24 Monate nach Eingang. Bei Kündigung des Abonnements verfallen Bonus-Seeds sofort und unwiderruflich.</li>
          <li><strong>Gekaufte Seeds:</strong> Verfallen 24 Monate nach Eingang. Bei Kündigung werden gekaufte Seeds eingefroren und sind nach einer Reaktivierung wieder vollständig verfügbar.</li>
          <li><strong>Eingefrorene Seeds</strong> (nach Kündigung): Verfallen endgültig, wenn das Konto 24 Monate lang inaktiv bleibt.</li>
        </ul>

        <H3>7.5 Erstattung von Guthaben</H3>
        <P>
          Eine Auszahlung von Seeds ist grundsätzlich ausgeschlossen. Eine Ausnahme besteht
          lediglich für käuflich erworbene Seeds (nicht für Bonus-Seeds), sofern der Nutzer
          die Plattform aufgrund von nachgewiesener dauerhafter schwerer Erkrankung oder im
          Todesfall nicht mehr nutzen kann. In diesen Fällen wird der verbleibende Gegenwert
          der gekauften Seeds auf Antrag erstattet.
        </P>
        <Hinweis title="Erstattung im Ausnahmefall">
          <ul className="space-y-1 mb-0">
            <li>Antrag schriftlich per E-Mail an <a href="mailto:hello@souleya.com" className="hover:underline" style={{ color: 'var(--gold-text)' }}>hello@souleya.com</a></li>
            <li>Bei schwerer Erkrankung: Nachweis durch ärztliches Attest erforderlich</li>
            <li>Im Todesfall: Nachweis durch Sterbeurkunde und Erbnachweis (z.B. Erbschein)</li>
            <li>Gegenwert auf Basis des Richtwerts (1 Seed = 0,01 EUR)</li>
            <li>Erstattung auf das bei Stripe hinterlegte Zahlungsmittel oder per SEPA-Überweisung</li>
          </ul>
        </Hinweis>

        <H4>Verbrauchsreihenfolge (Bonus-First)</H4>
        <P>
          Werden Seeds für Inhalte eingesetzt, werden immer zuerst Bonus-Seeds verbraucht,
          danach erst gekaufte Seeds. Innerhalb jeder Kategorie gilt: älteste Seeds zuerst
          (FIFO). So bleiben gekaufte Seeds so lange wie möglich erhalten.
        </P>

        {/* 8 */}
        <H2 id="sec-8">8. Sabbatical-Modus (Mitgliedschaft pausieren)</H2>
        <P>Das Leben hat Rhythmen. Wer eine Auszeit benötigt, kann die Mitgliedschaft vorübergehend pausieren, ohne kündigen zu müssen.</P>

        <H3>8.1 Bedingungen</H3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Maximal 2x pro Kalenderjahr (je 1 Monat) oder 1x für 2 Monate am Stück</li>
          <li>Voraussetzung: mindestens 3 aktive Monate Mitgliedschaft vor der ersten Pause</li>
          <li>Während der Pause wird kein Beitrag abgebucht (0 EUR)</li>
          <li>Plattform-Zugang und Inhalte sind während der Pause nicht verfügbar</li>
          <li>Seeds werden eingefroren — keine Aktivitäts-Seeds, keine Referral-Seeds während der Pause</li>
          <li>Der Enso-Ring-Level und VIP-Status bleiben vollständig erhalten</li>
        </ul>

        <H3>8.2 Reaktivierung</H3>
        <P>
          Die Mitgliedschaft reaktiviert sich automatisch nach Ablauf des Pausemonats.
          Eine manuelle Reaktivierung ist jederzeit möglich. Beim Monatsabonnement hat
          die Pause keinen Einfluss auf den Abrechnungszyklus.
        </P>

        <Hinweis title="Sabbatical beim Jahresabonnement">
          <P>
            Auch Jahresabonnenten können den Sabbatical-Modus nutzen. Die Laufzeit verlängert
            sich durch eine Pause nicht – der Pausemonat läuft innerhalb der bereits bezahlten
            12 Monate. Der Jahresbetrag wird dadurch nicht anteilig erstattet.
          </P>
        </Hinweis>

        {/* 9 */}
        <H2 id="sec-9">9. Empfehlungsprogramm</H2>

        <H3>9.1 Funktionsweise</H3>
        <P>
          Jedes Mitglied erhält nach der Registrierung einen persönlichen Empfehlungslink
          (Referral-Link). Wird ein neues Mitglied über diesen Link geworben und leistet eine
          erste Zahlung, erhält der Werbende Seeds als Prämie.
        </P>

        <H3>9.2 Prämien</H3>
        <P><strong>Standard-Empfehlung (Monatsabo)</strong></P>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Einmalig nach erster Zahlung des Geworbenen: 500 Seeds (ca. 5,00 EUR Gegenwert)</li>
          <li>Monatlich solange der Geworbene aktives Mitglied ist: 100 Seeds / Monat (ca. 1,00 EUR / Monat)</li>
        </ul>
        <P><strong>Jahresabo-Prämie</strong></P>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Einmalig pro Jahreszahlung, 30 Tage nach Zahlungseingang (auch bei Verlängerung): 3.000 Seeds (ca. 30,00 EUR Gegenwert)</li>
          <li>Monatlich solange der Geworbene aktives Mitglied ist: 100 Seeds / Monat</li>
          <li>Hinweis: Die Jahresabo-Prämie entfällt, wenn das Jahresabo des Geworbenen innerhalb von 30 Tagen nach Zahlung gekündigt oder storniert wird.</li>
        </ul>
        <P>Alle Prämien aus dem Empfehlungsprogramm werden ausschliesslich in Form von Seeds gutgeschrieben. Es erfolgt keine Barauszahlung.</P>

        <H3>9.3 Bedingungen und Missbrauchsschutz</H3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Keine Eigenempfehlung möglich</li>
          <li>Keine Prämie bei Storno oder Rückbuchung</li>
          <li>Der Werbende muss zum Zeitpunkt der Gutschrift selbst aktives Mitglied sein</li>
          <li>Während des Sabbatical-Modus werden keine Referral-Seeds gutgeschrieben</li>
          <li>Die Erstellung von Zweit- oder Fake-Accounts zur Selbstempfehlung ist ausdrücklich verboten und kann zur Sperrung führen</li>
        </ul>

        <H3>9.4 Mentoren und externe Supporter</H3>
        <P>
          Für Mentoren und externe Supporter gelten gesonderte Vergütungskonditionen gemäss
          den jeweiligen Einzelvereinbarungen (insbesondere der Mentor-Vereinbarung). Diese
          sind nicht Bestandteil des allgemeinen Empfehlungsprogramms und werden separat geregelt.
        </P>

        {/* 10 */}
        <H2 id="sec-10">10. Zahlungsbedingungen</H2>

        <H3>10.1 Zahlungsabwicklung</H3>
        <P>
          Die Zahlungsabwicklung erfolgt über den Zahlungsdienstleister Stripe Payments
          Europe, Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, D02 H210,
          Irland. Durch Eingabe der Zahlungsdaten stimmt der Nutzer der Verarbeitung seiner
          Daten durch Stripe zu. Es gelten die Datenschutzbestimmungen und
          Nutzungsbedingungen von Stripe (stripe.com/de/privacy).
        </P>

        <H3>10.2 Akzeptierte Zahlungsmethoden</H3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Kreditkarte (Visa, Mastercard)</li>
          <li>SEPA-Lastschrift</li>
          <li>Weitere von Stripe angebotene Zahlungsmethoden</li>
        </ul>

        <H3>10.3 Fälligkeit</H3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Beim monatlichen Abonnement wird der Betrag am jeweiligen Abrechnungstag des Monats eingezogen</li>
          <li>Beim jährlichen Abonnement wird der Jahresbetrag einmalig zu Beginn der Laufzeit fällig</li>
          <li>Bei Verlängerung des Abonnements erfolgt die Belastung automatisch zum Verlängerungsdatum</li>
        </ul>

        <H3>10.4 Zahlungsverzug</H3>
        <P>
          Schlägt eine Zahlung fehl (z.B. abgelaufene Karte, unzureichende Deckung), wird
          der Betrag automatisch bis zu 3-mal über einen Zeitraum von 14 Tagen erneut
          eingezogen. Der Nutzer erhält sofort eine automatische Benachrichtigung per E-Mail.
        </P>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li><strong>Grace Period (7 Tage):</strong> Der Zugang bleibt für 7 Tage nach dem ersten Fehlschlag aktiv, damit der Nutzer die Zahlungsmethode aktualisieren kann.</li>
          <li><strong>Einfrierung (Tag 8):</strong> Der Zugang wird gesperrt und Seeds eingefroren. Das Konto bleibt bestehen – es erfolgt keine automatische Kündigung.</li>
          <li><strong>Automatische Kündigung (Tag 30):</strong> Bleibt die Zahlung nach 30 Tagen aus, wird die Mitgliedschaft automatisch gekündigt. Es gelten die Regelungen zur Kündigung (siehe Abschnitt 12).</li>
        </ul>
        <P>
          Der Nutzer kann jederzeit mit einer aktualisierten Zahlungsmethode reaktivieren –
          eingefrorene (gekaufte) Seeds stehen nach Reaktivierung wieder vollständig zur Verfügung.
        </P>

        {/* 11 */}
        <H2 id="sec-11">11. Widerrufsrecht</H2>

        <H3>11.1 Widerrufsrecht für Verbraucher</H3>
        <P>
          Verbraucher im Sinne des deutschen Bürgerlichen Gesetzbuches (§ 13 BGB) haben ein
          gesetzliches Widerrufsrecht.
        </P>

        <Hinweis title="Widerrufsbelehrung">
          <p className="font-medium mb-1" style={{ color: 'var(--text-h)' }}>Widerrufsrecht</p>
          <P>
            Sie haben das Recht, binnen 14 Tagen ohne Angabe von Gründen diesen Vertrag zu
            widerrufen. Die Widerrufsfrist beträgt 14 Tage ab dem Tag des Vertragsabschlusses.
          </P>
          <p className="font-medium mb-1" style={{ color: 'var(--text-h)' }}>Ausübung des Widerrufsrechts</p>
          <P>
            Um Ihr Widerrufsrecht auszuüben, müssen Sie uns mittels einer eindeutigen Erklärung
            (z.B. per E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.
            Sie können dafür die E-Mail-Adresse{' '}
            <a href="mailto:hello@souleya.com" className="hover:underline" style={{ color: 'var(--gold-text)' }}>hello@souleya.com</a>{' '}
            nutzen.
          </P>
          <p className="font-medium mb-1" style={{ color: 'var(--text-h)' }}>Folgen des Widerrufs</p>
          <P className="mb-0">
            Wenn Sie diesen Vertrag widerrufen, haben wir alle Zahlungen, die wir von Ihnen
            erhalten haben, unverzüglich und spätestens binnen 14 Tagen ab dem Tag
            zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf bei uns eingegangen ist.
          </P>
        </Hinweis>

        <H3>11.2 Erlöschen des Widerrufsrechts</H3>
        <P>
          Das Widerrufsrecht erlischt bei Verträgen über die Erbringung von Dienstleistungen
          vorzeitig, wenn Souleya die Dienstleistung vollständig erbracht hat und mit der
          Ausführung erst begonnen hat, nachdem der Verbraucher dazu seine ausdrückliche
          Zustimmung gegeben und gleichzeitig bestätigt hat, dass er sein Widerrufsrecht
          verliert, sobald die Dienstleistung vollständig erbracht ist.
        </P>

        {/* 12 */}
        <H2 id="sec-12">12. Kündigung und Vertragsbeendigung</H2>

        <H3>12.1 Kündigung durch den Nutzer</H3>
        <P>Der Nutzer kann sein Abonnement jederzeit mit Wirkung zum Ende der aktuellen Laufzeit kündigen:</P>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li><strong>Monatliches Abo:</strong> Kündigung jederzeit zum Ende des laufenden Monats</li>
          <li><strong>Jährliches Abo:</strong> Kündigung mit einer Frist von 4 Wochen vor Ablauf des Vertragsjahres</li>
        </ul>
        <P>
          Die Kündigung erfolgt über die Kontoeinstellungen auf souleya.com oder per E-Mail
          an{' '}
          <a href="mailto:hello@souleya.com" className="hover:underline" style={{ color: 'var(--gold-text)' }}>hello@souleya.com</a>.
          Nach Eingang der Kündigung wird eine Bestätigung per E-Mail versandt.
        </P>

        <H3>12.2 Zugang nach Kündigung</H3>
        <P>
          Nach Kündigung des Abonnements bleibt der Zugang bis zum Ende der bezahlten
          Laufzeit erhalten. Danach wird der Zugang deaktiviert. Der Nutzer hat die
          Möglichkeit, seine Daten vor Ablauf der Laufzeit zu exportieren.
        </P>

        <H3>12.3 Kontolöschung</H3>
        <P>
          Der Nutzer kann sein Konto jederzeit vollständig löschen. Die Löschung des Kontos
          gilt gleichzeitig als Kündigung des Abonnements zum Ende der laufenden Periode.
          Nach Löschung werden alle personenbezogenen Daten gemäss der Datenschutzerklärung
          gelöscht.
        </P>

        {/* 13 */}
        <H2 id="sec-13">13. Sperrung und Kündigung durch Souleya</H2>

        <H3>13.1 Ordentliche Kündigung durch Souleya</H3>
        <P>
          Souleya kann das Vertragsverhältnis mit einer Frist von 30 Tagen kündigen. In
          diesem Fall wird dem Nutzer der bereits für die verbleibende Laufzeit gezahlte
          Betrag anteilig erstattet.
        </P>

        <H3>13.2 Ausserordentliche Kündigung und Sperrung</H3>
        <P>Souleya ist berechtigt, das Nutzerkonto ohne Vorankündigung zu sperren oder das Vertragsverhältnis ausserordentlich fristlos zu kündigen, wenn der Nutzer:</P>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Diese AGB schwerwiegend oder wiederholt verletzt</li>
          <li>Verbotene Inhalte gemäss Abschnitt 5 veröffentlicht</li>
          <li>Falsche Angaben bei der Registrierung gemacht hat</li>
          <li>Straftaten oder andere Rechtsverstösse über die Plattform begeht</li>
          <li>Das Mindestalter von 18 Jahren unterschreitet</li>
        </ul>
        <P>Bei einer ausserordentlichen Kündigung aus wichtigem Grund durch Souleya besteht kein Anspruch auf Rückerstattung bereits bezahlter Beträge.</P>

        {/* 14 */}
        <H2 id="sec-14">14. Haftungsbeschränkung</H2>

        <H3>14.1 Haftung von Souleya</H3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Souleya haftet unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit sowie für Schäden, die auf Vorsatz oder grober Fahrlässigkeit beruhen.</li>
          <li>Für einfache Fahrlässigkeit haftet Souleya nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten). Die Haftung ist in diesen Fällen auf den typischerweise vorhersehbaren Schaden beschränkt.</li>
        </ul>

        <H3>14.2 Haftung für Nutzerinhalte</H3>
        <P>Für Inhalte, die von Nutzern auf der Plattform eingestellt werden, haftet Souleya nicht. Die Nutzer sind allein verantwortlich für die von ihnen eingestellten Inhalte und die damit verbundenen Rechtsverletzungen.</P>

        <H3>14.3 Links zu externen Websites</H3>
        <P>Souleya haftet nicht für die Inhalte verlinkter externer Websites. Für den Inhalt der verlinkten Seiten sind ausschliesslich deren Betreiber verantwortlich.</P>

        {/* 15 */}
        <H2 id="sec-15">15. Geistiges Eigentum und Urheberrecht</H2>

        <H3>15.1 Rechte von Souleya</H3>
        <P>
          Alle Inhalte der Plattform Souleya, die nicht von Nutzern erstellt wurden —
          insbesondere Design, Texte, Grafiken, Logos und Software — sind urheberrechtlich
          geschützt und Eigentum von Souleya oder seiner Lizenzgeber. Eine Nutzung ausserhalb
          der Plattform bedarf der ausdrücklichen schriftlichen Zustimmung von Souleya.
        </P>

        <H3>15.2 Nutzerinhalte</H3>
        <P>
          Der Nutzer behält das Urheberrecht an seinen Inhalten. Er bestätigt mit dem
          Einstellen von Inhalten, dass er das Recht hat, diese Inhalte zu veröffentlichen,
          und dass die Inhalte keine Rechte Dritter verletzen. Souleya erhält das Recht,
          Nutzerinhalte innerhalb der Plattform anzuzeigen und zu speichern. Dieses Recht
          erlischt mit der Löschung der Inhalte oder des Kontos.
        </P>

        {/* 16 */}
        <H2 id="sec-16">16. Datenschutz</H2>
        <P>
          Die Erhebung, Verarbeitung und Nutzung personenbezogener Daten durch Souleya
          erfolgt gemäss der Datenschutz-Grundverordnung (DSGVO) und dem
          Bundesdatenschutzgesetz (BDSG). Die ausführliche Datenschutzerklärung ist
          jederzeit unter{' '}
          <Link href="/datenschutz" className="hover:underline" style={{ color: 'var(--gold-text)' }}>
            souleya.com/datenschutz
          </Link>{' '}
          abrufbar und Bestandteil dieser AGB.
        </P>

        {/* 17 */}
        <H2 id="sec-17">17. Änderungen der AGB</H2>
        <P>
          Souleya behält sich das Recht vor, diese AGB mit Wirkung für die Zukunft zu
          ändern. Änderungen werden dem Nutzer per E-Mail mindestens 30 Tage vor
          Inkrafttreten mitgeteilt. Wenn der Nutzer den Änderungen nicht innerhalb von
          30 Tagen nach Bekanntgabe widerspricht, gelten die neuen AGB als akzeptiert.
          Souleya wird den Nutzer in der Benachrichtigungsmail auf dieses Widerspruchsrecht
          und die Folgen des Schweigens hinweisen. Im Falle eines Widerspruchs hat Souleya
          das Recht, den Vertrag ordentlich zum Zeitpunkt des Inkrafttretens der Änderungen
          zu kündigen.
        </P>

        {/* 18 */}
        <H2 id="sec-18">18. Schlussbestimmungen</H2>

        <H3>18.1 Anwendbares Recht</H3>
        <P>
          Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts
          (CISG). Bei Verbrauchern gilt diese Rechtswahl nur, soweit der durch zwingende
          Bestimmungen des Rechts des Staates, in dem der Verbraucher seinen gewöhnlichen
          Aufenthalt hat, gewährte Schutz nicht entzogen wird.
        </P>

        <H3>18.2 Gerichtsstand</H3>
        <P>
          Gerichtsstand für alle Streitigkeiten aus diesem Vertragsverhältnis ist – soweit
          gesetzlich zulässig – Tallinn, Estland. Gegenüber Verbrauchern gilt diese
          Gerichtsstandsvereinbarung nur, sofern der Nutzer keinen allgemeinen Gerichtsstand
          in Deutschland hat.
        </P>

        <H3>18.3 Streitbeilegung</H3>
        <P>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
          bereit:{' '}
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--gold-text)' }}>
            ec.europa.eu/consumers/odr
          </a>. Souleya ist bereit, an einem aussergerichtlichen Schlichtungsverfahren
          teilzunehmen, ist hierzu aber nicht verpflichtet.
        </P>

        <H3>18.4 Salvatorische Klausel</H3>
        <P>
          Sollten einzelne Bestimmungen dieser AGB ganz oder teilweise unwirksam sein oder
          werden, berührt dies die Gültigkeit der übrigen Bestimmungen nicht. Anstelle der
          unwirksamen Bestimmung gilt eine wirksame Bestimmung als vereinbart, die dem
          wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.
        </P>

        <p className="mt-12 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          souleya.com · Allgemeine Geschäftsbedingungen · Stand: 13.03.2026
        </p>

      </div>
    </div>
  );
}
