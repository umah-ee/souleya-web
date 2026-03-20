'use client';

import { useMemo, useState } from 'react';
import { Icon } from '@/components/ui/Icon';

const AFFIRMATIONS = [
  'Ich vertraue meinem Weg und oeffne mich fuer das, was kommen darf.',
  'Ich bin genug — genau so, wie ich bin.',
  'Ich lasse los, was mir nicht dient, und mache Platz fuer Neues.',
  'Meine innere Staerke waechst mit jedem Tag.',
  'Ich begegne mir selbst mit Mitgefuehl und Geduld.',
  'Ich bin verbunden mit allem, was lebt.',
  'Jeder Atemzug erinnert mich daran, dass ich lebendig bin.',
  'Ich erlaube mir, gluecklich zu sein.',
  'Mein Herz ist offen fuer Liebe und Verbindung.',
  'Ich bin dankbar fuer diesen Moment.',
  'Ich waehle Frieden, auch wenn das Leben laut ist.',
  'Meine Gedanken formen meine Realitaet — ich waehle sie bewusst.',
  'Ich verdiene Ruhe und Erholung.',
  'Ich bin auf dem richtigen Weg, auch wenn ich ihn nicht ganz sehen kann.',
  'Veraenderung ist willkommen — sie hilft mir zu wachsen.',
  'Ich bin staerker, als ich denke.',
  'Heute lasse ich mich von Freude leiten.',
  'Ich bin ein Teil des Ganzen und das Ganze ist in mir.',
  'Mein Koerper ist mein Zuhause — ich behandle ihn mit Respekt.',
  'Ich bin bereit, mein vollstes Potenzial zu leben.',
];

function getDailyAffirmation(): string {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  return AFFIRMATIONS[dayOfYear % AFFIRMATIONS.length];
}

export default function AffirmationCard() {
  const affirmation = useMemo(() => getDailyAffirmation(), []);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(affirmation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: `${affirmation}\n\nsouleya.com` });
      } catch { /* cancelled */ }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center text-center gap-3 p-4">
      <span className="font-label text-[9px] tracking-[0.12em] uppercase" style={{ color: 'var(--gold)' }}>
        Tages-Affirmation
      </span>
      <p className="font-heading italic text-[18px] leading-[1.4]" style={{ color: 'var(--text-h)' }}>
        &ldquo;{affirmation}&rdquo;
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleShare}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full cursor-pointer transition-colors duration-150"
          style={{ border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-muted)', fontFamily: 'inherit', fontSize: '10px', fontWeight: 600 }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <Icon name="share" size={12} />
          Teilen
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full cursor-pointer transition-colors duration-150"
          style={{ border: '1px solid var(--glass-border)', background: 'transparent', color: copied ? 'var(--gold)' : 'var(--text-muted)', fontFamily: 'inherit', fontSize: '10px', fontWeight: 600 }}
          onMouseEnter={(e) => { if (!copied) { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; } }}
          onMouseLeave={(e) => { if (!copied) { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
        >
          <Icon name={copied ? 'check' : 'link'} size={12} />
          {copied ? 'Kopiert' : 'Kopieren'}
        </button>
      </div>
    </div>
  );
}
