'use client';

import { useState, useCallback } from 'react';

// ── Daten ─────────────────────────────────────────

const QUESTIONS = [
  {
    question: 'Hand aufs Herz. Wann hattest du zuletzt ein Gespraech, das dich danach wirklich aufgetankt hat?',
    answers: [
      { text: 'Letzte Woche. Ich hab Menschen um mich, mit denen das geht.', score: [4, 0, 0] },
      { text: 'Vor ein paar Wochen vielleicht. Kommt selten vor.', score: [2, 1, 1] },
      { text: 'Ich muss echt ueberlegen. Lange her.', score: [0, 2, 2] },
      { text: 'Ehrlich? Ich weiss es nicht mehr.', score: [0, 3, 3] },
    ],
  },
  {
    question: 'Du scrollst abends durch dein Handy. Instagram, WhatsApp, vielleicht noch ein Podcast. Wie fuehlst du dich danach?',
    answers: [
      { text: 'Inspiriert. Ich nehm oft was mit.', score: [3, 0, 1] },
      { text: 'Abgelenkt. Es fuellt die Zeit, mehr nicht.', score: [1, 2, 1] },
      { text: 'Leerer als vorher, wenn ich ehrlich bin.', score: [0, 3, 2] },
      { text: 'Ich merk es schon gar nicht mehr. Es ist einfach Routine.', score: [0, 2, 3] },
    ],
  },
  {
    question: 'Jemand fragt dich: Wie geht\u2019s dir? Was passiert in dir?',
    answers: [
      { text: 'Ich antworte ehrlich. Auch wenn\u2019s gerade nicht so laeuft.', score: [4, 0, 0] },
      { text: 'Kommt drauf an wer fragt. Bei den meisten sage ich: gut.', score: [2, 1, 1] },
      { text: 'Ich sage immer gut. Weil niemand die echte Antwort hoeren will.', score: [0, 3, 2] },
      { text: 'Ich weiss manchmal selbst nicht, wie ich antworten soll.', score: [0, 2, 3] },
    ],
  },
  {
    question: 'Stell dir vor, du haettest morgen einen komplett freien Tag. Keine Verpflichtungen. Was machst du?',
    answers: [
      { text: 'Ich treff mich mit jemandem, der mir gut tut.', score: [4, 0, 0] },
      { text: 'Endlich mal durchatmen. Allein sein. Ruhe.', score: [2, 0, 2] },
      { text: 'Ich wuerd gern was mit jemandem machen. Aber mir faellt niemand ein, den ich anrufen wuerde.', score: [0, 3, 2] },
      { text: 'Wahrscheinlich das Gleiche wie immer. Couch, Netflix, Handy.', score: [0, 2, 3] },
    ],
  },
  {
    question: 'Wie viele Menschen in deinem Leben kennen dich wirklich? Nicht den Job, nicht die Rolle. Dich.',
    answers: [
      { text: 'Mehr als drei. Ich hab Glueck.', score: [4, 0, 0] },
      { text: 'Vielleicht eine oder zwei Personen.', score: [2, 1, 1] },
      { text: 'Ich glaube, niemand kennt mich so richtig.', score: [0, 3, 2] },
      { text: 'Ich bin mir nicht sicher, ob ich mich selbst so richtig kenne.', score: [0, 2, 3] },
    ],
  },
  {
    question: 'Du bist auf einer Veranstaltung. Viele Leute, gute Stimmung. Wie geht es dir?',
    answers: [
      { text: 'Super. Ich liebe es, neue Leute kennenzulernen.', score: [3, 0, 1] },
      { text: 'Ich geniess es, aber echte Gespraeche entstehen da selten.', score: [2, 2, 0] },
      { text: 'Ich steh oft daneben und frage mich, ob das hier ueberhaupt mein Ding ist.', score: [0, 3, 1] },
      { text: 'Ich geh meistens gar nicht erst hin.', score: [0, 2, 3] },
    ],
  },
  {
    question: 'Wenn du an die letzten drei Monate denkst: Gab es einen Moment, in dem du dich wirklich gesehen gefuehlt hast?',
    answers: [
      { text: 'Ja, mehrere sogar.', score: [4, 0, 0] },
      { text: 'Einen vielleicht. Aber der war besonders.', score: [2, 1, 1] },
      { text: 'Gesehen? Ich weiss nicht, ob das oft passiert in meinem Leben.', score: [0, 3, 2] },
      { text: 'Ich glaube, ich hab mich daran gewoehnt, unsichtbar zu sein.', score: [0, 2, 4] },
    ],
  },
  {
    question: 'Was wuerdest du dir wuenschen, wenn du ganz ehrlich bist?',
    answers: [
      { text: 'Mehr davon, was ich schon habe. Tiefe Gespraeche, echte Menschen.', score: [4, 0, 0] },
      { text: 'Einen Ort, an dem ich einfach sein kann. Ohne Rolle, ohne Maske.', score: [1, 2, 2] },
      { text: 'Menschen, die den gleichen Weg gehen. Wegbegleiter, nicht nur Kontakte.', score: [0, 3, 1] },
      { text: 'Dass sich jemand meldet. Einfach so. Ohne dass ich immer den ersten Schritt mache.', score: [0, 2, 3] },
    ],
  },
];

