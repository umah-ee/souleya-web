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

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-3">{children}</p>;
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
              [8,  'Sabbatical-Modus'],
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
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li><strong>Unternehmen:</strong> umah.ee OÜ</li>
          <li><strong>Anschrift:</strong> Sakala tn 7-2, 10141 Tallinn, Estland</li>
          <li><strong>E-Mail:</strong> <a href="mailto:hello@souleya.com" className="hover:underline" style={{ color: 'var(--gold-text)' }}>hello@souleya.com</a></li>
          <li><strong>Registrierungscode:</strong> 16153774</li>
          <li><strong>USt-IdNr.:</strong> EE102339297</li>
        </ul>

        <H3>1.2 Geltungsbereich</H3>
        <P>
          Diese AGB gelten für alle Verträge zwischen Souleya und den Nutzern der Plattform
          souleya.com sowie der dazugehörigen mobilen Anwendungen. Mit Registrierung akzeptierst
          du diese AGB.
        </P>

        <H3>1.3 Nutzergruppen</H3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Privatpersonen (Mindestalter: 18 Jahre)</li>
          <li>Unternehmen und gewerbliche Nutzer</li>
        </ul>
        <P>Für die Registrierung ist die Angabe zutreffender und vollständiger Daten erforderlich.</P>

        {/* 2 */}
        <H2 id="sec-2">2. Vertragsgegenstand und Leistungsbeschreibung</H2>

        <H3>2.1 Was ist Souleya?</H3>
        <P>Community-Plattform mit Kernfunktionen:</P>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Profil erstellen und verwalten</li>
          <li>Beiträge und Inhalte veröffentlichen</li>
          <li>Direktnachrichten und Chats</li>
          <li>Events und Gruppen erstellen und beitreten</li>
          <li>Suche und Entdeckung nach Interessen</li>
        </ul>

        <H3>2.2 Verfügbarkeit</H3>
        <P>
          Souleya ist bestrebt, die Plattform rund um die Uhr verfügbar zu halten. Ein Anspruch
          auf ständige Verfügbarkeit besteht jedoch nicht. Wartungsarbeiten werden soweit möglich
          im Voraus angekündigt.
        </P>

        <H3>2.3 Änderungen des Leistungsumfangs</H3>
        <P>
          Souleya ist berechtigt, den Funktionsumfang jederzeit anzupassen. Wesentliche
          Einschränkungen werden dem Nutzer rechtzeitig mitgeteilt.
        </P>

        {/* 3 */}
        <H2 id="sec-3">3. Registrierung und Zugangsbedingungen</H2>

        <H3>3.1 Registrierungsvoraussetzungen</H3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Mindestalter von 18 Jahren</li>
          <li>Gültige E-Mail-Adresse</li>
          <li>Akzeptanz dieser AGB sowie der Datenschutzerklärung</li>
          <li>Bestätigung, dass alle Daten der Wahrheit entsprechen</li>
        </ul>

        <H3>3.2 Registrierungsverfahren (Magic Link)</H3>
        <P>
          Registrierung und Login erfolgen über Magic-Link-Verfahren. Du erhältst einen
          einmaligen Anmeldelink per E-Mail, dessen Klick den Zugang aktiviert.
        </P>

        <H3>3.3 Nutzerkonto</H3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Nur ein Konto pro Nutzer</li>
          <li>Weitergabe von Zugangsdaten ist nicht gestattet</li>
          <li>Du bist verpflichtet, Zugangsdaten sicher aufzubewahren</li>
          <li>Informiere Souleya unverzüglich bei verdächtigem Zugriff</li>
        </ul>

        <H3>3.4 Vertragsschluss</H3>
        <P>
          Der Vertrag kommt mit Abschluss der Registrierung und Bestätigung der E-Mail-Adresse
          zustande. Bei kostenpflichtigen Abonnements mit Zahlungsbestätigung.
        </P>

        {/* 4 */}
        <H2 id="sec-4">4. Nutzungsrechte und Nutzerpflichten</H2>

        <H3>4.1 Nutzungsrecht</H3>
        <P>
          Souleya räumt dir ein einfaches, nicht übertragbares und nicht unterlizenzierbares Recht
          ein, die Plattform im Rahmen dieser AGB zu nutzen.
        </P>

        <H3>4.2 Pflichten des Nutzers</H3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Nur wahre und vollständige Angaben machen</li>
          <li>Inhalte nur veröffentlichen, wenn du dazu berechtigt bist</li>
          <li>Rechte Dritter respektieren</li>
          <li>Keine illegalen Inhalte veröffentlichen</li>
          <li>Technische Infrastruktur nicht beeinträchtigen</li>
          <li>Keine automatisierten Abfragen (Bots, Scraper) verwenden</li>
        </ul>

        <H3>4.3 Nutzerinhalte</H3>
        <P>
          Du bleibst Rechteinhaber deiner Inhalte. Du räumst Souleya ein kostenfreies,
          nicht-exklusives, weltweites Nutzungsrecht ein, diese Inhalte zu speichern, anzuzeigen
          und zu übertragen. Dieses Recht endet mit Kontolöschung.
        </P>

        {/* 5 */}
        <H2 id="sec-5">5. Verbotene Inhalte und Verhaltensregeln</H2>

        <H3>5.1 Verbotene Inhalte</H3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Inhalte, die gegen Gesetze verstossen</li>
          <li>Hassbotschaften, Diskriminierung, Aufstachelung zu Gewalt</li>
          <li>Belästigungen, Bedrohungen, Mobbing</li>
          <li>Sexuell explizite Inhalte</li>
          <li>Spam, unerwünschte Werbung</li>
          <li>Falsche Tatsachenbehauptungen</li>
          <li>Schadsoftware</li>
          <li>Urheberrechtsverletzungen</li>
        </ul>

        <H3>5.2 Besondere Pflichten für Mentoren</H3>
        <P>Mentoren ist Folgendes ausdrücklich untersagt:</P>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Souleya als Werbetrichter für externe Angebote nutzen</li>
          <li>Kostenpflichtige Inhalte zeitgleich/exklusiv auf anderen Plattformen veröffentlichen</li>
          <li>Mitglieder aktiv dazu auffordern, Souleya zu verlassen</li>
          <li>Politische, religiöse oder medizinisch fragwürdige Inhalte veröffentlichen</li>
        </ul>
        <P>Bei Verstoss: Mentor-Status-Entziehung, Inhalts-Entfernung, Konto-Sperrung, ausserordentliche Kündigung.</P>

        <H3>5.3 Meldung von Verstössen</H3>
        <P>
          Du kannst regelwidrige Inhalte über die Meldefunktion melden. Souleya prüft und
          entfernt gegebenenfalls.
        </P>

        {/* 6 */}
        <H2 id="sec-6">6. Abonnement-Modell und Preise</H2>

        <H3>6.1 Kostenpflichtige Mitgliedschaft</H3>
        <div className="overflow-x-auto mb-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th className="py-2 pr-3 font-medium" style={{ color: 'var(--text-h)' }}>Abo-Modell</th>
                <th className="py-2 pr-3 font-medium" style={{ color: 'var(--text-h)' }}>Preis</th>
                <th className="py-2 pr-3 font-medium" style={{ color: 'var(--text-h)' }}>Laufzeit</th>
                <th className="py-2 font-medium" style={{ color: 'var(--text-h)' }}>Kündigungsfrist</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--glass-border)' }}>
              <tr>
                <td className="py-2 pr-3">Monatlich</td>
                <td className="py-2 pr-3">20,00 EUR/Monat</td>
                <td className="py-2 pr-3">1 Monat, automatisch</td>
                <td className="py-2">Jederzeit zum Monatsende</td>
              </tr>
              <tr>
                <td className="py-2 pr-3">Jährlich</td>
                <td className="py-2 pr-3">200,00 EUR/Jahr</td>
                <td className="py-2 pr-3">12 Monate, automatisch</td>
                <td className="py-2">4 Wochen vor Jahresende</td>
              </tr>
            </tbody>
          </table>
        </div>
        <P>Alle Preise sind Endpreise. MwSt. ist enthalten.</P>

        <H3>6.2 Kein Rückgaberecht beim Jahresabonnement</H3>
        <P>
          Mit Buchung des Jahresabonnements wird der Gesamtbetrag sofort eingezogen. Der Betrag
          wird nicht anteilig erstattet, wenn du das Abo kündigst, die Plattform nicht nutzt oder
          dein Konto löschst. Der Zugang bleibt bis Jahresende bestehen. Das gesetzliche
          Widerrufsrecht (14 Tage) bleibt davon unberührt.
        </P>

        <H3>6.3 Automatische Verlängerung</H3>
        <P>
          Beide Optionen verlängern sich nach Ablauf automatisch, sofern nicht fristgerecht
          gekündigt wird. Erinnerungs-E-Mails werden vor Verlängerung gesendet.
        </P>

        <H3>6.4 Preisänderungen</H3>
        <P>
          Souleya behält sich das Recht vor, Preise mit 30 Tagen Ankündigungsfrist per E-Mail
          anzupassen. Widerspruch innerhalb 14 Tagen beendet den Vertrag zum Zeitpunkt der
          Preisänderung.
        </P>

        {/* 7 */}
        <H2 id="sec-7">7. Seeds – Die interne Währung</H2>

        <H3>7.1 Was sind Seeds?</H3>
        <P>
          Seeds sind die interne Plattformwährung. Sie können durch Aktivität verdient, optional
          zugekauft und für Premium-Inhalte eingesetzt werden. Seeds sind keine Geldleistung und
          haben keinen gesetzlichen Zahlungsmittelcharakter.
        </P>

        <H3>7.2 Erwerb von Seeds</H3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li><strong>Durch Aktivität:</strong> Profil ausfüllen, Community-Beiträge, Empfehlungen – gelten als Bonus-Seeds</li>
          <li><strong>Durch direkten Kauf:</strong> Per Geldleistung – gelten als gekaufte Seeds</li>
        </ul>
        <P>Richtwert: 1 Seed = 0,01 EUR</P>

        <H3>7.3 Einsatz von Seeds</H3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Premium-Seminare und Intensiv-Workshops</li>
          <li>1:1-Mentor-Sessions</li>
          <li>Strukturierte Premium-Kurse und exklusives Material</li>
          <li>Anteilige oder vollständige Verrechnung des monatlichen Mitgliedsbeitrags (nur Monatsabonnement)</li>
        </ul>

        <H3>7.4 Verfall und Kündigung</H3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li><strong>Bonus-Seeds:</strong> Verfallen 24 Monate nach Eingang. Bei Kündigung verfallen sofort.</li>
          <li><strong>Gekaufte Seeds:</strong> Verfallen 24 Monate nach Eingang. Bei Kündigung eingefroren und nach Reaktivierung verfügbar.</li>
          <li><strong>Eingefrorene Seeds:</strong> Verfallen endgültig nach 24 Monaten Inaktivität des Kontos.</li>
        </ul>

        <H3>7.5 Erstattung von Guthaben</H3>
        <P>
          Auszahlung ist ausgeschlossen. Ausnahme: gekaufte Seeds bei nachgewiesener dauerhafter
          schwerer Erkrankung oder im Todesfall. Antrag per E-Mail an{' '}
          <a href="mailto:hello@souleya.com" className="hover:underline" style={{ color: 'var(--gold-text)' }}>hello@souleya.com</a>.
          Erstattung: 1 Seed = 0,01 EUR.
        </P>

        {/* 8 */}
        <H2 id="sec-8">8. Sabbatical-Modus</H2>

        <H3>8.1 Bedingungen</H3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Maximal 2x pro Kalenderjahr (je 1 Monat) oder 1x für 2 Monate am Stück</li>
          <li>Voraussetzung: mindestens 3 aktive Monate Mitgliedschaft</li>
          <li>Während Pause: kein Beitrag (0 EUR), kein Plattform-Zugang</li>
          <li>Seeds werden eingefroren</li>
          <li>Enso-Ring-Level und VIP-Status bleiben erhalten</li>
        </ul>

        <H3>8.2 Reaktivierung</H3>
        <P>
          Mitgliedschaft reaktiviert sich automatisch nach Pausemonat. Manuelle Reaktivierung
          jederzeit möglich. Jahresvertrag verlängert sich um Pausezeit.
        </P>

        {/* 9 */}
        <H2 id="sec-9">9. Empfehlungsprogramm</H2>

        <H3>9.1 Funktionsweise</H3>
        <P>
          Jedes Mitglied erhält einen persönlichen Empfehlungslink. Wird ein neues Mitglied über
          diesen Link geworben und leistet erste Zahlung, erhältst du Seeds als Prämie.
        </P>

        <H3>9.2 Prämien</H3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Einmalig nach erster Zahlung des Geworbenen: 500 Seeds (ca. 5,00 EUR)</li>
          <li>Monatlich solange Geworbener aktiv ist: 100 Seeds/Monat (ca. 1,00 EUR/Monat)</li>
        </ul>
        <P>Alle Prämien sind ausschliesslich in Seeds. Keine Barauszahlung.</P>

        <H3>9.3 Missbrauchsschutz</H3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Keine Eigenempfehlung möglich</li>
          <li>Keine Prämie bei Storno oder Rückbuchung</li>
          <li>Du musst zum Gutschrift-Zeitpunkt selbst aktives Mitglied sein</li>
          <li>Zweit- oder Fake-Accounts zur Selbstempfehlung sind verboten → Sperrung</li>
        </ul>

        {/* 10 */}
        <H2 id="sec-10">10. Zahlungsbedingungen</H2>

        <H3>10.1 Zahlungsabwicklung</H3>
        <P>Via Stripe Payments Europe, Ltd. (Irland).</P>

        <H3>10.2 Akzeptierte Zahlungsmethoden</H3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Kreditkarte (Visa, Mastercard)</li>
          <li>SEPA-Lastschrift</li>
          <li>Weitere von Stripe angebotene Methoden</li>
        </ul>

        <H3>10.3 Fälligkeit</H3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Monatlich: am jeweiligen Abrechnungstag</li>
          <li>Jährlich: Betrag einmalig zu Laufzeit-Beginn</li>
          <li>Bei Verlängerung: automatisch zum Verlängerungsdatum</li>
        </ul>

        <H3>10.4 Zahlungsverzug</H3>
        <P>
          Bei nicht erfolgreicher Zahlung behält sich Souleya das Recht vor, Zugang zur Plattform
          zu sperren, bis der Betrag beglichen ist. Vorherige E-Mail-Benachrichtigung erfolgt.
        </P>

        {/* 11 */}
        <H2 id="sec-11">11. Widerrufsrecht</H2>

        <H3>11.1 Widerrufsrecht für Verbraucher</H3>
        <P>
          Du hast das Recht, binnen 14 Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
          Die Frist beginnt am Tag des Vertragsabschlusses. Zur Ausübung: eindeutige Erklärung
          (z.B. E-Mail an{' '}
          <a href="mailto:hello@souleya.com" className="hover:underline" style={{ color: 'var(--gold-text)' }}>hello@souleya.com</a>)
          erforderlich.
        </P>
        <P>
          Bei Widerruf zahlen wir alle erhaltenen Zahlungen unverzüglich und spätestens 14 Tage
          nach Eingang deiner Widerrufs-Mitteilung zurück.
        </P>

        <H3>11.2 Erlöschen des Widerrufsrechts</H3>
        <P>
          Das Widerrufsrecht erlischt vorzeitig bei Dienstleistungsverträgen, wenn Souleya die
          Leistung vollständig erbracht hat und mit Ausführung erst nach deiner ausdrücklichen
          Zustimmung und Bestätigung des Widerrufsrechts-Verlusts begonnen hat.
        </P>

        {/* 12 */}
        <H2 id="sec-12">12. Kündigung und Vertragsbeendigung</H2>

        <H3>12.1 Kündigung durch den Nutzer</H3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li><strong>Monatliches Abo:</strong> Jederzeit zum Ende des laufenden Monats</li>
          <li><strong>Jährliches Abo:</strong> Mit 4-Wochen-Frist vor Ablauf des Vertragsjahres</li>
        </ul>
        <P>
          Kündigung über Kontoeinstellungen oder per E-Mail an{' '}
          <a href="mailto:hello@souleya.com" className="hover:underline" style={{ color: 'var(--gold-text)' }}>hello@souleya.com</a>.
        </P>

        <H3>12.2 Zugang nach Kündigung</H3>
        <P>
          Nach Kündigung bleibt Zugang bis Laufzeit-Ende bestehen. Danach wird Zugang deaktiviert.
          Du kannst deine Daten vor Ablauf exportieren.
        </P>

        <H3>12.3 Kontolöschung</H3>
        <P>
          Du kannst dein Konto jederzeit vollständig löschen. Löschung gilt als Kündigung zum
          Ende der laufenden Periode. Nach Löschung werden Daten gemäss Datenschutzerklärung gelöscht.
        </P>

        {/* 13 */}
        <H2 id="sec-13">13. Sperrung und Kündigung durch Souleya</H2>

        <H3>13.1 Ordentliche Kündigung</H3>
        <P>
          Souleya kann das Verhältnis mit 30-Tagen-Frist kündigen. Bereits gezahlte Beträge für
          die verbleibende Laufzeit werden anteilig erstattet.
        </P>

        <H3>13.2 Ausserordentliche Kündigung und Sperrung</H3>
        <P>Souleya ist berechtigt, das Konto ohne Vorankündigung zu sperren oder fristlos zu kündigen, wenn du:</P>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Diese AGB schwerwiegend oder wiederholt verletzt</li>
          <li>Verbotene Inhalte veröffentlichst</li>
          <li>Falsche Angaben bei Registrierung gemacht hast</li>
          <li>Straftaten oder Rechtsverstösse über die Plattform begehst</li>
          <li>Das Mindestalter von 18 Jahren unterschreitest</li>
        </ul>
        <P>Bei ausserordentlicher Kündigung aus wichtigem Grund: kein Anspruch auf Rückerstattung.</P>

        {/* 14 */}
        <H2 id="sec-14">14. Haftungsbeschränkung</H2>

        <H3>14.1 Haftung von Souleya</H3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Unbeschränkt für Schäden aus Verletzung von Leben, Körper oder Gesundheit sowie Vorsatz/grobe Fahrlässigkeit</li>
          <li>Für einfache Fahrlässigkeit: nur bei Verletzung wesentlicher Vertragspflichten, beschränkt auf vorhersehbaren Schaden</li>
        </ul>

        <H3>14.2 Haftung für Nutzerinhalte</H3>
        <P>Souleya haftet nicht für von Nutzern eingestellte Inhalte. Nutzer sind allein verantwortlich.</P>

        <H3>14.3 Links zu externen Websites</H3>
        <P>Souleya haftet nicht für Inhalte verlinkter externer Websites.</P>

        {/* 15 */}
        <H2 id="sec-15">15. Geistiges Eigentum und Urheberrecht</H2>

        <H3>15.1 Rechte von Souleya</H3>
        <P>
          Alle Inhalte der Plattform – Design, Texte, Grafiken, Logos, Software – sind
          urheberrechtlich geschützt und Eigentum von Souleya. Nutzung ausserhalb der Plattform
          bedarf schriftlicher Zustimmung.
        </P>

        <H3>15.2 Nutzerinhalte</H3>
        <P>
          Du behältst das Urheberrecht. Souleya erhält das Recht, Nutzerinhalte innerhalb der
          Plattform anzuzeigen und zu speichern. Dieses Recht endet mit Löschung.
        </P>

        {/* 16 */}
        <H2 id="sec-16">16. Datenschutz</H2>
        <P>
          Erhebung, Verarbeitung und Nutzung personenbezogener Daten erfolgt gemäss DSGVO und
          BDSG. Die ausführliche Datenschutzerklärung ist unter{' '}
          <Link href="/datenschutz" className="hover:underline" style={{ color: 'var(--gold-text)' }}>
            souleya.com/datenschutz
          </Link>{' '}
          abrufbar und Bestandteil dieser AGB.
        </P>

        {/* 17 */}
        <H2 id="sec-17">17. Änderungen der AGB</H2>
        <P>
          Souleya behält sich das Recht vor, die AGB mit Wirkung für die Zukunft zu ändern.
          Änderungen werden mindestens 30 Tage vor Inkrafttreten mitgeteilt. Ohne Widerspruch
          innerhalb 30 Tagen gelten neue AGB als akzeptiert.
        </P>

        {/* 18 */}
        <H2 id="sec-18">18. Schlussbestimmungen</H2>

        <H3>18.1 Anwendbares Recht</H3>
        <P>
          Es gilt das Recht der Bundesrepublik Deutschland (ohne UN-Kaufrecht CISG). Bei
          Verbrauchern gilt diese Wahl nur soweit zwingende Bestimmungen des Verbraucher-Heimatstaates
          nicht entzogen werden.
        </P>

        <H3>18.2 Gerichtsstand</H3>
        <P>
          Gerichtsstand für Streitigkeiten ist – soweit gesetzlich zulässig – Tallinn, Estland.
        </P>

        <H3>18.3 Streitbeilegung</H3>
        <P>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung bereit:{' '}
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--gold-text)' }}>
            ec.europa.eu/consumers/odr
          </a>
        </P>

        <H3>18.4 Salvatorische Klausel</H3>
        <P>
          Sollten einzelne Bestimmungen unwirksam sein, berührt dies nicht die Gültigkeit der
          übrigen. Anstelle unwirksamer Bestimmungen gilt eine wirksame Bestimmung, die dem
          wirtschaftlichen Zweck am nächsten kommt.
        </P>
      </div>
    </div>
  );
}
