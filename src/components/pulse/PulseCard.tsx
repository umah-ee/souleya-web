'use client';

import { useState, useEffect } from 'react';
import type { Pulse, PulsePoll } from '@/types/pulse';
import { toggleLike, deletePulse, votePoll } from '@/lib/pulse';
import { fetchChallenge, joinChallenge, checkinChallenge } from '@/lib/challenges';
import type { Challenge } from '@/types/challenges';
import ChallengeCard from '@/components/challenges/ChallengeCard';
import CommentsSection from './CommentsSection';
import EnsoRing from '@/components/ui/EnsoRing';
import { Icon } from '@/components/ui/Icon';
import EventShareCard from '@/components/shared/EventShareCard';
import ImageGrid from '@/components/shared/ImageGrid';

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
    <EnsoRing
      soulLevel={author.soul_level}
      isFirstLight={author.is_first_light}
      size="feed"
      className="flex-shrink-0"
    >
      <div
        className="w-full h-full rounded-full flex items-center justify-center font-heading text-[0.7rem] overflow-hidden"
        style={{
          background: 'var(--avatar-bg)',
          color: 'var(--gold-text)',
        }}
      >
        {author.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={author.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
        ) : initials}
      </div>
    </EnsoRing>
  );
}

// ── Poll-Anzeige ────────────────────────────────────────────
function PollDisplay({
  poll: initialPoll,
  pulseId,
  currentUserId,
}: {
  poll: PulsePoll;
  pulseId: string;
  currentUserId?: string;
}) {
  const [poll, setPoll] = useState(initialPoll);
  const [voting, setVoting] = useState(false);

  const totalVotes = poll.total_votes ?? poll.options.reduce((s, o) => s + o.votes_count, 0);
  const hasVoted = !!poll.user_vote_option_id;

  const handleVote = async (optionId: string) => {
    if (!currentUserId || voting) return;
    setVoting(true);
    try {
      const updated = await votePoll(pulseId, optionId);
      setPoll(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="mb-3">
      <p className="font-body font-medium text-sm mb-2" style={{ color: 'var(--text-h)' }}>
        {poll.question}
      </p>
      <div className="space-y-1.5">
        {poll.options.map((opt) => {
          const pct = totalVotes > 0 ? Math.round((opt.votes_count / totalVotes) * 100) : 0;
          const isSelected = poll.user_vote_option_id === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => handleVote(opt.id)}
              disabled={!currentUserId || voting}
              className="w-full relative overflow-hidden rounded-lg text-left transition-all duration-200"
              style={{
                background: 'var(--glass)',
                border: isSelected ? '1.5px solid var(--gold)' : '1px solid var(--glass-border)',
                cursor: currentUserId ? 'pointer' : 'default',
                padding: '8px 12px',
              }}
            >
              {/* Fortschrittsbalken */}
              {hasVoted && (
                <div
                  className="absolute inset-0 transition-all duration-500"
                  style={{
                    background: isSelected
                      ? 'linear-gradient(to right, rgba(200,169,110,0.15), rgba(200,169,110,0.05))'
                      : 'rgba(200,169,110,0.05)',
                    width: `${pct}%`,
                  }}
                />
              )}
              <div className="relative flex items-center justify-between">
                <span className="font-body text-sm" style={{ color: 'var(--text-h)' }}>
                  {opt.label}
                </span>
                {hasVoted && (
                  <span className="font-label text-[0.65rem] ml-2" style={{ color: 'var(--text-muted)' }}>
                    {pct}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-[0.65rem] font-label mt-1.5" style={{ color: 'var(--text-muted)' }}>
        {totalVotes} {totalVotes === 1 ? 'Stimme' : 'Stimmen'}
      </p>
    </div>
  );
}

// ── Location-Anzeige (Static Mapbox Image) ──────────────────
function LocationEmbed({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';
  const staticUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s+c8a96e(${lng},${lat})/${lng},${lat},13,0/400x160@2x?access_token=${token}`;

  return (
    <div className="mb-3 rounded-lg overflow-hidden" style={{ border: '1px solid var(--glass-border)' }}>
      {token ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={staticUrl}
          alt={name}
          className="w-full h-[120px] object-cover"
        />
      ) : (
        <div className="w-full h-[80px] flex items-center justify-center" style={{ background: 'var(--glass)' }}>
          <Icon name="map-pin" size={20} style={{ color: 'var(--text-muted)' }} />
        </div>
      )}
      <div className="px-3 py-2 flex items-center gap-2" style={{ background: 'var(--glass)' }}>
        <Icon name="map-pin" size={12} style={{ color: 'var(--gold)' }} />
        <span className="text-xs font-body truncate" style={{ color: 'var(--text-h)' }}>
          {name}
        </span>
      </div>
    </div>
  );
}

// ── Inline Challenge Card ─────────────────────────────────
function InlineChallengeCard({ challengeId, currentUserId }: { challengeId: string; currentUserId?: string }) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenge(challengeId).then(setChallenge).catch(console.error).finally(() => setLoading(false));
  }, [challengeId]);

  if (loading) return <div className="py-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>Lade Challenge …</div>;
  if (!challenge) return null;

  const startDate = new Date(challenge.starts_at);
  const today = new Date(); today.setHours(0,0,0,0);
  const startDay = new Date(startDate); startDay.setHours(0,0,0,0);
  const diffMs = today.getTime() - startDay.getTime();
  const currentDayNumber = Math.max(1, Math.min(challenge.duration_days, Math.floor(diffMs / 86400000) + 1));
  const checkinDays = new Set((challenge.my_progress?.checkins ?? []).map(c => c.day_number));
  const checkedInToday = checkinDays.has(currentDayNumber);

  return (
    <ChallengeCard
      challenge={challenge}
      currentDayNumber={currentDayNumber}
      checkedInToday={checkedInToday}
      onJoin={async () => {
        const res = await joinChallenge(challenge.id);
        setChallenge(prev => prev ? { ...prev, has_joined: true, participants_count: res.participants_count } : null);
      }}
      onCheckin={async () => {
        await checkinChallenge(challenge.id, currentDayNumber);
        const updated = await fetchChallenge(challengeId);
        setChallenge(updated);
      }}
    />
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
            {pulse.author.is_first_light && (
              <span
                className="text-[0.6rem] tracking-[0.15em] uppercase font-label rounded-full px-1.5 py-px"
                style={{
                  color: 'var(--gold)',
                  border: '1px solid var(--gold-border-s)',
                }}
              >
                First Light
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
            <Icon name="x" size={14} />
          </button>
        )}
      </div>

      {/* Content (ausblenden wenn auto-generiert und Location/Poll den Inhalt zeigt) */}
      {pulse.content && pulse.content !== '✨' && !(pulse.content.startsWith('📍') && pulse.location_name) && (
        <p className="leading-[1.8] text-[0.95rem] font-body whitespace-pre-wrap mb-3" style={{ color: 'var(--text-body)' }}>
          {pulse.content}
        </p>
      )}

      {/* Bilder (Multi-Image oder Einzelbild) */}
      {(() => {
        const images = pulse.image_urls?.length
          ? pulse.image_urls
          : pulse.image_url
            ? [pulse.image_url]
            : [];
        return images.length > 0 ? (
          <div className="mb-3">
            <ImageGrid images={images} />
          </div>
        ) : null;
      })()}

      {/* Location Embed */}
      {pulse.location_lat != null && pulse.location_lng != null && pulse.location_name && (
        <LocationEmbed
          lat={pulse.location_lat}
          lng={pulse.location_lng}
          name={pulse.location_name}
        />
      )}

      {/* Poll */}
      {pulse.poll && (
        <PollDisplay
          poll={pulse.poll}
          pulseId={pulse.id}
          currentUserId={currentUserId}
        />
      )}

      {/* Event Embed */}
      {pulse.metadata != null && Boolean(pulse.metadata.event_id) && (
        <div className="mb-3">
          <EventShareCard
            data={{
              event_id: String(pulse.metadata.event_id),
              event_title: String(pulse.metadata.event_title ?? ''),
              event_category: pulse.metadata.event_category as 'meetup' | 'course' | undefined,
              event_cover_url: pulse.metadata.event_cover_url as string | null | undefined,
              event_starts_at: pulse.metadata.event_starts_at as string | undefined,
              event_location_name: pulse.metadata.event_location_name as string | undefined,
              event_participants_count: pulse.metadata.event_participants_count as number | undefined,
            }}
            onClick={() => { window.location.href = '/discover'; }}
          />
        </div>
      )}

      {/* Challenge Embed */}
      {pulse.metadata != null && pulse.metadata.type === 'challenge' && Boolean(pulse.metadata.challenge_id) && (
        <div className="mb-3">
          <InlineChallengeCard challengeId={String(pulse.metadata.challenge_id)} currentUserId={currentUserId} />
        </div>
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
          <Icon name={liked ? 'heart-filled' : 'heart'} size={16} />
          {likesCount > 0 && <span>{likesCount}</span>}
          <span>Like</span>
        </button>

        <button
          onClick={() => setShowComments((s) => !s)}
          className="flex items-center gap-1.5 bg-transparent border-none py-1 cursor-pointer font-label text-[0.7rem] tracking-[0.1em] uppercase transition-colors duration-200"
          style={{ color: 'var(--text-muted)' }}
        >
          <Icon name="message-circle" size={16} />
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
