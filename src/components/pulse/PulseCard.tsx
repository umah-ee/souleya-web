'use client';

import { useState } from 'react';
import type { Pulse } from '@/types/pulse';
import { toggleLike, deletePulse } from '@/lib/pulse';

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
    <div className={`
      w-10 h-10 rounded-full bg-gold-1/15 flex-shrink-0
      flex items-center justify-center font-heading text-[1.1rem] text-gold-1
      border ${author.is_origin_soul ? 'border-gold-1/50' : 'border-gold-1/20'}
    `}>
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
    <article className="bg-dark rounded-2xl border border-gold-1/10 p-5 mb-4">
      {/* Author Header */}
      <div className="flex items-center gap-3 mb-3">
        <AuthorAvatar author={pulse.author} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-body font-medium text-sm text-[#F0EDE8]">
              {pulse.author.display_name ?? pulse.author.username ?? 'Anonym'}
            </span>
            {pulse.author.is_origin_soul && (
              <span className="text-[0.6rem] tracking-[0.15em] uppercase text-gold-3 font-label border border-gold-3/30 rounded-full px-1.5 py-px">
                Origin Soul
              </span>
            )}
          </div>
          <span className="text-xs text-[#5A5450] font-label">
            {timeAgo(pulse.created_at)}
          </span>
        </div>
        {isOwner && (
          <button
            onClick={handleDelete}
            className="bg-transparent border-none cursor-pointer text-[#5A5450] text-base p-1 hover:text-gold-1/60 transition-colors"
            title="Loeschen"
          >
            ×
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-[#c8c0b8] leading-[1.8] text-[0.95rem] font-body font-light whitespace-pre-wrap mb-3">
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
      <div className="flex gap-4 pt-2 border-t border-gold-1/[0.06]">
        <button
          onClick={handleLike}
          disabled={!currentUserId}
          className={`
            flex items-center gap-1.5 bg-transparent border-none py-1
            font-label text-[0.7rem] tracking-[0.1em] uppercase transition-colors duration-200
            ${currentUserId ? 'cursor-pointer' : 'cursor-default'}
            ${liked ? 'text-gold-1' : 'text-[#5A5450]'}
          `}
        >
          <span className="text-base">{liked ? '♥' : '♡'}</span>
          {likesCount > 0 && <span>{likesCount}</span>}
          <span>Like</span>
        </button>

        <span className="flex items-center gap-1.5 text-[#5A5450] font-label text-[0.7rem] tracking-[0.1em] uppercase">
          <span className="text-base">○</span>
          {pulse.comments_count > 0 && <span>{pulse.comments_count}</span>}
          <span>Kommentare</span>
        </span>
      </div>
    </article>
  );
}
