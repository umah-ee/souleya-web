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
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      backgroundColor: 'rgba(200,169,110,0.15)',
      border: `1px solid ${author.is_origin_soul ? 'rgba(200,169,110,0.5)' : 'rgba(200,169,110,0.2)'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-cormorant)', fontSize: '1.1rem',
      color: '#C8A96E', flexShrink: 0,
    }}>
      {author.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={author.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
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
      // revert on error
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
    <article style={{
      backgroundColor: '#2C2A35',
      border: '1px solid rgba(200,169,110,0.1)',
      borderRadius: 16,
      padding: '1.25rem',
      marginBottom: '1rem',
    }}>
      {/* Author Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <AuthorAvatar author={pulse.author} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontFamily: 'var(--font-body)', fontWeight: 500,
              fontSize: '0.875rem', color: '#F0EDE8',
            }}>
              {pulse.author.display_name ?? pulse.author.username ?? 'Anonym'}
            </span>
            {pulse.author.is_origin_soul && (
              <span style={{
                fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                color: '#A8894E', fontFamily: 'var(--font-label)',
                border: '1px solid rgba(168,137,78,0.3)',
                borderRadius: 99, padding: '1px 6px',
              }}>Origin Soul</span>
            )}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#5A5450', fontFamily: 'var(--font-label)' }}>
            {timeAgo(pulse.created_at)}
          </span>
        </div>
        {isOwner && (
          <button onClick={handleDelete} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#5A5450', fontSize: '1rem', padding: 4,
          }} title="Loeschen">×</button>
        )}
      </div>

      {/* Content */}
      <p style={{
        color: '#c8c0b8', lineHeight: 1.8, fontSize: '0.95rem',
        fontFamily: 'var(--font-body)', fontWeight: 300,
        whiteSpace: 'pre-wrap', marginBottom: 12,
      }}>
        {pulse.content}
      </p>

      {/* Image */}
      {pulse.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={pulse.image_url} alt="" style={{
          width: '100%', borderRadius: 8, marginBottom: 12,
          maxHeight: 400, objectFit: 'cover',
        }} />
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 16, paddingTop: 8, borderTop: '1px solid rgba(200,169,110,0.06)' }}>
        <button
          onClick={handleLike}
          disabled={!currentUserId}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: currentUserId ? 'pointer' : 'default',
            color: liked ? '#C8A96E' : '#5A5450',
            fontFamily: 'var(--font-label)', fontSize: '0.7rem',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '4px 0', transition: 'color 0.2s',
          }}
        >
          <span style={{ fontSize: '1rem' }}>{liked ? '♥' : '♡'}</span>
          {likesCount > 0 && <span>{likesCount}</span>}
          <span>Like</span>
        </button>

        <span style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: '#5A5450', fontFamily: 'var(--font-label)',
          fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          <span style={{ fontSize: '1rem' }}>○</span>
          {pulse.comments_count > 0 && <span>{pulse.comments_count}</span>}
          <span>Kommentare</span>
        </span>
      </div>
    </article>
  );
}
