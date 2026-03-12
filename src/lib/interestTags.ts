// ── Interest Tags — gruppierte Vorschläge für Nutzer-Interessen ──
//
// Jede Kategorie enthält Hauptthema + Unterthemen als Tags.
// User kann aus allen Tags wählen oder eigene eingeben.

export interface InterestCategory {
  label: string;
  icon: string; // Emoji als visueller Anker
  tags: string[];
}

export const INTEREST_CATEGORIES: InterestCategory[] = [
  {
    label: 'Meditation & Achtsamkeit',
    icon: '🧘',
    tags: [
      'Achtsamkeit', 'Achtsames Essen', 'Achtsamkeit am Arbeitsplatz',
      'Meditation', 'Geführte Meditation', 'Transzendentale Meditation',
      'Geh-Meditation', 'Innere Ruhe', 'Stille-Retreats',
    ],
  },
  {
    label: 'Yoga & Bewegung',
    icon: '🙏',
    tags: [
      'Yoga', 'Hormon-Yoga', 'Yoga Nidra', 'Qigong', 'Tai Chi',
      'Tiefenentspannung', 'Progressive Muskelentspannung',
    ],
  },
  {
    label: 'Atemarbeit',
    icon: '🌬️',
    tags: [
      'Atemarbeit', 'Pranayama', 'Holotropes Atmen',
      'Box Breathing', 'Nervensystem Regulation',
    ],
  },
  {
    label: 'Energiearbeit & Heilung',
    icon: '✨',
    tags: [
      'Energiearbeit', 'Reiki', 'Reiki Fernheilung', 'Prana-Heilung',
      'Chakren', 'Herzchakra', 'Wurzelchakra', 'Aura',
      'Kristallheilung', 'Heilsteine', 'Edelsteinwasser',
      'Frequenzheilung', 'Klangschalen', 'Solfeggio Frequenzen',
    ],
  },
  {
    label: 'Spiritualität & Bewusstsein',
    icon: '🔮',
    tags: [
      'Spirituelles Erwachen', 'Bewusstsein', 'Höheres Selbst',
      'Lichtarbeit', 'Channeling', 'Schamanismus',
      'Seelenreise', 'Astralreisen', 'Schamanische Reisen',
      'Karma', 'Dharma', 'Seelenweg', 'Berufung finden',
    ],
  },
  {
    label: 'Persönlichkeitsentwicklung',
    icon: '🌱',
    tags: [
      'Selbstliebe', 'Selbstakzeptanz', 'Grenzen setzen',
      'Transformation', 'Loslass-Prozesse', 'Schattenarbeit',
      'Inneres Kind', 'Glaubenssätze auflösen', 'Intuition',
      'Resilienz', 'Klarheit', 'Entscheidungsfindung',
    ],
  },
  {
    label: 'Manifestation & Fülle',
    icon: '🎯',
    tags: [
      'Manifestation', 'Law of Attraction', 'Vision Board',
      'Fülle-Bewusstsein', 'Bewusstes Erschaffen',
      'Dankbarkeit', 'Dankbarkeitstagebuch',
    ],
  },
  {
    label: 'Gesundheit & Körper',
    icon: '💚',
    tags: [
      'Ayurveda', 'Ernährung', 'Superfoods', 'Fasten',
      'Detox', 'Biohacking', 'Longevity', 'Zellgesundheit',
      'Sauna & Eisbaden', 'Wim Hof Methode',
      'Vitalität', 'Stressreduktion', 'Burnout-Prävention',
      'Vagusnerv-Training',
    ],
  },
  {
    label: 'Herzöffnung & Beziehungen',
    icon: '💛',
    tags: [
      'Herzöffnung', 'Vergebungsarbeit', 'Mitgefühl',
      'Beziehungsmuster', 'Emotionale Intelligenz',
      'Weibliche Spiritualität', 'Männliche Energie',
    ],
  },
  {
    label: 'Natur & Erdung',
    icon: '🌿',
    tags: [
      'Naturverbundenheit', 'Waldbaden', 'Erdung',
      'Barfuß laufen', 'Elemente-Lehre',
    ],
  },
  {
    label: 'Kreativität & Ausdruck',
    icon: '🎨',
    tags: [
      'Journaling', 'Morgenseiten', 'Intuitives Schreiben',
      'Musik', 'Tanz', 'Kunst', 'Mantren',
    ],
  },
  {
    label: 'Bewusstes Leben',
    icon: '☯️',
    tags: [
      'Slow Living', 'Nachhaltigkeit', 'Bewusster Konsum',
      'Selbstfürsorge', 'Work-Life-Balance',
      'Feng Shui', 'Harmonie', 'Coaching',
    ],
  },
];

/** Flaches Array aller verfügbaren Tags */
export const ALL_INTEREST_TAGS: string[] = INTEREST_CATEGORIES.flatMap((c) => c.tags);

/** Suche in Tags — case-insensitive, Teilstring-Match */
export function searchInterestTags(query: string): string[] {
  if (!query.trim()) return [];
  const lower = query.toLowerCase();
  return ALL_INTEREST_TAGS.filter((tag) => tag.toLowerCase().includes(lower));
}
