export type RaumComment = {
  id: string;
  name: string;
  isFounder?: boolean;
  isAnonymous?: boolean;
  timeAgo: string;
  text: string;
  replies?: RaumComment[];
};

type RaumBase = {
  slug: string;
  question: string;
  teaser: string;
  impuls: string[];
  impulsFrage: string;
  comments: RaumComment[];
};

export type CallRaum = RaumBase & {
  type: 'call';
  callDate: string;
  callDateLong: string;
  callTime: string;
  callDurationMin: number;
  callMaxSlots: number;
  callTakenSlots: number;
  ended: boolean;
  callSummary?: string;
};

export type OffenerRaum = RaumBase & {
  type: 'offen';
};

export type Raum = CallRaum | OffenerRaum;

export const RAEUME: Raum[] = [
  {
    slug: 'frueher-ueber-alles-reden',
    type: 'call',
    callDate: 'Samstag 10. Mai',
    callDateLong: '10. Mai, 9 Uhr',
    callTime: '9 Uhr',
    callDurationMin: 20,
    callMaxSlots: 12,
    callTakenSlots: 4,
    ended: false,
    question:
      'Gibt es einen Menschen in deinem Leben mit dem du früher über alles reden konntest und heute irgendwie nicht mehr?',
    teaser:
      'Irgendwann hat sich etwas verschoben. Nicht laut, nicht dramatisch. Einfach leise genug um es zu überhören.',
    impuls: [
      'Irgendwann hat sich etwas verschoben. Nicht laut, nicht dramatisch. Einfach leise genug um es zu überhören. Die Telefonate wurden kürzer. Die Pausen zwischen den Treffen länger. Nicht weil etwas Schlimmes passiert ist. Sondern weil sich einer von euch verändert hat. Oder beide. Nur nicht in die gleiche Richtung.',
      'Es gibt diesen Moment, wenn du merkst, du erzählst jemandem nicht mehr alles. Nicht aus Misstrauen. Sondern weil du spürst, es kommt nicht mehr an. Du fängst an zu filtern. Sagst die Hälfte. Lachst über Dinge die dich eigentlich beschäftigen. Und irgendwann sitzt du in einem Gespräch und denkst. Wir reden, aber wir meinen verschiedene Dinge.',
      'Das Schwierige daran. Es gibt keinen Streit auf den du zeigen kannst. Keinen Moment wo es gekippt ist. Es ist einfach langsam passiert. Und jetzt stehst du da mit jemandem, den du gut kennst, und trotzdem nicht mehr erreichst.',
    ],
    impulsFrage: 'Was hat sich verändert? Und wer hat sich zuerst entfernt?',
    comments: [
      {
        id: 'c1',
        name: 'Steffi',
        isFounder: true,
        timeAgo: 'vor 2 Tagen',
        text: 'Bei mir war es meine beste Freundin. Nach meiner Reise hat sie gesagt ich hätte mich verändert. Sie hatte recht. Aber es hat lange gedauert bis ich verstanden habe, es war nicht mein Fehler. Wir sind einfach in verschiedene Richtungen gewachsen.',
      },
      {
        id: 'c2',
        name: 'Thomas',
        timeAgo: 'vor 1 Tag',
        text: 'Mein Bruder. Wir haben als Kinder alles geteilt und jetzt telefonieren wir an Geburtstagen. Nicht weil wir uns nicht mögen. Sondern weil wir nicht mehr wissen worüber.',
        replies: [
          {
            id: 'c2-r1',
            name: 'Steffi',
            isFounder: true,
            timeAgo: 'vor 20 Stunden',
            text: 'Das mit den Geburtstagen kenne ich. Irgendwann ist es nur noch Pflicht und beide wissen es.',
          },
        ],
      },
      {
        id: 'c3',
        name: 'Anonym',
        isAnonymous: true,
        timeAgo: 'vor 4 Stunden',
        text: 'Das mit dem Filtern. Ja. Genau das. Irgendwann merkst du, du erzählst nur noch die Version die der andere hören will.',
      },
    ],
  },
  {
    slug: 'aufgehoert-zu-sagen-was-du-denkst',
    type: 'offen',
    question: 'Wann hast du aufgehört zu sagen was du wirklich denkst?',
    teaser:
      'Es passiert nicht über Nacht. Es fängt klein an. Ein Satz den du runterschluckst.',
    impuls: [
      'Es fängt klein an. Ein Satz den du runterschluckst, weil der Moment nicht passt. Eine Meinung die du für dich behältst, weil du weißt wie die anderen reagieren. Ein Gefühl das du nicht aussprichst, weil du niemanden belasten willst.',
      'Am Anfang fühlt es sich an wie Rücksicht. Wie Höflichkeit. Wie erwachsen sein. Du sagst dir, es ist nicht so wichtig. Du willst keinen Streit. Du willst nicht die Person sein die immer alles kompliziert macht.',
      'Aber irgendwann merkst du es. Du sitzt in einer Runde und nickst zu Dingen die du anders siehst. Du lachst über Witze die dich eigentlich stören. Du sagst passt schon wenn nichts passt. Und du fragst dich wann genau du angefangen hast, die abgeschliffene Version von dir zu zeigen.',
      'Irgendwann tust du es auch dir selbst gegenüber. Du hörst auf ehrlich hinzuschauen. Weil ehrlich heißt, du müsstest etwas ändern. Und das ist anstrengend.',
    ],
    impulsFrage:
      'Wann hast du das letzte Mal etwas gesagt das wirklich unbequem war? Und wie hat es sich angefühlt?',
    comments: [],
  },
  {
    slug: 'gespraech-das-du-dir-wuenschst',
    type: 'offen',
    question: 'Das Gespräch das du dir wünschst aber nie anfängst.',
    teaser:
      'Du weißt genau mit wem. Und du weißt auch ungefähr was du sagen würdest.',
    impuls: [
      'Du weißt genau mit wem. Und du weißt auch ungefähr was du sagen würdest. Vielleicht hast du es sogar schon formuliert. Im Kopf, unter der Dusche, nachts wenn du nicht schlafen kannst. Es ist alles da. Nur der Moment kommt nie.',
      'Manchmal ist es Angst. Die Angst, es könnte danach anders sein. Schlechter. Oder endgültig. Manchmal ist es Stolz. Du wartest, weil du findest der andere müsste den ersten Schritt machen. Und manchmal ist es einfach der Alltag, der sich vor die Dinge schiebt die wirklich wichtig wären.',
      'Das Verrückte ist. Die Gespräche die wir nicht führen, führen wir trotzdem. Nur eben alleine. Wir wiederholen sie in Schleifen. Stellen uns vor was der andere sagen würde. Und leben mit einer Version der Wahrheit die wir uns selbst erzählen, weil die echte zu unbequem ist.',
      'Aber die echte Version ist meistens kürzer als du denkst. Ein Satz reicht oft. Ich vermisse wie es war. Oder. Das hat mich verletzt. Oder einfach. Können wir reden?',
    ],
    impulsFrage:
      'Welches Gespräch schiebst du vor dir her? Und was hält dich davon ab es zu führen?',
    comments: [],
  },
];

export function findRaum(slug: string): Raum | undefined {
  return RAEUME.find((r) => r.slug === slug);
}

export function sortedRaeume(): Raum[] {
  // Aktive Call Räume (noch nicht gelaufen) immer oben
  return [...RAEUME].sort((a, b) => {
    const aPinned = a.type === 'call' && !a.ended ? 1 : 0;
    const bPinned = b.type === 'call' && !b.ended ? 1 : 0;
    return bPinned - aPinned;
  });
}

export function commentCount(raum: Raum): number {
  return raum.comments.reduce(
    (sum, c) => sum + 1 + (c.replies?.length ?? 0),
    0,
  );
}
