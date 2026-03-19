'use client';

import { useEffect, useRef } from 'react';

/* ── Fade-in Hook ── */
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('mentor-visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function FadeIn({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useFadeIn();
  return (
    <div ref={ref} className={`mentor-fade-in ${className}`}>
      {children}
    </div>
  );
}

/* ── Enso SVG (Hero) ── */
function EnsoHero() {
  return (
    <svg viewBox="0 0 180 180" width="180" height="180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="mentor-enso-glow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="mentor-star-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M 145.7 57 A 65 65 0 1 1 121.9 33.1"
        stroke="var(--gold, #C8A96E)"
        strokeWidth="9"
        fill="none"
        strokeLinecap="round"
        filter="url(#mentor-enso-glow)"
        opacity="0.88"
      />
      <path
        d="M 121.9 21.7 L 123.9 31.3 L 133.5 33.1 L 123.9 34.9 L 121.9 44.5 L 119.9 34.9 L 110.3 33.1 L 119.9 31.3 Z"
        fill="var(--gold-bright, #E2C07A)"
        filter="url(#mentor-star-glow)"
      />
    </svg>
  );
}

/* ── Arrow Icon ── */
function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--gold, #C8A96E)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 20, height: 20, opacity: 0.35 }}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/* ── WhatsApp Icon ── */
function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
        fill="currentColor"
      />
      <path
        d="M12 0C5.373 0 0 5.373 0 12c0 2.136.561 4.14 1.535 5.874L0 24l6.293-1.51A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.371l-.36-.213-3.733.896.933-3.617-.233-.373A9.818 9.818 0 1 1 12 21.818z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ── Mail Icon ── */
