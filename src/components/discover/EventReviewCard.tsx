'use client';

import type { EventReview } from '@/lib/progression';
import EnsoRing from '@/components/ui/EnsoRing';
import { Icon } from '@/components/ui/Icon';

interface EventReviewCardProps {
  review: EventReview;
  currentUserId?: string;
  onDelete?: (reviewId: string) => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          name={star <= rating ? 'star-filled' : 'star'}
          size={14}
          style={{ color: star <= rating ? 'var(--gold)' : 'var(--text-muted)' }}
        />
      ))}
    </div>
  );
}

export default function EventReviewCard({ review, currentUserId, onDelete }: EventReviewCardProps) {
  const isOwn = currentUserId === review.user_id;
  const date = new Date(review.created_at);

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'var(--glass)',
        border: '1px solid var(--glass-border)',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <EnsoRing
            soulLevel={review.profile?.soul_level ?? 1}
            isFirstLight={review.profile?.is_first_light ?? false}
            size="feed"
          >
            <div
              className="w-full h-full rounded-full flex items-center justify-center font-heading text-[0.6rem] overflow-hidden"
              style={{ background: 'var(--avatar-bg)', color: 'var(--gold-text)' }}
            >
              {review.profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={review.profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                (review.profile?.display_name ?? '?')[0].toUpperCase()
              )}
            </div>
          </EnsoRing>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-body font-medium" style={{ color: 'var(--text-h)' }}>
              {review.profile?.display_name ?? 'Anonym'}
            </span>
            <span className="text-[0.55rem] font-label" style={{ color: 'var(--text-muted)' }}>
              {date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            {isOwn && onDelete && (
              <button
                onClick={() => onDelete(review.id)}
                className="ml-auto p-1 bg-transparent border-none cursor-pointer rounded"
                style={{ color: 'var(--text-muted)' }}
              >
                <Icon name="trash" size={14} />
              </button>
            )}
          </div>

          <StarRating rating={review.rating} />

          {review.comment && (
            <p className="text-sm font-body mt-2" style={{ color: 'var(--text-sec)', lineHeight: 1.6 }}>
              {review.comment}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
