'use client';

import { Icon } from '@/components/ui/Icon';
import type { Challenge } from '@/types/challenges';

interface Props {
  challenges: Challenge[];
  onCheckin: (id: string, dayNumber: number) => void;
  checkingIn?: Record<string, boolean>;
}

export default function ChallengeWidget({ challenges, onCheckin, checkingIn = {} }: Props) {
  if (challenges.length === 0) return null;

  const ch = challenges[0];
  const progress = ch.my_progress;
  const totalDays = ch.duration_days;
  const checkins = progress?.total_checkins ?? 0;
  const streak = progress?.current_streak ?? 0;
  const todayNumber = checkins + 1;
  const isChecking = checkingIn[ch.id];

  return (
    <div
      className="rounded-[8px] p-4"
      style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Icon name="flame" size={18} style={{ color: 'var(--gold)' }} />
        <span className="font-label text-[0.6rem] tracking-[0.06em] uppercase flex-1" style={{ color: 'var(--text-h)' }}>
          Aktive Challenge
        </span>
        {streak > 0 && (
          <span className="flex items-center gap-1 font-label text-xs" style={{ color: 'var(--gold-text)' }}>
            <Icon name="flame" size={14} />
            {streak} Tage
          </span>
        )}
      </div>

      {/* Title */}
      <p className="text-sm font-body font-medium mb-3" style={{ color: 'var(--text-h)' }}>
        {ch.title}
      </p>

      {/* Day task */}
      {!progress?.completed && todayNumber <= totalDays && (
        <p className="text-xs font-body mb-3" style={{ color: 'var(--text-sec)' }}>
          Tag {todayNumber} von {totalDays}
        </p>
      )}

      {/* Progress dots */}
      <div className="flex gap-1 flex-wrap mb-3">
        {Array.from({ length: Math.min(totalDays, 14) }, (_, i) => {
          const dayNum = i + 1;
          const done = dayNum <= checkins;
          const isCurrent = dayNum === todayNumber;
          return (
            <div
              key={i}
              className="w-3 h-3 rounded-full transition-all duration-300"
              style={{
                background: done
                  ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))'
                  : isCurrent
                    ? 'var(--gold-bg)'
                    : 'var(--divider)',
                border: isCurrent ? '1.5px solid var(--gold)' : 'none',
              }}
            />
          );
        })}
        {totalDays > 14 && (
          <span className="text-[0.5rem] font-label self-center" style={{ color: 'var(--text-muted)' }}>
            +{totalDays - 14}
          </span>
        )}
      </div>

      {/* CTA */}
      {!progress?.completed && todayNumber <= totalDays && (
        <button
          onClick={() => onCheckin(ch.id, todayNumber)}
          disabled={isChecking}
          className="px-4 py-1.5 border-none rounded-full font-label text-[0.55rem] tracking-[0.08em] uppercase cursor-pointer transition-opacity duration-200"
          style={{
            background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
            color: 'var(--text-on-gold)',
            opacity: isChecking ? 0.5 : 1,
          }}
        >
          Erledigt
        </button>
      )}

      {progress?.completed && (
        <div className="flex items-center gap-1.5">
          <Icon name="circle-check" size={14} style={{ color: 'var(--gold)' }} />
          <span className="text-xs font-body" style={{ color: 'var(--gold-text)' }}>Abgeschlossen</span>
        </div>
      )}
    </div>
  );
}
