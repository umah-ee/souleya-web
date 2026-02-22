'use client';

import type { Connection } from '@/types/circles';

interface Props {
  connection: Connection;
  onRemove: (id: string) => void;
}

export default function ConnectionCard({ connection, onRemove }: Props) {
  const { profile } = connection;
  const initials = (profile.display_name ?? profile.username ?? '?').slice(0, 1).toUpperCase();

  return (
    <div className="flex items-center gap-3 bg-dark rounded-2xl border border-gold-1/10 p-4 mb-3">
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
        <div className="flex items-center gap-2">
          <span className="font-body font-medium text-sm text-[#F0EDE8] truncate">
            {profile.display_name ?? profile.username ?? 'Anonym'}
          </span>
          {profile.is_origin_soul && (
            <span className="text-[0.6rem] tracking-[0.15em] uppercase text-gold-3 font-label border border-gold-3/30 rounded-full px-1.5 py-px flex-shrink-0">
              Origin Soul
            </span>
          )}
        </div>
        {profile.username && (
          <span className="text-xs text-[#5A5450] font-label">
            @{profile.username}
          </span>
        )}
      </div>

      {/* Entfernen */}
      <button
        onClick={() => onRemove(connection.id)}
        className="px-3 py-1.5 bg-transparent border border-[#5A5450]/30 rounded-full text-[#5A5450] font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer hover:border-[#E63946]/40 hover:text-[#E63946] transition-colors duration-200"
      >
        Entfernen
      </button>
    </div>
  );
}
