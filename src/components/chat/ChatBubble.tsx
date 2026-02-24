'use client';

import { useState } from 'react';
import type { Message } from '@/types/chat';
import { Icon } from '@/components/ui/Icon';

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

interface Props {
  message: Message;
  isOwn: boolean;
  showAuthor: boolean;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ChatBubble({ message, isOwn, showAuthor, onReply, onEdit, onDelete }: Props) {
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
            {/* Content */}
            {message.type === 'text' && (
              <p className="text-[13px] leading-[1.6] whitespace-pre-wrap break-words" style={{ color: 'var(--text-body)' }}>
                {message.content}
              </p>
            )}

            {message.type === 'image' && (
              <div className="rounded-lg overflow-hidden -mx-1 -mt-0.5 mb-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={message.content ?? ''}
                  alt=""
                  className="max-w-full rounded-lg"
                  style={{ maxHeight: '300px', objectFit: 'cover' }}
                />
              </div>
            )}

            {message.type === 'voice' && (
              <div className="flex items-center gap-2">
                <Icon name="microphone" size={14} style={{ color: 'var(--gold-text)' }} />
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Sprachnachricht</span>
              </div>
            )}

            {message.type === 'location' && (
              <div className="flex items-center gap-2">
                <Icon name="map-pin" size={14} style={{ color: 'var(--gold-text)' }} />
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Standort</span>
              </div>
            )}

            {/* Meta (Zeit + editiert) */}
            <div className={`flex items-center gap-1.5 mt-0.5 ${isOwn ? 'justify-end' : ''}`}>
              {message.edited_at && (
                <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>bearbeitet</span>
              )}
              <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                {formatTime(message.created_at)}
              </span>
            </div>
          </div>

          {/* Action Buttons (Hover) */}
          {showActions && (onReply || onEdit || onDelete) && (
            <div
              className={`absolute top-0 ${isOwn ? '-left-16' : '-right-16'} flex gap-0.5`}
              style={{ zIndex: 10 }}
            >
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