function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 6l-10 7L2 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ═══════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════ */
export default function MentorContent() {
  return (
    <>
      {/* ── Scoped Styles ── */}
      <style>{`
        .mentor-fade-in {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.85s ease, transform 0.85s ease;
        }
        .mentor-fade-in.mentor-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      {/* ══════════════════════════════
           1 · HERO
      ══════════════════════════════ */}
      <section
        className="flex items-center justify-center text-center"
        style={{
          minHeight: '100vh',
          padding: '80px 28px 100px',
          background: 'radial-gradient(ellipse at 50% 30%, var(--gold-softer, rgba(200,169,110,0.06)) 0%, transparent 60%)',
        }}
      >
        <FadeIn>
          <div style={{ maxWidth: 740, margin: '0 auto' }}>
            <div style={{ width: 180, height: 180, margin: '0 auto 48px' }}>
              <EnsoHero />
            </div>

            <span
              className="inline-block font-label text-[10px] font-medium tracking-[0.22em] uppercase"
              style={{
                border: '1px solid var(--gold-border, rgba(200,169,110,0.14))',
                color: 'var(--gold, #C8A96E)',
                padding: '8px 24px',
                borderRadius: '9999px',
                marginBottom: 36,
              }}
            >
              Souleya Launch · Sommer 2026
            </span>

            <h1
              className="font-heading"
              style={{
                fontSize: 'clamp(28px, 5vw, 42px)',
                lineHeight: 1.15,
                color: 'var(--text-h)',
                marginBottom: 28,
                fontWeight: 400,
              }}
            >
              Deine Teilnehmer
              <br />
              verlieren <em style={{ fontStyle: 'italic', color: 'var(--gold, #C8A96E)' }}>den Faden.</em>
              <br />
              Wir ändern das.
            </h1>

            <p
              className="font-body"
              style={{
                fontSize: 18,
                color: 'var(--text-sec)',
                maxWidth: 540,
                margin: '0 auto',
                lineHeight: 1.8,
              }}
            >
              Souleya ist der Ort, an dem Menschen nach dem Kurs weiterwachsen –
              mit dir, mit anderen, jeden Tag.
            </p>
          </div>
        </FadeIn>
      </section>

      {/* ══════════════════════════════
           2 · DAS PROBLEM
      ══════════════════════════════ */}
      <section
        style={{ padding: '100px 0', background: 'var(--bg-section-warm)' }}
      >
        <div className="max-w-[1080px] mx-auto px-7">
          <FadeIn>
            <p className="font-label text-[11px] font-medium tracking-[0.25em] uppercase mb-4" style={{ color: 'var(--gold)' }}>
              Das kennst du
            </p>
            <h2
              className="font-heading"
              style={{
                fontSize: 'clamp(28px, 4vw, 40px)',
                lineHeight: 1.25,
                color: 'var(--text-h)',
                maxWidth: 600,
                fontWeight: 400,
              }}
            >
              Begeisterung, die im Alltag verpufft.
            </h2>
          </FadeIn>

          <FadeIn className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <div className="glass-card rounded-[8px]" style={{ padding: 36 }}>
              <p className="font-body text-[17px] leading-[1.8]" style={{ color: 'var(--text-body)' }}>
                Deine Teilnehmer kommen mit leuchtenden Augen aus deinem Kurs. Voller Energie, bereit für Veränderung.
              </p>
            </div>
            <div className="glass-card rounded-[8px]" style={{ padding: 36 }}>
              <p className="font-body text-[17px] leading-[1.8]" style={{ color: 'var(--text-body)' }}>
                Dann gehen sie nach Hause. In einen Alltag, in dem niemand versteht was sie gerade erlebt haben. Kein Gesprächspartner, kein Raum.
              </p>
            </div>
            <div
              className="glass-card rounded-[8px] md:col-span-2 text-center"
              style={{
                padding: 36,
                borderColor: 'var(--gold-border, rgba(200,169,110,0.14))',
              }}
            >
              <p
                className="font-heading italic"
                style={{
                  fontSize: 'clamp(22px, 3vw, 28px)',
                  color: 'var(--text-h)',
                  lineHeight: 1.5,
                  fontWeight: 400,
                }}
              >
                &bdquo;Nach zwei Wochen ist die Energie weg.
                <br />
                Nicht weil der Impuls schwach war –
                <br />
                sondern weil er allein nicht trägt.&ldquo;
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════
           3 · DIE LÖSUNG
      ══════════════════════════════ */}
      <section className="text-center" style={{ padding: '100px 0' }}>
        <div className="max-w-[1080px] mx-auto px-7">
          <FadeIn>
            <p className="font-label text-[11px] font-medium tracking-[0.25em] uppercase mb-4" style={{ color: 'var(--gold)' }}>
              Souleya
            </p>
            <h2
              className="font-heading"
              style={{
                fontSize: 'clamp(28px, 4vw, 40px)',
                lineHeight: 1.25,
                color: 'var(--text-h)',
                marginBottom: 20,
                fontWeight: 400,
              }}
            >
              Der Raum, der den Faden hält.
            </h2>
            <p
              className="font-body"
              style={{
                fontSize: 18,
                color: 'var(--text-sec)',
                maxWidth: 600,
                margin: '0 auto 48px',
                lineHeight: 1.9,
              }}
            >
              Eine Gemeinschaft für Menschen die wachsen wollen. Deine Teilnehmer machen nach dem Kurs weiter – im Austausch mit Gleichgesinnten, begleitet von dir.
            </p>
          </FadeIn>

          <FadeIn className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[800px] mx-auto">
            {[
              { title: 'Kurse', desc: 'Dein Wissen, dauerhaft verfügbar. Videos, Texte, Meditationen.' },
              { title: 'Community', desc: 'Chat, Events, Austausch. Deine Teilnehmer bleiben verbunden.' },
              { title: 'Mentoring', desc: 'Du begleitest persönlich. Auf deine Weise, in deinem Rhythmus.' },
            ].map((f) => (
              <div key={f.title} className="glass-card rounded-[8px] text-center" style={{ padding: '28px 24px' }}>
                <h3 className="font-heading text-xl mb-2" style={{ color: 'var(--text-h)', fontWeight: 400 }}>
                  {f.title}
                </h3>
                <p className="font-body text-[15px] leading-[1.7]" style={{ color: 'var(--text-sec)' }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════
           4 · DEIN HEBEL
      ══════════════════════════════ */}
      <section
        style={{ padding: '100px 0', background: 'var(--section-warm, var(--bg-elevated))' }}
      >
        <div className="max-w-[1080px] mx-auto px-7">
          <FadeIn>
            <p className="font-label text-[11px] font-medium tracking-[0.25em] uppercase mb-4" style={{ color: 'var(--gold)' }}>
              Dein Hebel
            </p>
            <h2
              className="font-heading"
              style={{
                fontSize: 'clamp(28px, 4vw, 40px)',
                lineHeight: 1.25,
                color: 'var(--text-h)',
                marginBottom: 16,
                fontWeight: 400,
              }}
            >
              Deine Community ist dein größter Vorteil.
            </h2>
            <p
              className="font-body"
              style={{
                fontSize: 18,
                color: 'var(--text-sec)',
                maxWidth: 620,
                lineHeight: 1.8,
                marginBottom: 56,
              }}
            >
              Menschen mit positiver Erfahrung erzählen weiter. Jeder einzelne wird zum Botschafter – und verdient dir Geld.
            </p>
          </FadeIn>

          <FadeIn className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: '1',
                title: 'Du bringst deine Leute mit',
                desc: 'Deine Teilnehmer und Follower kommen über deinen persönlichen Link.',
                arrow: true,
              },
              {
                num: '2',
                title: 'Sie teilen ihre Erfahrung',
                desc: 'Begeisterte Mitglieder erzählen weiter – organisch, authentisch.',
                arrow: true,
              },
              {
                num: '3',
                title: 'Deine Reichweite wächst',
                desc: 'Neue Menschen finden dich – ohne Werbung, durch echte Empfehlungen.',
                arrow: false,
              },
            ].map((card) => (
              <div key={card.num} className="glass-card rounded-[8px] text-center relative" style={{ padding: '36px 28px' }}>
                <div
                  className="font-heading text-[52px] leading-none mb-4"
                  style={{ color: 'var(--gold)', fontWeight: 400 }}
                >
                  {card.num}
                </div>
                <h3 className="font-heading text-xl mb-2.5" style={{ color: 'var(--text-h)', fontWeight: 400 }}>
                  {card.title}
                </h3>
                <p className="font-body text-[15px] leading-[1.75]" style={{ color: 'var(--text-sec)' }}>
                  {card.desc}
                </p>
                {card.arrow && (
                  <span className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 z-[1]">
                    <ArrowIcon />
                  </span>
                )}
              </div>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════
           5 · DIE ZAHLEN
      ══════════════════════════════ */}
      <section style={{ padding: '100px 0' }}>
        <div className="max-w-[1080px] mx-auto px-7">
          <FadeIn>
            <p className="font-label text-[11px] font-medium tracking-[0.25em] uppercase mb-4" style={{ color: 'var(--gold)' }}>
              Dein Einkommen
            </p>
            <h2
              className="font-heading"
              style={{
                fontSize: 'clamp(28px, 4vw, 40px)',
                lineHeight: 1.25,
                color: 'var(--text-h)',
                marginBottom: 16,
                fontWeight: 400,
              }}
            >
              Du zahlst nichts. Du verdienst.
            </h2>
            <p
              className="font-body"
              style={{
                fontSize: 18,
                color: 'var(--text-sec)',
                maxWidth: 620,
                lineHeight: 1.8,
                marginBottom: 56,
              }}
            >
              Als Gründungsmentor ist Souleya für dich kostenlos. Du verdienst auf zwei Wegen – ab Tag 1.
            </p>
          </FadeIn>

          {/* 3 große Stat-Cards */}
          <FadeIn className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              {
                value: '0 €',
                label: 'Plattformkosten',
                detail: 'Kein Abo, keine Gebühr.\nFür Gründungsmentoren dauerhaft.',
              },
              {
                value: '20 %',
                label: 'Provision pro User',
                detail: 'Für jeden Menschen den du mitbringst. Wiederkehrend, jeden Monat.',
              },
              {
                value: '80 %',
                label: 'Deine Kurseinnahmen',
                detail: 'Du setzt deine Preise selbst. 80 % gehören dir, direkt via Stripe.',
              },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-[8px] text-center" style={{ padding: '44px 28px' }}>
                <div
                  className="font-heading leading-none mb-3"
                  style={{ fontSize: 'clamp(48px, 6vw, 72px)', color: 'var(--gold)', fontWeight: 400 }}
                >
                  {stat.value}
                </div>
                <div className="font-label text-[11px] font-medium tracking-[0.18em] uppercase mb-2.5" style={{ color: 'var(--text-sec)' }}>
                  {stat.label}
                </div>
                <div className="font-body text-[15px] leading-[1.65]" style={{ color: 'var(--text-muted)' }}>
                  {stat.detail.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < stat.detail.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </FadeIn>

          {/* Detail-Blocks */}
          <FadeIn className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="glass-card rounded-[8px]" style={{ padding: 40 }}>
              <h3 className="font-heading text-xl mb-5" style={{ color: 'var(--gold)', fontWeight: 400 }}>
                Für jeden den du mitbringst
              </h3>
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--divider)' }}>
                    <td className="py-3 pr-4 font-body text-[15px]" style={{ color: 'var(--text-body)', width: '48%' }}>
                      Monatsabo
                      <span className="block text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>20 € / Monat</span>
                    </td>
                    <td className="py-3 font-body text-[15px]" style={{ color: 'var(--text-sec)' }}>
                      <span className="font-semibold" style={{ color: 'var(--gold)' }}>4 € / Monat</span>
                      <span className="block text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>wiederkehrend</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-body text-[15px]" style={{ color: 'var(--text-body)' }}>
                      Jahresabo
                      <span className="block text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>200 € / Jahr</span>
                    </td>
                    <td className="py-3 font-body text-[15px]" style={{ color: 'var(--text-sec)' }}>
                      <span className="font-semibold" style={{ color: 'var(--gold)' }}>40 € / Jahr</span>
                      <span className="block text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>inkl. Verlängerung</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p className="font-body text-[13px] mt-4" style={{ color: 'var(--text-muted)' }}>
                Dein Ref-Link wird automatisch bei Profil-Einrichtung aktiviert.
              </p>
            </div>

            <div className="glass-card rounded-[8px]" style={{ padding: 40 }}>
              <h3 className="font-heading text-xl mb-5" style={{ color: 'var(--gold)', fontWeight: 400 }}>
                Für deine Kurse &amp; Sessions
              </h3>
              <p className="font-body text-[16px] leading-[1.8] mb-2" style={{ color: 'var(--text-body)' }}>
                Du setzt deinen Preis – Souleya behält 20 %, damit die Plattform wächst und dich weiter tragen kann.
              </p>
              <p className="font-body text-[16px] leading-[1.8] mb-2" style={{ color: 'var(--text-body)' }}>
                Auszahlung über Stripe. Transparent, direkt.
              </p>
              <p className="font-body text-[13px] mt-4" style={{ color: 'var(--text-muted)' }}>
                Keine Monatsgebühr. Keine versteckten Kosten.
              </p>
            </div>

            {/* Beispielrechnung */}
            <div
              className="glass-card rounded-[8px] md:col-span-2"
              style={{
                padding: 44,
                borderColor: 'var(--gold-border, rgba(200,169,110,0.14))',
              }}
            >
              <h3 className="font-heading text-[22px] mb-8" style={{ color: 'var(--gold)', fontWeight: 400 }}>
                Ein Beispiel, das für sich spricht.
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <div>
                  <div className="font-label text-[10px] font-medium tracking-[0.18em] uppercase mb-2.5" style={{ color: 'var(--text-muted)' }}>
                    50 Mitglieder mitgebracht
                  </div>
                  <div
                    className="font-heading leading-[1.1] mb-1.5"
                    style={{ fontSize: 'clamp(32px, 4vw, 42px)', color: 'var(--gold)', fontWeight: 400 }}
                  >
                    200 €
                  </div>
                  <div className="font-body text-[14px] leading-[1.6]" style={{ color: 'var(--text-muted)' }}>
                    50 × 4 € Provision / Monat
                  </div>
                </div>
                <div>
                  <div className="font-label text-[10px] font-medium tracking-[0.18em] uppercase mb-2.5" style={{ color: 'var(--text-muted)' }}>
                    Kurs: 79 € · 20 Teilnehmer
                  </div>
                  <div
                    className="font-heading leading-[1.1] mb-1.5"
                    style={{ fontSize: 'clamp(32px, 4vw, 42px)', color: 'var(--gold)', fontWeight: 400 }}
                  >
                    1.264 €
                  </div>
                  <div className="font-body text-[14px] leading-[1.6]" style={{ color: 'var(--text-muted)' }}>
                    80 % von 1.580 € Einnahmen
                  </div>
                </div>
                <div className="md:border-l md:pl-8" style={{ borderColor: 'var(--gold-border, rgba(200,169,110,0.14))' }}>
                  <div className="font-label text-[10px] font-medium tracking-[0.18em] uppercase mb-2.5" style={{ color: 'var(--text-muted)' }}>
                    Dein erster Monat
                  </div>
                  <div
                    className="font-heading leading-[1.1] mb-1.5"
                    style={{ fontSize: 'clamp(40px, 5vw, 42px)', color: 'var(--gold)', fontWeight: 400 }}
                  >
                    1.464 €
                  </div>
                  <div className="font-body text-[14px] leading-[1.6]" style={{ color: 'var(--text-sec)' }}>
                    Ohne Werbung. Ohne Gebühr.
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════
           6 · DEIN START
      ══════════════════════════════ */}
      <section
        style={{ padding: '100px 0', background: 'var(--bg-section-warm)' }}
      >
        <div className="max-w-[1080px] mx-auto px-7">
          <FadeIn>
            <p className="font-label text-[11px] font-medium tracking-[0.25em] uppercase mb-4" style={{ color: 'var(--gold)' }}>
              Dein Weg
            </p>
            <h2
              className="font-heading mb-14"
              style={{
                fontSize: 'clamp(28px, 4vw, 40px)',
                color: 'var(--text-h)',
                fontWeight: 400,
              }}
            >
              So einfach startest du.
            </h2>
          </FadeIn>

          <FadeIn className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { num: '01', title: 'Kurzes Gespräch', desc: 'Wir lernen uns kennen. Kein Interview – ein echtes Gespräch.' },
              { num: '02', title: 'Raum einrichten', desc: 'Dein Mentor-Profil. Dein erster Gratis-Inhalt. Auf deine Weise.' },
              { num: '03', title: 'Community einladen', desc: 'Teile deinen Link. Jeder der kommt, verdient dir ab Tag 1.' },
              { num: '04', title: 'Zusammen wachsen', desc: 'Ab Launch begleitest du – und neue finden dich von selbst.' },
            ].map((step) => (
              <div key={step.num} className="glass-card rounded-[8px] text-center" style={{ padding: '32px 24px' }}>
                <div
                  className="font-heading text-[44px] leading-none mb-4"
                  style={{ color: 'var(--gold)', fontWeight: 400 }}
                >
                  {step.num}
                </div>
                <h3 className="font-heading text-lg mb-2.5" style={{ color: 'var(--text-h)', fontWeight: 400 }}>
                  {step.title}
                </h3>
                <p className="font-body text-[14px] leading-[1.7]" style={{ color: 'var(--text-sec)' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════
           7 · ANFORDERUNGEN
      ══════════════════════════════ */}
      <section style={{ padding: '100px 0' }}>
        <div className="max-w-[1080px] mx-auto px-7">
          <FadeIn>
            <p className="font-label text-[11px] font-medium tracking-[0.25em] uppercase mb-4" style={{ color: 'var(--gold)' }}>
              Gemeinsame Basis
            </p>
            <h2
              className="font-heading mb-12"
              style={{
                fontSize: 'clamp(28px, 4vw, 40px)',
                color: 'var(--text-h)',
                fontWeight: 400,
              }}
            >
              Was wir voneinander erwarten.
            </h2>
          </FadeIn>

          <FadeIn className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[800px]">
            {[
              'Echte Erfahrung in dem was du teilst – gelebtes Wissen, keine Theorie',
              'Die Bereitschaft sichtbar zu sein – auf deine Weise, in deinem Rhythmus',
              'Respekt für den Raum anderer – Begegnung, nicht Bühne',
              'Mindestens einen Gratis-Inhalt – damit Besucher erleben was dich ausmacht',
            ].map((text, i) => (
              <div key={i} className="glass-card rounded-[8px] flex items-start gap-4" style={{ padding: '28px 32px' }}>
                <span className="text-[10px] mt-1 flex-shrink-0" style={{ color: 'var(--gold)', opacity: 0.7 }}>
                  ✦
                </span>
                <p className="font-body text-[16px] leading-[1.7]" style={{ color: 'var(--text-body)' }}>
                  {text}
                </p>
              </div>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════
           8 · CTA
      ══════════════════════════════ */}
      <section
        className="text-center"
        style={{
          padding: '120px 28px',
          background: 'var(--section-warm, var(--bg-elevated))',
        }}
      >
        <FadeIn>
          <p className="font-label text-[11px] font-medium tracking-[0.25em] uppercase mb-4" style={{ color: 'var(--gold)' }}>
            Dein erster Schritt
          </p>
          <h2
            className="font-heading"
            style={{
              fontSize: 'clamp(28px, 5vw, 42px)',
              color: 'var(--text-h)',
              marginBottom: 16,
              fontWeight: 400,
            }}
          >
            Lass uns reden.
          </h2>
          <p
            className="font-body"
            style={{
              fontSize: 17,
              color: 'var(--text-sec)',
              marginBottom: 48,
              lineHeight: 1.8,
            }}
          >
            Wenn das resoniert, freuen wir uns von dir zu hören.
            <br />
            Schreib uns kurz – per WhatsApp oder E-Mail.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://wa.me/66986378733?text=Hallo%20Souleya%2C%20ich%20bin%20%5BName%5D%20und%20m%C3%B6chte%20als%20Mentor%20dabei%20sein."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 font-label text-[11px] font-medium tracking-[0.18em] uppercase no-underline transition-all duration-300"
              style={{
                background: 'var(--gold, #C8A96E)',
                color: 'var(--text-on-gold)',
                border: '1px solid var(--gold)',
                padding: '16px 36px',
                borderRadius: '9999px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 20px var(--gold-glow, rgba(200,169,110,0.25))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <WhatsAppIcon />
              Gespräch auf WhatsApp
            </a>

            <a
              href="mailto:hello@souleya.com?subject=Mentor-Einladung%20Souleya&body=Hallo%20Souleya%2C%20ich%20bin%20%5BName%5D%20und%20m%C3%B6chte%20als%20Mentor%20dabei%20sein."
              className="inline-flex items-center gap-2.5 font-label text-[11px] font-medium tracking-[0.18em] uppercase no-underline transition-all duration-300"
              style={{
                background: 'transparent',
                color: 'var(--gold)',
                border: '1px solid var(--gold)',
                padding: '16px 36px',
                borderRadius: '9999px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.background = 'var(--gold-soft, rgba(200,169,110,0.10))';
                e.currentTarget.style.boxShadow = '0 4px 20px var(--gold-glow, rgba(200,169,110,0.25))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <MailIcon />
              Per E-Mail schreiben
            </a>
          </div>

          <p className="font-body text-[13px] mt-6" style={{ color: 'var(--text-muted)' }}>
            Wir melden uns persönlich bei dir.
          </p>
        </FadeIn>
      </section>
    </>
  );
}
