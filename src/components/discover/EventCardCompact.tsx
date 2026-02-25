'use client';

import type { SoEvent } from '@/types/events';
import { Icon } from '@/components/ui/Icon';

interface Props {
  event: SoEvent;
  onJoin?: (id: string) => void;
  onLeave?: (id: string) => void;
  onShare?: (event: SoEvent) => void;
  joining?: boolean;
  userId?: string | null;
}

function formatDay(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE', { day: 'numeric' });
}

function formatMonth(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE', { month: 'short' }).toUpperCase();
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export default function EventCardCompact({ event, onJoin, onLeave, onShare, joining, userId }: Props) {
  const isCreator = userId === event.creator_id;
  const isFull = event.max_participants != null && event.participants_count >= event.max_participants;
  const creatorName = event.creator?.display_name ?? event.creator?.username ?? 'Anonym';
  const creatorInitial = creatorName.slice(0, 1).toUpperCase();

  return (
    <div
      className="glass-card rounded-[18px] overflow-hidden transition-transform duration-200 hover:-translate-y-[3px]"
      style={{ cursor: 'pointer' }}
    >
      {/* Hero-Bild */}
      <div
        className="relative h-[140px] overflow-hidden"
        style={{
          background: event.cover_url
            ? undefined
            : 'linear-gradient(135deg, var(--gold-deep), var(--gold), var(--gold-deep))',
        }}
      >
        {event.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.cover_url}
            alt=""
            className="w-full h-full object-cover"
          />
        )}

        {/* Gradient-Overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,.65) 0%, transparent 60%)' }}
        />

        {/* Datum-Chip oben links */}
        <div
          className="absolute top-2.5 left-2.5 w-10 h-10 rounded-lg flex flex-col items-center justify-center"
          style={{
            background: 'rgba(255,255,255,.18)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,.25)',
          }}
        >
          <span className="text-white font-heading text-base leading-none">{formatDay(event.starts_at)}</span>
          <span className="text-white/80 font-label text-[0.45rem] tracking-[0.12em] uppercase">{formatMonth(event.starts_at)}</span>
        </div>

        {/* Kategorie-Badge oben rechts */}
        <div className="absolute top-2.5 right-2.5">
          <span
            className="text-[0.5rem] tracking-[0.12em] uppercase font-label px-2 py-0.5 rounded-full"
            style={event.category === 'course' ? {
              color: '#fff',
              background: 'rgba(155,114,207,.7)',
              border: '1px solid rgba(155,114,207,.5)',
            } : {
              color: '#fff',
              background: 'rgba(200,169,110,.6)',
              border: '1px solid rgba(200,169,110,.4)',
            }}
          >
            {event.category === 'course' ? 'Kurs' : 'Meetup'}
          </span>
        </div>

        {/* Titel + Zeit unten im Hero */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5">
          <h3
            className="font-heading text-sm leading-tight text-white mb-1 line-clamp-2"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,.4)', fontStyle: 'italic' }}
          >
            {event.title}
          </h3>
          <div className="flex items-center gap-1">
            <span className="text-white/70"><Icon name="clock" size={10} /></span>
            <span className="text-white/80 text-[0.6rem] font-body">
              {formatTime(event.starts_at)}
              {event.ends_at && ` – ${formatTime(event.ends_at)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        {/* Creator */}
        <div className="flex items-center gap-1.5 mb-2">
          <div
            className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-heading overflow-hidden"
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
          <span className="text-[0.65rem] font-body truncate" style={{ color: 'var(--text-muted)' }}>{creatorName}</span>
        </div>

        {/* Ort */}
        <div className="flex items-center gap-1 mb-2">
          <span style={{ color: 'var(--text-muted)' }}><Icon name="map-pin" size={10} /></span>
          <span className="text-[0.6rem] font-body truncate" style={{ color: 'var(--text-sec)' }}>{event.location_name}</span>
        </div>

        {/* Teilnehmer + Actions */}
        <div className="flex items-center justify-between">
          <span className="text-[0.6rem] font-body" style={{ color: 'var(--text-muted)' }}>
            {event.participants_count}{event.max_participants ? `/${event.max_participants}` : ''} Teilnehmer
          </span>

          <div className="flex items-center gap-1.5">
            {/* Share */}
            {onShare && (
              <button
                onClick={(e) => { e.stopPropagation(); onShare(event); }}
                className="w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                style={{ border: '1px solid var(--divider)', color: 'var(--text-muted)' }}
              >
                <Icon name="share" size={11} />
              </button>
            )}

            {/* Join/Leave */}
            {userId && !isCreator && (
              <>
                {event.has_joined ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); onLeave?.(event.id); }}
                    disabled={joining}
                    className="px-2.5 py-1 rounded-full font-label text-[0.5rem] tracking-[0.08em] uppercase cursor-pointer transition-colors"
                    style={{
                      border: '1px solid var(--divider)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {joining ? '...' : 'Verlassen'}
                  </button>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); onJoin?.(event.id); }}
                    disabled={joining || isFull}
                    className="px-2.5 py-1 rounded-full font-label text-[0.5rem] tracking-[0.08em] uppercase transition-all duration-200"
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
