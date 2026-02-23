'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { MapNearbyUser } from './MapView';
import type { SoEvent } from '@/types/events';
import { VIP_NAMES } from '@/types/profile';
import EnsoRing from '@/components/ui/EnsoRing';

interface UserOverlayProps {
  type: 'user';
  user: MapNearbyUser;
  event?: never;
  userId?: string | null;
  connectionStatus?: string;
  onConnect?: () => void;
  onJoin?: never;
  onLeave?: never;
  connecting?: boolean;
  joining?: never;
  onClose: () => void;
}

interface EventOverlayProps {
  type: 'event';
  event: SoEvent;
  user?: never;
  userId?: string | null;
  connectionStatus?: never;
  onConnect?: never;
  onJoin?: (id: string) => void;
  onLeave?: (id: string) => void;
  connecting?: never;
  joining?: boolean;
  onClose: () => void;
}

type Props = UserOverlayProps | EventOverlayProps;

function formatDate(dateString: string): string {
  const d = new Date(dateString);
  return d.toLocaleDateString('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatTime(dateString: string): string {
  const d = new Date(dateString);
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export default function DiscoverOverlay(props: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Klick ausserhalb schliesst Overlay
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        props.onClose();
      }
    };
    // Timeout damit der Marker-Klick nicht sofort schliesst
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [props]);

  if (props.type === 'user') {
    return <UserOverlay {...props} overlayRef={overlayRef} />;
  }

  return <EventOverlay {...props} overlayRef={overlayRef} />;
}

// ── User Overlay ──────────────────────────────────────────────

