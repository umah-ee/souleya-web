'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Raum, RaumComment } from '@/lib/raeume';
import { commentCount } from '@/lib/raeume';

export default function RaumDetailClient({ raum }: { raum: Raum }) {
  return (
    <div className="raum-container raum-detail">
      <Link href="/raeume" className="raum-back">
        ← Zurück zu allen Räumen
      </Link>

      <div className="raum-detail-badge">
        {raum.type === 'call'
          ? `Call Raum · ${raum.callDate}`
          : 'Offener Raum'}
      </div>
      <h2>{raum.question}</h2>

      <div className="raum-impuls">
        {raum.impuls.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="raum-impuls-frage">{raum.impulsFrage}</div>

      {raum.type === 'call' && !raum.ended && (
        <CallSignup
          dateLong={raum.callDateLong}
          durationMin={raum.callDurationMin}
          slotsLeft={raum.callMaxSlots - raum.callTakenSlots}
        />
      )}

      {raum.type === 'call' && raum.ended && (
        <CallEnded date={raum.callDate} summary={raum.callSummary} />
      )}

      <Comments raum={raum} />
    </div>
  );
}

function CallSignup({
  dateLong,
  durationMin,
  slotsLeft,
}: {
  dateLong: string;
  durationMin: number;
  slotsLeft: number;
}) {
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState('');

  if (done) {
    return (
      <div className="raum-call-signup">
        <div className="raum-call-done">
          <div className="raum-call-done-check" aria-hidden="true">✓</div>
          <h3>Du bist dabei.</h3>
          <p>
            Check dein Postfach. Du bekommst eine Mail mit allen Details und dem Link zum Call.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="raum-call-signup">
      <h3>Darüber reden wir am Samstag.</h3>
      <div className="raum-call-details">
        {dateLong} · Kleine Runde, {durationMin} Minuten, eine Frage.
      </div>
      <div className="raum-call-slots">Noch {slotsLeft} Plätze frei</div>
      <form
        className="raum-call-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (email.trim()) setDone(true);
        }}
      >
        <input
          type="email"
          required
          placeholder="deine@email.de"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="raum-call-btn">
          Anmelden
        </button>
      </form>
    </div>
  );
}

function CallEnded({ date, summary }: { date: string; summary?: string }) {
  return (
    <div className="raum-call-ended">
      <div className="raum-call-ended-label">
        Das Gespräch hat am {date} stattgefunden
      </div>
      <div className="raum-call-ended-text">
        {summary ??
          'Sobald die Zusammenfassung steht, findest du sie hier. Bis dahin bleibt der Raum offen für Gedanken.'}
      </div>
    </div>
  );
}

function Comments({ raum }: { raum: Raum }) {
  const count = commentCount(raum);
  const heading =
    count === 0
      ? 'Noch keine Gedanken'
      : `${count} ${count === 1 ? 'Gedanke' : 'Gedanken'}`;

  const isCallEnded = raum.type === 'call' && raum.ended;

  return (
    <section className="raum-comments">
      <h4>{heading}</h4>
      {isCallEnded && raum.comments.length > 0 && (
        <div className="raum-comments-empty">
          Dieser Raum bleibt offen. Du kannst weiter schreiben.
        </div>
      )}

      {raum.comments.map((c) => (
        <CommentBlock key={c.id} comment={c} />
      ))}

      <LoginPrompt slug={raum.slug} />
    </section>
  );
}

function CommentBlock({ comment }: { comment: RaumComment }) {
  return (
    <>
      <div className="raum-comment">
        <Avatar comment={comment} />
        <div className="raum-comment-body">
          <div className="raum-comment-header">
            <span className="raum-comment-name">{comment.name}</span>
            {comment.isFounder && (
              <span className="raum-comment-founder-badge">Gründerin</span>
            )}
            {!comment.isFounder && ' · '}
            {comment.timeAgo}
          </div>
          <div className="raum-comment-text">{comment.text}</div>
          {!comment.isAnonymous && (
            <button type="button" className="raum-comment-reply-btn">
              Antworten
            </button>
          )}
        </div>
      </div>
      {comment.replies?.map((reply) => (
        <div key={reply.id} className="raum-comment-reply">
          <Avatar comment={reply} />
          <div className="raum-comment-body">
            <div className="raum-comment-header">
              <span className="raum-comment-name">{reply.name}</span>
              {reply.isFounder && (
                <span className="raum-comment-founder-badge">Gründerin</span>
              )}
              {!reply.isFounder && ' · '}
              {reply.timeAgo}
            </div>
            <div className="raum-comment-text">{reply.text}</div>
          </div>
        </div>
      ))}
    </>
  );
}

function Avatar({ comment }: { comment: RaumComment }) {
  if (comment.isAnonymous) {
    return <div className="raum-comment-avatar is-anon">?</div>;
  }
  return (
    <div
      className={`raum-comment-avatar${comment.isFounder ? ' is-founder' : ''}`}
    >
      {comment.name.charAt(0)}
    </div>
  );
}

function LoginPrompt({ slug }: { slug: string }) {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');

  if (sent) {
    return (
      <div className="raum-login-prompt">
        <p>Check dein Postfach. Wir haben dir einen Link geschickt.</p>
        <p className="raum-login-prompt-hint">
          Ein Klick und du kannst hier weiterschreiben.
        </p>
      </div>
    );
  }

  return (
    <div className="raum-login-prompt">
      <p>Möchtest du deine Gedanken teilen?</p>
      <form
        className="raum-call-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (email.trim()) setSent(true);
        }}
        aria-label={`Mitmachen im Raum ${slug}`}
      >
        <input
          type="email"
          required
          placeholder="deine@email.de"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="raum-call-btn">
          Mitmachen
        </button>
      </form>
      <div className="raum-login-prompt-hint">
        Du bekommst einen Link per Mail. Ein Klick und du kannst schreiben. Du kannst auch anonym posten.
      </div>
    </div>
  );
}
