/**
 * 5 Hauptthemen mit je 5 Unterthemen, Hotspot-Koordinaten und Unsplash-Bildern.
 * Wird von TopicHero.tsx und FirstLightFullSection.tsx verwendet.
 */

export interface SubTopic {
  name: string;
  desc: string;
  img: string;
  x: number;
  y: number;
}

export interface Topic {
  name: string;
  tag: string;
  img: string;
  subs: SubTopic[];
}

export const TOPICS: Record<string, Topic> = {
  wachstum: {
    name: 'Persönliches Wachstum',
    tag: 'Wachse über dich hinaus',
    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=900&fit=crop',
    subs: [
      { name: 'Glaubenssätze auflösen', desc: 'Erkenne und verändere die unsichtbaren Muster, die dich zurückhalten.', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=500&fit=crop', x: 22, y: 30 },
      { name: 'Selbstwert stärken', desc: 'Lerne, deinen eigenen Wert zu erkennen – unabhängig von Bestätigung.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=500&fit=crop', x: 68, y: 20 },
      { name: 'Gewohnheiten & Routinen', desc: 'Kleine tägliche Schritte, die langfristig alles verändern.', img: 'https://images.unsplash.com/photo-1484627147104-f5197bcd6651?w=800&h=500&fit=crop', x: 44, y: 54 },
      { name: 'Resilienz & Rückschläge', desc: 'Nicht das Fallen zählt, sondern wie du wieder aufstehst.', img: 'https://images.unsplash.com/photo-1505455184862-554165e5f6ba?w=800&h=500&fit=crop', x: 18, y: 68 },
      { name: 'Journaling & Reflexion', desc: 'Schreibe deine Gedanken auf – und finde Klarheit.', img: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&h=500&fit=crop', x: 73, y: 62 },
    ],
  },
  gesundheit: {
    name: 'Gesundheit',
    tag: 'Dein Körper als Zuhause',
    img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&h=900&fit=crop',
    subs: [
      { name: 'Nervensystem & Stress', desc: 'Lerne, dein Nervensystem bewusst zu regulieren.', img: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&h=500&fit=crop', x: 26, y: 34 },
      { name: 'Schlafoptimierung', desc: 'Guter Schlaf ist die Basis für alles andere.', img: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=500&fit=crop', x: 62, y: 22 },
      { name: 'Hormongesundheit', desc: 'Verstehe, wie Hormone dein Wohlbefinden steuern.', img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=500&fit=crop', x: 42, y: 58 },
      { name: 'Mentale Gesundheit', desc: 'Dein Kopf verdient genauso viel Aufmerksamkeit wie dein Körper.', img: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&h=500&fit=crop', x: 74, y: 50 },
      { name: 'Burnout-Prävention', desc: 'Erkenne die Warnsignale, bevor es zu spät ist.', img: 'https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=800&h=500&fit=crop', x: 20, y: 72 },
    ],
  },
  worklife: {
    name: 'Work-Life Balance',
    tag: 'Freiheit mit Struktur',
    img: 'https://images.unsplash.com/photo-1483389127117-b6a2102724ae?w=1600&h=900&fit=crop',
    subs: [
      { name: 'Remote Work optimieren', desc: 'Arbeite von überall – ohne die Struktur zu verlieren.', img: 'https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=800&h=500&fit=crop', x: 30, y: 26 },
      { name: 'Finanzielle Freiheit', desc: 'Baue dir ein System, das für dich arbeitet.', img: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=800&h=500&fit=crop', x: 65, y: 36 },
      { name: 'Produktivität & Deep Work', desc: 'Weniger Stunden, mehr Ergebnis – durch echten Fokus.', img: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&h=500&fit=crop', x: 47, y: 56 },
      { name: 'Grenzen im Job setzen', desc: 'Nein sagen ohne schlechtes Gewissen.', img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=500&fit=crop', x: 22, y: 66 },
      { name: 'Sinnvolle Arbeit finden', desc: 'Arbeit, die sich nicht wie Arbeit anfühlt.', img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=500&fit=crop', x: 70, y: 68 },
    ],
  },
  spiritualitaet: {
    name: 'Spiritualität',
    tag: 'Tiefe ohne Dogma',
    img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600&h=900&fit=crop',
    subs: [
      { name: 'Meditation & Atemübungen', desc: 'Finde Stille – selbst im lautesten Moment.', img: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&h=500&fit=crop', x: 28, y: 30 },
      { name: 'Achtsamkeit im Alltag', desc: 'Nicht auf dem Kissen – sondern beim Frühstück.', img: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&h=500&fit=crop', x: 63, y: 20 },
      { name: 'Human Design', desc: 'Verstehe, wie du funktionierst – und hör auf, dich zu verbiegen.', img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=500&fit=crop', x: 45, y: 52 },
      { name: 'Manifestation', desc: 'Klarheit über das, was du willst – und dann loslegen.', img: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&h=500&fit=crop', x: 71, y: 60 },
      { name: 'Mondzyklen & Astrologie', desc: 'Natürliche Rhythmen als Orientierung.', img: 'https://images.unsplash.com/photo-1533577116850-9cc66cad8a9b?w=800&h=500&fit=crop', x: 20, y: 70 },
    ],
  },
  beziehungen: {
    name: 'Beziehungen & Verbindung',
    tag: 'Echte Freundschaften jenseits der Einsamkeit',
    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&h=900&fit=crop',
    subs: [
      { name: 'Einsamkeit überwinden', desc: 'Du bist nicht allein – du hast nur noch nicht die richtigen gefunden.', img: 'https://images.unsplash.com/photo-1445543949571-ffc3e0e2f55e?w=800&h=500&fit=crop', x: 25, y: 32 },
      { name: 'Echte Freundschaften', desc: 'Tiefe Verbindungen statt oberflächlicher Kontakte.', img: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=800&h=500&fit=crop', x: 63, y: 22 },
      { name: 'Bindungsstile verstehen', desc: 'Warum du so liebst, wie du liebst.', img: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&h=500&fit=crop', x: 46, y: 55 },
      { name: 'Kommunikation & GFK', desc: 'Sag, was du meinst – ohne zu verletzen.', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=500&fit=crop', x: 70, y: 58 },
      { name: 'Grenzen setzen', desc: 'Nein sagen ist ein Akt der Liebe – auch dir selbst gegenüber.', img: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=800&h=500&fit=crop', x: 22, y: 72 },
    ],
  },
};

export const TOPIC_ORDER = ['wachstum', 'gesundheit', 'beziehungen', 'worklife', 'spiritualitaet'];
