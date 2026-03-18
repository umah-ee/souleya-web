'use client';

import { useState } from 'react';
import type { Nomination } from '@/lib/nominations';
import { voteOnNomination } from '@/lib/nominations';
import EnsoRing from '@/components/ui/EnsoRing';
import { Icon } from '@/components/ui/Icon';

interface NominationCardProps {
  nomination: Nomination;
  currentUserId?: string;
}

export default function NominationCard({ nomination, currentUserId }: NominationCardProps) {
  const [userVote, setUserVote] = useState<boolean | null>(nomination.user_vote ?? null);
  const [votesFor, setVotesFor] = useState(nomination.votes_for);
  const [votesAgainst, setVotesAgainst] = useState(nomination.votes_against);
  const [voting, setVoting] = useState(false);

  const nominee = nomination.nominee;
  const totalVotes = votesFor + votesAgainst;
  const approvalPct = totalVotes > 0 ? Math.round((votesFor / totalVotes) * 100) : 0;

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(nomination.voting_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  const handleVote = async (vote: boolean) => {
    if (!currentUserId || voting || userVote !== null) return;
    setVoting(true);
    try {
      await voteOnNomination(nomination.id, vote);
      setUserVote(vote);
      if (vote) setVotesFor((v) => v + 1);
      else setVotesAgainst((v) => v + 1);
    } catch (err) {
      console.error('Vote failed:', err);
    } finally {
      setVoting(false);
    }
  };

  return (
    <div
      className="rounded-2xl p-5 md:p-6"
      style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--gold-border-s)',
        boxShadow: '0 0 20px rgba(200, 169, 110, 0.1)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-4">
        <Icon name="star" size={14} style={{ color: 'var(--gold-text)' }} />
        <span
          className="font-label text-[0.55rem] tracking-[0.15em] uppercase"
          style={{ color: 'var(--gold-text)' }}
        >
          Mentor-Nominierung
        </span>
        <span className="ml-auto text-[0.6rem] font-body" style={{ color: 'var(--text-muted)' }}>
          {daysLeft > 0 ? `Noch ${daysLeft} Tag${daysLeft === 1 ? '' : 'e'}` : 'Abgelaufen'}
        </span>
      </div>

      {/* Nominee */}
      <div className="flex items-center gap-3 mb-4">
        <EnsoRing
          soulLevel={nominee?.soul_level ?? 4}
          isFirstLight={nominee?.is_first_light ?? false}
          size="feed"
        >
          <div
            className="w-full h-full rounded-full flex items-center justify-center font-heading text-sm overflow-hidden"
            style={{ background: 'var(--avatar-bg)', color: 'var(--gold-text)' }}
          >
            {nominee?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={nominee.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              (nominee?.display_name ?? '?')[0].toUpperCase()
            )}
          </div>
        </EnsoRing>
        <div>
          <p className="font-heading text-base" style={{ color: 'var(--text-h)' }}>
            {nominee?.display_name ?? 'Unbekannt'}
          </p>
          <p className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>
            Soll Soul Mentor werden?
          </p>
        </div>
      </div>

      {/* Fortschrittsbalken */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-[0.6rem] font-label" style={{ color: 'var(--text-muted)' }}>
            {totalVotes} Stimme{totalVotes !== 1 ? 'n' : ''}
          </span>
          <span className="text-[0.6rem] font-label" style={{ color: 'var(--gold-text)' }}>
            {approvalPct}% Zustimmung
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--divider)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${approvalPct}%`,
              background: approvalPct >= 70
                ? 'linear-gradient(90deg, var(--gold-deep), var(--gold))'
                : 'var(--text-muted)',
            }}
          />
        </div>
      </div>

      {/* Vote Buttons */}
      {currentUserId && userVote === null && daysLeft > 0 && (
        <div className="flex gap-2">
          <button
            onClick={() => handleVote(true)}
            disabled={voting}
            className="flex-1 py-2 border-none rounded-full font-label text-[0.55rem] tracking-[0.08em] uppercase cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
              color: 'var(--text-on-gold)',
              opacity: voting ? 0.5 : 1,
            }}
          >
            Ja, verdient
          </button>
          <button
            onClick={() => handleVote(false)}
            disabled={voting}
            className="flex-1 py-2 bg-transparent rounded-full font-label text-[0.55rem] tracking-[0.08em] uppercase cursor-pointer"
            style={{
              border: '1px solid var(--divider)',
              color: 'var(--text-muted)',
              opacity: voting ? 0.5 : 1,
            }}
          >
            Noch nicht
          </button>
        </div>
      )}

      {/* Voted State */}
      {userVote !== null && (
        <div className="text-center">
          <span className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>
            Du hast mit {userVote ? '„Ja"' : '„Noch nicht"'} gestimmt
          </span>
        </div>
      )}
    </div>
  );
}
