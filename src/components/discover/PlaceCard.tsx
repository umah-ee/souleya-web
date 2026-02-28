'use client';

import type { Place } from '@/types/places';
import { Icon } from '@/components/ui/Icon';

// ── Star SVGs (inline, Tabler-konform) ───────────────────
function StarFilled({ size = 14 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="var(--gold)"
      stroke="var(--gold)"
    >
      <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
    </svg>
  );
}

function StarEmpty({ size = 14 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      stroke="var(--text-muted)"
    >
      <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
    </svg>
  );
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-[1px]">
      {[1, 2, 3, 4, 5].map((i) =>
        i <= full ? <StarFilled key={i} size={size} /> : <StarEmpty key={i} size={size} />,
      )}
    </span>
  );
}

// ── Props ────────────────────────────────────────────────
interface Props {
  place: Place;
  userId: string | null;
  onSave: (placeId: string) => void;
  onUnsave: (placeId: string) => void;
  saving?: boolean;
  onClick: (place: Place) => void;
}

export default function PlaceCard({ place, userId, onSave, onUnsave, saving, onClick }: Props) {
  const visibleTags = place.tags.slice(0, 3);
  const extraCount = place.tags.length - 3;

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId || saving) return;
    if (place.is_saved) {
      onUnsave(place.id);
    } else {
      onSave(place.id);
    }
  };

  return (
    <div
      className="glass-card rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-[3px]"
      onClick={() => onClick(place)}
    >
      {/* ── Cover Image ──────────────────────── */}
      {place.cover_url && (
        <div className="relative overflow-hidden" style={{ height: '160px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={place.cover_url}
            alt=""
            className="w-full h-full object-cover block"
          />
          {/* Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,.55) 0%, rgba(0,0,0,.1) 40%, transparent 70%)',
            }}
          />
        </div>
      )}

      {/* ── Body ─────────────────────────────── */}
      <div className="p-4">
        {/* Name + Save Row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3
            className="text-[15px] font-heading italic leading-snug line-clamp-2"
            style={{ color: 'var(--text-h)' }}
          >
            {place.name}
          </h3>

          {/* Save / Bookmark Button */}
          {userId && (
            <button
              onClick={handleSaveClick}
              disabled={saving}
              className="flex-shrink-0 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300"
              style={{
                width: '34px',
                height: '34px',
                background: place.is_saved
                  ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))'
                  : 'var(--glass-strong, var(--glass))',
                border: `1px solid ${place.is_saved ? 'var(--gold)' : 'var(--glass-border)'}`,
                color: place.is_saved ? 'var(--text-on-gold)' : 'var(--text-muted)',
                boxShadow: place.is_saved ? '0 0 12px rgba(200,169,110,0.35)' : 'none',
              }}
            >
              <Icon name={place.is_saved ? 'bookmark-filled' : 'bookmark'} size={15} />
            </button>
          )}
        </div>

        {/* Tags */}
        {place.tags.length > 0 && (
          <div className="flex flex-wrap gap-[5px] mb-2.5">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="text-[8px] tracking-[1.5px] uppercase px-[9px] py-[3px] rounded-[12px] inline-block"
                style={{
                  color: 'var(--gold-text)',
                  border: '1px solid var(--gold-border)',
                  background: 'var(--gold-bg)',
                }}
              >
                {tag}
              </span>
            ))}
            {extraCount > 0 && (
              <span
                className="text-[8px] tracking-[1px] px-[8px] py-[3px] rounded-[12px] inline-block"
                style={{
                  color: 'var(--text-muted)',
                  border: '1px solid var(--divider)',
                }}
              >
                +{extraCount}
              </span>
            )}
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <StarRating rating={place.avg_rating} size={13} />
          <span className="text-[12px]" style={{ color: 'var(--text-h)' }}>
            {place.avg_rating.toFixed(1)}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            ({place.reviews_count})
          </span>
        </div>

        {/* Address */}
        {(place.address || place.city) && (
          <div
            className="flex items-center gap-1.5 text-[10px]"
            style={{ color: 'var(--text-sec)' }}
          >
            <Icon name="map-pin" size={13} style={{ flexShrink: 0 }} />
            <span className="truncate">
              {[place.address, place.city].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
