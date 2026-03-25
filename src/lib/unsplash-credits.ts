/**
 * Zentrales Mapping: Unsplash Photo-ID → Fotografen-Info.
 * Wird fuer die Attribution auf allen Unsplash-Bildern verwendet.
 * UTM-Parameter: ?utm_source=souleya&utm_medium=referral
 */

export interface UnsplashCredit {
  name: string;
  username: string;
}

const UNSPLASH_CREDITS: Record<string, UnsplashCredit> = {
  // HeroSlider — TODO: Fotografen-Namen muessen manuell verifiziert werden
  // (Unsplash Photo-IDs lassen sich nicht automatisch aufloesen)
  'photo-1529156069898-49953e39b3ac': { name: 'Helena Lopes', username: 'helenalopesph' },
  'photo-1544367567-0f2fcb009e0b': { name: 'Anupam Mahapatra', username: 'mister_a' },
  'photo-1619781458519-5c6115c0ee98': { name: 'Conscious Design', username: 'conscious_design' },

  // FeaturesGrid
  'photo-1722963220475-979db2dbf216': { name: 'Dingzeyu Li', username: 'dingzeyuli' },
  'photo-1593811167562-9cef47bfc4d7': { name: 'Kaylee Garrett', username: 'realkayls' },
  'photo-1523301343968-6a6ebf63c672': { name: 'Kimson Doan', username: 'kimsondoan' },

  // HowItWorks
  'photo-1525026198548-4baa812f1183': { name: 'Papaioannou Kostas', username: 'papaioannou_kostas' },

  // FirstLightSection (Avatar)
  'photo-1544005313-94ddf0286df2': { name: 'Houcine Ncib', username: 'houcinencibphotography' },

  // demo-covers
  'photo-1506126613408-eca07ce68773': { name: 'Jared Rice', username: 'jareddrice' },
  'photo-1545389336-cf090694435e': { name: 'Patrick Malleret', username: 'pmalleret' },
  'photo-1518241353330-0f7941c2d9b5': { name: 'Sebastian Unrau', username: 'sebastian_unrau' },
  'photo-1507003211169-0a1dd7228f2d': { name: 'Jack Finnigan', username: 'jackofallstreets' },
  'photo-1529693662653-9d480530a697': { name: 'magic bowls', username: 'magicbowls' },
  'photo-1519681393784-d120267933ba': { name: 'Benjamin Voros', username: 'vorosbenisop' },
  'photo-1497436072909-60f360e1d4b1': { name: 'Luca Bravo', username: 'lucabravo' },

  // TopicHero – Beziehungen & Verbindung
  'photo-1758524945869-24a53c8cbc1e': { name: 'Vitaly Gariev', username: 'silverkblack' },
};

/**
 * Extrahiert die Photo-ID aus einer Unsplash-URL.
 * z.B. "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600" → "photo-1529156069898-49953e39b3ac"
 */
function extractPhotoId(url: string): string | null {
  const match = url.match(/(photo-[\d]+-[a-f0-9]+)/);
  return match ? match[1] : null;
}

/**
 * Gibt die Fotografen-Info fuer eine Unsplash-URL zurueck.
 */
export function getCreditForUrl(url: string): UnsplashCredit | null {
  const id = extractPhotoId(url);
  if (!id) return null;
  return UNSPLASH_CREDITS[id] ?? null;
}

/**
 * Gibt die Fotografen-Info fuer eine Photo-ID zurueck.
 */
export function getCreditForId(photoId: string): UnsplashCredit | null {
  return UNSPLASH_CREDITS[photoId] ?? null;
}
