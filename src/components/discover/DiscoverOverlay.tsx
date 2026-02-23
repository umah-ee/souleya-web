'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { MapNearbyUser } from './MapView';
import type { SoEvent } from '@/types/events';
import { VIP_NAMES } from '@/types/profile';

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
        className="mx-3 mb-3 bg-dark-est/95 backdrop-blur-xl border border-gold-1/20 rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
      >
        {/* Gold-Leiste oben */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-gold-1/60 to-transparent" />

        <div className="p-5">
          {/* Schliessen */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-[#5A5450] hover:text-[#F0EDE8] transition-colors cursor-pointer z-10"
          >
            ✕
          </button>

          {/* Avatar + Info */}
          <div className="flex items-start gap-4 mb-4">
            <div
              className={`
                w-14 h-14 rounded-full bg-gold-1/15 flex-shrink-0 flex items-center justify-center
                font-heading text-xl text-gold-1 overflow-hidden
                border-2 ${user.is_origin_soul ? 'border-gold-1/60' : 'border-gold-1/20'}
              `}
            >
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : initials}
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <h3 className="text-[#F0EDE8] font-body font-medium text-base truncate">
                {user.display_name ?? user.username ?? 'Anonym'}
              </h3>
              {user.username && (
                <p className="text-[#5A5450] text-sm font-body">@{user.username}</p>
              )}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[0.55rem] tracking-[0.15em] uppercase text-gold-3 font-label border border-gold-3/30 rounded-full px-1.5 py-px">
                  {vipName}
                </span>
                {user.is_origin_soul && (
                  <span className="text-[0.55rem] tracking-[0.15em] uppercase text-gold-1 font-label border border-gold-1/40 rounded-full px-1.5 py-px bg-gold-1/10">
                    Origin Soul
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-[#9A9080] text-sm font-body font-light leading-relaxed line-clamp-2 mb-3">
              {user.bio}
            </p>
          )}

          {/* Location + Connections */}
          <div className="flex items-center gap-4 text-xs text-[#5A5450] font-body mb-4">
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
                className="flex-1 py-2.5 border border-gold-1/25 rounded-full text-gold-1 font-label text-[0.65rem] tracking-[0.1em] uppercase text-center hover:border-gold-1/40 transition-colors"
              >
                Profil ansehen
              </Link>
            )}

            {userId && connectionStatus === 'none' && (
              <button
                onClick={onConnect}
                disabled={connecting}
                className={`
                  flex-1 py-2.5 rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase transition-all duration-200
                  ${connecting
                    ? 'bg-gold-1/20 text-[#5A5450] cursor-not-allowed'
                    : 'bg-gradient-to-br from-gold-3 to-gold-2 text-dark cursor-pointer hover:opacity-90'
                  }
                `}
              >
                {connecting ? '...' : 'Verbinden'}
              </button>
            )}
            {connectionStatus === 'connected' && (
              <span className="flex-1 py-2.5 border border-[#52B788]/30 rounded-full text-[#52B788] font-label text-[0.65rem] tracking-[0.1em] uppercase text-center">
                Verbunden
              </span>
            )}
            {connectionStatus === 'pending_outgoing' && (
              <span className="flex-1 py-2.5 border border-gold-1/20 rounded-full text-[#5A5450] font-label text-[0.65rem] tracking-[0.1em] uppercase text-center">
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
        className="mx-3 mb-3 bg-dark-est/95 backdrop-blur-xl border border-gold-1/20 rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
      >
        {/* Lila-Leiste oben */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#9B72CF]/60 to-transparent" />

        <div className="p-5">
          {/* Schliessen */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-[#5A5450] hover:text-[#F0EDE8] transition-colors cursor-pointer z-10"
          >
            ✕
          </button>

          {/* Kategorie Badge */}
          <div className="mb-3">
            <span className={`
              text-[0.6rem] tracking-[0.15em] uppercase font-label px-2 py-0.5 rounded-full
              ${event.category === 'course'
                ? 'text-[#9B72CF] border border-[#9B72CF]/30 bg-[#9B72CF]/10'
                : 'text-gold-1 border border-gold-1/30 bg-gold-1/10'
              }
            `}>
              {event.category === 'course' ? 'Kurs' : 'Meetup'}
            </span>
          </div>

          {/* Titel */}
          <h3 className="text-[#F0EDE8] font-body font-medium text-base mb-2 pr-8">
            {event.title}
          </h3>

          {/* Datum + Uhrzeit */}
          <div className="flex items-center gap-2 text-sm text-[#9A9080] font-body mb-2">
            <span>📅 {formatDate(event.starts_at)} · {formatTime(event.starts_at)}</span>
            {event.ends_at && <span>– {formatTime(event.ends_at)}</span>}
          </div>

          {/* Ort */}
          <p className="text-sm text-[#5A5450] font-body mb-3">
            📍 {event.location_name}
          </p>

          {/* Beschreibung */}
          {event.description && (
            <p className="text-[#9A9080] text-sm font-body font-light leading-relaxed line-clamp-3 mb-4">
              {event.description}
            </p>
          )}

          {/* Creator + Teilnehmer */}
          <div className="flex items-center gap-3 mb-4 text-sm">
            <div className={`
              w-6 h-6 rounded-full bg-gold-1/15 flex-shrink-0 flex items-center justify-center
              text-[10px] text-gold-1 font-heading border
              ${event.creator?.is_origin_soul ? 'border-gold-1/50' : 'border-gold-1/20'}
            `}>
              {event.creator?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={event.creator.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : creatorInitial}
            </div>
            <span className="text-[#5A5450] font-body">{creatorName}</span>
            <span className="text-[#5A5450]/50">·</span>
            <span className="text-[#5A5450] font-body">
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
                  className="w-full py-2.5 border border-[#5A5450]/30 rounded-full text-[#5A5450] font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer hover:border-[#5A5450]/50 transition-colors"
                >
                  {joining ? '...' : 'Verlassen'}
                </button>
              ) : (
                <button
                  onClick={() => onJoin?.(event.id)}
                  disabled={joining || isFull}
                  className={`
                    w-full py-2.5 rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase transition-all duration-200
                    ${isFull
                      ? 'bg-[#5A5450]/20 text-[#5A5450] cursor-not-allowed'
                      : joining
                        ? 'bg-gold-1/20 text-[#5A5450] cursor-not-allowed'
                        : 'bg-gradient-to-br from-gold-3 to-gold-2 text-dark cursor-pointer hover:opacity-90'
                    }
                  `}
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
