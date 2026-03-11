// ══════════════════════════════════════════════════════════════
// SOULEYA — Tägliche Weisheitssprüche
// Kuratierte Sammlung aus verschiedenen spirituellen Traditionen
// ══════════════════════════════════════════════════════════════

export interface WisdomQuote {
  text: string;
  author: string;
  tradition: string;
}

const QUOTES: WisdomQuote[] = [
  // ── Buddha / Buddhismus ────────────────────────────────────
  { text: 'Der Geist ist alles. Was du denkst, das wirst du.', author: 'Buddha', tradition: 'Buddhismus' },
  { text: 'Es gibt keinen Weg zum Glück. Glücklichsein ist der Weg.', author: 'Buddha', tradition: 'Buddhismus' },
  { text: 'Verweile nicht in der Vergangenheit, träume nicht von der Zukunft. Konzentriere dich auf den gegenwärtigen Moment.', author: 'Buddha', tradition: 'Buddhismus' },
  { text: 'Jeder Morgen ist eine neue Chance, das Leben zu verändern.', author: 'Buddha', tradition: 'Buddhismus' },
  { text: 'Lerne loszulassen. Das ist der Schlüssel zum Glück.', author: 'Buddha', tradition: 'Buddhismus' },
  { text: 'Frieden kommt von innen. Suche ihn nicht außerhalb.', author: 'Buddha', tradition: 'Buddhismus' },
  { text: 'Tausende von Kerzen kann man am Licht einer Kerze anzünden, ohne dass ihr Licht schwächer wird.', author: 'Buddha', tradition: 'Buddhismus' },
  { text: 'Wir sind, was wir denken. Alles, was wir sind, entsteht aus unseren Gedanken.', author: 'Buddha', tradition: 'Buddhismus' },
  { text: 'Drei Dinge lassen sich nicht verbergen: die Sonne, der Mond und die Wahrheit.', author: 'Buddha', tradition: 'Buddhismus' },

  // ── Laotse / Taoismus ──────────────────────────────────────
  { text: 'Der Weg ist das Ziel.', author: 'Laotse', tradition: 'Taoismus' },
  { text: 'Wer andere kennt, ist klug. Wer sich selbst kennt, ist weise.', author: 'Laotse', tradition: 'Taoismus' },
  { text: 'Eine Reise von tausend Meilen beginnt mit einem einzigen Schritt.', author: 'Laotse', tradition: 'Taoismus' },
  { text: 'Stille ist eine Quelle großer Stärke.', author: 'Laotse', tradition: 'Taoismus' },
  { text: 'Wenn du loslässt, hast du beide Hände frei.', author: 'Laotse', tradition: 'Taoismus' },
  { text: 'Wasser ist die weichste Substanz der Welt, doch es kann den härtesten Stein aushöhlen.', author: 'Laotse', tradition: 'Taoismus' },
  { text: 'Die Natur eilt nicht und dennoch wird alles vollendet.', author: 'Laotse', tradition: 'Taoismus' },
  { text: 'Güte in Worten schafft Vertrauen. Güte im Denken schafft Tiefe.', author: 'Laotse', tradition: 'Taoismus' },

  // ── Rumi / Sufismus ────────────────────────────────────────
  { text: 'Die Wunde ist der Ort, an dem das Licht in dich eintritt.', author: 'Rumi', tradition: 'Sufismus' },
  { text: 'Gestern war ich klug und wollte die Welt verändern. Heute bin ich weise und verändere mich selbst.', author: 'Rumi', tradition: 'Sufismus' },
  { text: 'Was du suchst, sucht auch dich.', author: 'Rumi', tradition: 'Sufismus' },
  { text: 'Sei wie ein Baum und lass die toten Blätter fallen.', author: 'Rumi', tradition: 'Sufismus' },
  { text: 'Erhebe dich über die Stürme und du wirst den Sonnenschein finden.', author: 'Rumi', tradition: 'Sufismus' },
  { text: 'Vergiss Sicherheit. Lebe, wo du fürchtest zu leben.', author: 'Rumi', tradition: 'Sufismus' },
  { text: 'Schweigen ist die Sprache Gottes. Alles andere ist schlechte Übersetzung.', author: 'Rumi', tradition: 'Sufismus' },

  // ── Thich Nhat Hanh / Zen ──────────────────────────────────
  { text: 'Trinke deinen Tee langsam und ehrfürchtig, als wäre er die Achse, um die sich die Welt dreht.', author: 'Thich Nhat Hanh', tradition: 'Zen' },
  { text: 'Lächle, atme und gehe langsam.', author: 'Thich Nhat Hanh', tradition: 'Zen' },
  { text: 'Das Wunder ist nicht, auf dem Wasser zu gehen, sondern auf der Erde.', author: 'Thich Nhat Hanh', tradition: 'Zen' },
  { text: 'Der gegenwärtige Moment ist voller Freude und Glück. Wenn du achtsam bist, kannst du es sehen.', author: 'Thich Nhat Hanh', tradition: 'Zen' },
  { text: 'Kein Schlamm, kein Lotus.', author: 'Thich Nhat Hanh', tradition: 'Zen' },

  // ── Zen-Meister ────────────────────────────────────────────
  { text: 'Bevor die Erleuchtung: Holz hacken, Wasser tragen. Nach der Erleuchtung: Holz hacken, Wasser tragen.', author: 'Zen-Sprichwort', tradition: 'Zen' },
  { text: 'Wenn du gehst, dann geh. Wenn du sitzt, dann sitze. Aber schwanke nicht.', author: 'Zen-Sprichwort', tradition: 'Zen' },
  { text: 'Der Anfängergeist kennt viele Möglichkeiten, der Expertengeist nur wenige.', author: 'Shunryu Suzuki', tradition: 'Zen' },
  { text: 'Im Anfängergeist gibt es viele Möglichkeiten. Im Geist des Experten gibt es wenige.', author: 'Shunryu Suzuki', tradition: 'Zen' },
  { text: 'Sitzen wie ein Berg. Fließen wie Wasser.', author: 'Zen-Sprichwort', tradition: 'Zen' },

  // ── Eckhart Tolle ──────────────────────────────────────────
  { text: 'Erkenne tief, dass der gegenwärtige Moment alles ist, was du je hast.', author: 'Eckhart Tolle', tradition: 'Achtsamkeit' },
  { text: 'Du bist nicht deine Gedanken.', author: 'Eckhart Tolle', tradition: 'Achtsamkeit' },
  { text: 'Was immer der gegenwärtige Moment enthält — nimm es an, als hättest du es gewählt.', author: 'Eckhart Tolle', tradition: 'Achtsamkeit' },
  { text: 'Die Stille ist dein wahres Zuhause.', author: 'Eckhart Tolle', tradition: 'Achtsamkeit' },
  { text: 'Das Leben wird nicht gemessen an der Zahl der Atemzüge, sondern an den Momenten, die uns den Atem rauben.', author: 'Eckhart Tolle', tradition: 'Achtsamkeit' },

  // ── Hinduismus / Bhagavad Gita ─────────────────────────────
  { text: 'Du hast das Recht zu handeln, aber niemals auf die Früchte deiner Handlungen.', author: 'Bhagavad Gita', tradition: 'Hinduismus' },
  { text: 'Yoga ist die Reise des Selbst, durch das Selbst, zum Selbst.', author: 'Bhagavad Gita', tradition: 'Hinduismus' },
  { text: 'Wenn der Geist ruhig ist, folgt die Seele.', author: 'Bhagavad Gita', tradition: 'Hinduismus' },
  { text: 'Der Wandel ist das Gesetz des Lebens. Wer nur auf die Vergangenheit oder Gegenwart blickt, wird die Zukunft verpassen.', author: 'Bhagavad Gita', tradition: 'Hinduismus' },
  { text: 'Die Seele ist weder geboren, noch stirbt sie jemals.', author: 'Bhagavad Gita', tradition: 'Hinduismus' },

  // ── Khalil Gibran ──────────────────────────────────────────
  { text: 'Dein Herz kennt im Stillen die Geheimnisse der Tage und Nächte.', author: 'Khalil Gibran', tradition: 'Mystik' },
  { text: 'Aus dem Leiden sind die stärksten Seelen hervorgegangen.', author: 'Khalil Gibran', tradition: 'Mystik' },
  { text: 'Und vergiss nicht, die Erde liebt es, deine nackten Füße zu spüren.', author: 'Khalil Gibran', tradition: 'Mystik' },
  { text: 'Zwischen dem, was gesagt und nicht gemeint, und dem, was gemeint und nicht gesagt wird, geht die Liebe verloren.', author: 'Khalil Gibran', tradition: 'Mystik' },

  // ── Alan Watts ─────────────────────────────────────────────
  { text: 'Das einzige, was sich nie verändert, ist die Veränderung selbst.', author: 'Alan Watts', tradition: 'Philosophie' },
  { text: 'Schlammiges Wasser wird am besten klar, indem man es in Ruhe lässt.', author: 'Alan Watts', tradition: 'Philosophie' },
  { text: 'Du bist das Universum, das sich selbst erfährt.', author: 'Alan Watts', tradition: 'Philosophie' },
  { text: 'Der Sinn des Lebens ist einfach zu leben.', author: 'Alan Watts', tradition: 'Philosophie' },

  // ── Marcus Aurelius / Stoizismus ───────────────────────────
  { text: 'Das Glück deines Lebens hängt ab von der Beschaffenheit deiner Gedanken.', author: 'Marcus Aurelius', tradition: 'Stoizismus' },
  { text: 'Die beste Rache ist, nicht so zu sein wie dein Feind.', author: 'Marcus Aurelius', tradition: 'Stoizismus' },
  { text: 'Verliere keine Zeit damit, über die Fehler anderer nachzudenken.', author: 'Marcus Aurelius', tradition: 'Stoizismus' },

  // ── Weitere ────────────────────────────────────────────────
  { text: 'Sei du selbst die Veränderung, die du dir für diese Welt wünschst.', author: 'Mahatma Gandhi', tradition: 'Hinduismus' },
  { text: 'Achtsamkeit heißt, im gegenwärtigen Moment präsent zu sein, ohne zu urteilen.', author: 'Jon Kabat-Zinn', tradition: 'Achtsamkeit' },
  { text: 'In der Mitte von Schwierigkeiten liegen die Möglichkeiten.', author: 'Albert Einstein', tradition: 'Philosophie' },
  { text: 'Die größte Herrschaft ist die Selbstbeherrschung.', author: 'Seneca', tradition: 'Stoizismus' },
  { text: 'Wer nach außen schaut, träumt. Wer nach innen schaut, erwacht.', author: 'Carl Gustav Jung', tradition: 'Psychologie' },
];

/**
 * Gibt den Spruch des Tages zurück.
 * Deterministisch: gleicher Spruch den ganzen Tag, basierend auf Tag-des-Jahres.
 */
export function getDailyQuote(): WisdomQuote {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}
