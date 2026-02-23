'use client';

import Link from 'next/link';
import type { Connection } from '@/types/circles';

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'gerade eben';
  if (diff < 3600) return `${Math.floor(diff / 60)} Min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} Std`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} Tg`;
  return new Date(dateString).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}

interface IncomingProps {
  request: Connection;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

export function IncomingRequestCard({ request, onAccept, onDecline }: IncomingProps) {
  const { profile } = request;
  const initials = (profile.display_name ?? profile.username ?? '?').slice(0, 1).toUpperCase();

  const avatarAndInfo = (
    <>
      {/* Avatar */}
      <div
        className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center font-heading text-lg overflow-hidden"
        style={{
          background: 'var(--avatar-bg)',
          color: 'var(--gold-text)',
          border: `1.5px solid ${profile.is_origin_soul ? 'var(--gold-border)' : 'var(--gold-border-s)'}`,
        }}
      >
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
        ) : initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <span className="font-body font-medium text-sm truncate block" style={{ color: 'var(--text-h)' }}>
          {profile.display_name ?? profile.username ?? 'Anonym'}
        </span>
        <span className="text-xs font-label" style={{ color: 'var(--text-muted)' }}>
          {timeAgo(request.created_at)}
        </span>
      </div>
    </>
  );

  return (
    <div className="flex items-center gap-3 glass-card rounded-2xl p-4 mb-3 transition-colors">
      {profile.username ? (
        <Link href={`/u/${profile.username}`} className="flex items-center gap-3 flex-1 min-w-0">
          {avatarAndInfo}
        </Link>
      ) : (
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {avatarAndInfo}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => onAccept(request.id)}
          className="px-3 py-1.5 border-none rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer transition-opacity duration-200"
          style={{
            background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
            color: 'var(--text-on-gold)',
          }}
        >
          Annehmen
        </button>
        <button
          onClick={() => onDecline(request.id)}
          className="px-3 py-1.5 bg-transparent rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer transition-colors duration-200"
          style={{
            border: '1px solid var(--divider)',
            color: 'var(--text-muted)',
          }}
        >
          Ablehnen
        </button>
      </div>
    </div>
  );
}

interface OutgoingProps {
  request: Connection;
  onCancel: (id: string) => void;
}

export function OutgoingRequestCard({ request, onCancel }: OutgoingProps) {
  const { profile } = request;
  const initials = (profile.display_name ?? profile.username ?? '?').slice(0, 1).toUpperCase();

  const avatarAndInfo = (
    <>
      {/* Avatar */}
      <div
        className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center font-heading text-lg overflow-hidden"
        style={{
          background: 'var(--avatar-bg)',
          color: 'var(--gold-text)',
          border: `1.5px solid ${profile.is_origin_soul ? 'var(--gold-border)' : 'var(--gold-border-s)'}`,
        }}
      >
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
        ) : initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <span className="font-body font-medium text-sm truncate block" style={{ color: 'var(--text-h)' }}>
          {profile.display_name ?? profile.username ?? 'Anonym'}
        </span>
        <span className="text-xs font-label" style={{ color: 'var(--text-muted)' }}>
          Anfrage gesendet · {timeAgo(request.created_at)}
        </span>
      </div>
    </>
  );

  return (
    <div className="flex items-center gap-3 glass-card rounded-2xl p-4 mb-3 transition-colors">
      {profile.username ? (
        <Link href={`/u/${profile.username}`} className="flex items-center gap-3 flex-1 min-w-0">
          {avatarAndInfo}
        </Link>
      ) : (
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {avatarAndInfo}
        </div>
      )}

      {/* Cancel */}
      <button
        onClick={() => onCancel(request.id)}
        className="px-3 py-1.5 bg-transparent rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer transition-colors duration-200 flex-shrink-0"
        style={{
          border: '1px solid var(--divider)',
          color: 'var(--text-muted)',
        }}
      >
        Abbrechen
      </button>
    </div>
  );
}
