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
      <div className={`
        w-11 h-11 rounded-full bg-gold-1/15 flex-shrink-0
        flex items-center justify-center font-heading text-lg text-gold-1
        border ${profile.is_origin_soul ? 'border-gold-1/50' : 'border-gold-1/20'}
      `}>
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
        ) : initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <span className="font-body font-medium text-sm text-[#F0EDE8] truncate block">
          {profile.display_name ?? profile.username ?? 'Anonym'}
        </span>
        <span className="text-xs text-[#5A5450] font-label">
          {timeAgo(request.created_at)}
        </span>
      </div>
    </>
  );

  return (
    <div className="flex items-center gap-3 bg-dark rounded-2xl border border-gold-1/10 p-4 mb-3 hover:border-gold-1/25 transition-colors">
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
          className="px-3 py-1.5 bg-gradient-to-br from-gold-3 to-gold-2 border-none rounded-full text-dark font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer hover:opacity-90 transition-opacity duration-200"
        >
          Annehmen
        </button>
        <button
          onClick={() => onDecline(request.id)}
          className="px-3 py-1.5 bg-transparent border border-[#5A5450]/30 rounded-full text-[#5A5450] font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer hover:border-[#5A5450]/50 transition-colors duration-200"
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
      <div className={`
        w-11 h-11 rounded-full bg-gold-1/15 flex-shrink-0
        flex items-center justify-center font-heading text-lg text-gold-1
        border ${profile.is_origin_soul ? 'border-gold-1/50' : 'border-gold-1/20'}
      `}>
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
        ) : initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <span className="font-body font-medium text-sm text-[#F0EDE8] truncate block">
          {profile.display_name ?? profile.username ?? 'Anonym'}
        </span>
        <span className="text-xs text-[#5A5450] font-label">
          Anfrage gesendet · {timeAgo(request.created_at)}
        </span>
      </div>
    </>
  );

  return (
    <div className="flex items-center gap-3 bg-dark rounded-2xl border border-gold-1/10 p-4 mb-3 hover:border-gold-1/25 transition-colors">
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
        className="px-3 py-1.5 bg-transparent border border-[#5A5450]/30 rounded-full text-[#5A5450] font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer hover:border-[#5A5450]/50 transition-colors duration-200 flex-shrink-0"
      >
        Abbrechen
      </button>
    </div>
  );
}
