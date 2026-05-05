'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Raum, RaumComment, CallRaum } from '@/lib/raeume';
import { commentCount } from '@/lib/raeume';

type Props = {
  raum: Raum;
  comments: RaumComment[];
  sessionEmail: string | null;
  liveTakenSlots: number | null;
};

export default function RaumDetailClient({ raum, comments, sessionEmail, liveTakenSlots }: Props) {
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
        <CallSignup raum={raum} liveTakenSlots={liveTakenSlots} />
      )}

      {raum.type === 'call' && raum.ended && (
        <CallEnded date={raum.callDate} summary={raum.callSummary} />
      )}

      <Comments
        raum={raum}
        comments={comments}
        sessionEmail={sessionEmail}
      />
    </div>
  );
}

/* ───────────────── Call-Anmeldung ───────────────── */

function CallSignup({
  raum,
  liveTakenSlots,
}: {
  raum: CallRaum;
  liveTakenSlots: number | null;
}) {
  const taken = liveTakenSlots ?? 0;
  const slotsLeft = Math.max(0, raum.callMaxSlots - taken);

  const [state, setState] = useState<
    | { kind: 'idle' }
    | { kind: 'loading' }
    | { kind: 'confirmed' }
    | { kind: 'waitlist' }
    | { kind: 'error'; message: string }
  >({ kind: 'idle' });
  const [email, setEmail] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState({ kind: 'loading' });
    try {
      const res = await fetch('/api/raeume/subscribe-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), slug: raum.slug }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        setState({
          kind: 'error',
          message: friendlyError(body.error),
        });
        return;
      }
      setState({ kind: body.status === 'waitlist' ? 'waitlist' : 'confirmed' });
    } catch {
      setState({
        kind: 'error',
        message: 'Das hat leider nicht geklappt. Versuch es gerne nochmal.',
      });
    }
  }

  if (state.kind === 'confirmed') {
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

  if (state.kind === 'waitlist') {
    return (
      <div className="raum-call-signup">
        <div className="raum-call-done">
          <div className="raum-call-done-check" aria-hidden="true">✉</div>
          <h3>Schade — der Raum ist schon voll.</h3>
          <p>
            Wir machen einen zweiten Termin. Sobald das Datum steht, schicken wir dir eine Mail.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="raum-call-signup">
      <h3>Darüber reden wir am Samstag.</h3>
      <div className="raum-call-details">
        {raum.callDateLong} · Kleine Runde, {raum.callDurationMin} Minuten, eine Frage.
      </div>
      <div className="raum-call-slots">
        {slotsLeft > 0
          ? `Noch ${slotsLeft} Plätze frei`
          : 'Aktuell keine Plätze frei — du landest auf der Warteliste'}
      </div>
      <form className="raum-call-form" onSubmit={submit}>
        <input
          type="email"
          required
          placeholder="deine@email.de"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state.kind === 'loading'}
        />
        <button
          type="submit"
          className="raum-call-btn"
          disabled={state.kind === 'loading'}
        >
          {state.kind === 'loading' ? 'Einen Moment …' : 'Anmelden'}
        </button>
      </form>
      {state.kind === 'error' && (
        <p className="raum-login-prompt-hint" style={{ color: '#A8894E', marginTop: 12 }}>
          {state.message}
        </p>
      )}
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

/* ───────────────── Kommentare ───────────────── */

function Comments({
  raum,
  comments,
  sessionEmail,
}: {
  raum: Raum;
  comments: RaumComment[];
  sessionEmail: string | null;
}) {
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const count = commentCount(comments);
  const heading =
    count === 0
      ? 'Noch keine Gedanken'
      : `${count} ${count === 1 ? 'Gedanke' : 'Gedanken'}`;

  const isCallEnded = raum.type === 'call' && raum.ended;

  return (
    <section className="raum-comments">
      <h4>{heading}</h4>
      {isCallEnded && comments.length > 0 && (
        <div className="raum-comments-empty">
          Dieser Raum bleibt offen. Du kannst weiter schreiben.
        </div>
      )}

      {comments.map((c) => (
        <CommentBlock
          key={c.id}
          comment={c}
          canReply={!!sessionEmail}
          onReply={(id, name) => setReplyTo({ id, name })}
        />
      ))}

      {sessionEmail ? (
        <CommentForm
          email={sessionEmail}
          slug={raum.slug}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />
      ) : (
        <LoginPrompt slug={raum.slug} />
      )}
    </section>
  );
}

function CommentBlock({
  comment,
  canReply,
  onReply,
}: {
  comment: RaumComment;
  canReply: boolean;
  onReply: (id: string, name: string) => void;
}) {
  return (
    <>
      <div className="raum-comment">
        <Avatar comment={comment} />
        <div className="raum-comment-body">
          <div className="raum-comment-header">
            <span className="raum-comment-name">{comment.name}</span>
            {' · '}
            {comment.timeAgo}
          </div>
          <div className="raum-comment-text">{comment.text}</div>
          {canReply && (
            <button
              type="button"
              className="raum-comment-reply-btn"
              onClick={() => onReply(comment.id, comment.name)}
            >
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
              {' · '}
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
    <div className="raum-comment-avatar">
      {comment.name.charAt(0).toUpperCase()}
    </div>
  );
}

/* ───────────────── Login-Prompt (nicht eingeloggt) ───────────────── */

function LoginPrompt({ slug }: { slug: string }) {
  const [state, setState] = useState<
    | { kind: 'idle' }
    | { kind: 'loading' }
    | { kind: 'sent' }
    | { kind: 'error'; message: string }
  >({ kind: 'idle' });
  const [email, setEmail] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState({ kind: 'loading' });
    try {
      const res = await fetch('/api/raeume/subscribe-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), slug }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        setState({ kind: 'error', message: friendlyError(body.error) });
        return;
      }
      setState({ kind: 'sent' });
    } catch {
      setState({
        kind: 'error',
        message: 'Das hat leider nicht geklappt. Versuch es gerne nochmal.',
      });
    }
  }

  if (state.kind === 'sent') {
    return (
      <div className="raum-login-prompt">
        <p>Check dein Postfach. Wir haben dir einen Link geschickt.</p>
        <p className="raum-login-prompt-hint">
          Ein Klick und du kannst hier weiterschreiben. Du bleibst eingeloggt — beim nächsten Besuch musst du keinen neuen Link anfordern.
        </p>
      </div>
    );
  }

  return (
    <div className="raum-login-prompt">
      <p>Möchtest du deine Gedanken teilen?</p>
      <form className="raum-call-form" onSubmit={submit}>
        <input
          type="email"
          required
          placeholder="deine@email.de"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state.kind === 'loading'}
        />
        <button
          type="submit"
          className="raum-call-btn"
          disabled={state.kind === 'loading'}
        >
          {state.kind === 'loading' ? 'Einen Moment …' : 'Mitmachen'}
        </button>
      </form>
      <div className="raum-login-prompt-hint">
        Du bekommst einen Link per Mail. Ein Klick und du kannst schreiben. Du kannst auch anonym posten.
      </div>
      {state.kind === 'error' && (
        <p className="raum-login-prompt-hint" style={{ color: '#A8894E', marginTop: 8 }}>
          {state.message}
        </p>
      )}
    </div>
  );
}

/* ───────────────── Comment-Form (eingeloggt) ───────────────── */

function CommentForm({
  email,
  slug,
  replyTo,
  onCancelReply,
}: {
  email: string;
  slug: string;
  replyTo: { id: string; name: string } | null;
  onCancelReply: () => void;
}) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [name, setName] = useState(() => defaultNameFromEmail(email));
  const [anon, setAnon] = useState(false);
  const [state, setState] = useState<
    | { kind: 'idle' }
    | { kind: 'loading' }
    | { kind: 'error'; message: string }
  >({ kind: 'idle' });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !name.trim()) return;
    setState({ kind: 'loading' });
    try {
      const res = await fetch('/api/raeume/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          text: text.trim(),
          display_name: name.trim(),
          is_anonymous: anon,
          parent_id: replyTo?.id ?? null,
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        setState({ kind: 'error', message: friendlyError(body.error) });
        return;
      }
      setText('');
      setState({ kind: 'idle' });
      onCancelReply();
      router.refresh();
    } catch {
      setState({
        kind: 'error',
        message: 'Das hat leider nicht geklappt. Versuch es gerne nochmal.',
      });
    }
  }

  return (
    <div className="raum-comment-form-wrap">
      <p className="raum-comment-form-meta">
        Angemeldet als <strong>{email}</strong>
        <button
          type="button"
          className="raum-comment-form-logout"
          onClick={async () => {
            await fetch('/api/raeume/me', { method: 'DELETE' });
            window.location.reload();
          }}
        >
          Abmelden
        </button>
      </p>

      {replyTo && (
        <div
          style={{
            padding: '8px 12px',
            marginBottom: 12,
            borderRadius: 8,
            background: 'var(--gold-bg)',
            border: '1px solid var(--gold-border-s)',
            fontSize: 13,
            color: 'var(--text-body)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span>
            Antwort an <strong>{replyTo.name}</strong>
          </span>
          <button
            type="button"
            onClick={onCancelReply}
            className="raum-comment-form-logout"
            style={{ marginLeft: 0 }}
          >
            Abbrechen
          </button>
        </div>
      )}

      <form onSubmit={submit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dein Name"
          disabled={anon}
          required={!anon}
          style={{
            width: '100%',
            padding: '10px 14px',
            marginBottom: 8,
            borderRadius: 8,
            border: '1px solid var(--glass-border)',
            background: 'rgba(255,255,255,0.6)',
            color: 'var(--text-h)',
            fontFamily: 'var(--font-body, "Quicksand", sans-serif)',
            fontSize: 14,
            outline: 'none',
            opacity: anon ? 0.5 : 1,
          }}
        />
        <textarea
          className="raum-comment-textarea"
          placeholder="Was denkst du darüber?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          disabled={state.kind === 'loading'}
        />
        <div className="raum-comment-form-actions">
          <label className="raum-anon-check">
            <input
              type="checkbox"
              checked={anon}
              onChange={(e) => setAnon(e.target.checked)}
            />
            Anonym posten
          </label>
          <button
            type="submit"
            className="raum-call-btn"
            disabled={state.kind === 'loading'}
          >
            {state.kind === 'loading' ? 'Einen Moment …' : 'Gedanken teilen'}
          </button>
        </div>
        {state.kind === 'error' && (
          <p className="raum-login-prompt-hint" style={{ color: '#A8894E', marginTop: 8 }}>
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
}

function defaultNameFromEmail(email: string): string {
  const prefix = email.split('@')[0] ?? '';
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

/* ───────────────── Helpers ───────────────── */

function friendlyError(code: unknown): string {
  switch (code) {
    case 'invalid_email':
      return 'Die E-Mail-Adresse sieht nicht ganz richtig aus. Schau bitte nochmal.';
    case 'mail_not_configured':
    case 'audience_not_configured':
    case 'magic_link_secret_not_configured':
      return 'Bei uns läuft gerade etwas nicht. Schreib uns kurz an hello@souleya.com.';
    case 'raum_not_available':
      return 'Dieser Raum ist gerade nicht für Anmeldungen offen.';
    default:
      return 'Das hat leider nicht geklappt. Versuch es gerne nochmal.';
  }
}
