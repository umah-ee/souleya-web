'use client';

import { useState, useEffect } from 'react';
import type { PulseComment } from '@/types/pulse';
import { fetchComments, addComment } from '@/lib/pulse';

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'gerade eben';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} Min`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} Std`;
  return `${Math.floor(seconds / 86400)} Tg`;
}

interface Props {
  pulseId: string;
  currentUserId?: string;
  onCountChange?: (delta: number) => void;
}

export default function CommentsSection({ pulseId, currentUserId, onCountChange }: Props) {
  const [comments, setComments] = useState<PulseComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments(pulseId)
      .then(setComments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [pulseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting || !currentUserId) return;

    setSubmitting(true);
    try {
      const comment = await addComment(pulseId, newComment.trim());
      setComments((prev) => [...prev, comment]);
      setNewComment('');
      onCountChange?.(1);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--divider-l)' }}>
      {/* Kommentare */}
      {loading ? (
        <p className="font-label text-[0.65rem] tracking-[0.15em] py-2" style={{ color: 'var(--text-muted)' }}>
          Lade Kommentare …
        </p>
      ) : comments.length === 0 ? (
        <p className="font-body text-xs py-2" style={{ color: 'var(--text-muted)' }}>
          Noch keine Kommentare. Sei der Erste!
        </p>
      ) : (
        <div className="space-y-3 mb-3">
          {comments.map((comment) => {
            const initials = (comment.author.display_name ?? comment.author.username ?? '?').slice(0, 1).toUpperCase();
            return (
              <div key={comment.id} className="flex gap-2.5">
                {/* Mini Avatar */}
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center font-heading text-[0.7rem]"
                  style={{
                    background: 'var(--avatar-bg)',
                    border: '1px solid var(--gold-border-s)',
                    color: 'var(--gold-text)',
                  }}
                >
                  {comment.author.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={comment.author.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : initials}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-body font-medium text-xs" style={{ color: 'var(--text-h)' }}>
                      {comment.author.display_name ?? comment.author.username ?? 'Anonym'}
                    </span>
                    <span className="text-[10px] font-label" style={{ color: 'var(--text-muted)' }}>
                      {timeAgo(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-xs font-body leading-[1.7] mt-0.5" style={{ color: 'var(--text-body)' }}>
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Neuer Kommentar */}
      {currentUserId && (
        <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Kommentar schreiben …"
            maxLength={500}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-body outline-none transition-colors"
            style={{
              background: 'var(--glass)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-h)',
            }}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="px-3 py-2 rounded-xl font-label text-[0.6rem] tracking-[0.1em] uppercase transition-all duration-200"
            style={{
              background: !newComment.trim() || submitting ? 'var(--gold-bg)' : 'var(--gold-bg-hover)',
              color: !newComment.trim() || submitting ? 'var(--text-muted)' : 'var(--gold-text)',
              cursor: !newComment.trim() || submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? '…' : 'Senden'}
          </button>
        </form>
      )}
    </div>
  );
}