const RESULTS = [
  {
    title: 'Du bist verbunden.',
    subtitle: 'Und das ist selten.',
    description: 'Du hast etwas, das viele suchen: echte Menschen in deinem Leben, die dich kennen. Das ist nicht selbstverstaendlich. Aber vielleicht kennst du jemanden, dem das fehlt. Jemand der gerade alleine auf dem Weg ist.',
    cta: 'Teile die Reflexion mit jemandem, dem es gut tun koennte.',
  },
  {
    title: 'Du suchst. Und das ist mutig.',
    subtitle: 'Die meisten geben sich mit Smalltalk zufrieden.',
    description: 'Du spuerst, dass da mehr sein koennte. Mehr Tiefe, mehr echte Gespraeche, mehr Menschen die verstehen ohne dass du dich erklaeren musst. Du bist nicht anspruchsvoll. Du bist ehrlich. Und genau das braucht die Welt.',
    cta: 'Souleya ist fuer Menschen wie dich. Fuer Begegnungen, die man nicht erklaeren muss.',
  },
  {
    title: 'Da fehlt was. Du weisst es.',
    subtitle: 'Und du bist nicht die einzige Person, der es so geht.',
    description: 'Du hast dich vielleicht daran gewoehnt, dass echte Verbindung selten ist. Dass man halt funktioniert. Dass niemand wirklich fragt, wie es dir geht. Aber tief drin weisst du: So soll es nicht bleiben. Und allein die Tatsache, dass du diese Reflexion bis hierher gemacht hast, zeigt, dass du bereit bist.',
    cta: 'Du musst den Weg nicht alleine gehen. Souleya bringt dich zu Menschen, die verstehen.',
  },
];

const IMPULSES = [
  { question: 'Wer in deinem Leben hat gerade mal wieder ein richtiges Danke verdient? Wofuer?', context: 'Schick es ihm heute. Kein Anlass noetig.' },
  { question: 'Bei welcher Sache oder in welchem Moment bist du dir selbst am liebsten?', context: 'Die meisten wissen was sie an anderen moegen. An sich selbst? Selten.' },
  { question: 'Bei wem darfst du sein wie du wirklich bist, ohne dich zu erklaeren?', context: 'Genau das ist echte Verbindung. Sag dieser Person beim naechsten Treffen wie wertvoll das fuer dich ist.' },
  { question: 'Wer hat dich so sehr gepraegt, dass du heute noch seine oder ihre Saetze denkst?', context: 'Manchmal sind es nicht die lautesten Menschen, sondern die stillsten.' },
  { question: 'Was hast du in den letzten Monaten geschafft, wofuer du dich viel zu wenig gefeiert hast?', context: 'Kleine Sachen zaehlen oft mehr als die grossen.' },
  { question: 'Zu welcher Sache hast du zuletzt Ja gesagt, obwohl dein Bauchgefuehl Nein gesagt hat?', context: 'Kein Vorwurf. Nur ein Hinweis darauf wo du dir gerade nicht zuhoerst.' },
  { question: 'Wer in deinem Leben sollte unbedingt wissen, wie viel er dir bedeutet? Und weiss er es schon?', context: 'Wenn nicht, dann sag es heute. In zwei Saetzen. Das reicht.' },
];

// ── Enso SVG ──────────────────────────────────────

