'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Message, PollResult } from '@/types/chat';
import { getPollResults, votePoll } from '@/lib/chat';
import { Icon } from '@/components/ui/Icon';

interface Props {
  message: Message;
  isOwn: boolean;
  currentUserId: string;
}

export default function PollBubble({ message, currentUserId }: Props) {
  const [result, setResult] = useState<PollResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  const pollId = message.metadata?.poll_id as string | undefined;
  const hasVoted = result?.options.some((o) => o.has_voted) ?? false;

  const loadResults = useCallback(async () => {
    if (!pollId) return;
    try {
      const data = await getPollResults(pollId);
      setResult(data);
    } catch (e) {
      console.error('Poll laden fehlgeschlagen:', e);
    } finally {
      setLoading(false);
    }
  }, [pollId]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  // Realtime: poll-vote-update Events abhoeren
  useEffect(() => {
    const handler = () => { loadResults(); };
    window.addEventListener('poll-vote-update', handler);
    return () => window.removeEventListener('poll-vote-update', handler);
  }, [loadResults]);

  const handleVote = async (optionId: string) => {
    if (!pollId || voting || result?.is_expired) return;
    setVoting(true);
    try {
      const updated = await votePoll(pollId, optionId);
      setResult(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-2">
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Abstimmung wird geladen ...</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="py-2">
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Abstimmung nicht verfuegbar</span>
      </div>
    );
  }

  return (
    <div className="py-1 min-w-[200px]">
      {/* Frage */}
      <p className="text-[13px] font-heading mb-2" style={{ color: 'var(--text-h)' }}>
        {result.question}
      </p>

      {/* Info-Badges */}
      <div className="flex items-center gap-2 mb-2">
        {result.multiple_choice && (
          <span
            className="text-[9px] font-label tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-full"
            style={{ background: 'var(--gold-bg)', color: 'var(--gold-text)' }}
          >
            Mehrfachauswahl
          </span>
        )}
        {result.is_expired && (
          <span
            className="text-[9px] font-label tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-full"
            style={{ background: 'var(--glass)', color: 'var(--text-muted)' }}
          >
            Beendet
          </span>
        )}
      </div>

      {/* Optionen */}
      <div className="space-y-1.5">
        {result.options.map((option) => (
          <div key={option.id}>
            {!hasVoted && !result.is_expired ? (
              /* Noch nicht abgestimmt: klickbare Buttons */
              <button
                onClick={() => handleVote(option.id)}
                disabled={voting}
                className="w-full text-left px-3 py-2 rounded-lg text-[12px] cursor-pointer transition-colors"
                style={{
                  background: 'var(--glass)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-body)',
                  opacity: voting ? 0.6 : 1,
                }}
              >
                {option.label}
              </button>
            ) : (
              /* Ergebnis-Ansicht */
              <div
                className="px-3 py-2 rounded-lg relative overflow-hidden"
                style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}
              >
                {/* Prozentbalken */}
                <div
                  className="absolute inset-0 rounded-lg transition-all duration-500"
                  style={{
                    background: option.has_voted
                      ? 'linear-gradient(135deg, rgba(200,169,110,0.2), rgba(200,169,110,0.08))'
                      : 'rgba(255,255,255,0.03)',
                    width: `${option.percentage}%`,
                  }}
                />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {option.has_voted && (
                      <Icon name="check" size={12} style={{ color: 'var(--gold-text)' }} />
                    )}
                    <span className="text-[12px]" style={{ color: 'var(--text-body)' }}>
                      {option.label}
                    </span>
                  </div>
                  <span className="text-[11px] font-label" style={{ color: 'var(--text-muted)' }}>
                    {option.percentage}%
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Stimmen-Count */}
      <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
        {result.total_votes} {result.total_votes === 1 ? 'Stimme' : 'Stimmen'}
      </p>
    </div>
  );
}
