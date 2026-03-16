'use client';

import { useState, useEffect } from 'react';
import type { Message, ReactionSummary } from '@/types/chat';
import { Icon } from '@/components/ui/Icon';
import { renderMarkdown } from '@/lib/markdown';
import EventShareCard from '@/components/shared/EventShareCard';
import PollBubble from '@/components/chat/PollBubble';
import ImageGrid from '@/components/shared/ImageGrid';
import { fetchChallenge } from '@/lib/challenges';
import type { Challenge } from '@/types/challenges';
import ChallengeCard from '@/components/challenges/ChallengeCard';
import LinkPreviewCard from '@/components/chat/LinkPreviewCard';
import VoicePlayer from '@/components/chat/VoicePlayer';

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

interface Props {
  message: Message;
  isOwn: boolean;
  showAuthor: boolean;
  currentUserId: string;
  reactions?: ReactionSummary[];
  isRead?: boolean;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReact?: () => void;
  onPin?: () => void;
  onForward?: () => void;
  onToggleReaction?: (emoji: string) => void;
}

// ── Inline Challenge Embed ────────────────────────────────
function InlineChallengeEmbed({ challengeId }: { challengeId: string }) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  useEffect(() => {
    fetchChallenge(challengeId).then(setChallenge).catch(console.error);
  }, [challengeId]);
  if (!challenge) return null;
  return <ChallengeCard challenge={challenge} />;
}

