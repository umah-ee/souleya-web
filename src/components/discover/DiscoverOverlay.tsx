'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { MapNearbyUser } from './MapView';
import type { SoEvent } from '@/types/events';
import { SOUL_LEVEL_NAMES } from '@/types/profile';
import { Icon } from '@/components/ui/Icon';
import { getEventCover } from '@/lib/demo-covers';

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
  onShare?: (event: SoEvent) => void;
  onBookmark?: (id: string) => void;
  connecting?: never;
  joining?: boolean;
  bookmarking?: boolean;
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

// ── User Overlay — Visitenkarte-Style (nach Mockup) ────────────

function UserOverlay({
  user,
  userId,
  connectionStatus,
  onConnect,
  connecting,
  onClose,
  overlayRef,
}: UserOverlayProps & { overlayRef: React.RefObject<HTMLDivElement | null> }) {
  const displayName = user.display_name ?? user.username ?? 'Anonym';
  const initials = displayName.slice(0, 1).toUpperCase();
  const vipName = SOUL_LEVEL_NAMES[user.soul_level] ?? `Level ${user.soul_level}`;

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,.55)', padding: '20px' }}
    >
      {/* Card — Mockup: 420px web, bg-elevated, radius 32px */}
      <div
        ref={overlayRef}
        className="w-full max-w-[420px] overflow-hidden animate-scale-in"
        style={{
          background: 'var(--bg-elevated)',
          borderRadius: '32px',
          border: '1px solid var(--divider-l)',
          boxShadow: '0 20px 60px rgba(0,0,0,.35)',
        }}
      >
        {/* ─── Banner (90px) — Mockup: gold-softer → bg-elevated gradient ─── */}
        <div
          className="relative w-full h-[90px] overflow-hidden"
          style={{ background: 'linear-gradient(135deg, var(--gold-softer, var(--gold-bg)) 0%, var(--bg-elevated) 100%)' }}
        >
          {/* Close — Mockup: 28px, right 10px, top 10px */}
          <button
            onClick={onClose}
            className="absolute flex items-center justify-center cursor-pointer"
            style={{
              right: '10px',
              top: '10px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,.35)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              color: '#fff',
              border: 'none',
            }}
          >
            <Icon name="x" size={12} />
          </button>
        </div>

        {/* ─── Avatar — Mockup: 72px circle, 3px solid bg-card border ─── */}
        <div className="flex justify-center -mt-[36px] relative z-10">
          <div
            className="avatar-circle rounded-full flex items-center justify-center font-heading overflow-hidden"
            style={{
              width: '72px',
              height: '72px',
              fontSize: '24px',
              fontWeight: 400,
              background: 'var(--avatar-bg)',
              color: 'var(--gold)',
              border: '3px solid var(--bg-card)',
              boxShadow: '0 4px 16px rgba(0,0,0,.15)',
            }}
          >
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : initials}
          </div>
        </div>

        {/* ─── Body — Mockup: padding 12px 24px 24px ─── */}
        <div style={{ padding: '12px 24px 24px', textAlign: 'center' }}>
          {/* Name — Mockup: 24px, serif italic, weight 500 */}
          <div
            className="font-heading italic leading-[1.2]"
            style={{ fontSize: '24px', fontWeight: 500, color: 'var(--text-h)' }}
          >
            {displayName}
          </div>

          {/* Handle — Mockup: 12px, Josefin Sans, weight 400 */}
          {user.username && (
            <div
              className="font-label"
              style={{ fontSize: '12px', fontWeight: 400, letterSpacing: '1px', color: 'var(--text-sec)', marginTop: '2px' }}
            >
              @{user.username}
            </div>
          )}

          {/* Level — Mockup: 10px, weight 500, uppercase */}
          <div
            className="font-label"
            style={{
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              color: 'var(--text-sec)',
              marginTop: '6px',
            }}
          >
            {vipName} · Level {user.soul_level}
          </div>

          {/* Bio — Mockup: 14px, weight 500, line-height 1.6, line-clamp-2 */}
          {user.bio && (
            <div
              className="line-clamp-2"
              style={{
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: 1.6,
                color: 'var(--text-body)',
                marginTop: '14px',
                maxHeight: '3.2em',
                overflow: 'hidden',
              }}
            >
              {user.bio}
            </div>
          )}

          {/* Meta — Mockup: 12px, weight 500, gap 14px */}
          <div
            className="flex items-center justify-center"
            style={{ gap: '14px', marginTop: '12px', fontSize: '12px', fontWeight: 500, color: 'var(--text-sec)' }}
          >
            {user.location && (
              <span className="flex items-center gap-1">
                <Icon name="map-pin" size={12} />
                {user.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Icon name="users" size={12} />
              {user.connections_count} Kontakte
            </span>
          </div>

          {/* Mutual Connections — Mockup: border-top, 12px, avatar circles */}
          <div
            className="flex items-center justify-center"
            style={{
              gap: '6px',
              marginTop: '16px',
              paddingTop: '14px',
              borderTop: '1px solid var(--divider-l)',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--text-sec)',
            }}
          >
            <div className="flex" style={{ marginRight: '2px' }}>
              {['LW', 'JR'].map((init, i) => (
                <div
                  key={init}
                  className="flex items-center justify-center font-label"
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'var(--glass)',
                    border: '2px solid var(--bg-elevated)',
                    fontSize: '8px',
                    color: 'var(--text-sec)',
                    marginLeft: i > 0 ? '-6px' : 0,
                  }}
                >
                  {init}
                </div>
              ))}
            </div>
            2 gemeinsame Kontakte
          </div>

          {/* Actions — Mockup: flex, gap 10px, margin-top 18px */}
          <div className="flex" style={{ gap: '10px', marginTop: '18px' }}>
            {/* Primary: Vernetzen */}
            {userId && connectionStatus === 'none' && (
              <button
                onClick={onConnect}
                disabled={connecting}
                className="vcard-btn-primary flex-1 font-label cursor-pointer"
                style={{
                  padding: '10px 0',
                  borderRadius: '14px',
                  fontSize: '10px',
                  fontWeight: 500,
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                  background: 'var(--gold)',
                  color: 'var(--text-on-gold)',
                  border: 'none',
                  boxShadow: '0 4px 16px var(--gold-glow)',
                  opacity: connecting ? 0.6 : 1,
                }}
              >
                {connecting ? '...' : 'Vernetzen'}
              </button>
            )}
            {connectionStatus === 'connected' && (
              <span
                className="flex-1 font-label flex items-center justify-center"
                style={{
                  padding: '10px 0',
                  borderRadius: '14px',
                  fontSize: '10px',
                  fontWeight: 500,
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                  background: 'var(--success-bg)',
                  color: 'var(--success)',
                  border: '1px solid var(--success-border)',
                }}
              >
                Verbunden
              </span>
            )}
            {connectionStatus === 'pending_outgoing' && (
              <span
                className="flex-1 font-label flex items-center justify-center"
                style={{
                  padding: '10px 0',
                  borderRadius: '14px',
                  fontSize: '10px',
                  fontWeight: 500,
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                  background: 'var(--glass)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--divider-l)',
                }}
              >
                Angefragt
              </span>
            )}

            {/* Secondary: Profil ansehen — Mockup: glass bg, border */}
            {user.username && (
              <Link
                href={`/u/${user.username}`}
                className="flex-1 font-label flex items-center justify-center"
                style={{
                  padding: '10px 0',
                  borderRadius: '14px',
                  fontSize: '10px',
                  fontWeight: 500,
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                  background: 'var(--glass)',
                  color: 'var(--text-body)',
                  border: '1px solid var(--divider-l)',
                  textDecoration: 'none',
                }}
              >
                Profil ansehen
              </Link>
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
  onShare,
  onBookmark,
  joining,
  bookmarking,
  onClose,
  overlayRef,
}: EventOverlayProps & { overlayRef: React.RefObject<HTMLDivElement | null> }) {
  const isCreator = userId === event.creator_id;
  const isFull = event.max_participants != null && event.participants_count >= event.max_participants;
  const creatorName = event.creator?.display_name ?? event.creator?.username ?? 'Anonym';
  const creatorInitial = creatorName.slice(0, 1).toUpperCase();
  const heroUrl = getEventCover(event.cover_url, event.id);

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,.35)' }}
    >
      <div
        ref={overlayRef}
        className="mx-4 rounded-2xl overflow-hidden max-w-[400px] w-full animate-slide-up"
        style={{
          background: 'var(--bg-solid)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
        }}
      >
        {/* Hero-Bild */}
        <div className="relative overflow-hidden" style={{ height: '160px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroUrl} alt="" className="w-full h-full object-cover block" />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,.65) 0%, rgba(0,0,0,.15) 40%, transparent 70%)',
            }}
          />

          {/* Schliessen */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer z-10"
            style={{
              background: 'rgba(0,0,0,.35)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,.2)',
            }}
          >
            <Icon name="x" size={14} />
          </button>

          {/* Kategorie Badge */}
          <div className="absolute top-3 left-3.5">
            <span
              className="text-[0.5rem] tracking-[0.12em] uppercase font-label px-2.5 py-1 rounded-[10px]"
              style={{
                background: event.category === 'course'
                  ? 'rgba(120,160,140,.85)'
                  : 'rgba(200,169,110,.85)',
                color: '#fff',
              }}
            >
              {event.category === 'course' ? 'Kurs' : 'Event'}
            </span>
          </div>

          {/* Titel auf Hero */}
          <div className="absolute bottom-3 left-3.5 right-3.5">
            <h3
              className="line-clamp-2"
              style={{
                fontSize: '16px',
                fontStyle: 'italic',
                color: '#fff',
                lineHeight: '1.35',
                textShadow: '0 1px 8px rgba(0,0,0,.3)',
              }}
            >
              {event.title}
            </h3>
          </div>
        </div>

        <div className="p-5">
          {/* Datum + Uhrzeit */}
          <div className="flex items-center gap-2 text-sm font-body mb-2" style={{ color: 'var(--text-sec)' }}>
            <span className="flex items-center gap-1"><Icon name="calendar" size={14} /> {formatDate(event.starts_at)} · {formatTime(event.starts_at)}</span>
            {event.ends_at && <span>– {formatTime(event.ends_at)}</span>}
          </div>

          {/* Ort */}
          <p className="text-sm font-body mb-3" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1"><Icon name="map-pin" size={14} /> {event.location_name}</span>
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
                border: `1px solid ${event.creator?.is_first_light ? 'var(--gold-border)' : 'var(--gold-border-s)'}`,
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

          {/* Action Bar (Join + Share + Bookmark) */}
          <div
            className="flex items-center gap-2"
            style={{ paddingTop: '12px', borderTop: '1px solid var(--divider-l)' }}
          >
            {/* Teilnehmen / Verlassen */}
            {userId && !isCreator ? (
              event.has_joined ? (
                <button
                  onClick={() => onLeave?.(event.id)}
                  disabled={joining}
                  className="flex-1 py-2.5 rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer transition-colors"
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
                  className="flex-1 py-2.5 rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase transition-all duration-200 flex items-center justify-center gap-1.5"
                  style={{
                    background: isFull || joining
                      ? 'var(--gold-bg)'
                      : 'var(--gold)',
                    color: isFull || joining ? 'var(--text-muted)' : 'var(--text-on-gold)',
                    cursor: isFull || joining ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Icon name="calendar-plus" size={14} />
                  {isFull ? 'Voll' : joining ? '...' : 'Teilnehmen'}
                </button>
              )
            ) : (
              <div className="flex-1" />
            )}

            {/* Share Button (Kreis) */}
            {onShare && (
              <button
                onClick={() => { onShare(event); onClose(); }}
                className="flex items-center justify-center rounded-full cursor-pointer transition-all duration-200"
                style={{
                  width: '38px',
                  height: '38px',
                  background: 'var(--glass-strong, var(--glass))',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-muted)',
                  flexShrink: 0,
                }}
              >
                <Icon name="share" size={16} />
              </button>
            )}

            {/* Bookmark Button (Kreis) – invertiert wenn aktiv */}
            <button
              onClick={() => onBookmark?.(event.id)}
              disabled={bookmarking}
              className="flex items-center justify-center rounded-full cursor-pointer transition-all duration-300"
              style={{
                width: '38px',
                height: '38px',
                background: event.is_bookmarked
                  ? 'var(--gold)'
                  : 'var(--glass-strong, var(--glass))',
                border: `1px solid ${event.is_bookmarked ? 'var(--gold)' : 'var(--glass-border)'}`,
                color: event.is_bookmarked ? 'var(--text-on-gold)' : 'var(--text-muted)',
                boxShadow: event.is_bookmarked ? '0 0 12px rgba(200,169,110,0.35)' : 'none',
                flexShrink: 0,
              }}
            >
              <Icon name={event.is_bookmarked ? 'bookmark-filled' : 'bookmark'} size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
