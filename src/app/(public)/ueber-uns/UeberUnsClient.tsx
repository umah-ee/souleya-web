'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';

const TEAM = [
  {
    name: 'Andreas',
    role: 'Founder & Entwickler',
    avatar: '/team/andreas.png',
    bio: 'Seit über einem Jahrzehnt in der Tech-Welt unterwegs. Irgendwann hat er gemerkt, dass die besten Produkte die sind, die echte Probleme lösen – nicht die mit den meisten Features. Souleya ist sein Herzensprojekt.',
  },
  {
    name: 'Steffi',
    role: 'Founder & Community',
    avatar: '/team/steffi.jpg',
    bio: 'Steffis Superpower: Menschen zusammenbringen und ihnen das Gefühl geben, angekommen zu sein. Sie kümmert sich darum, dass jeder neue Souleya-Mensch sich willkommen fühlt – vom ersten Moment an.',
  },
];

export default function UeberUnsClient() {
  const [lightbox, setLightbox] = useState<typeof TEAM[number] | null>(null);

  return (
    <>
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* ── Hero ── */}
        <div className="text-center mb-16">
          <h1
            className="font-heading text-3xl md:text-4xl italic mb-4"
            style={{ color: 'var(--text-h)' }}
          >
            Wer steckt hinter Souleya?
          </h1>
          <p className="text-base leading-relaxed max-w-xl mx-auto" style={{ color: 'var(--text-sec)' }}>
            Zwei Menschen, eine Vision: Ein Ort, an dem echte Verbindungen entstehen –
            nicht für den Algorithmus, sondern für dich.
          </p>
        </div>

        {/* ── Geschichte ── */}
        <section className="mb-14">
          <h2 className="font-heading text-2xl italic mb-4" style={{ color: 'var(--text-h)' }}>
            Warum Souleya?
          </h2>
          <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
            <p>
              Du kennst das Gefühl: Du warst auf einem wunderbaren Retreat, einem Workshop oder
              einer Meditations-Session. Es war intensiv, berührend, transformierend. Und dann?
              Du fährst nach Hause und die Verbindung – zu den Menschen, zur Energie, zum Gelernten
              – löst sich langsam auf.
            </p>
            <p>
              Genau dieses Problem wollen wir lösen. Souleya ist der Ort, an dem die Verbindung
              bleibt. Wo du Gleichgesinnte findest, die den gleichen Weg gehen. Wo du von Mentoren
              lernst, die dich wirklich verstehen. Und wo du deine Reise in deinem Tempo gehen
              kannst – begleitet von einer Community, die dich trägt.
            </p>
          </div>
        </section>

        {/* ── Team ── */}
        <section className="mb-14">
          <h2 className="font-heading text-2xl italic mb-6" style={{ color: 'var(--text-h)' }}>
            Das Team
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="rounded-2xl border p-6"
                style={{
                  background: 'var(--glass)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderColor: 'var(--glass-border)',
                }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() => setLightbox(member)}
                    className="relative group flex-shrink-0 cursor-zoom-in"
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-14 h-14 rounded-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      style={{
                        border: '2px solid var(--gold-border)',
                      }}
                    />
                    <div
                      className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ boxShadow: '0 0 16px rgba(200,169,110,0.5)' }}
                    />
                  </button>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-h)' }}>{member.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{member.role}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Mission & Vision ── */}
        <section className="mb-14">
          <h2 className="font-heading text-2xl italic mb-6" style={{ color: 'var(--text-h)' }}>
            Mission &amp; Vision
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div
              className="rounded-2xl border p-6"
              style={{
                background: 'var(--glass)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderColor: 'var(--glass-border)',
              }}
            >
              <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--gold-text)' }}>
                Mission
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
                Menschen auf ihrem Weg der persönlichen Entwicklung verbinden – mit Gleichgesinnten,
                Mentoren und Wissen. Alles an einem Ort, ohne dass die Verbindung nach dem letzten
                Workshop verloren geht.
              </p>
            </div>
            <div
              className="rounded-2xl border p-6"
              style={{
                background: 'var(--glass)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderColor: 'var(--glass-border)',
              }}
            >
              <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--gold-text)' }}>
                Vision
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
                Eine Welt, in der persönliches Wachstum keine einsame Reise ist, sondern ein
                gemeinsamer Weg. Souleya soll der Ort werden, an dem du dich traust, du selbst
                zu sein – und dabei Menschen findest, die dich sehen.
              </p>
            </div>
          </div>
        </section>

        {/* ── Werte ── */}
        <section>
          <h2 className="font-heading text-2xl italic mb-6" style={{ color: 'var(--text-h)' }}>
            Unsere Werte
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { title: 'Echtheit', desc: 'Keine Filter, keine Fassade. Wir glauben an echte Verbindungen und ehrliche Kommunikation.' },
              { title: 'Wachstum', desc: 'Jeder Mensch hat das Potenzial zu wachsen – in seinem eigenen Tempo, auf seinem eigenen Weg.' },
              { title: 'Gemeinschaft', desc: 'Alleine geht vieles. Zusammen geht mehr. Wir bauen Brücken, keine Mauern.' },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border p-5"
                style={{
                  background: 'var(--glass)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderColor: 'var(--glass-border)',
                }}
              >
                <p className="font-medium mb-2" style={{ color: 'var(--text-h)' }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-body)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative rounded-2xl border overflow-hidden max-w-sm w-full"
            style={{
              background: 'var(--bg-elevated)',
              borderColor: 'var(--glass-border)',
              boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Enso Deko */}
            <div className="absolute top-3 right-3 opacity-10">
              <svg viewBox="0 0 100 100" className="w-10 h-10">
                <circle
                  cx="50" cy="50" r="38" fill="none" stroke="var(--gold-text)"
                  strokeWidth="3" strokeLinecap="round"
                  strokeDasharray="196 30" transform="rotate(-30 50 50)"
                />
              </svg>
            </div>

            {/* Schliessen-Button */}
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-3 left-3 z-10 p-1.5 rounded-full transition-colors hover:bg-black/20"
            >
              <Icon name="x" size={18} style={{ color: 'var(--text-muted)' }} />
            </button>

            {/* Bild */}
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src={lightbox.avatar}
                alt={lightbox.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="p-5 text-center">
              <p className="font-heading text-xl italic mb-0.5" style={{ color: 'var(--text-h)' }}>
                {lightbox.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--gold-text)' }}>
                {lightbox.role}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
