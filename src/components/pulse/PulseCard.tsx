'use client';

import { useState } from 'react';
import type { Pulse } from '@/types/pulse';
import { toggleLike, deletePulse } from '@/lib/pulse';
import CommentsSection from './CommentsSection';

interface Props {
  pulse: Pulse;
  currentUserId?: string;
  onDelete?: (id: string) => void;
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'gerade eben';
  if (seconds < 3600) return `vor ${Math.floor(seconds / 60)} Min.`;
  if (seconds < 86400) return `vor ${Math.floor(seconds / 3600)} Std.`;
  return `vor ${Math.floor(seconds / 86400)} Tagen`;
}

function AuthorAvatar({ author }: { author: Pulse['author'] }) {
  const initials = (author.display_name ?? author.username ?? '?').slice(0, 1).toUpperCase();
  return (
    <div
      className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-heading text-[1.1rem]"
      style={{
        background: 'var(--avatar-bg)',
        color: 'var(--gold-text)',
        border: `1px solid ${author.is_origin_soul ? 'var(--gold-border)' : 'var(--gold-border-s)'}`,
      }}
    >
      {author.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={author.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
      ) : initials}
    </div>
  );
}

export default function PulseCard({ pulse, currentUserId, onDelete }: Props) {
  const [liked, setLiked] = useState(pulse.has_liked ?? false);
  const [likesCount, setLikesCount] = useState(pulse.likes_count);
  const [liking, setLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(pulse.comments_count);

  const handleLike = async () => {
    if (!currentUserId || liking) return;
    setLiking(true);
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((c) => c + (newLiked ? 1 : -1));
    try {
      await toggleLike(pulse.id, liked);
    } catch {
      setLiked(liked);
      setLikesCount((c) => c + (newLiked ? -1 : 1));
    }
    setLiking(false);
  };

  const handleDelete = async () => {
    if (!confirm('Pulse wirklich loeschen?')) return;
    await deletePulse(pulse.id);
    onDelete?.(pulse.id);
  };

  const isOwner = currentUserId === pulse.author.id;

  return (
    <article className="glass-card rounded-2xl p-5 mb-4">
      {/* Author Header */}
      <div className="flex items-center gap-3 mb-3">
        <AuthorAvatar author={pulse.author} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-body font-medium text-sm" style={{ color: 'var(--text-h)' }}>
              {pulse.author.display_name ?? pulse.author.username ?? 'Anonym'}
            </span>
            {pulse.author.is_origin_soul && (
              <span
                className="text-[0.6rem] tracking-[0.15em] uppercase font-label rounded-full px-1.5 py-px"
                style={{
                  color: 'var(--gold)',
                  border: '1px solid var(--gold-border-s)',
                }}
              >
                Origin Soul
              </span>
            )}
          </div>
          <span className="text-xs font-label" style={{ color: 'var(--text-muted)' }}>
            {timeAgo(pulse.created_at)}
          </span>
        </div>
        {isOwner && (
          <button
            onClick={handleDelete}
            className="bg-transparent border-none cursor-pointer text-base p-1 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title="Loeschen"
          >
            ×
          </button>
        )}
      </div>

      {/* Content */}
      <p className="leading-[1.8] text-[0.95rem] font-body whitespace-pre-wrap mb-3" style={{ color: 'var(--text-body)' }}>
        {pulse.content}
      </p>

      {/* Image */}
      {pulse.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={pulse.image_url}
          alt=""
          className="w-full rounded-lg mb-3 max-h-[400px] object-cover"
        />
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-2" style={{ borderTop: '1px solid var(--divider-l)' }}>
        <button
          onClick={handleLike}
          disabled={!currentUserId}
          className={`
            flex items-center gap-1.5 bg-transparent border-none py-1
            font-label text-[0.7rem] tracking-[0.1em] uppercase transition-colors duration-200
            ${currentUserId ? 'cursor-pointer' : 'cursor-default'}
          `}
          style={{ color: liked ? 'var(--gold-text)' : 'var(--text-muted)' }}
        >
          <span className="text-base">{liked ? '♥' : '♡'}</span>
          {likesCount > 0 && <span>{likesCount}</span>}
          <span>Like</span>
        </button>

        <button
          onClick={() => setShowComments((s) => !s)}
          className="flex items-center gap-1.5 bg-transparent border-none py-1 cursor-pointer font-label text-[0.7rem] tracking-[0.1em] uppercase transition-colors duration-200"
          style={{ color: 'var(--text-muted)' }}
        >
          <span className="text-base">○</span>
          {commentsCount > 0 && <span>{commentsCount}</span>}
          <span>Kommentare</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <CommentsSection
          pulseId={pulse.id}
          currentUserId={currentUserId}
          onCountChange={(delta) => setCommentsCount((c) => c + delta)}
        />
      )}
    </article>
  );
}
