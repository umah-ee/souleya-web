/**
 * Demo-/Testbilder fuer Events ohne eigenes Cover.
 * Unsplash-Links, thematisch passend: Spiritualitaet, Wellness, Natur.
 * Wird deterministisch basierend auf der Event-ID zugewiesen,
 * sodass jedes Event immer dasselbe Bild bekommt.
 */

const DEMO_COVERS = [
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80', // Meditation am Strand
  'https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&q=80', // Yoga Pose
  'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=600&q=80', // Wald Lichtung
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80', // Berglandschaft
  'https://images.unsplash.com/photo-1529693662653-9d480530a697?w=600&q=80', // Klangschale
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80', // Yoga Gruppe
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80', // Sternenhimmel Berge
  'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=600&q=80', // Gruener See
];

/**
 * Gibt ein Demo-Cover-Bild fuer eine Event-ID zurueck.
 * Deterministisch: gleiche ID → gleiches Bild.
 */
export function getDemoCover(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return DEMO_COVERS[Math.abs(hash) % DEMO_COVERS.length];
}

/**
 * Gibt das cover_url zurueck oder ein Demo-Fallback.
 */
export function getEventCover(coverUrl: string | null | undefined, eventId: string): string {
  return coverUrl || getDemoCover(eventId);
}
