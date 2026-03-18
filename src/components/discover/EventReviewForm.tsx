'use client';

import { useState } from 'react';
import { createEventReview } from '@/lib/progression';
import { Icon } from '@/components/ui/Icon';

interface EventReviewFormProps {
  eventId: string;
  onReviewCreated?: () => void;
  onClose?: () => void;
}

export default function EventReviewForm({ eventId, onReviewCreated, onClose }: EventReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Bitte vergib mindestens einen Stern.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await createEventReview(eventId, rating, comment.trim() || undefined);
      onReviewCreated?.();
      onClose?.();
    } catch (err) {
      console.error('Review erstellen fehlgeschlagen:', err);
      setError('Das hat leider nicht geklappt. Versuch es gerne nochmal.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div
      className="rounded-2xl p-5 md:p-6"
      style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
      }}
    >
      <h3
        className="font-heading text-base mb-4"
        style={{ color: 'var(--text-h)' }}
      >
        Wie war das Event?
      </h3>

      {/* Star Rating */}
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-0.5 bg-transparent border-none cursor-pointer transition-transform duration-150"
            style={{ transform: displayRating >= star ? 'scale(1.1)' : 'scale(1)' }}
          >
            <Icon
              name={displayRating >= star ? 'star-filled' : 'star'}
              size={28}
              style={{
                color: displayRating >= star ? 'var(--gold)' : 'var(--text-muted)',
                transition: 'color 0.15s',
              }}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 self-center text-sm font-body" style={{ color: 'var(--gold-text)' }}>
            {rating}/5
          </span>
        )}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Erzaehl anderen von deiner Erfahrung … (optional)"
        maxLength={2000}
        rows={3}
        className="w-full resize-none rounded-lg px-3 py-2.5 text-sm font-body"
        style={{
          background: 'var(--input-bg)',
          border: '1px solid var(--glass-border)',
          color: 'var(--text-body)',
          borderRadius: '8px',
          outline: 'none',
        }}
      />

      {error && (
        <p className="text-xs mt-2" style={{ color: 'var(--error)' }}>
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
          className="flex-1 py-2 border-none rounded-full font-label text-[0.6rem] tracking-[0.1em] uppercase cursor-pointer"
          style={{
            background: rating > 0
              ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))'
              : 'var(--divider)',
            color: rating > 0 ? 'var(--text-on-gold)' : 'var(--text-muted)',
            opacity: submitting ? 0.5 : 1,
          }}
        >
          {submitting ? 'Wird gespeichert …' : 'Bewertung abgeben'}
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-transparent rounded-full font-label text-[0.6rem] tracking-[0.1em] uppercase cursor-pointer"
            style={{
              border: '1px solid var(--divider)',
              color: 'var(--text-muted)',
            }}
          >
            Abbrechen
          </button>
        )}
      </div>
    </div>
  );
}