function EnsoRing({ size = 100, id = 'enso' }: { size?: number; id?: string }) {
  return (
    <svg viewBox="0 0 1000 1000" fill="none" style={{ width: size, height: size }}>
      <defs>
        <linearGradient id={`goldGrad-${id}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A8894E" />
          <stop offset="50%" stopColor="#C8A96E" />
          <stop offset="100%" stopColor="#DAC08A" />
        </linearGradient>
      </defs>
      <path
        d="M 847.73 406.83 A 360.00 360.00 0 1 1 593.17 152.27"
        fill="none"
        stroke={`url(#goldGrad-${id})`}
        strokeWidth="85"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Typen ─────────────────────────────────────────

type Screen = 'intro' | 'quiz' | 'result' | 'thankyou';

// ── Component ─────────────────────────────────────

export default function ReflexionQuiz() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState([0, 0, 0]);
  const [selected, setSelected] = useState<number | null>(null);
  const [fading, setFading] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getResult = useCallback(() => {
    const [connected, seeking, longing] = scores;
    if (connected >= seeking && connected >= longing) return RESULTS[0];
    if (seeking >= longing) return RESULTS[1];
    return RESULTS[2];
  }, [scores]);

  const getResultType = useCallback((): 'verbunden' | 'suchend' | 'sehnsucht' => {
    const [connected, seeking, longing] = scores;
    if (connected >= seeking && connected >= longing) return 'verbunden';
    if (seeking >= longing) return 'suchend';
    return 'sehnsucht';
  }, [scores]);

  function startQuiz() {
    setCurrentQ(0);
    setScores([0, 0, 0]);
    setScreen('quiz');
    window.scrollTo(0, 0);
  }

  function selectAnswer(idx: number) {
    if (selected !== null) return;
    setSelected(idx);

    const answerScore = QUESTIONS[currentQ].answers[idx].score;
    setScores(prev => prev.map((s, i) => s + answerScore[i]));

    setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        if (currentQ < QUESTIONS.length - 1) {
          setCurrentQ(prev => prev + 1);
        } else {
          setScreen('result');
          window.scrollTo(0, 0);
        }
        setSelected(null);
        setFading(false);
      }, 400);
    }, 600);
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-5821e.up.railway.app';
      await fetch(`${apiUrl}/reflexion/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), quizResult: getResultType() }),
      });
    } catch {
      // Impulse trotzdem anzeigen
    }

    setSubmitting(false);
    setScreen('thankyou');
    window.scrollTo(0, 0);
  }

  function shareQuiz() {
    const text = 'Ich hab gerade rausgefunden wie verbunden ich wirklich bin. Mach die Reflexion: ';
    const url = typeof window !== 'undefined' ? window.location.href : 'https://souleya.com/reflexion';

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: 'Wie verbunden bist du wirklich?', text, url }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text + url);
    }
  }

  function restart() {
    setCurrentQ(0);
    setScores([0, 0, 0]);
    setSelected(null);
    setEmail('');
    setScreen('intro');
    window.scrollTo(0, 0);
  }

  const result = getResult();
  const total = QUESTIONS.length;
  const q = QUESTIONS[currentQ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F5EFE6 0%, #EDE4D3 40%, #D8CFBE 100%)', fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif", color: '#1E180C', WebkitFontSmoothing: 'antialiased' }}>

      {/* Deko-Kreise */}
      <div style={{ position: 'fixed', top: -120, right: -80, width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(200,169,110,0.08)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -60, left: -100, width: 250, height: 250, borderRadius: '50%', border: '1px solid rgba(200,169,110,0.08)', pointerEvents: 'none' }} />

      {/* ── INTRO ────────────────────────────── */}
      {screen === 'intro' && (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center', animation: 'fadeIn 0.6s ease' }}>
          <EnsoRing size={100} id="intro" />
          <div style={{ fontSize: 14, letterSpacing: 3, color: '#C8A96E', textTransform: 'uppercase' as const, fontWeight: 600, marginTop: 20, marginBottom: 32, fontFamily: "Georgia, 'Times New Roman', serif" }}>Souleya</div>
          <h1 style={{ fontSize: 'clamp(28px, 6vw, 42px)', fontWeight: 400, color: '#1E180C', lineHeight: 1.25, marginBottom: 20, fontFamily: "Georgia, 'Times New Roman', serif", maxWidth: 500 }}>
            Wie verbunden bist du wirklich?
          </h1>
          <p style={{ fontSize: 17, color: '#3E3020', lineHeight: 1.7, maxWidth: 440, marginBottom: 48 }}>
            8 ehrliche Fragen. Kein richtig oder falsch. Nur du und ein Moment der Klarheit darueber, was in deinem Leben vielleicht zu kurz kommt.
          </p>
          <button onClick={startQuiz} style={{ padding: '18px 48px', background: '#C8A96E', color: '#fff', border: 'none', borderRadius: 24, fontSize: 16, fontWeight: 600, cursor: 'pointer', boxShadow: '0 8px 32px rgba(200,169,110,0.3)', fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Lass uns anfangen
          </button>
          <p style={{ fontSize: 13, color: '#8A7A66', marginTop: 24 }}>Dauert etwa 2 Minuten. Kein Account noetig.</p>
        </div>
      )}

      {/* ── QUIZ ─────────────────────────────── */}
      {screen === 'quiz' && (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '40px 24px', maxWidth: 540, margin: '0 auto', textAlign: 'left', opacity: fading ? 0 : 1, transform: fading ? 'translateY(20px)' : 'translateY(0)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
          {/* Progress Bar */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 32, width: '100%' }}>
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= currentQ ? '#C8A96E' : 'rgba(200,169,110,0.2)', transition: 'background 0.4s ease' }} />
            ))}
          </div>

          <div style={{ fontSize: 12, color: '#8A7A66', marginBottom: 16, letterSpacing: 1, width: '100%' }}>
            {currentQ + 1} von {total}
          </div>

          <h2 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 400, color: '#1E180C', lineHeight: 1.4, marginBottom: 36, fontFamily: "Georgia, 'Times New Roman', serif", width: '100%' }}>
            {q.question}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
            {q.answers.map((answer, i) => (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                disabled={selected !== null}
                style={{
                  padding: '18px 22px',
                  background: selected === i ? 'linear-gradient(135deg, rgba(200,169,110,0.09), rgba(200,169,110,0.04))' : 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: `2px solid ${selected === i ? '#C8A96E' : 'rgba(200,169,110,0.15)'}`,
                  borderRadius: 16,
                  textAlign: 'left' as const,
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: selected === i ? '#7A6014' : '#3E3020',
                  cursor: selected !== null ? 'default' : 'pointer',
                  fontWeight: selected === i ? 600 : 400,
                  fontFamily: 'inherit',
                  width: '100%',
                  transform: selected === i ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.3s ease',
                }}
              >
                {answer.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── RESULT ───────────────────────────── */}
      {screen === 'result' && (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center', animation: 'fadeIn 0.6s ease' }}>
          <div style={{ fontSize: 'clamp(26px, 6vw, 36px)', fontWeight: 400, color: '#1E180C', lineHeight: 1.3, marginBottom: 8, fontFamily: "Georgia, 'Times New Roman', serif", maxWidth: 480 }}>
            {result.title}
          </div>
          <p style={{ fontSize: 17, color: '#C8A96E', fontStyle: 'italic', marginBottom: 32, fontFamily: "Georgia, 'Times New Roman', serif" }}>
            {result.subtitle}
          </p>
          <p style={{ fontSize: 16, color: '#3E3020', lineHeight: 1.8, maxWidth: 440, marginBottom: 16 }}>
            {result.description}
          </p>
          <p style={{ fontSize: 15, color: '#3E3020', marginTop: 16, marginBottom: 32, fontStyle: 'italic', maxWidth: 440, lineHeight: 1.6 }}>
            {result.cta}
          </p>

          {/* E-Mail Signup */}
          <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 20, padding: 28, maxWidth: 400, width: '100%', marginBottom: 32, border: '1px solid rgba(200,169,110,0.2)' }}>
            <p style={{ fontSize: 15, color: '#3E3020', lineHeight: 1.7, marginBottom: 20 }}>
              Du willst wissen, wie echte Gespraeche sich anfuehlen? Wir schicken dir 7 Fragen, die jedes Gespraech vertiefen. Sofort. Kostenlos.
            </p>
            <form onSubmit={handleEmailSubmit}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Deine E-Mail Adresse"
                required
                style={{ width: '100%', padding: '16px 20px', border: '2px solid rgba(200,169,110,0.2)', borderRadius: 14, fontSize: 15, fontFamily: 'inherit', color: '#1E180C', background: 'rgba(255,255,255,0.8)', outline: 'none', marginBottom: 12, boxSizing: 'border-box' as const }}
              />
              <button
                type="submit"
                disabled={submitting}
                style={{ width: '100%', padding: '16px 36px', background: '#C8A96E', color: '#fff', border: 'none', borderRadius: 24, fontSize: 15, fontWeight: 600, cursor: submitting ? 'wait' : 'pointer', fontFamily: "Georgia, 'Times New Roman', serif", opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? 'Wird gesendet …' : '7 Gespraechsimpulse erhalten'}
              </button>
              <p style={{ fontSize: 12, color: '#8A7A66', marginTop: 8 }}>
                Kein Spam. Kein Newsletter. Nur die 7 Impulse.
              </p>
            </form>
          </div>

          {/* Souleya Teaser */}
          <div style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: 20, padding: '24px 28px', maxWidth: 400, width: '100%', marginBottom: 32, border: '1px solid rgba(200,169,110,0.12)', textAlign: 'center' }}>
            <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 17, color: '#1E180C', fontWeight: 400, marginBottom: 10 }}>
              Genau dafuer bauen wir gerade etwas.
            </p>
            <p style={{ fontSize: 14, color: '#3E3020', lineHeight: 1.7 }}>
              Souleya bringt Menschen zusammen, die echte Verbindung suchen. Online finden, offline treffen. Wir starten bald. Wer sich hier eintraegt, erfaehrt es als Erstes.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' as const, justifyContent: 'center' }}>
            <button onClick={shareQuiz} style={{ padding: '12px 28px', background: 'rgba(200,169,110,0.1)', border: '2px solid rgba(200,169,110,0.27)', borderRadius: 24, color: '#7A6014', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Teilen
            </button>
            <button onClick={restart} style={{ padding: '12px 28px', background: 'transparent', border: '2px solid rgba(200,169,110,0.2)', borderRadius: 24, color: '#8A7A66', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              Nochmal machen
            </button>
          </div>

          <Footer id="result" />
        </div>
      )}

      {/* ── THANK YOU ────────────────────────── */}
      {screen === 'thankyou' && (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center', animation: 'fadeIn 0.6s ease' }}>
          <div style={{ fontSize: 'clamp(26px, 6vw, 36px)', fontWeight: 400, color: '#1E180C', lineHeight: 1.3, marginBottom: 8, fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Hier sind sie.
          </div>
          <p style={{ fontSize: 17, color: '#C8A96E', fontStyle: 'italic', marginBottom: 32, fontFamily: "Georgia, 'Times New Roman', serif" }}>
            7 Fragen, die jedes Gespraech veraendern koennen.
          </p>
          <p style={{ fontSize: 15, color: '#3E3020', lineHeight: 1.7, maxWidth: 440, marginBottom: 32 }}>
            Nimm dir eine davon mit ins naechste Gespraech. Nicht alle auf einmal. Eine reicht. Du wirst merken, was passiert.
          </p>

          {IMPULSES.map((impulse, i) => (
            <div key={i} style={{ textAlign: 'left', padding: '18px 22px', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(200,169,110,0.12)', borderRadius: 16, marginBottom: 10, maxWidth: 440, width: '100%' }}>
              <div style={{ fontSize: 12, color: '#C8A96E', fontWeight: 600, letterSpacing: 1, marginBottom: 6 }}>
                0{i + 1}
              </div>
              <div style={{ fontSize: 16, color: '#1E180C', fontFamily: "Georgia, 'Times New Roman', serif", lineHeight: 1.5 }}>
                {impulse.question}
              </div>
              <div style={{ fontSize: 13, color: '#8A7A66', marginTop: 6, lineHeight: 1.5 }}>
                {impulse.context}
              </div>
            </div>
          ))}

          <div style={{ maxWidth: 440, width: '100%', marginTop: 32, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#8A7A66', lineHeight: 1.7, marginBottom: 24 }}>
              Diese Fragen sind erst der Anfang. Souleya bringt dich zu Menschen, bei denen solche Gespraeche selbstverstaendlich sind. Wir starten bald.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' as const, justifyContent: 'center' }}>
            <button onClick={shareQuiz} style={{ padding: '12px 28px', background: 'rgba(200,169,110,0.1)', border: '2px solid rgba(200,169,110,0.27)', borderRadius: 24, color: '#7A6014', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Reflexion teilen
            </button>
          </div>

          <Footer id="thankyou" />
        </div>
      )}

      {/* Global Keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function Footer({ id }: { id: string }) {
  return (
    <div style={{ marginTop: 48, textAlign: 'center' }}>
      <EnsoRing size={48} id={`footer-${id}`} />
      <div style={{ marginTop: 12, fontSize: 14, letterSpacing: 3, color: '#C8A96E', textTransform: 'uppercase' as const, fontWeight: 600, fontFamily: "Georgia, 'Times New Roman', serif" }}>
        Souleya
      </div>
      <p style={{ fontSize: 12, color: '#8A7A66', marginTop: 8 }}>
        Fuer Begegnungen, die man spuert.
      </p>
    </div>
  );
}
