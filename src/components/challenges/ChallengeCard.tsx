'use client';

import { useState } from 'react';
import type { Challenge } from '@/types/challenges';
import { Icon } from '@/components/ui/Icon';

interface Props {
  challenge: Challenge;
  onJoin?: () => void;
  onCheckin?: () => void;
  onClick?: () => void;
  currentDayNumber?: number;
  checkedInToday?: boolean;
}

export default function ChallengeCard({
  challenge,
  onJoin,
  onCheckin,
  onClick,
  currentDayNumber,
  checkedInToday = false,
}: Props) {
  const [joining, setJoining] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  const hasJoined = challenge.has_joined ?? false;
  const totalCheckins = challenge.my_progress?.total_checkins ?? 0;
  const currentStreak = challenge.my_progress?.current_streak ?? 0;
  const checkinDays = new Set(
    (challenge.my_progress?.checkins ?? []).map((c) => c.day_number),
  );

  const handleJoin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (joining || !onJoin) return;
    setJoining(true);
    try {
      await onJoin();
    } finally {
      setJoining(false);
    }
  };

  const handleCheckin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (checkingIn || !onCheckin) return;
    setCheckingIn(true);
    try {
      await onCheckin();
    } finally {
      setCheckingIn(false);
    }
  };

  // ── Progress Dots ────────────────────────────────────────────
  const maxDotsShown = 14;
  const duration = challenge.duration_days;
  const showTruncated = duration > maxDotsShown;
  const dotsToRender = showTruncated ? maxDotsShown : duration;
  const remaining = duration - maxDotsShown;

  // ── Participant Avatars ──────────────────────────────────────
  const participants = challenge.participants ?? [];
  const maxAvatars = 5;
  const shownParticipants = participants.slice(0, maxAvatars);
  const extraCount = challenge.participants_count - maxAvatars;

  return (
    <div
      className="glass-card rounded-2xl p-4 cursor-pointer transition-all duration-200"
      style={{ minWidth: 0 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {/* Header: Emoji + Title + Duration Badge */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--gold-bg)', border: '1px solid var(--gold-border-s)' }}
        >
          <Icon name={(challenge.emoji || 'target') as any} size={22} style={{ color: 'var(--gold)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="font-heading text-base leading-tight truncate"
            style={{ color: 'var(--text-h)' }}
          >
            {challenge.title}
          </h3>
        </div>
        <span
          className="flex-shrink-0 text-[0.6rem] font-label tracking-[0.1em] uppercase px-2 py-0.5 rounded-full"
          style={{
            background: 'var(--gold-bg)',
            color: 'var(--gold-text)',
            border: '1px solid var(--gold-border-s)',
          }}
        >
          {duration} Tage
        </span>
      </div>

      {/* Progress Dots */}
      <div className="flex flex-wrap gap-1 mb-3 items-center">
        {Array.from({ length: dotsToRender }, (_, i) => {
          const dayNum = i + 1;
          const isCompleted = checkinDays.has(dayNum);
          return (
            <span
              key={dayNum}
              className="inline-block rounded-full"
              style={{
                width: 8,
                height: 8,
                background: isCompleted
                  ? 'var(--gold)'
                  : 'var(--glass)',
                border: isCompleted
                  ? '1px solid var(--gold)'
                  : '1px solid var(--glass-border)',
              }}
            />
          );
        })}
        {showTruncated && (
          <span
            className="text-[0.6rem] font-label"
            style={{ color: 'var(--text-muted)' }}
          >
            ...+{remaining}
          </span>
        )}
      </div>

      {/* Participants Row */}
      {challenge.participants_count > 0 && (
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {shownParticipants.map((p, i) => {
              const user = p.user;
              const initials = (user?.display_name ?? user?.username ?? '?')
                .slice(0, 1)
                .toUpperCase();
              return (
                <div
                  key={p.user_id}
                  className="rounded-full flex items-center justify-center text-[0.5rem] font-heading overflow-hidden"
                  style={{
                    width: 24,
                    height: 24,
                    background: 'var(--avatar-bg)',
                    color: 'var(--gold-text)',
                    border: '2px solid var(--bg-solid)',
                    marginLeft: i > 0 ? -8 : 0,
                    zIndex: maxAvatars - i,
                    position: 'relative',
                  }}
                >
                  {user?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar_url}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
              );
            })}
          </div>
          {extraCount > 0 && (
            <span
              className="text-[0.6rem] font-label ml-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              +{extraCount}
            </span>
          )}
          <span
            className="text-[0.6rem] font-label ml-2"
            style={{ color: 'var(--text-muted)' }}
          >
            {challenge.participants_count}{' '}
            {challenge.participants_count === 1 ? 'Teilnehmer' : 'Teilnehmer'}
          </span>
        </div>
      )}

      {/* Streak Badge */}
      {hasJoined && currentStreak > 1 && (
        <div className="mb-3">
          <span
            className="inline-flex items-center gap-1 text-[0.65rem] font-label px-2 py-0.5 rounded-full"
            style={{
              background: 'var(--gold-bg)',
              color: 'var(--gold-text)',
              border: '1px solid var(--gold-border-s)',
            }}
          >
            <Icon name="flame" size={12} style={{ color: 'var(--gold-text)' }} /> {currentStreak} Tage Streak
          </span>
        </div>
      )}

      {/* Action Row */}
      <div>
        {!hasJoined ? (
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full py-2 rounded-full font-label text-[0.7rem] tracking-[0.12em] uppercase transition-all duration-200"
            style={{
              background: joining
                ? 'var(--gold-bg)'
                : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
              color: joining ? 'var(--text-muted)' : 'var(--text-on-gold)',
              cursor: joining ? 'not-allowed' : 'pointer',
              border: 'none',
            }}
          >
            {joining ? 'Wird beigetreten ...' : 'Mitmachen'}
          </button>
        ) : checkedInToday ? (
          <div
            className="w-full py-2 rounded-full font-label text-[0.7rem] tracking-[0.12em] uppercase text-center"
            style={{
              background: 'var(--success-bg)',
              color: 'var(--success)',
              border: '1px solid var(--success-border)',
            }}
          >
            Erledigt &#10003;
          </div>
        ) : (
          <button
            onClick={handleCheckin}
            disabled={checkingIn}
            className="w-full py-2 rounded-full font-label text-[0.7rem] tracking-[0.12em] uppercase transition-all duration-200"
            style={{
              background: 'transparent',
              color: checkingIn ? 'var(--text-muted)' : 'var(--gold-text)',
              border: '1.5px solid var(--gold)',
              cursor: checkingIn ? 'not-allowed' : 'pointer',
            }}
          >
            {checkingIn ? 'Wird eingetragen ...' : 'Heute geschafft \u2713'}
          </button>
        )}
      </div>
    </div>
  );
}
