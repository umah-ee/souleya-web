'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Challenge, ChallengeParticipant, ChallengeProgress } from '@/types/challenges';
import {
  joinChallenge,
  leaveChallenge,
  checkinChallenge,
  fetchChallengeParticipants,
  fetchChallengeProgress,
} from '@/lib/challenges';
import { Icon } from '@/components/ui/Icon';

interface Props {
  challenge: Challenge;
  currentUserId?: string;
  onClose: () => void;
  onUpdate?: (updated: Partial<Challenge>) => void;
}

export default function ChallengeDetailModal({
  challenge,
  currentUserId,
  onClose,
  onUpdate,
}: Props) {
  const [participants, setParticipants] = useState<ChallengeParticipant[]>(
    challenge.participants ?? [],
  );
  const [progress, setProgress] = useState<ChallengeProgress | null>(
    challenge.my_progress ?? null,
  );
  const [hasJoined, setHasJoined] = useState(challenge.has_joined ?? false);
  const [participantsCount, setParticipantsCount] = useState(
    challenge.participants_count,
  );
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isCreator = currentUserId === challenge.creator_id;

  // ── Tages-Berechnungen ───────────────────────────────────────
  const startDate = new Date(challenge.starts_at);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDay = new Date(startDate);
  startDay.setHours(0, 0, 0, 0);
  const diffMs = today.getTime() - startDay.getTime();
  const currentDayNumber = Math.max(
    1,
    Math.min(challenge.duration_days, Math.floor(diffMs / 86400000) + 1),
  );

  const checkinDays = new Set(
    (progress?.checkins ?? []).map((c) => c.day_number),
  );
  const checkedInToday = checkinDays.has(currentDayNumber);
  const totalCheckins = progress?.total_checkins ?? 0;
  const percentage = Math.round(
    (totalCheckins / challenge.duration_days) * 100,
  );

  // ── Teilnehmer + Fortschritt laden ───────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [parts, prog] = await Promise.allSettled([
        fetchChallengeParticipants(challenge.id),
        hasJoined ? fetchChallengeProgress(challenge.id) : Promise.resolve(null),
      ]);
      if (parts.status === 'fulfilled' && parts.value) {
        const sorted = [...parts.value].sort(
          (a, b) => b.total_checkins - a.total_checkins,
        );
        setParticipants(sorted);
      }
      if (prog.status === 'fulfilled' && prog.value) {
        setProgress(prog.value);
      }
    } catch {
      // silent
    }
  }, [challenge.id, hasJoined]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Aktionen ─────────────────────────────────────────────────
  const handleJoin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await joinChallenge(challenge.id);
      setHasJoined(true);
      setParticipantsCount(res.participants_count);
      onUpdate?.({ has_joined: true, participants_count: res.participants_count });
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await leaveChallenge(challenge.id);
      setHasJoined(false);
      setParticipantsCount(res.participants_count);
      setProgress(null);
      onUpdate?.({ has_joined: false, participants_count: res.participants_count });
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async () => {
    if (loading || checkedInToday) return;
    setLoading(true);
    try {
      const result = await checkinChallenge(challenge.id, currentDayNumber);
      setProgress((prev) => {
        if (!prev) {
          return {
            current_streak: result.current_streak,
            longest_streak: result.current_streak,
            total_checkins: result.total_checkins,
            completed: result.completed,
            checkins: [{ day_number: result.day_number, checked_at: new Date().toISOString(), note: null }],
          };
        }
        return {
          ...prev,
          current_streak: result.current_streak,
          total_checkins: result.total_checkins,
          completed: result.completed,
          checkins: [
            ...prev.checkins,
            { day_number: result.day_number, checked_at: new Date().toISOString(), note: null },
          ],
        };
      });
      onUpdate?.({});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/challenges/${challenge.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // ── Progress Ring SVG ────────────────────────────────────────
  const ringSize = 120;
  const strokeW = 6;
  const radius = (ringSize - strokeW) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  // ── Day Calendar Grid ────────────────────────────────────────
  const calendarDays = Array.from(
    { length: challenge.duration_days },
    (_, i) => i + 1,
  );

  const getDayStatus = (dayNum: number) => {
    if (checkinDays.has(dayNum)) return 'checked';
    if (dayNum === currentDayNumber && !checkinDays.has(dayNum)) return 'today';
    if (dayNum < currentDayNumber) return 'missed';
    return 'future';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,.55)' }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl overflow-hidden mx-4 max-w-lg w-full max-h-[90vh] flex flex-col"
        style={{
          background: 'var(--bg-solid)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold-Leiste */}
        <div
          className="h-[2px] flex-shrink-0"
          style={{
            background:
              'linear-gradient(to right, transparent, var(--gold-glow), transparent)',
          }}
        />

        {/* Header */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--gold-bg)', border: '1px solid var(--gold-border-s)' }}
            >
              <Icon name={(challenge.emoji || 'target') as any} size={28} style={{ color: 'var(--gold)' }} />
            </div>
            <div className="min-w-0 flex-1">
              <h2
                className="font-heading text-lg leading-tight"
                style={{ color: 'var(--text-h)' }}
              >
                {challenge.title}
              </h2>
              <span
                className="text-[0.6rem] font-label tracking-[0.1em] uppercase"
                style={{ color: 'var(--text-muted)' }}
              >
                {challenge.duration_days} Tage &middot;{' '}
                {participantsCount}{' '}
                {participantsCount === 1 ? 'Teilnehmer' : 'Teilnehmer'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0"
            style={{ background: 'var(--glass)', color: 'var(--text-muted)' }}
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Scrollbarer Body */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-5">
          {/* Description */}
          {challenge.description && (
            <p
              className="text-sm font-body leading-relaxed"
              style={{ color: 'var(--text-body)' }}
            >
              {challenge.description}
            </p>
          )}

          {/* Progress Ring (nur wenn beigetreten) */}
          {hasJoined && (
            <div className="flex justify-center">
              <div className="relative" style={{ width: ringSize, height: ringSize }}>
                <svg
                  width={ringSize}
                  height={ringSize}
                  viewBox={`0 0 ${ringSize} ${ringSize}`}
                >
                  {/* Hintergrund-Ring */}
                  <circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--glass-border)"
                    strokeWidth={strokeW}
                  />
                  {/* Fortschritts-Ring */}
                  <circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--gold)"
                    strokeWidth={strokeW}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                  />
                </svg>
                {/* Center Text */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center"
                >
                  <span
                    className="font-heading text-xl"
                    style={{ color: 'var(--text-h)' }}
                  >
                    {totalCheckins}/{challenge.duration_days}
                  </span>
                  <span
                    className="text-[0.55rem] font-label tracking-[0.1em] uppercase"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Tage
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Streak Badge (wenn beigetreten und Streak > 1) */}
          {hasJoined && (progress?.current_streak ?? 0) > 1 && (
            <div className="flex justify-center">
              <span
                className="inline-flex items-center gap-1 text-[0.7rem] font-label px-3 py-1 rounded-full"
                style={{
                  background: 'var(--gold-bg)',
                  color: 'var(--gold-text)',
                  border: '1px solid var(--gold-border-s)',
                }}
              >
                <Icon name="flame" size={14} style={{ color: 'var(--gold-text)' }} /> {progress!.current_streak} Tage Streak
              </span>
            </div>
          )}

          {/* Day Calendar Grid (nur wenn beigetreten) */}
          {hasJoined && (
            <div>
              <label
                className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Tageskalender
              </label>
              <div
                className="grid gap-1.5"
                style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}
              >
                {calendarDays.map((dayNum) => {
                  const status = getDayStatus(dayNum);
                  return (
                    <div
                      key={dayNum}
                      className="aspect-square rounded-md flex items-center justify-center text-[0.6rem] font-label"
                      style={{
                        background:
                          status === 'checked'
                            ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))'
                            : 'var(--glass)',
                        color:
                          status === 'checked'
                            ? 'var(--text-on-gold)'
                            : status === 'missed'
                              ? 'var(--text-muted)'
                              : status === 'today'
                                ? 'var(--gold-text)'
                                : 'var(--text-muted)',
                        border:
                          status === 'today'
                            ? '1.5px solid var(--gold)'
                            : status === 'checked'
                              ? 'none'
                              : '1px solid var(--glass-border)',
                        animation:
                          status === 'today'
                            ? 'challenge-today-pulse 2s ease-in-out infinite'
                            : undefined,
                        opacity: status === 'future' ? 0.5 : 1,
                      }}
                    >
                      {status === 'checked' ? (
                        <Icon name="check" size={12} />
                      ) : status === 'missed' ? (
                        <span style={{ opacity: 0.5 }}>&ndash;</span>
                      ) : (
                        dayNum
                      )}
                    </div>
                  );
                })}
              </div>
              <style>{`
                @keyframes challenge-today-pulse {
                  0%, 100% { box-shadow: 0 0 0 0 rgba(200,169,110, 0.4); }
                  50% { box-shadow: 0 0 0 4px rgba(200,169,110, 0.1); }
                }
              `}</style>
            </div>
          )}

          {/* Participants List */}
          {participants.length > 0 && (
            <div>
              <label
                className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Teilnehmer ({participantsCount})
              </label>
              <div className="space-y-2">
                {participants.map((p) => {
                  const user = p.user;
                  const initials = (
                    user?.display_name ??
                    user?.username ??
                    '?'
                  )
                    .slice(0, 1)
                    .toUpperCase();
                  return (
                    <div
                      key={p.user_id}
                      className="flex items-center gap-3 py-2 px-3 rounded-xl"
                      style={{
                        background: 'var(--glass)',
                        border: '1px solid var(--glass-border)',
                      }}
                    >
                      {/* Avatar */}
                      <div
                        className="rounded-full flex items-center justify-center text-[0.6rem] font-heading overflow-hidden flex-shrink-0"
                        style={{
                          width: 32,
                          height: 32,
                          background: 'var(--avatar-bg)',
                          color: 'var(--gold-text)',
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

                      {/* Name + Streak */}
                      <div className="flex-1 min-w-0">
                        <span
                          className="font-body text-sm truncate block"
                          style={{ color: 'var(--text-h)' }}
                        >
                          {user?.display_name ?? user?.username ?? 'Anonym'}
                        </span>
                      </div>

                      {/* Streak Badge */}
                      {p.current_streak > 1 && (
                        <span
                          className="text-[0.55rem] font-label px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            background: 'var(--gold-bg)',
                            color: 'var(--gold-text)',
                          }}
                        >
                          <Icon name="flame" size={10} style={{ color: 'var(--gold-text)' }} /> {p.current_streak}
                        </span>
                      )}

                      {/* Progress */}
                      <span
                        className="text-[0.65rem] font-label flex-shrink-0"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {p.total_checkins}/{challenge.duration_days} Tage
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {/* Check-in */}
            {hasJoined && !checkedInToday && (
              <button
                onClick={handleCheckin}
                disabled={loading}
                className="w-full py-3 rounded-full font-label text-[0.7rem] tracking-[0.12em] uppercase transition-all duration-200"
                style={{
                  background: loading
                    ? 'var(--gold-bg)'
                    : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                  color: loading ? 'var(--text-muted)' : 'var(--text-on-gold)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  border: 'none',
                }}
              >
                {loading ? 'Wird eingetragen ...' : 'Heute geschafft \u2713'}
              </button>
            )}

            {/* Checked-in badge */}
            {hasJoined && checkedInToday && (
              <div
                className="w-full py-3 rounded-full font-label text-[0.7rem] tracking-[0.12em] uppercase text-center"
                style={{
                  background: 'var(--success-bg)',
                  color: 'var(--success)',
                  border: '1px solid var(--success-border)',
                }}
              >
                Erledigt &#10003;
              </div>
            )}

            {/* Join */}
            {!hasJoined && (
              <button
                onClick={handleJoin}
                disabled={loading}
                className="w-full py-3 rounded-full font-label text-[0.7rem] tracking-[0.12em] uppercase transition-all duration-200"
                style={{
                  background: loading
                    ? 'var(--gold-bg)'
                    : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                  color: loading ? 'var(--text-muted)' : 'var(--text-on-gold)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  border: 'none',
                }}
              >
                {loading ? 'Wird beigetreten ...' : 'Mitmachen'}
              </button>
            )}

            {/* Leave + Share row */}
            <div className="flex gap-2">
              {hasJoined && !isCreator && (
                <button
                  onClick={handleLeave}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-full font-label text-[0.7rem] tracking-[0.12em] uppercase transition-all duration-200 cursor-pointer"
                  style={{
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--divider)',
                  }}
                >
                  Verlassen
                </button>
              )}
              <button
                onClick={handleShare}
                className="flex-1 py-2.5 rounded-full font-label text-[0.7rem] tracking-[0.12em] uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                style={{
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--divider)',
                }}
              >
                <Icon name="share" size={14} />
                {copied ? 'Link kopiert!' : 'Teilen'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
