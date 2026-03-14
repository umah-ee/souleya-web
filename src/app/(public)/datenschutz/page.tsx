import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung | Souleya',
  description: 'Datenschutzerklärung von Souleya – Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO.',
};

/* ── Helpers ── */
function SectionH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-heading text-xl italic mb-3 mt-10" style={{ color: 'var(--text-h)' }}>
      {children}
    </h2>
  );
}

function SectionH3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-medium text-base mb-2 mt-6" style={{ color: 'var(--text-h)' }}>
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-3">{children}</p>;
}

export default function DatenschutzPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1
        className="font-heading text-3xl md:text-4xl italic mb-2"
        style={{ color: 'var(--text-h)' }}
      >
        Datenschutzerklärung
      </h1>
      <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>
        Gemäss Art. 13, 14 DSGVO · Stand: 13.03.2026
      </p>

      <div className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>

        {/* 1 */}
        <SectionH2>1. Verantwortlicher</SectionH2>
        <P>Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO):</P>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li><strong>Betreiber:</strong> Souleya – betrieben von umah.ee OÜ</li>
          <li><strong>Anschrift:</strong> Sakala tn 7-2, 10141 Tallinn, Estland</li>
          <li><strong>E-Mail:</strong>{' '}
            <a href="mailto:datenschutz@souleya.com" className="hover:underline" style={{ color: 'var(--gold-text)' }}>
              datenschutz@souleya.com
            </a>
          </li>
          <li><strong>Website:</strong> souleya.com</li>
        </ul>

        {/* 2 */}
        <SectionH2>2. Datenschutzbeauftragter</SectionH2>
        <P>
          Gemäss Art. 37 DSGVO ist die Benennung eines Datenschutzbeauftragten derzeit nicht
          erforderlich. Die Bestellung wird regelmässig geprüft.
        </P>

        {/* 3 */}
        <SectionH2>3. Erhebung und Verarbeitung personenbezogener Daten</SectionH2>

        <SectionH3>3.1 Beim Besuch der Website</SectionH3>
        <P>Automatisch erhobene Daten:</P>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>IP-Adresse des anfragenden Rechners (anonymisiert nach 7 Tagen)</li>
          <li>Datum und Uhrzeit des Zugriffs</li>
          <li>Name und URL der abgerufenen Datei</li>
          <li>Website, von der aus der Zugriff erfolgt (Referrer-URL)</li>
          <li>Verwendeter Browser und Betriebssystem</li>
          <li>Name des Access-Providers</li>
        </ul>
        <P>Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)</P>

        <SectionH3>3.2 Bei Registrierung und Nutzung</SectionH3>
        <div className="overflow-x-auto mb-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th className="py-2 pr-3 font-medium" style={{ color: 'var(--text-h)' }}>Datenkategorie</th>
                <th className="py-2 pr-3 font-medium" style={{ color: 'var(--text-h)' }}>Zweck</th>
                <th className="py-2 font-medium" style={{ color: 'var(--text-h)' }}>Rechtsgrundlage</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--glass-border)' }}>
              <tr><td className="py-2 pr-3">E-Mail-Adresse</td><td className="py-2 pr-3">Zugang, Magic Link Auth, Kommunikation</td><td className="py-2">Art. 6 Abs. 1 lit. b DSGVO</td></tr>
              <tr><td className="py-2 pr-3">Vorname</td><td className="py-2 pr-3">Personalisierung, Community-Funktionen</td><td className="py-2">Art. 6 Abs. 1 lit. b DSGVO</td></tr>
              <tr><td className="py-2 pr-3">Profilbild (optional)</td><td className="py-2 pr-3">Darstellung im Profil</td><td className="py-2">Art. 6 Abs. 1 lit. a DSGVO</td></tr>
              <tr><td className="py-2 pr-3">Interessen/Präferenzen</td><td className="py-2 pr-3">Personalisierung</td><td className="py-2">Art. 6 Abs. 1 lit. b DSGVO</td></tr>
              <tr><td className="py-2 pr-3">Nutzungsdaten</td><td className="py-2 pr-3">Verbesserung der Plattform</td><td className="py-2">Art. 6 Abs. 1 lit. f DSGVO</td></tr>
            </tbody>
          </table>
        </div>

        <SectionH3>3.3 E-Mail-Kommunikation</SectionH3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Magic Link E-Mail (Verifizierung)</li>
          <li>Willkommens-E-Mail</li>
          <li>Erinnerungs-E-Mails (maximal 2 innerhalb 72 Stunden bei unvollständiger Registrierung)</li>
          <li>Launch-Informationen</li>
          <li>Optionaler Newsletter (mit Einwilligung)</li>
        </ul>

        {/* 4 */}
        <SectionH2>4. Magic Link Authentifizierung</SectionH2>
        <P>
          Magic Link Verfahren mit 24-Stunden-Gültigkeit. Single-Use-Token: Nach einmaligem Aufruf
          oder nach Ablauf ungültig. Der Anklick gilt als Vertragsanbahnung gemäss Art. 6 Abs. 1
          lit. b DSGVO.
        </P>

        {/* 5 */}
        <SectionH2>5. Weitergabe personenbezogener Daten an Dritte</SectionH2>

        <SectionH3>5.1 Hosting und Infrastruktur</SectionH3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li><strong>Website-Hosting:</strong> Vercel Inc. (USA)</li>
          <li><strong>API-Server:</strong> Railway Corporation (USA)</li>
          <li><strong>Datenbank &amp; Auth:</strong> Supabase Inc. (AWS, USA)</li>
          <li><strong>Rechtsgrundlage:</strong> Art. 28 DSGVO, Standardvertragsklauseln</li>
        </ul>

        <SectionH3>5.2 E-Mail-Versand</SectionH3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li><strong>Anbieter:</strong> Resend Inc. (USA)</li>
          <li><strong>Daten:</strong> E-Mail-Adresse, Vorname</li>
          <li><strong>Rechtsgrundlage:</strong> Art. 28 DSGVO, Standardvertragsklauseln</li>
        </ul>

        <SectionH3>5.3 Zahlungsabwicklung</SectionH3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li><strong>Anbieter:</strong> Stripe Payments Europe, Ltd. (Irland)</li>
          <li><strong>Daten:</strong> Name, E-Mail, Rechnungsadresse, Zahlungsdaten (Kreditkartendaten werden nur von Stripe gespeichert)</li>
          <li><strong>Zertifizierung:</strong> EU-US Data Privacy Framework</li>
        </ul>

        {/* 6 */}
        <SectionH2>6. Cookies und ähnliche Technologien</SectionH2>

        <SectionH3>6.1 Technisch notwendige Cookies</SectionH3>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Session-Cookies (zur Aufrechterhaltung der Anmeldung)</li>
          <li>Sicherheits-Cookies (CSRF-Schutz)</li>
        </ul>
        <P>Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO</P>

        <SectionH3>6.2 Optionale Cookies</SectionH3>
        <P>Nur mit expliziter Einwilligung. Jederzeit über Cookie-Einstellungen widerrufbar.</P>

        <SectionH3>6.3 Social Media Tracking (Pixel)</SectionH3>
        <P>
          <strong>Meta Pixel (Facebook &amp; Instagram):</strong> Anbieter: Meta Platforms Ireland Limited (Irland).
          Nachverfolgung nach Anzeigen-Klick.
        </P>
        <P>
          <strong>TikTok Pixel:</strong> Anbieter: TikTok Information Technologies UK Limited.
          Messung von Kampagnen-Wirksamkeit.
        </P>
        <P>
          <strong>Pinterest Tag:</strong> Anbieter: Pinterest Europe Ltd. (Irland).
          Erfolgsmessung von Pinterest-Kampagnen.
        </P>

        {/* 7 */}
        <SectionH2>7. Speicherdauer und Löschfristen</SectionH2>
        <div className="overflow-x-auto mb-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th className="py-2 pr-3 font-medium" style={{ color: 'var(--text-h)' }}>Datenkategorie</th>
                <th className="py-2 pr-3 font-medium" style={{ color: 'var(--text-h)' }}>Speicherdauer</th>
                <th className="py-2 font-medium" style={{ color: 'var(--text-h)' }}>Grund</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--glass-border)' }}>
              <tr><td className="py-2 pr-3">Kontodaten (E-Mail, Name)</td><td className="py-2 pr-3">Bis zur Löschung des Kontos</td><td className="py-2">Vertragserfüllung</td></tr>
              <tr><td className="py-2 pr-3">Profilbild</td><td className="py-2 pr-3">Bis Löschung oder manuelle Entfernung</td><td className="py-2">Einwilligung</td></tr>
              <tr><td className="py-2 pr-3">Server-Logfiles/IP</td><td className="py-2 pr-3">7 Tage (dann anonymisiert)</td><td className="py-2">Berechtigtes Interesse</td></tr>
              <tr><td className="py-2 pr-3">Nicht abgeschl. Registrierungen</td><td className="py-2 pr-3">72 Stunden nach letzter E-Mail</td><td className="py-2">DSGVO-Konformität</td></tr>
              <tr><td className="py-2 pr-3">Magic Link Token</td><td className="py-2 pr-3">24 Stunden oder bis Nutzung</td><td className="py-2">Sicherheit</td></tr>
              <tr><td className="py-2 pr-3">Gelöschte Konten</td><td className="py-2 pr-3">30 Tage (Wiederherstellungsfrist)</td><td className="py-2">Vertragserfüllung</td></tr>
            </tbody>
          </table>
        </div>

        {/* 8 */}
        <SectionH2>8. Deine Rechte als betroffene Person</SectionH2>
        <P>
          Kontakt:{' '}
          <a href="mailto:datenschutz@souleya.com" className="hover:underline" style={{ color: 'var(--gold-text)' }}>
            datenschutz@souleya.com
          </a>
        </P>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li><strong>Auskunftsrecht</strong> (Art. 15 DSGVO) – Bestätigung über Verarbeitung deiner Daten</li>
          <li><strong>Recht auf Berichtigung</strong> (Art. 16 DSGVO) – Korrektur unrichtiger Daten</li>
          <li><strong>Recht auf Löschung</strong> (Art. 17 DSGVO) – Löschung deiner Daten, soweit keine Aufbewahrungspflicht besteht</li>
          <li><strong>Recht auf Einschränkung</strong> (Art. 18 DSGVO) – Einschränkung der Verarbeitung</li>
          <li><strong>Recht auf Datenübertragbarkeit</strong> (Art. 20 DSGVO) – Daten in maschinenlesbarer Form</li>
          <li><strong>Widerspruchsrecht</strong> (Art. 21 DSGVO) – Widerspruch gegen Verarbeitung auf Basis berechtigter Interessen</li>
          <li><strong>Widerruf der Einwilligung</strong> (Art. 7 Abs. 3 DSGVO) – Jederzeit widerrufbar</li>
        </ul>

        {/* 9 */}
        <SectionH2>9. Beschwerderecht bei der Aufsichtsbehörde</SectionH2>
        <P>
          <strong>Zuständige Aufsichtsbehörde:</strong> Andmekaitse Inspektsioon (Estnische Datenschutzbehörde),
          Tatari 39, 10134 Tallinn, Estland –{' '}
          <a href="https://www.aki.ee" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--gold-text)' }}>
            aki.ee
          </a>
        </P>
        <P>
          Für Nutzer aus Deutschland:{' '}
          <a href="https://www.bfdi.bund.de" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--gold-text)' }}>
            bfdi.bund.de
          </a>
        </P>

        {/* 10 */}
        <SectionH2>10. Datensicherheit</SectionH2>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>SSL/TLS-Verschlüsselung für alle Datenübertragungen (HTTPS)</li>
          <li>Magic Links sind Single-Use und laufen nach 24 Stunden ab</li>
          <li>Zugriff auf Daten nur für autorisierte Mitarbeiter</li>
          <li>Regelmässige Überprüfung der Sicherheitsmassnahmen</li>
        </ul>

        {/* 11 */}
        <SectionH2>11. Kinder und Minderjährige</SectionH2>
        <P>
          Die Plattform richtet sich ausschliesslich an Personen ab 18 Jahren.
          Personenbezogene Daten von Minderjährigen werden umgehend gelöscht.
        </P>

        {/* 12 */}
        <SectionH2>12. Änderungen dieser Datenschutzerklärung</SectionH2>
        <P>
          Die aktuelle Version ist jederzeit unter souleya.com/datenschutz abrufbar.
          Bei wesentlichen Änderungen wird der Nutzer per E-Mail benachrichtigt.
        </P>

        {/* 13 */}
        <SectionH2>13. Kontakt für Datenschutzanfragen</SectionH2>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>
            <strong>E-Mail:</strong>{' '}
            <a href="mailto:datenschutz@souleya.com" className="hover:underline" style={{ color: 'var(--gold-text)' }}>
              datenschutz@souleya.com
            </a>
          </li>
          <li><strong>Bearbeitungsfrist:</strong> 30 Tage (Art. 12 Abs. 3 DSGVO)</li>
        </ul>
      </div>
    </div>
  );
}
