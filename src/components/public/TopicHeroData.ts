/**
 * 5 Hauptthemen mit je 5 Unterthemen, Hotspot-Koordinaten und Unsplash-Bildern.
 * Wird von TopicHero.tsx und FirstLightFullSection.tsx verwendet.
 */

export interface SubTopicMsg {
  name: string;
  soul: string;
  time: string;
  txt: string;
}

export interface SubTopic {
  name: string;
  desc: string;
  img: string;
  x: number;
  y: number;
  flip?: boolean; // Label öffnet nach links statt rechts
  blog: { cat: string; time: string; title: string; excerpt: string };
  members: string;
  circle: string;
  msgs: SubTopicMsg[];
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
    img: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1600&h=900&fit=crop&fm=webp&q=75',
    subs: [
      {
        name: 'Glaubenssätze auflösen',
        desc: 'Erkenne und verändere die unsichtbaren Muster, die dich zurückhalten.',
        img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=500&fit=crop',
        x: 14, y: 22,
        blog: {
          cat: 'Wachstum',
          time: '6 Min',
          title: '„Ich bin nicht gut genug" – wie du diesen Satz für immer loslässt',
          excerpt: 'Glaubenssätze sind wie unsichtbare Wände. Sie entstehen früh, wirken still und halten uns von dem ab, was wir eigentlich wollen. Dieser Artikel zeigt, wie du sie erkennst und sanft auflöst.',
        },
        members: '312 Mitglieder',
        circle: 'Neue Denkmuster',
        msgs: [
          { name: 'Mira K.', soul: 'Soul 3', time: 'vor 2 Std', txt: 'Ich hab heute zum ersten Mal gespürt, wie sich ein alter Glaubenssatz auflöst – fast wie ein tiefes Aufatmen 🌿' },
          { name: 'Jonas B.', soul: 'Soul 2', time: 'vor 1 Std', txt: 'Das kenn ich. Ich hab angefangen, meinen inneren Kritiker wie einen nervigen Mitbewohner zu behandeln – weniger Macht, mehr Distanz.' },
          { name: 'Lena R.', soul: 'Soul 4', time: 'vor 45 Min', txt: 'Habt ihr einen bestimmten Ansatz genutzt? Ich arbeite gerade mit Teile-Arbeit und es verändert wirklich etwas …' },
        ],
      },
      {
        name: 'Selbstwert stärken',
        desc: 'Lerne, deinen eigenen Wert zu erkennen – unabhängig von Bestätigung.',
        img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=500&fit=crop',
        x: 68, y: 18, flip: true,
        blog: {
          cat: 'Selbstliebe',
          time: '5 Min',
          title: 'Selbstwert ist kein Ziel – er ist eine Praxis',
          excerpt: 'Wir warten darauf, dass er einfach da ist. Dabei entsteht Selbstwert täglich, in kleinen Momenten des Zuhörens auf uns selbst.',
        },
        members: '289 Mitglieder',
        circle: 'Selbstliebe & Stärke',
        msgs: [
          { name: 'Sara M.', soul: 'Soul 3', time: 'vor 3 Std', txt: 'Mir hat geholfen: jeden Abend drei Dinge aufschreiben, die ich heute gut gemacht habe. Klingt simpel, aber es verändert den Blick auf sich selbst.' },
          { name: 'Tom A.', soul: 'Soul 2', time: 'vor 2 Std', txt: 'Ich hab mich lange damit schwer getan, Komplimente anzunehmen. Inzwischen sage ich einfach "Danke" – und meins es auch so.' },
          { name: 'Nele W.', soul: 'Soul 3', time: 'vor 1 Std', txt: 'Welche Übungen helfen euch, wenn der innere Kritiker besonders laut ist? Ich suche etwas für schwierige Tage …' },
        ],
      },
      {
        name: 'Gewohnheiten & Routinen',
        desc: 'Kleine tägliche Schritte, die langfristig alles verändern.',
        img: 'https://images.unsplash.com/photo-1484627147104-f5197bcd6651?w=800&h=500&fit=crop',
        x: 38, y: 48,
        blog: {
          cat: 'Routinen',
          time: '7 Min',
          title: 'Die 2-Minuten-Regel: Wie kleine Gewohnheiten große Veränderungen auslösen',
          excerpt: 'James Clear hat es populär gemacht, aber das Prinzip ist uralt: Wenn du etwas wirklich willst, fang winzig klein an. Hier ist, wie du es umsetzt.',
        },
        members: '418 Mitglieder',
        circle: 'Morgenroutinen & Rituale',
        msgs: [
          { name: 'Felix P.', soul: 'Soul 3', time: 'vor 4 Std', txt: 'Meine Morgenroutine hat sich zu einem echten Anker entwickelt. 10 Min Stille, Kaffee ohne Handy, kurze Bewegung – das reicht schon.' },
          { name: 'Anna K.', soul: 'Soul 2', time: 'vor 3 Std', txt: 'Ich habe aufgehört, perfekte Routinen zu planen. Jetzt habe ich eine "Minimum Viable Routine" – und die halte ich tatsächlich durch.' },
          { name: 'Marco L.', soul: 'Soul 3', time: 'vor 2 Std', txt: 'Habt ihr Tipps, wie man eine Routine nach einem schlechten Tag wieder aufnimmt? Das ist mein größter Knackpunkt …' },
        ],
      },
      {
        name: 'Resilienz & Rückschläge',
        desc: 'Nicht das Fallen zählt, sondern wie du wieder aufstehst.',
        img: 'https://images.unsplash.com/photo-1505455184862-554165e5f6ba?w=800&h=500&fit=crop',
        x: 62, y: 44, flip: true,
        blog: {
          cat: 'Resilienz',
          time: '8 Min',
          title: 'Scheitern neu denken: Was du aus deinen Rückschlägen wirklich lernen kannst',
          excerpt: 'Wir fürchten Niederlagen, dabei sind sie oft die stärksten Lehrmeister. Dieser Artikel zeigt, wie du Rückschläge in echte Wendepunkte verwandelst.',
        },
        members: '256 Mitglieder',
        circle: 'Resilienz & Stärke',
        msgs: [
          { name: 'Julia S.', soul: 'Soul 4', time: 'vor 5 Std', txt: 'Mein bisher größter Rückschlag hat sich drei Jahre später als beste Wendung meines Lebens herausgestellt. Das glaubt man mittendrin natürlich nicht.' },
          { name: 'Ben T.', soul: 'Soul 2', time: 'vor 4 Std', txt: 'Ich frage mich inzwischen bei Schwierigkeiten: "Was kann ich hier lernen?" Nicht immer leicht – aber es verschiebt die Perspektive.' },
          { name: 'Clara H.', soul: 'Soul 3', time: 'vor 2 Std', txt: 'Wie geht ihr damit um, wenn Resilienz sich einfach nicht zeigen will und man einfach nur traurig ist? Manchmal fehlt mir da der Raum …' },
        ],
      },
      {
        name: 'Journaling & Reflexion',
        desc: 'Schreibe deine Gedanken auf – und finde Klarheit.',
        img: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&h=500&fit=crop',
        x: 18, y: 72,
        blog: {
          cat: 'Journaling',
          time: '5 Min',
          title: '5 Journaling-Prompts, die wirklich etwas verändern',
          excerpt: 'Nicht jede Frage im Tagebuch führt zu Tiefe. Diese fünf Prompts helfen dir, echte Klarheit zu bekommen – über dich, dein Leben und was du wirklich willst.',
        },
        members: '347 Mitglieder',
        circle: 'Schreiben & Klarheit',
        msgs: [
          { name: 'Lisa N.', soul: 'Soul 3', time: 'vor 6 Std', txt: 'Journaling hat mein Leben verändert. Klingt dramatisch, aber ich erkenne Muster in mir jetzt viel früher.' },
          { name: 'Kevin R.', soul: 'Soul 2', time: 'vor 5 Std', txt: 'Ich bin kein geborener Schreiber, aber der Prompt "Was brauche ich gerade wirklich?" hat mir so oft geholfen.' },
          { name: 'Sophie E.', soul: 'Soul 3', time: 'vor 3 Std', txt: 'Schreibt ihr morgens oder abends? Ich merke, dass meine Energie und Themen sich je nach Zeit stark unterscheiden …' },
        ],
      },
    ],
  },
  gesundheit: {
    name: 'Gesundheit',
    tag: 'Dein Körper als Zuhause',
    img: 'https://images.unsplash.com/photo-1706267701238-b4d69fc8f640?w=1600&h=900&fit=crop&fm=webp&q=75',
    subs: [
      {
        name: 'Nervensystem & Stress',
        desc: 'Lerne, dein Nervensystem bewusst zu regulieren.',
        img: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&h=500&fit=crop',
        x: 16, y: 20,
        blog: {
          cat: 'Gesundheit',
          time: '7 Min',
          title: 'Warum dein Nervensystem alles entscheidet – und wie du es beruhigst',
          excerpt: 'Chronischer Stress ist nicht Schwäche. Er ist ein überaktives Alarmsystem. Lerne die einfachsten Wege, deinen Körper wieder in Sicherheit zu bringen.',
        },
        members: '381 Mitglieder',
        circle: 'Nervensystem & Ruhe',
        msgs: [
          { name: 'Hanna M.', soul: 'Soul 3', time: 'vor 2 Std', txt: 'Die 4-7-8 Atemtechnik hat mir in stressigen Meetings wirklich geholfen. Klingt simpel, wirkt aber erstaunlich schnell.' },
          { name: 'Tobias F.', soul: 'Soul 3', time: 'vor 1 Std', txt: 'Ich hab gelernt: Wenn mein Nervensystem aktiviert ist, hilft kein Denken – nur Körperarbeit. Kalt duschen, tief atmen, Füße auf den Boden.' },
          { name: 'Marie C.', soul: 'Soul 2', time: 'vor 30 Min', txt: 'Gibt es hier Empfehlungen für eine tägliche Regulationspraxis, die nicht mehr als 5 Minuten dauert? …' },
        ],
      },
      {
        name: 'Schlafoptimierung',
        desc: 'Guter Schlaf ist die Basis für alles andere.',
        img: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=500&fit=crop',
        x: 66, y: 16, flip: true,
        blog: {
          cat: 'Schlaf',
          time: '6 Min',
          title: 'Besser schlafen ohne Schlaftabletten: Was wirklich hilft',
          excerpt: 'Die meisten Schlafprobleme haben eine einfache Ursache: wir ignorieren unseren Körperrhythmus. Hier sind die Basics, die einen echten Unterschied machen.',
        },
        members: '264 Mitglieder',
        circle: 'Schlaf & Erholung',
        msgs: [
          { name: 'Pia L.', soul: 'Soul 2', time: 'vor 8 Std', txt: 'Seit ich mein Handy eine Stunde vor dem Schlafen weglege, schlafe ich deutlich besser. Klingt banal, aber die Veränderung war wirklich spürbar.' },
          { name: 'Stefan K.', soul: 'Soul 3', time: 'vor 6 Std', txt: 'Kühles Zimmer und immer zur gleichen Zeit ins Bett – das war mein Gamechanger. Der Körper liebt Rituale.' },
          { name: 'Clara J.', soul: 'Soul 3', time: 'vor 4 Std', txt: 'Hat jemand Erfahrung mit Schlaf-Tracking? Ich überlege, ob es sinnvoll ist oder eher Stress erzeugt …' },
        ],
      },
      {
        name: 'Hormongesundheit',
        desc: 'Verstehe, wie Hormone dein Wohlbefinden steuern.',
        img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=500&fit=crop',
        x: 36, y: 50,
        blog: {
          cat: 'Gesundheit',
          time: '8 Min',
          title: 'Hormone im Gleichgewicht: Was du täglich tun kannst (ohne Diät-Extremismus)',
          excerpt: 'Cortisol, Östrogen, Serotonin – sie steuern mehr als wir denken. Dieser Artikel erklärt verständlich, was Hormone wirklich brauchen.',
        },
        members: '198 Mitglieder',
        circle: 'Hormonbalance',
        msgs: [
          { name: 'Laura B.', soul: 'Soul 3', time: 'vor 10 Std', txt: 'Erst als ich meine Schilddrüse checken ließ, verstanden ich, warum ich mich jahrelang erschöpft gefühlt habe. Wer seine Hormone nicht kennt, stochert im Dunkeln.' },
          { name: 'Nadine P.', soul: 'Soul 2', time: 'vor 8 Std', txt: 'Zyklusbasiertes Leben hat für mich so vieles erklärt. In der Lutealphase brauche ich einfach mehr Ruhe – und das ist völlig okay.' },
          { name: 'Miriam S.', soul: 'Soul 3', time: 'vor 5 Std', txt: 'Wo fange ich an, wenn ich mehr über meine Hormongesundheit verstehen will? Welche Basics sollte man zuerst angehen? …' },
        ],
      },
      {
        name: 'Mentale Gesundheit',
        desc: 'Dein Kopf verdient genauso viel Aufmerksamkeit wie dein Körper.',
        img: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&h=500&fit=crop',
        x: 60, y: 48, flip: true,
        blog: {
          cat: 'Mental Health',
          time: '6 Min',
          title: 'Psychische Gesundheit pflegen – ohne dass es sich nach Arbeit anfühlt',
          excerpt: 'Mentale Gesundheit ist kein Luxus und keine Schwäche. Sie ist Prävention. Hier sind einfache Wege, sie täglich zu nähren.',
        },
        members: '427 Mitglieder',
        circle: 'Mentale Gesundheit',
        msgs: [
          { name: 'Jana T.', soul: 'Soul 4', time: 'vor 12 Std', txt: 'Ich hab lange gebraucht, um zu sagen: Ich gehe zur Therapie. Und es war die beste Entscheidung meines Lebens.' },
          { name: 'David W.', soul: 'Soul 3', time: 'vor 10 Std', txt: 'Bewegung ist meine Ersthelfer-Maßnahme für den Kopf. Wenn alles zu viel wird, 20 Minuten gehen – fast immer hilft es.' },
          { name: 'Sophie N.', soul: 'Soul 2', time: 'vor 7 Std', txt: 'Wie erklärt ihr Freunden, dass ihr gerade nicht könnt, ohne euch erklären zu müssen? Das fällt mir so schwer …' },
        ],
      },
      {
        name: 'Burnout-Prävention',
        desc: 'Erkenne die Warnsignale, bevor es zu spät ist.',
        img: 'https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=800&h=500&fit=crop',
        x: 20, y: 74,
        blog: {
          cat: 'Burnout',
          time: '9 Min',
          title: 'Die 7 stillen Zeichen von Burnout – und was du jetzt tun kannst',
          excerpt: 'Burnout kommt selten laut. Meist schleicht er sich an. Dieser Artikel zeigt die frühen Warnsignale und gibt konkrete erste Schritte.',
        },
        members: '303 Mitglieder',
        circle: 'Erholen & Stabilisieren',
        msgs: [
          { name: 'Kai B.', soul: 'Soul 3', time: 'vor 14 Std', txt: 'Mein Burnout damals hat mir beibgebracht, Nein zu sagen. Ich wünschte, ich hätte das früher gelernt.' },
          { name: 'Emma R.', soul: 'Soul 3', time: 'vor 12 Std', txt: 'Das erste Warnsignal bei mir ist immer Zynismus. Wenn ich anfange, über alles zu spotten, weiß ich: Zeit für eine Pause.' },
          { name: 'Florian S.', soul: 'Soul 2', time: 'vor 9 Std', txt: 'Wie erkläre ich meinem Arbeitgeber, dass ich gerade an meine Grenzen stoße? Ich will nicht als schwach gelten …' },
        ],
      },
    ],
  },
  worklife: {
    name: 'Work-Life Balance',
    tag: 'Freiheit mit Struktur',
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=900&fit=crop&fm=webp&q=75',
    subs: [
      {
        name: 'Remote Work optimieren',
        desc: 'Arbeite von überall – ohne die Struktur zu verlieren.',
        img: 'https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=800&h=500&fit=crop',
        x: 14, y: 18,
        blog: {
          cat: 'Remote Work',
          time: '6 Min',
          title: 'Remote arbeiten und trotzdem produktiv sein – was wirklich hilft',
          excerpt: 'Die Freiheit ist groß, aber so auch die Ablenkungen. Dieser Artikel zeigt, wie du Struktur und Flexibilität in Einklang bringst.',
        },
        members: '276 Mitglieder',
        circle: 'Remote & Freelance',
        msgs: [
          { name: 'Paul H.', soul: 'Soul 3', time: 'vor 3 Std', txt: 'Mein Trick: Ich "pendele" trotzdem – kurz raus, Runde drehen, zurück. Das trennt Schlafen vom Arbeiten im Kopf.' },
          { name: 'Lea M.', soul: 'Soul 2', time: 'vor 2 Std', txt: 'Feste Arbeitszeiten haben mir mehr gebracht als jeder Produktivitätshack. Das Gehirn braucht Vorhersehbarkeit.' },
          { name: 'Nico T.', soul: 'Soul 3', time: 'vor 1 Std', txt: 'Wie handhabt ihr das mit Social Media während der Arbeit? Das ist mein größtes Problem beim Remote-Arbeiten …' },
        ],
      },
      {
        name: 'Finanzielle Freiheit',
        desc: 'Baue dir ein System, das für dich arbeitet.',
        img: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=800&h=500&fit=crop',
        x: 64, y: 22, flip: true,
        blog: {
          cat: 'Finanzen',
          time: '7 Min',
          title: 'Finanzen ohne Angst: Der erste Schritt zu echtem Überblick',
          excerpt: 'Die meisten Menschen vermeiden ihre Konten. Dabei ist Klarheit der erste Schritt zur Freiheit. Hier ist, wie du anfängst.',
        },
        members: '334 Mitglieder',
        circle: 'Finanzielle Unabhängigkeit',
        msgs: [
          { name: 'Chris W.', soul: 'Soul 3', time: 'vor 4 Std', txt: 'Das Einrichten eines "Pay yourself first"-Systems hat mehr verändert als alles andere. Erst sparen, dann ausgeben.' },
          { name: 'Mia K.', soul: 'Soul 2', time: 'vor 3 Std', txt: 'Ich habe angefangen, meine Ausgaben einfach aufzuschreiben – ohne zu bewerten. Allein das Bewusstsein hat schon so viel verändert.' },
          { name: 'Lukas P.', soul: 'Soul 3', time: 'vor 2 Std', txt: 'Wo fängt man an, wenn man kaum Puffer hat? Ich fühle mich manchmal wie im Hamsterrad und weiß nicht, wo ich ansetzen soll …' },
        ],
      },
      {
        name: 'Produktivität & Deep Work',
        desc: 'Weniger Stunden, mehr Ergebnis – durch echten Fokus.',
        img: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&h=500&fit=crop',
        x: 34, y: 52,
        blog: {
          cat: 'Produktivität',
          time: '8 Min',
          title: 'Deep Work: Warum 2 Stunden fokussiert mehr bringen als 8 Stunden online',
          excerpt: 'Cal Newports Konzept klingt radikal, ist aber erstaunlich praktisch. Hier ist, wie du echten Fokus in deinen Alltag integrierst.',
        },
        members: '389 Mitglieder',
        circle: 'Deep Work & Fokus',
        msgs: [
          { name: 'Elena S.', soul: 'Soul 4', time: 'vor 5 Std', txt: 'Ich blocke jeden Morgen 2 Stunden ohne Meetings und Nachrichten. Diese Zeit ist heilig – und die produktivsten meines Tages.' },
          { name: 'Jan F.', soul: 'Soul 3', time: 'vor 4 Std', txt: 'Pomodoro hat mir nicht geholfen, aber "Themenblocker" schon. Alles was mit einem Bereich zu tun hat, kommt in einen Block.' },
          { name: 'Nina R.', soul: 'Soul 2', time: 'vor 2 Std', txt: 'Wie schafft ihr es, nicht ständig Nachrichten zu checken? Ich weiß, dass es mich zerstreut, aber tue es trotzdem immer wieder …' },
        ],
      },
      {
        name: 'Grenzen im Job setzen',
        desc: 'Nein sagen ohne schlechtes Gewissen.',
        img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=500&fit=crop',
        x: 62, y: 46, flip: true,
        blog: {
          cat: 'Grenzen',
          time: '5 Min',
          title: 'Nein sagen im Job – warum es niemanden enttäuscht, sondern respektiert',
          excerpt: 'Viele Menschen fürchten, durch Grenzen als schwierig zu gelten. Das Gegenteil ist wahr: Grenzen signalisieren Selbstwert und erzeugen Respekt.',
        },
        members: '241 Mitglieder',
        circle: 'Grenzen & Selbstschutz',
        msgs: [
          { name: 'Max B.', soul: 'Soul 3', time: 'vor 6 Std', txt: 'Ich habe gelernt: "Ich schau es mir an" ist kein Nein – aber auch kein Ja. Manchmal braucht man Puffer, um in sich reinzuhören.' },
          { name: 'Lara W.', soul: 'Soul 3', time: 'vor 5 Std', txt: 'Mein Chef reagiert immer mit Druck, wenn ich Grenzen setze. Irgendwann merkte ich: Das ist sein Problem, nicht meins.' },
          { name: 'Simon T.', soul: 'Soul 2', time: 'vor 3 Std', txt: 'Wie setzt ihr Grenzen, ohne den Job zu riskieren? Ich arbeite in einer Kultur, wo 24/7 erwartet wird …' },
        ],
      },
      {
        name: 'Sinnvolle Arbeit finden',
        desc: 'Arbeit, die sich nicht wie Arbeit anfühlt.',
        img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=500&fit=crop',
        x: 18, y: 76,
        blog: {
          cat: 'Purpose',
          time: '7 Min',
          title: 'Ikigai im Alltag: Wie du herausfindest, was dich wirklich erfüllt',
          excerpt: 'Das japanische Konzept "Ikigai" – der Grund aufzustehen – lässt sich praktisch anwenden. Dieser Artikel zeigt, wie du deinen persönlichen Ikigai entdeckst.',
        },
        members: '298 Mitglieder',
        circle: 'Purpose & Berufung',
        msgs: [
          { name: 'Katharina M.', soul: 'Soul 4', time: 'vor 7 Std', txt: 'Ich habe meinen Beruf nach 10 Jahren gewechselt. Der härteste Schritt. Und der beste.' },
          { name: 'Oliver B.', soul: 'Soul 3', time: 'vor 6 Std', txt: 'Die Frage "Was würde ich tun, wenn Geld keine Rolle spielt?" ist ein guter Startpunkt – auch wenn man nicht sofort kündigt.' },
          { name: 'Hannah K.', soul: 'Soul 2', time: 'vor 4 Std', txt: 'Ich weiß, was mich erfüllt – aber ich weiß nicht, wie ich davon leben soll. Wie habt ihr diesen Schritt gemacht? …' },
        ],
      },
    ],
  },
  spiritualitaet: {
    name: 'Spiritualität',
    tag: 'Tiefe ohne Dogma',
    img: 'https://images.unsplash.com/photo-1597682886233-61b9023db181?w=1600&h=900&fit=crop&fm=webp&q=75',
    subs: [
      {
        name: 'Meditation & Atemübungen',
        desc: 'Finde Stille – selbst im lautesten Moment.',
        img: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&h=500&fit=crop',
        x: 16, y: 20,
        blog: {
          cat: 'Meditation',
          time: '6 Min',
          title: 'Meditation für Menschen, die nicht stillsitzen können',
          excerpt: 'Keine Stunde auf dem Kissen, kein perfekter Moment. Hier ist, wie Meditation im echten Leben funktioniert – auch wenn du unruhig bist.',
        },
        members: '512 Mitglieder',
        circle: 'Stille & Atemraum',
        msgs: [
          { name: 'Yara S.', soul: 'Soul 3', time: 'vor 2 Std', txt: 'Meine Erkenntnis nach 2 Jahren meditieren: Es geht nicht darum, keine Gedanken zu haben. Es geht darum, sie ziehen zu lassen.' },
          { name: 'Till M.', soul: 'Soul 3', time: 'vor 1 Std', txt: 'Atemübungen haben mir in stressigen Momenten mehr gebracht als jede Meditation. Einfach 4-7-8 atmen – Körper hört sofort.' },
          { name: 'Zoe F.', soul: 'Soul 2', time: 'vor 45 Min', txt: 'Ich komme morgens einfach nicht in die Stille. Kennt ihr Wege, die helfen, wenn der Kopf schon beim Aufwachen voll ist? …' },
        ],
      },
      {
        name: 'Achtsamkeit im Alltag',
        desc: 'Nicht auf dem Kissen – sondern beim Frühstück.',
        img: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&h=500&fit=crop',
        x: 66, y: 16, flip: true,
        blog: {
          cat: 'Achtsamkeit',
          time: '5 Min',
          title: '3 achtsame Momente täglich – kein App-Abo nötig',
          excerpt: 'Achtsamkeit muss keine Übung sein. Manchmal reicht es, beim Kaffee nicht ans Handy zu greifen. Hier sind drei einfache Einstiegspunkte.',
        },
        members: '445 Mitglieder',
        circle: 'Achtsamkeit & Gegenwart',
        msgs: [
          { name: 'Anna L.', soul: 'Soul 3', time: 'vor 3 Std', txt: 'Ich habe aufgehört, beim Essen nebenbei zu scrollen. Klingt simpel – aber das Essen schmeckt seitdem wirklich besser.' },
          { name: 'Robin B.', soul: 'Soul 2', time: 'vor 2 Std', txt: 'Mein Achtsamkeitsmoment: Morgens ohne Handy aus dem Haus. 10 Minuten zu Fuß, Kopfhörer raus. Der Unterschied ist enorm.' },
          { name: 'Leonie K.', soul: 'Soul 3', time: 'vor 1 Std', txt: 'Ich verliere die Achtsamkeit schnell, wenn ich in Stress gerate. Wie haltet ihr sie auch in intensiven Phasen aufrecht? …' },
        ],
      },
      {
        name: 'Human Design',
        desc: 'Verstehe, wie du funktionierst – und hör auf, dich zu verbiegen.',
        img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=500&fit=crop',
        x: 36, y: 50,
        blog: {
          cat: 'Human Design',
          time: '9 Min',
          title: 'Human Design verstehen: Dein Typ und was er über dich aussagt',
          excerpt: 'Generator, Manifestor, Projector – was bedeuten diese Begriffe wirklich? Und wie nutzt du dein Human Design im Alltag, ohne esoterisch zu klingen?',
        },
        members: '287 Mitglieder',
        circle: 'Human Design & Typen',
        msgs: [
          { name: 'Stella P.', soul: 'Soul 4', time: 'vor 10 Std', txt: 'Ich bin ein Generator – und seitdem ich das weiß, kämpfe ich nicht mehr gegen meinen Energiefluss an. Ich folge dem Sog.' },
          { name: 'Adrian K.', soul: 'Soul 3', time: 'vor 8 Std', txt: 'Als Projector war es eine Erleichterung zu verstehen: Ich bin nicht faul. Ich brauche einfach mehr Erholung als Generatoren.' },
          { name: 'Paula R.', soul: 'Soul 2', time: 'vor 6 Std', txt: 'Wie seriös findet ihr Human Design eigentlich? Ich bin fasziniert, aber auch skeptisch. Wie viel steckt dahinter? …' },
        ],
      },
      {
        name: 'Manifestation',
        desc: 'Klarheit über das, was du willst – und dann loslegen.',
        img: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&h=500&fit=crop',
        x: 60, y: 44, flip: true,
        blog: {
          cat: 'Manifestation',
          time: '6 Min',
          title: 'Manifestieren ohne Magie: Warum Klarheit mächtiger ist als jedes Vision Board',
          excerpt: 'Manifestation hat wenig mit Wünschen zu tun – und viel mit innerer Ausrichtung und Handlung. Hier ist der nüchterne Blick auf ein oft missverstandenes Konzept.',
        },
        members: '356 Mitglieder',
        circle: 'Manifestation & Intention',
        msgs: [
          { name: 'Vera M.', soul: 'Soul 3', time: 'vor 11 Std', txt: 'Für mich ist Manifestation hauptsächlich Klarheit. Wenn ich weiß, was ich will, verändert sich, worauf ich achte.' },
          { name: 'Bastian H.', soul: 'Soul 3', time: 'vor 9 Std', txt: 'Ich hab lange Manifestation belächelt. Bis ich merkte: Es geht ums Programmieren des eigenen Fokus. Dann macht es plötzlich Sinn.' },
          { name: 'Johanna T.', soul: 'Soul 2', time: 'vor 7 Std', txt: 'Wie unterscheidet ihr gesundes Manifestieren von Magical Thinking? Ich finde die Grenze manchmal unscharf …' },
        ],
      },
      {
        name: 'Mondzyklen & Astrologie',
        desc: 'Natürliche Rhythmen als Orientierung.',
        img: 'https://images.unsplash.com/photo-1533577116850-9cc66cad8a9b?w=800&h=500&fit=crop',
        x: 20, y: 74,
        blog: {
          cat: 'Astrologie',
          time: '7 Min',
          title: 'Der Mondkalender als Lebensplaner: Wie ich meine Energie dem Rhythmus anpasse',
          excerpt: 'Vollmond, Neumond, Mondphasen – nicht als Aberglauben, sondern als Werkzeug. Hier ist, wie natürliche Zyklen deinen Alltag bereichern können.',
        },
        members: '219 Mitglieder',
        circle: 'Mondenergie & Kosmos',
        msgs: [
          { name: 'Inke B.', soul: 'Soul 3', time: 'vor 13 Std', txt: 'Ich setze bei Neumond Intentionen und lasse bei Vollmond los. Ob es "wahr" ist, weiß ich nicht – aber es gibt meinem Monat Rhythmus.' },
          { name: 'Caro F.', soul: 'Soul 2', time: 'vor 11 Std', txt: 'Astrologie als Sprache für innere Zustände finde ich hilfreich. Nicht als Schicksal, sondern als Spiegel.' },
          { name: 'Daria P.', soul: 'Soul 3', time: 'vor 8 Std', txt: 'Wie erkläre ich Mondkraft-Praktiken jemandem, der das alles für Unsinn hält, ohne defensiv zu werden? …' },
        ],
      },
    ],
  },
  beziehungen: {
    name: 'Beziehungen & Verbindung',
    tag: 'Echte Freundschaften jenseits der Einsamkeit',
    img: 'https://images.unsplash.com/photo-1758524945869-24a53c8cbc1e?w=1600&h=900&fit=crop&fm=webp&q=75',
    subs: [
      {
        name: 'Einsamkeit überwinden',
        desc: 'Du bist nicht allein – du hast nur noch nicht die richtigen gefunden.',
        img: 'https://images.unsplash.com/photo-1445543949571-ffc3e0e2f55e?w=800&h=500&fit=crop',
        x: 14, y: 22,
        blog: {
          cat: 'Verbindung',
          time: '7 Min',
          title: 'Modern einsam: Warum wir trotz 500 Kontakten allein fühlen – und was hilft',
          excerpt: 'Einsamkeit ist keine Frage der Anzahl Menschen um uns herum. Sie ist eine Frage der Tiefe. Hier ist, warum – und wie du echte Verbindungen aufbaust.',
        },
        members: '472 Mitglieder',
        circle: 'Verbindung & Zugehörigkeit',
        msgs: [
          { name: 'Marie T.', soul: 'Soul 3', time: 'vor 2 Std', txt: 'Ich war umgeben von Menschen und so allein. Bis ich aufgehört habe, nach Quantität zu suchen und anfing, Tiefe anzubieten.' },
          { name: 'Philipp S.', soul: 'Soul 2', time: 'vor 1 Std', txt: 'In neue Städte ziehen ist so schwer. Was mir geholfen hat: Nicht warten, bis Freundschaft passiert, sondern sie aktiv einladen.' },
          { name: 'Romy K.', soul: 'Soul 3', time: 'vor 30 Min', txt: 'Wie überwindet ihr die Angst, sich zu zeigen? Ich wünscht mir Tiefe, aber gleichzeitig fühlt es sich riskant an …' },
        ],
      },
      {
        name: 'Echte Freundschaften',
        desc: 'Tiefe Verbindungen statt oberflächlicher Kontakte.',
        img: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=800&h=500&fit=crop',
        x: 65, y: 18, flip: true,
        blog: {
          cat: 'Freundschaft',
          time: '5 Min',
          title: 'Was echte Freundschaft ausmacht – und warum sie Mut erfordert',
          excerpt: 'Echte Freundschaft ist kein Zufallsprodukt. Sie entsteht dort, wo zwei Menschen sich wirklich zeigen. Dieser Artikel zeigt, wie du das aktiv kultivierst.',
        },
        members: '318 Mitglieder',
        circle: 'Tiefe Verbindungen',
        msgs: [
          { name: 'Fiona L.', soul: 'Soul 3', time: 'vor 4 Std', txt: 'Ich habe gelernt: Eine echte Freundschaft ist nicht daran erkennbar, wie oft wir uns sehen – sondern wie schnell wir nach Monaten Pause wieder dort sind.' },
          { name: 'Markus B.', soul: 'Soul 3', time: 'vor 3 Std', txt: 'Je älter ich werde, desto mehr schätze ich Qualität. Drei echte Freunde sind mehr wert als dreißig Bekanntschaften.' },
          { name: 'Elisa P.', soul: 'Soul 2', time: 'vor 2 Std', txt: 'Wie findet ihr als Erwachsene neue tiefe Freundschaften? Das fühlt sich viel schwieriger an als als Kind …' },
        ],
      },
      {
        name: 'Bindungsstile verstehen',
        desc: 'Warum du so liebst, wie du liebst.',
        img: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&h=500&fit=crop',
        x: 36, y: 50,
        blog: {
          cat: 'Bindung',
          time: '8 Min',
          title: 'Sicher, ängstlich, vermeidend: Was dein Bindungsstil über deine Beziehungen sagt',
          excerpt: 'Bindungstheorie erklärt, warum wir in Beziehungen reagieren wie wir reagieren – und wie wir unsere Muster verändern können.',
        },
        members: '361 Mitglieder',
        circle: 'Bindung & Beziehungsmuster',
        msgs: [
          { name: 'Tina K.', soul: 'Soul 4', time: 'vor 6 Std', txt: 'Als ich meinen ängstlichen Bindungsstil erkannt habe, war das ein Schock und eine Erleichterung zugleich. Endlich hatte mein Verhalten einen Namen.' },
          { name: 'Nico M.', soul: 'Soul 3', time: 'vor 5 Std', txt: 'Ich war vermeidend – nicht weil mir Nähe egal war, sondern weil ich sie so sehr fürchtete. Das zu verstehen hat alles verändert.' },
          { name: 'Katja R.', soul: 'Soul 2', time: 'vor 3 Std', txt: 'Kann man seinen Bindungsstil wirklich verändern? Oder ist man damit einfach geboren? Ich tue mich mit der Hoffnung darauf schwer …' },
        ],
      },
      {
        name: 'Kommunikation & GFK',
        desc: 'Sag, was du meinst – ohne zu verletzen.',
        img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=500&fit=crop',
        x: 62, y: 46, flip: true,
        blog: {
          cat: 'Kommunikation',
          time: '6 Min',
          title: 'Gewaltfreie Kommunikation: Wie du sagst, was du meinst – ohne Mauern aufzubauen',
          excerpt: 'Marshall Rosenbergs Modell klingt theoretisch, ist aber erstaunlich praktisch. Dieser Artikel erklärt GFK in vier einfachen Schritten.',
        },
        members: '284 Mitglieder',
        circle: 'Achtsame Kommunikation',
        msgs: [
          { name: 'Lisa G.', soul: 'Soul 3', time: 'vor 7 Std', txt: 'GFK hat unsere Partnerschaft verändert. Nicht weil wir jetzt immer sanft reden – sondern weil wir gelernt haben, Bedürfnisse zu benennen.' },
          { name: 'Jonas H.', soul: 'Soul 3', time: 'vor 6 Std', txt: 'Das Schwierigste war, von Urteilen zu Beobachtungen zu wechseln. Aber der Unterschied im Gespräch ist enorm.' },
          { name: 'Annika W.', soul: 'Soul 2', time: 'vor 4 Std', txt: 'Wie übt ihr GFK in hitzigen Momenten? Theoretisch kenne ich das Modell – praktisch flippe ich trotzdem manchmal aus …' },
        ],
      },
      {
        name: 'Grenzen setzen',
        desc: 'Nein sagen ist ein Akt der Liebe – auch dir selbst gegenüber.',
        img: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=800&h=500&fit=crop',
        x: 18, y: 74,
        blog: {
          cat: 'Grenzen',
          time: '5 Min',
          title: 'Grenzen in Beziehungen: Warum es keine Ablehnung ist, sondern Selbstschutz',
          excerpt: 'Viele fürchten, mit Grenzen Menschen zu verletzen. Aber echte Verbindungen entstehen erst dort, wo beide authentisch sein dürfen.',
        },
        members: '327 Mitglieder',
        circle: 'Gesunde Grenzen',
        msgs: [
          { name: 'Ida B.', soul: 'Soul 3', time: 'vor 9 Std', txt: 'Grenzen setzen war für mich lange gleichbedeutend mit "ich mag dich nicht". Heute weiß ich: Es ist das Gegenteil.' },
          { name: 'Niko S.', soul: 'Soul 2', time: 'vor 8 Std', txt: 'Die härteste Grenze ist oft die gegenüber der Familie. Aber sie ist auch die, die am meisten verändert.' },
          { name: 'Laura M.', soul: 'Soul 3', time: 'vor 5 Std', txt: 'Wie setzt ihr Grenzen, wenn der andere sie immer wieder überschreitet – egal wie klar ihr sie benennt? …' },
        ],
      },
    ],
  },
};

export const TOPIC_ORDER = ['wachstum', 'gesundheit', 'beziehungen', 'worklife', 'spiritualitaet'];
