'use client';

import { useState, useCallback } from 'react';

// ── Daten ─────────────────────────────────────────

const QUESTIONS = [
  {
    question: 'Hand aufs Herz. Wann hattest du zuletzt ein Gespräch, das dich danach wirklich aufgetankt hat?',
    answers: [
      { text: 'Letzte Woche. Ich hab Menschen um mich, mit denen das geht.', score: [4, 0, 0] },
      { text: 'Vor ein paar Wochen vielleicht. Kommt selten vor.', score: [2, 1, 1] },
      { text: 'Ich muss echt überlegen. Lange her.', score: [0, 2, 2] },
      { text: 'Ehrlich? Ich weiß es nicht mehr.', score: [0, 3, 3] },
    ],
  },
  {
    question: 'Du scrollst abends durch dein Handy. Instagram, WhatsApp, vielleicht noch ein Podcast. Wie fühlst du dich danach?',
    answers: [
      { text: 'Inspiriert. Ich nehm oft was mit.', score: [3, 0, 1] },
      { text: 'Abgelenkt. Es füllt die Zeit, mehr nicht.', score: [1, 2, 1] },
      { text: 'Leerer als vorher, wenn ich ehrlich bin.', score: [0, 3, 2] },
      { text: 'Ich merk es schon gar nicht mehr. Es ist einfach Routine.', score: [0, 2, 3] },
    ],
  },
  {
    question: 'Jemand fragt dich: Wie geht\u2019s dir? Was passiert in dir?',
    answers: [
      { text: 'Ich antworte ehrlich. Auch wenn\u2019s gerade nicht so läuft.', score: [4, 0, 0] },
      { text: 'Kommt drauf an wer fragt. Bei den meisten sage ich: gut.', score: [2, 1, 1] },
      { text: 'Ich sage immer gut. Weil niemand die echte Antwort hören will.', score: [0, 3, 2] },
      { text: 'Ich weiß manchmal selbst nicht, wie ich antworten soll.', score: [0, 2, 3] },
    ],
  },
  {
    question: 'Stell dir vor, du hättest morgen einen komplett freien Tag. Keine Verpflichtungen. Was machst du?',
    answers: [
      { text: 'Ich treff mich mit jemandem, der mir gut tut.', score: [4, 0, 0] },
      { text: 'Endlich mal durchatmen. Allein sein. Ruhe.', score: [2, 0, 2] },
      { text: 'Ich würd gern was mit jemandem machen. Aber mir fällt niemand ein, den ich anrufen würde.', score: [0, 3, 2] },
      { text: 'Wahrscheinlich das Gleiche wie immer. Couch, Netflix, Handy.', score: [0, 2, 3] },
    ],
  },
  {
    question: 'Wie viele Menschen in deinem Leben kennen dich wirklich? Nicht den Job, nicht die Rolle. Dich.',
    answers: [
      { text: 'Mehr als drei. Ich hab Glück.', score: [4, 0, 0] },
      { text: 'Vielleicht eine oder zwei Personen.', score: [2, 1, 1] },
      { text: 'Ich glaube, niemand kennt mich so richtig.', score: [0, 3, 2] },
      { text: 'Ich bin mir nicht sicher, ob ich mich selbst so richtig kenne.', score: [0, 2, 3] },
    ],
  },
  {
    question: 'Du bist auf einer Veranstaltung. Viele Leute, gute Stimmung. Wie geht es dir?',
    answers: [
      { text: 'Super. Ich liebe es, neue Leute kennenzulernen.', score: [3, 0, 1] },
      { text: 'Ich genieß es, aber echte Gespräche entstehen da selten.', score: [2, 2, 0] },
      { text: 'Ich steh oft daneben und frage mich, ob das hier überhaupt mein Ding ist.', score: [0, 3, 1] },
      { text: 'Ich geh meistens gar nicht erst hin.', score: [0, 2, 3] },
    ],
  },
  {
    question: 'Wenn du an die letzten drei Monate denkst: Gab es einen Moment, in dem du dich wirklich gesehen gefühlt hast?',
    answers: [
      { text: 'Ja, mehrere sogar.', score: [4, 0, 0] },
      { text: 'Einen vielleicht. Aber der war besonders.', score: [2, 1, 1] },
      { text: 'Gesehen? Ich weiß nicht, ob das oft passiert in meinem Leben.', score: [0, 3, 2] },
      { text: 'Ich glaube, ich hab mich daran gewöhnt, unsichtbar zu sein.', score: [0, 2, 4] },
    ],
  },
  {
    question: 'Was würdest du dir wünschen, wenn du ganz ehrlich bist?',
    answers: [
      { text: 'Mehr davon, was ich schon habe. Tiefe Gespräche, echte Menschen.', score: [4, 0, 0] },
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
    description: 'Du hast etwas, das viele suchen: echte Menschen in deinem Leben, die dich kennen. Das ist nicht selbstverständlich. Aber vielleicht kennst du jemanden, dem das fehlt. Jemand der gerade alleine auf dem Weg ist.',
    cta: 'Teile die Reflexion mit jemandem, dem es gut tun könnte.',
  },
  {
    title: 'Du suchst. Und das ist mutig.',
    subtitle: 'Die meisten geben sich mit Smalltalk zufrieden.',
    description: 'Du spürst, dass da mehr sein könnte. Mehr Tiefe, mehr echte Gespräche, mehr Menschen die verstehen ohne dass du dich erklären musst. Du bist nicht anspruchsvoll. Du bist ehrlich. Und genau das braucht die Welt.',
    cta: 'Souleya ist für Menschen wie dich. Für Begegnungen, die man nicht erklären muss.',
  },
  {
    title: 'Da fehlt was. Du weißt es.',
    subtitle: 'Und du bist nicht die einzige Person, der es so geht.',
    description: 'Du hast dich vielleicht daran gewöhnt, dass echte Verbindung selten ist. Dass man halt funktioniert. Dass niemand wirklich fragt, wie es dir geht. Aber tief drin weißt du: So soll es nicht bleiben. Und allein die Tatsache, dass du diese Reflexion bis hierher gemacht hast, zeigt, dass du bereit bist.',
    cta: 'Du musst den Weg nicht alleine gehen. Souleya bringt dich zu Menschen, die verstehen.',
  },
];

// ── Kanonischer Enso-Ring (viewBox 0 0 100 100) ──

function EnsoRing({ size = 100, id = 'enso' }: { size?: number; id?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" style={{ width: size, height: size }}>
      <defs>
        <linearGradient id={`enso-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A8894E" />
          <stop offset="100%" stopColor="#D4BC8B" />
        </linearGradient>
      </defs>
      <circle
        cx="50" cy="50" r="36" fill="none"
        stroke={`url(#enso-grad-${id})`}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray="196 30"
        strokeDashoffset="15"
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
      // Bestätigung trotzdem anzeigen
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
            8 ehrliche Fragen. Kein richtig oder falsch. Nur du und ein Moment der Klarheit darüber, was in deinem Leben vielleicht zu kurz kommt.
          </p>
          <button onClick={startQuiz} style={{ padding: '18px 48px', background: '#C8A96E', color: '#fff', border: 'none', borderRadius: 24, fontSize: 16, fontWeight: 600, cursor: 'pointer', boxShadow: '0 8px 32px rgba(200,169,110,0.3)', fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Lass uns anfangen
          </button>
          <p style={{ fontSize: 13, color: '#8A7A66', marginTop: 24 }}>Dauert etwa 2 Minuten. Kein Account nötig.</p>
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
              Du willst wissen, wie echte Gespräche sich anfühlen? Wir schicken dir 7 Fragen, die jedes Gespräch vertiefen. Sofort. Kostenlos.
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
                {submitting ? 'Wird gesendet …' : '7 Gesprächsimpulse erhalten'}
              </button>
              <p style={{ fontSize: 12, color: '#8A7A66', marginTop: 8 }}>
                Kein Spam. Kein Newsletter. Nur die 7 Impulse.
              </p>
            </form>
          </div>

          {/* Souleya Teaser */}
          <div style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: 20, padding: '24px 28px', maxWidth: 400, width: '100%', marginBottom: 32, border: '1px solid rgba(200,169,110,0.12)', textAlign: 'center' }}>
            <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 17, color: '#1E180C', fontWeight: 400, marginBottom: 10 }}>
              Genau dafür bauen wir gerade etwas.
            </p>
            <p style={{ fontSize: 14, color: '#3E3020', lineHeight: 1.7 }}>
              Souleya bringt Menschen zusammen, die echte Verbindung suchen. Online finden, offline treffen. Wir starten bald. Wer sich hier einträgt, erfährt es als Erstes.
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

      {/* ── BESTÄTIGUNG ──────────────────────── */}
      {screen === 'thankyou' && (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center', animation: 'fadeIn 0.6s ease' }}>
          <EnsoRing size={80} id="thankyou-hero" />

          <div style={{ fontSize: 'clamp(26px, 6vw, 36px)', fontWeight: 400, color: '#1E180C', lineHeight: 1.3, marginTop: 24, marginBottom: 8, fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Die 7 Impulse sind auf dem Weg zu dir.
          </div>
          <p style={{ fontSize: 17, color: '#C8A96E', fontStyle: 'italic', marginBottom: 32, fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Schau in dein Postfach.
          </p>
          <p style={{ fontSize: 15, color: '#3E3020', lineHeight: 1.7, maxWidth: 440, marginBottom: 40 }}>
            Wir haben dir 7 Fragen geschickt, die jedes Gespräch verändern können. Nimm dir eine davon mit ins nächste Gespräch. Nicht alle auf einmal. Eine reicht.
          </p>

          {/* Souleya Teaser */}
          <div style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: 20, padding: '24px 28px', maxWidth: 400, width: '100%', marginBottom: 32, border: '1px solid rgba(200,169,110,0.12)', textAlign: 'center' }}>
            <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 17, color: '#1E180C', fontWeight: 400, marginBottom: 10 }}>
              Genau dafür bauen wir gerade etwas.
            </p>
            <p style={{ fontSize: 14, color: '#3E3020', lineHeight: 1.7 }}>
              Souleya bringt Menschen zusammen, die echte Verbindung suchen. Online finden, offline treffen. Wir starten bald.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' as const, justifyContent: 'center' }}>
            <button onClick={shareQuiz} style={{ padding: '12px 28px', background: 'rgba(200,169,110,0.1)', border: '2px solid rgba(200,169,110,0.27)', borderRadius: 24, color: '#7A6014', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Reflexion teilen
            </button>
            <button onClick={restart} style={{ padding: '12px 28px', background: 'transparent', border: '2px solid rgba(200,169,110,0.2)', borderRadius: 24, color: '#8A7A66', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              Nochmal machen
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
        Für Begegnungen, die man spürt.
      </p>
    </div>
  );
}
