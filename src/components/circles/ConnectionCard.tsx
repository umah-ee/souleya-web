'use client';

import Link from 'next/link';
import type { Connection } from '@/types/circles';
import EnsoRing from '@/components/ui/EnsoRing';

interface Props {
  connection: Connection;
  onRemove: (id: string) => void;
}

export default function ConnectionCard({ connection, onRemove }: Props) {
  const { profile } = connection;
  const initials = (profile.display_name ?? profile.username ?? '?').slice(0, 1).toUpperCase();

  const profileContent = (
    <>
      {/* Avatar im Enso Ring */}
      <EnsoRing
        vipLevel={profile.vip_level}
        isOriginSoul={profile.is_origin_soul}
        size="feed"
        className="flex-shrink-0"
      >
        <div
          className="w-full h-full rounded-full flex items-center justify-center font-heading text-[0.7rem] overflow-hidden"
          style={{
            background: 'var(--avatar-bg)',
            color: 'var(--gold-text)',
          }}
        >
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : initials}
        </div>
      </EnsoRing>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-body font-medium text-sm truncate" style={{ color: 'var(--text-h)' }}>
            {profile.display_name ?? profile.username ?? 'Anonym'}
          </span>
          {profile.is_origin_soul && (
            <span
              className="text-[0.6rem] tracking-[0.15em] uppercase font-label rounded-full px-1.5 py-px flex-shrink-0"
              style={{ color: 'var(--gold)', border: '1px solid var(--gold-border-s)' }}
            >
              First Light
            </span>
          )}
        </div>
        {profile.username && (
          <span className="text-xs font-label" style={{ color: 'var(--text-muted)' }}>
            @{profile.username}
          </span>
        )}
      </div>
    </>
  );

  return (
    <div className="flex items-center gap-3 glass-card rounded-2xl p-4 mb-3 transition-colors">
      {profile.username ? (
        <Link href={`/u/${profile.username}`} className="flex items-center gap-3 flex-1 min-w-0">
          {profileContent}
        </Link>
      ) : (
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {profileContent}
        </div>
      )}

      {/* Entfernen */}
      <button
        onClick={() => onRemove(connection.id)}
        className="px-3 py-1.5 bg-transparent rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer transition-colors duration-200 flex-shrink-0"
        style={{
          border: '1px solid var(--divider)',
          color: 'var(--text-muted)',
        }}
      >
        Entfernen
      </button>
    </div>
  );
}