function UserOverlay({
  user,
  userId,
  connectionStatus,
  onConnect,
  connecting,
  onClose,
  overlayRef,
}: UserOverlayProps & { overlayRef: React.RefObject<HTMLDivElement | null> }) {
  const initials = (user.display_name ?? user.username ?? '?').slice(0, 1).toUpperCase();
  const vipName = VIP_NAMES[user.vip_level] ?? `VIP ${user.vip_level}`;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 animate-slide-up">
      <div
        ref={overlayRef}
        className="mx-3 mb-3 glass-card rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 -4px 30px rgba(0,0,0,0.3)' }}
      >
        {/* Gold-Leiste oben */}
        <div
          className="h-[2px]"
          style={{ background: 'linear-gradient(to right, transparent, var(--gold-glow), transparent)' }}
        />

        <div className="p-5">
          {/* Schliessen */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer z-10"
            style={{ background: 'var(--glass)', color: 'var(--text-muted)' }}
          >
            ✕
          </button>

          {/* Avatar im Enso Ring + Info */}
          <div className="flex items-start gap-4 mb-4">
            <EnsoRing
              vipLevel={user.vip_level}
              isOriginSoul={user.is_origin_soul}
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
                {user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : initials}
              </div>
            </EnsoRing>

            <div className="flex-1 min-w-0 pr-6">
              <h3 className="font-body font-medium text-base truncate" style={{ color: 'var(--text-h)' }}>
                {user.display_name ?? user.username ?? 'Anonym'}
              </h3>
              {user.username && (
                <p className="text-sm font-body" style={{ color: 'var(--text-muted)' }}>@{user.username}</p>
              )}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  className="text-[0.55rem] tracking-[0.15em] uppercase font-label rounded-full px-1.5 py-px"
                  style={{ color: 'var(--gold)', border: '1px solid var(--gold-border-s)' }}
                >
                  {vipName}
                </span>
                {user.is_origin_soul && (
                  <span
                    className="text-[0.55rem] tracking-[0.15em] uppercase font-label rounded-full px-1.5 py-px"
                    style={{
                      color: 'var(--gold-text)',
                      border: '1px solid var(--gold-border)',
                      background: 'var(--gold-bg)',
                    }}
                  >
                    First Light
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-sm font-body leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--text-sec)' }}>
              {user.bio}
            </p>
          )}

          {/* Location + Connections */}
          <div className="flex items-center gap-4 text-xs font-body mb-4" style={{ color: 'var(--text-muted)' }}>
            {user.location && (
              <span>📍 {user.location}</span>
            )}
            <span>{user.connections_count} Verbindungen</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {user.username && (
              <Link
                href={`/u/${user.username}`}
                className="flex-1 py-2.5 rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase text-center transition-colors"
                style={{
                  border: '1px solid var(--gold-border-s)',
                  color: 'var(--gold-text)',
                }}
              >
                Profil ansehen
              </Link>
            )}

            {userId && connectionStatus === 'none' && (
              <button
                onClick={onConnect}
                disabled={connecting}
                className="flex-1 py-2.5 rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase transition-all duration-200"
                style={{
                  background: connecting ? 'var(--gold-bg)' : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                  color: connecting ? 'var(--text-muted)' : 'var(--text-on-gold)',
                  cursor: connecting ? 'not-allowed' : 'pointer',
                }}
              >
                {connecting ? '...' : 'Verbinden'}
              </button>
            )}
            {connectionStatus === 'connected' && (
              <span
                className="flex-1 py-2.5 rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase text-center"
                style={{ border: '1px solid var(--success-border)', color: 'var(--success)' }}
              >
                Verbunden
              </span>
            )}
            {connectionStatus === 'pending_outgoing' && (
              <span
                className="flex-1 py-2.5 rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase text-center"
                style={{ border: '1px solid var(--gold-border-s)', color: 'var(--text-muted)' }}
              >
                Angefragt
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Event Overlay ─────────────────────────────────────────────

function EventOverlay({
  event,
  userId,
  onJoin,
  onLeave,
  joining,
  onClose,
  overlayRef,
}: EventOverlayProps & { overlayRef: React.RefObject<HTMLDivElement | null> }) {
  const isCreator = userId === event.creator_id;
  const isFull = event.max_participants != null && event.participants_count >= event.max_participants;
  const creatorName = event.creator?.display_name ?? event.creator?.username ?? 'Anonym';
  const creatorInitial = creatorName.slice(0, 1).toUpperCase();

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 animate-slide-up">
      <div
        ref={overlayRef}
        className="mx-3 mb-3 glass-card rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 -4px 30px rgba(0,0,0,0.3)' }}
      >
        {/* Lila-Leiste oben */}
        <div
          className="h-[2px]"
          style={{ background: 'linear-gradient(to right, transparent, var(--event-purple), transparent)' }}
        />

        <div className="p-5">
          {/* Schliessen */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer z-10"
            style={{ background: 'var(--glass)', color: 'var(--text-muted)' }}
          >
            ✕
          </button>

          {/* Kategorie Badge */}
          <div className="mb-3">
            <span
              className="text-[0.6rem] tracking-[0.15em] uppercase font-label px-2 py-0.5 rounded-full"
              style={event.category === 'course' ? {
                color: 'var(--event-purple)',
                border: '1px solid var(--event-purple-border)',
                background: 'var(--event-purple-bg)',
              } : {
                color: 'var(--gold-text)',
                border: '1px solid var(--gold-border-s)',
                background: 'var(--gold-bg)',
              }}
            >
              {event.category === 'course' ? 'Kurs' : 'Meetup'}
            </span>
          </div>

          {/* Titel */}
          <h3 className="font-body font-medium text-base mb-2 pr-8" style={{ color: 'var(--text-h)' }}>
            {event.title}
          </h3>

          {/* Datum + Uhrzeit */}
          <div className="flex items-center gap-2 text-sm font-body mb-2" style={{ color: 'var(--text-sec)' }}>
            <span>📅 {formatDate(event.starts_at)} · {formatTime(event.starts_at)}</span>
            {event.ends_at && <span>– {formatTime(event.ends_at)}</span>}
          </div>

          {/* Ort */}
          <p className="text-sm font-body mb-3" style={{ color: 'var(--text-muted)' }}>
            📍 {event.location_name}
          </p>

          {/* Beschreibung */}
          {event.description && (
            <p className="text-sm font-body leading-relaxed line-clamp-3 mb-4" style={{ color: 'var(--text-sec)' }}>
              {event.description}
            </p>
          )}

          {/* Creator + Teilnehmer */}
          <div className="flex items-center gap-3 mb-4 text-sm">
            <div
              className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-heading overflow-hidden"
              style={{
                background: 'var(--avatar-bg)',
                color: 'var(--gold-text)',
                border: `1px solid ${event.creator?.is_origin_soul ? 'var(--gold-border)' : 'var(--gold-border-s)'}`,
              }}
            >
              {event.creator?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={event.creator.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : creatorInitial}
            </div>
            <span className="font-body" style={{ color: 'var(--text-muted)' }}>{creatorName}</span>
            <span style={{ color: 'var(--divider)' }}>·</span>
            <span className="font-body" style={{ color: 'var(--text-muted)' }}>
              {event.participants_count}{event.max_participants ? `/${event.max_participants}` : ''} Teilnehmer
            </span>
          </div>

          {/* Action Button */}
          {userId && !isCreator && (
            <div>
              {event.has_joined ? (
                <button
                  onClick={() => onLeave?.(event.id)}
                  disabled={joining}
                  className="w-full py-2.5 rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer transition-colors"
                  style={{
                    border: '1px solid var(--divider)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {joining ? '...' : 'Verlassen'}
                </button>
              ) : (
                <button
                  onClick={() => onJoin?.(event.id)}
                  disabled={joining || isFull}
                  className="w-full py-2.5 rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase transition-all duration-200"
                  style={{
                    background: isFull || joining
                      ? 'var(--gold-bg)'
                      : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                    color: isFull || joining ? 'var(--text-muted)' : 'var(--text-on-gold)',
                    cursor: isFull || joining ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isFull ? 'Voll' : joining ? '...' : 'Teilnehmen'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