export default function ChatBubble({
  message, isOwn, showAuthor, currentUserId, reactions = [],
  isRead, onReply, onEdit, onDelete, onReact, onPin, onForward, onToggleReaction,
}: Props) {
  const [showActions, setShowActions] = useState(false);
  const authorName = message.author?.display_name ?? message.author?.username ?? 'Anonym';

  // System-Nachricht
  if (message.type === 'system') {
    return (
      <div className="flex justify-center py-2">
        <span
          className="text-[10px] font-label tracking-[0.1em] uppercase px-3 py-1 rounded-full"
          style={{ background: 'var(--gold-bg)', color: 'var(--text-muted)' }}
        >
          {message.content}
        </span>
      </div>
    );
  }

  // Seeds-Nachricht
  if (message.type === 'seeds') {
    const amount = (message.metadata?.amount as number) ?? 0;
    return (
      <div className="flex justify-center py-2">
        <div
          className="text-center px-5 py-3 rounded-2xl"
          style={{ background: 'var(--gold-bg)', border: '1px solid var(--gold-border-s)' }}
        >
          <span className="text-lg font-heading" style={{ color: 'var(--gold-text)' }}>
            {amount} Seeds
          </span>
          {message.content && (
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{message.content}</p>
          )}
          <p className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>
            von {authorName} · {formatTime(message.created_at)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Author Name (nur bei Gruppen, nicht eigene) */}
        {showAuthor && (
          <p className="text-[10px] font-label tracking-[0.05em] px-3 mb-0.5" style={{ color: 'var(--gold-text)' }}>
            {authorName}
          </p>
        )}

        {/* Pin-Indikator */}
        {message.pinned_at && (
          <div className={`flex items-center gap-1 mb-0.5 px-1 ${isOwn ? 'justify-end' : ''}`}>
            <Icon name="pin-filled" size={10} style={{ color: 'var(--gold)' }} />
            <span className="text-[9px]" style={{ color: 'var(--gold-text)' }}>Angepinnt</span>
          </div>
        )}

        <div className="relative group">
          {/* Reply-Vorschau */}
          {message.reply_message && (
            <div
              className="px-3 pt-2 pb-1 text-[10px] rounded-t-[14px] -mb-1"
              style={{
                background: isOwn ? 'rgba(200,169,110,0.08)' : 'rgba(255,255,255,0.03)',
                borderLeft: '2px solid var(--gold-border)',
              }}
            >
              <span style={{ color: 'var(--gold-text)' }}>
                {message.reply_message.author?.display_name ?? 'Nachricht'}
              </span>
              <p className="truncate" style={{ color: 'var(--text-muted)' }}>
                {message.reply_message.content?.slice(0, 40) ?? '...'}
              </p>
            </div>
          )}

          {/* Bubble */}
          <div
            className="px-3.5 py-2 relative"
            style={{
              background: isOwn
                ? 'linear-gradient(135deg, rgba(200,169,110,0.15), rgba(200,169,110,0.08))'
                : 'var(--glass)',
              border: `1px solid ${isOwn ? 'var(--gold-border-s)' : 'var(--glass-border)'}`,
              borderRadius: isOwn
                ? message.reply_message ? '0 14px 4px 14px' : '14px 14px 4px 14px'
                : message.reply_message ? '14px 0 14px 4px' : '14px 14px 14px 4px',
            }}
          >
            {/* Forwarded Header */}
            {Boolean(message.metadata?.forwarded) && (
              <div className="flex items-center gap-1 mb-1">
                <Icon name="arrow-forward-up" size={10} style={{ color: 'var(--text-muted)' }} />
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Weitergeleitet von {String(message.metadata.forwarded_author ?? 'Jemand')}
                </span>
              </div>
            )}

            {/* Content */}
            {message.type === 'text' && (
              <p className="text-[13px] leading-[1.6] whitespace-pre-wrap break-words" style={{ color: 'var(--text-body)' }}>
                {renderMarkdown(message.content ?? '')}
              </p>
            )}

            {message.type === 'image' && (() => {
              const imageUrls = (message.metadata?.image_urls as string[] | undefined);
              const urls = imageUrls && imageUrls.length > 1
                ? imageUrls
                : message.content ? [message.content] : [];
              return urls.length > 0 ? (
                <div className="rounded-lg overflow-hidden -mx-1 -mt-0.5 mb-1">
                  {urls.length === 1 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={urls[0]}
                      alt=""
                      className="max-w-full rounded-lg"
                      style={{ maxHeight: '300px', objectFit: 'cover' }}
                    />
                  ) : (
                    <ImageGrid images={urls} maxHeight={280} />
                  )}
                </div>
              ) : null;
            })()}

            {message.type === 'voice' && message.content && (
              <VoicePlayer
                src={message.content}
                durationMs={message.metadata?.duration_ms as number | undefined}
              />
            )}

            {message.type === 'location' && (
              <div className="flex items-center gap-2">
                <Icon name="map-pin" size={14} style={{ color: 'var(--gold-text)' }} />
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Standort</span>
              </div>
            )}

            {message.type === 'poll' && (
              <PollBubble message={message} isOwn={isOwn} currentUserId={currentUserId} />
            )}

            {message.type === 'challenge' && !!message.metadata?.challenge_id ? (
              <div className="-mx-1 my-0.5">
                <InlineChallengeEmbed challengeId={String(message.metadata.challenge_id)} />
              </div>
            ) : null}

            {/* Event Embed */}
            {!!message.metadata?.event_id && (
              <div className="mt-1.5 -mx-0.5">
                <EventShareCard
                  data={{
                    event_id: String(message.metadata.event_id),
                    event_title: String(message.metadata.event_title ?? ''),
                    event_category: message.metadata.event_category as 'meetup' | 'course' | undefined,
                    event_cover_url: message.metadata.event_cover_url as string | null | undefined,
                    event_starts_at: message.metadata.event_starts_at as string | undefined,
                    event_location_name: message.metadata.event_location_name as string | undefined,
                    event_participants_count: message.metadata.event_participants_count as number | undefined,
                  }}
                  onClick={() => { window.location.href = '/discover'; }}
                />
              </div>
            )}

            {/* Link-Vorschau */}
            {!!message.metadata?.link_preview && (
              <div className="mt-1.5 -mx-0.5">
                <LinkPreviewCard preview={message.metadata.link_preview as { url: string; title?: string; description?: string; image?: string; site_name?: string }} />
              </div>
            )}

            {/* Meta (Zeit + editiert + Häkchen) */}
            <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : ''}`}>
              {message.edited_at && (
                <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>bearbeitet</span>
              )}
              <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                {formatTime(message.created_at)}
              </span>
              {isOwn && (
                <span style={{ color: isRead ? 'var(--gold)' : 'var(--text-muted)' }}>
                  {isRead ? (
                    <Icon name="checks" size={12} />
                  ) : (
                    <Icon name="check" size={12} />
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Reactions */}
          {reactions.length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-1 px-1 ${isOwn ? 'justify-end' : ''}`}>
              {reactions.map((r) => (
                <button
                  key={r.emoji}
                  onClick={() => onToggleReaction?.(r.emoji)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] cursor-pointer transition-colors duration-150"
                  style={{
                    background: r.has_reacted ? 'rgba(200,169,110,0.15)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${r.has_reacted ? 'rgba(200,169,110,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  <span>{r.emoji}</span>
                  {r.count > 1 && (
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{r.count}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Action Buttons (Hover) */}
          {showActions && (onReply || onEdit || onDelete || onReact || onPin) && (
            <div
              className={`absolute top-0 ${isOwn ? '-left-24' : '-right-24'} flex gap-0.5`}
              style={{ zIndex: 10 }}
            >
              {onReact && (
                <button
                  onClick={onReact}
                  className="w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-colors"
                  style={{ color: 'var(--text-muted)', background: 'var(--glass)' }}
                  title="Reagieren"
                >
                  <Icon name="face-smile" size={12} />
                </button>
              )}
              {onPin && (
                <button
                  onClick={onPin}
                  className="w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-colors"
                  style={{ color: message.pinned_at ? 'var(--gold)' : 'var(--text-muted)', background: 'var(--glass)' }}
                  title={message.pinned_at ? 'Lospinnen' : 'Anpinnen'}
                >
                  <Icon name={message.pinned_at ? 'pin-filled' : 'pin'} size={12} />
                </button>
              )}
              {onForward && (
                <button
                  onClick={onForward}
                  className="w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-colors"
                  style={{ color: 'var(--text-muted)', background: 'var(--glass)' }}
                  title="Weiterleiten"
                >
                  <Icon name="arrow-forward-up" size={12} />
                </button>
              )}
              {onReply && (
                <button
                  onClick={onReply}
                  className="w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-colors"
                  style={{ color: 'var(--text-muted)', background: 'var(--glass)' }}
                  title="Antworten"
                >
                  <Icon name="corner-up-left" size={12} />
                </button>
              )}
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-colors"
                  style={{ color: 'var(--text-muted)', background: 'var(--glass)' }}
                  title="Bearbeiten"
                >
                  <Icon name="pencil" size={12} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-colors"
                  style={{ color: 'var(--text-muted)', background: 'var(--glass)' }}
                  title="Loeschen"
                >
                  <Icon name="trash" size={12} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
