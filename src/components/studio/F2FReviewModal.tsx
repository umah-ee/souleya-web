'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { completeF2FBooking } from '@/lib/studio';

interface Props {
  bookingId: string;
  mentorName: string;
  duration: number; // Sekunden
  onClose: () => void;
  onSubmitted: () => void;
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function F2FReviewModal({ bookingId, mentorName, duration, onClose, onSubmitted }: Props) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await completeF2FBooking(bookingId, rating || undefined, comment || undefined);
      onSubmitted();
    } catch {
      // Trotzdem schliessen
      onClose();
    }
    setSaving(false);
  };

  const displayRating = hoverRating || rating;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        className="rounded-[8px] p-6 w-full max-w-sm"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--gold-border-s)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-5">
          <Icon name="heart" size={32} style={{ color: 'var(--gold)', margin: '0 auto 8px' }} />
          <h3 style={{ fontSize: 18, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 400, color: 'var(--text-h)', marginBottom: 4 }}>
            Wie war deine Session?
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {formatDuration(duration)} Min mit {mentorName}
          </p>
        </div>

        {/* Sterne */}
        <div className="flex justify-center gap-2 mb-5">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="border-none cursor-pointer p-0 transition-transform duration-150"
              style={{ background: 'none', transform: displayRating >= star ? 'scale(1.15)' : 'scale(1)' }}
            >
              <Icon
                name={displayRating >= star ? 'star-filled' : 'star'}
                size={32}
                style={{ color: displayRating >= star ? 'var(--gold)' : 'var(--text-muted)' }}
              />
            </button>
          ))}
        </div>

        {/* Kommentar */}
        <textarea
          placeholder="Moechtest du etwas dazu sagen? (optional)"
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          className="w-full p-3 text-sm outline-none resize-none font-body"
          style={{
            background: 'var(--glass)',
            border: '1px solid var(--gold-border-s)',
            borderRadius: 8,
            color: 'var(--text-h)',
            marginBottom: 16,
          }}
        />

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 border-none cursor-pointer"
            style={{
              padding: '10px 0', borderRadius: 9999, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase',
              background: rating > 0 ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))' : 'var(--glass)',
              color: rating > 0 ? 'var(--text-on-gold)' : 'var(--text-muted)',
            }}
          >
            {saving ? 'Wird gespeichert …' : rating > 0 ? 'Bewertung abgeben' : 'Ohne Bewertung schliessen'}
          </button>
          <button
            onClick={onClose}
            className="border-none cursor-pointer px-4"
            style={{ background: 'none', color: 'var(--text-muted)', fontSize: 11 }}
          >
            Spaeter
          </button>
        </div>
      </div>
    </div>
  );
}
