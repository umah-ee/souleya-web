import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Über uns · Souleya',
  description:
    'Wer steckt hinter Souleya? Zwei Menschen, ein Gefühl das nicht wegging. Und die Frage ob es anderen auch so geht.',
};

export default function UeberUnsPage() {
  return (
    <div className="about-page">
      <h2>Wer steckt hinter Souleya?</h2>
      <p className="about-subtitle">
        Zwei Menschen, ein Gefühl das nicht wegging. Und die Frage ob es anderen auch so geht.
      </p>

      <h3>Warum Souleya?</h3>

      <p className="about-text">
        Hand aufs Herz. Wann hast du zuletzt ein Gespräch geführt, das dich danach wirklich aufgetankt hat? Nicht das höfliche Wie geht's, gut, danke. Nicht Smalltalk über das Wetter oder den Job. Sondern ein Gespräch, nach dem du denkst. <em>Genau das hat mir gefehlt.</em>
      </p>

      <p className="about-text">
        Wir leben in einer Zeit in der wir für alles eine Lösung haben. Wir optimieren unsere Ernährung, lesen über Mindset, tracken unseren Schlaf, meditieren für mehr Balance. Und trotzdem schleicht sich abends manchmal ein Gedanke ein, den kaum jemand laut ausspricht. <em>Ich mache das alles. Warum fühlt es sich trotzdem so leer an?</em>
      </p>

      <p className="about-text">
        Das ist kein persönliches Versagen. Das ist eine kollektive Erschöpfung. Wir sind perfekt vernetzt und trotzdem zu oft ungesehen. Wir sind Steffi und Andreas, und wir kennen dieses Gefühl. Deshalb haben wir Souleya gegründet.
      </p>

      <div className="about-banner">
        Souleya ist kein weiterer Podcast. Kein weiteres Buch.
      </div>

      <p className="about-bridge">
        Souleya ist ein Ort für Gespräche die bleiben. Keine Tipps, keine Formel, kein Programm. Einfach Menschen die ehrlich reden wollen. Über das was sie bewegt, was sie verändert hat, was sie sich wünschen.
      </p>

      <p className="about-bridge">
        Wir fangen digital an. Jede Woche ein Impuls, eine Frage, ein kleiner Call mit Menschen die das genauso fühlen. Und irgendwann treffen wir uns. Bei einem Tee, einem Spaziergang, einem Abend ohne Agenda.
      </p>

      <p className="about-bridge">
        <strong>Du musst deinen Weg nicht alleine gehen.</strong>
      </p>

      <h3 className="about-team-heading">Das Team</h3>
      <div className="about-team-grid">
        <div className="about-team-card">
          <div className="about-team-name">Andreas</div>
          <div className="about-team-role">Founder &amp; Entwickler</div>
          <p className="about-team-desc">
            Ohne Andreas gäbe es Souleya nicht. Er hat die Idee von Anfang an mitgetragen und baut alles was ihr hier seht. Die Technik, die Räume, den ganzen Ort. Seit über zehn Jahren macht er digitale Produkte, aber Souleya ist das erste bei dem es ihm nicht um Features geht sondern um Menschen.
          </p>
        </div>
        <div className="about-team-card">
          <div className="about-team-name">Steffi</div>
          <div className="about-team-role">Founder &amp; Community</div>
          <p className="about-team-desc">
            Bringt Menschen zusammen und gibt ihnen das Gefühl angekommen zu sein. Jeder Impuls, jede Mail, jeder Call trägt ihre Handschrift. Wenn du bei Souleya das Gefühl hast, da hört jemand wirklich zu, dann ist das meistens Steffi.
          </p>
        </div>
      </div>
    </div>
  );
}
