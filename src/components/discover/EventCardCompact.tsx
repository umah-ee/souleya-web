'use client';

import type { SoEvent } from '@/types/events';
import { Icon } from '@/components/ui/Icon';
import { getEventCover } from '@/lib/demo-covers';

interface Props {
  event: SoEvent;
  onJoin?: (id: string) => void;
  onLeave?: (id: string) => void;
  onShare?: (event: SoEvent) => void;
  onBookmark?: (id: string) => void;
  joining?: boolean;
  bookmarking?: boolean;
  userId?: string | null;
}

function formatDay(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE', { day: 'numeric' });
}

function formatMonth(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE', { month: 'short' }).toUpperCase();
}

function formatDateShort(dateString: string): string {
  const d = new Date(dateString);
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export default function EventCardCompact({ event, onJoin, onLeave, onShare, onBookmark, joining, bookmarking, userId }: Props) {
  const isCreator = userId === event.creator_id;
  const isFull = event.max_participants != null && event.participants_count >= event.max_participants;
  const creatorName = event.creator?.display_name ?? event.creator?.username ?? 'Anonym';
  const creatorInitial = creatorName.slice(0, 1).toUpperCase();

  // Hero-Bild: cover_url oder Demo-Fallback
  const heroUrl = getEventCover(event.cover_url, event.id);

  // Statische Karten-URL (Mapbox Static Images API)
  const mapToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const staticMapUrl = mapToken
    ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${event.location_lng},${event.location_lat},12,0/400x300@2x?access_token=${mapToken}`
    : null;

  return (
    <div
      className="rounded-[18px] overflow-hidden transition-all duration-300 hover:-translate-y-[3px]"
      style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow), var(--glass-inset)',
      }}
    >
      {/* ── Hero Image (160px Compact) ────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ height: '160px' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroUrl} alt="" className="w-full h-full object-cover block" />

        {/* Gradient-Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,.65) 0%, rgba(0,0,0,.15) 40%, transparent 70%)',
          }}
        />

        {/* Top: Date Chip + Category Badge */}
        <div className="absolute top-3 left-3.5 right-3.5 flex justify-between items-start">
          {/* Frosted Date Chip */}
          <div
            className="text-center rounded-xl"
            style={{
              background: 'rgba(255,255,255,.18)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,.25)',
              padding: '6px 10px',
              minWidth: '48px',
            }}
          >
            <div className="text-white text-lg leading-none" style={{ fontWeight: 400 }}>
              {formatDay(event.starts_at)}
            </div>
            <div
              className="uppercase mt-0.5"
              style={{ fontSize: '8px', letterSpacing: '2px', color: 'rgba(255,255,255,.75)' }}
            >
              {formatMonth(event.starts_at)}
            </div>
          </div>

          {/* Category Badge */}
          <div
            className="uppercase"
            style={{
              fontSize: '8px',
              letterSpacing: '1.5px',
              padding: '5px 12px',
              borderRadius: '10px',
              background: event.category === 'course'
                ? 'rgba(120,160,140,.85)'
                : 'rgba(200,169,110,.85)',
              color: '#fff',
            }}
          >
            {event.category === 'course' ? 'Kurs' : 'Event'}
          </div>
        </div>

        {/* Bottom: Title + Subtitle */}
        <div className="absolute bottom-3 left-3.5 right-3.5">
          <div
            className="line-clamp-2 mb-1"
            style={{
              fontSize: '14px',
              fontStyle: 'italic',
              color: '#fff',
              lineHeight: '1.35',
              textShadow: '0 1px 8px rgba(0,0,0,.3)',
            }}
          >
            {event.title}
          </div>
          <div className="flex items-center gap-1.5" style={{ fontSize: '10px', color: 'rgba(255,255,255,.7)' }}>
            <Icon name="clock" size={12} />
            {formatDateShort(event.starts_at)} · {formatTime(event.starts_at)}
            {event.ends_at && ` – ${formatTime(event.ends_at)}`}
          </div>
        </div>
      </div>

      {/* ── Body mit Map-Hintergrund ─────────────── */}
      <div style={{ padding: '0 16px 16px' }}>
        {/* Content Area (Info links, Map rechts) */}
        <div className="relative overflow-hidden" style={{ padding: '16px 0 14px', minHeight: '100px' }}>

          {/* Statischer Map-Hintergrund (rechte Seite) */}
          {staticMapUrl && (
            <div
              className="absolute top-0 bottom-0"
              style={{ right: '-16px', width: '45%', zIndex: 0, overflow: 'hidden' }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${staticMapUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'saturate(.3) brightness(.9)',
                }}
              />
              {/* Fade-Overlay von links */}
              <div
                className="absolute inset-0 z-[1] pointer-events-none ev-map-fade"
              />
              {/* Gold Pin */}
              <div
                className="absolute z-[2] pointer-events-none"
                style={{ top: '38%', right: '22%' }}
              >
                <svg width="18" height="24" viewBox="0 0 28 36" fill="none">
                  <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="#C8A96E"/>
                  <circle cx="14" cy="13" r="5" fill="#fff" opacity=".9"/>
                  <circle cx="14" cy="13" r="2.5" fill="#C8A96E"/>
                </svg>
              </div>
            </div>
          )}

          {/* Info (links, ueber der Map) */}
          <div className="relative z-[2]" style={{ maxWidth: '62%' }}>
            {/* Creator */}
            <div className="flex items-center gap-2 mb-2.5">
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden"
                style={{
                  background: 'var(--avatar-bg)',
                  color: 'var(--gold-text)',
                  border: '1.5px solid var(--gold-border)',
                  fontSize: '11px',
                }}
              >
                {event.creator?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={event.creator.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : creatorInitial}
              </div>
              <div className="min-w-0">
                <div className="text-xs truncate" style={{ color: 'var(--text-h)' }}>{creatorName}</div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Organisator</div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5 mb-2.5" style={{ fontSize: '10px', color: 'var(--text-sec)' }}>
              <Icon name="map-pin" size={14} style={{ flexShrink: 0 }} />
              <span className="truncate">{event.location_name}</span>
            </div>

            {/* Teilnehmer */}
            <div className="flex items-center">
              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                {event.participants_count}{event.max_participants ? ` von ${event.max_participants}` : ''} Teilnehmer
              </span>
            </div>
          </div>
        </div>

        {/* ── Action Bar ────────────────────────── */}
        <div
          className="flex items-center gap-2"
          style={{ paddingTop: '12px', borderTop: '1px solid var(--divider-l)' }}
        >
          {/* Teilnehmen / Verlassen Button */}
          {userId && !isCreator ? (
            event.has_joined ? (
              <button
                onClick={(e) => { e.stopPropagation(); onLeave?.(event.id); }}
                disabled={joining}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[24px] uppercase cursor-pointer transition-all duration-200"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--divider)',
                  color: 'var(--text-muted)',
                  fontSize: '10px',
                  letterSpacing: '2px',
                }}
              >
                {joining ? '...' : 'Verlassen'}
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onJoin?.(event.id); }}
                disabled={joining || isFull}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[24px] uppercase transition-all duration-200"
                style={{
                  background: isFull || joining ? 'var(--gold-bg)' : 'var(--gold)',
                  color: isFull || joining ? 'var(--text-muted)' : 'var(--text-on-gold)',
                  cursor: isFull || joining ? 'not-allowed' : 'pointer',
                  border: 'none',
                  fontSize: '10px',
                  letterSpacing: '2px',
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
              onClick={(e) => { e.stopPropagation(); onShare(event); }}
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

          {/* Bookmark Button (Kreis) */}
          <button
            onClick={(e) => { e.stopPropagation(); onBookmark?.(event.id); }}
            disabled={bookmarking}
            className="flex items-center justify-center rounded-full cursor-pointer transition-all duration-200"
            style={{
              width: '38px',
              height: '38px',
              background: event.is_bookmarked ? 'var(--gold-bg)' : 'var(--glass-strong, var(--glass))',
              border: `1px solid ${event.is_bookmarked ? 'var(--gold-border)' : 'var(--glass-border)'}`,
              color: event.is_bookmarked ? 'var(--gold-text)' : 'var(--text-muted)',
              flexShrink: 0,
            }}
          >
            <Icon name="bookmark" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
