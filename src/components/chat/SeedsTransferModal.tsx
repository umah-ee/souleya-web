'use client';

import { useState } from 'react';
import type { ChannelMember } from '@/types/chat';
import { transferSeeds } from '@/lib/chat';
import { Icon } from '@/components/ui/Icon';

const QUICK_AMOUNTS = [10, 25, 50, 100];

interface Props {
  channelId: string;
  channelType: string;
  members: ChannelMember[];
  currentUserId: string;
  onClose: () => void;
  onSent: () => void;
}

export default function SeedsTransferModal({
  channelId, channelType, members, currentUserId,
  onClose, onSent,
}: Props) {
  const [amount, setAmount] = useState<number | ''>('');
  const [message, setMessage] = useState('');
  const [toUserId, setToUserId] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const isDirect = channelType === 'direct';
  const otherMembers = members.filter((m) => m.user_id !== currentUserId);

  // Bei Direkt-Channels: automatisch den Partner auswaehlen
  const recipientId = isDirect ? otherMembers[0]?.user_id : toUserId;
  const canSend = typeof amount === 'number' && amount >= 1 && !sending && (isDirect || recipientId);

  const handleSend = async () => {
    if (!canSend || typeof amount !== 'number') return;
    setSending(true);
    setError('');
    try {
      await transferSeeds(channelId, {
        amount,
        message: message.trim() || undefined,
        to_user_id: isDirect ? undefined : recipientId,
      });
      onSent();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Transfer fehlgeschlagen';
      setError(msg.includes('Nicht genug') ? 'Nicht genug Seeds' : msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-[340px] rounded-2xl p-5"
        style={{ background: 'var(--bg-solid)', border: '1px solid var(--glass-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <span
            className="font-label text-[0.65rem] tracking-[0.15em] uppercase"
            style={{ color: 'var(--gold-text)' }}
          >
            Seeds senden
          </span>
          <button onClick={onClose} className="cursor-pointer p-0.5" style={{ color: 'var(--text-muted)' }}>
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Betrag */}
        <div className="text-center mb-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              const v = e.target.value;
              setAmount(v === '' ? '' : Math.max(1, Math.min(10000, Number(v))));
              setError('');
            }}
            placeholder="0"
            min={1}
            max={10000}
            className="w-full text-center text-4xl font-heading outline-none bg-transparent"
            style={{ color: 'var(--gold-text)' }}
            autoFocus
          />
          <p className="text-[11px] mt-1 font-label tracking-[0.05em]" style={{ color: 'var(--text-muted)' }}>
            Seeds
          </p>
        </div>

        {/* Quick-Buttons */}
        <div className="flex justify-center gap-2 mb-5">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              onClick={() => { setAmount(q); setError(''); }}
              className="px-3.5 py-1.5 rounded-full text-[12px] font-label cursor-pointer transition-colors"
              style={{
                background: amount === q ? 'rgba(200,169,110,0.15)' : 'var(--glass)',
                border: `1px solid ${amount === q ? 'var(--gold-border-s)' : 'var(--glass-border)'}`,
                color: amount === q ? 'var(--gold-text)' : 'var(--text-muted)',
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Empfaenger (nur bei Gruppen) */}
        {!isDirect && (
          <div className="mb-4">
            <p className="text-[10px] font-label tracking-[0.1em] uppercase mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Empfaenger
            </p>
            <div className="space-y-1 max-h-[120px] overflow-y-auto">
              {otherMembers.map((m) => (
                <button
                  key={m.user_id}
                  onClick={() => setToUserId(m.user_id)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left cursor-pointer transition-colors"
                  style={{
                    background: toUserId === m.user_id ? 'rgba(200,169,110,0.1)' : 'var(--glass)',
                    border: `1px solid ${toUserId === m.user_id ? 'var(--gold-border-s)' : 'var(--glass-border)'}`,
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-heading shrink-0 overflow-hidden"
                    style={{ background: 'var(--avatar-bg)', color: 'var(--gold-text)', border: '1px solid var(--gold-border-s)' }}
                  >
                    {m.profile.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (m.profile.display_name ?? '?').slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <span className="text-[12px] truncate" style={{ color: 'var(--text-body)' }}>
                    {m.profile.display_name ?? m.profile.username ?? 'Anonym'}
                  </span>
                  {toUserId === m.user_id && (
                    <Icon name="check" size={14} style={{ color: 'var(--gold-text)', marginLeft: 'auto' }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Nachricht (optional) */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nachricht (optional)"
          maxLength={200}
          className="w-full px-3 py-2 text-sm font-body outline-none mb-4"
          style={{
            background: 'var(--input-bg)',
            border: '1px solid var(--input-border)',
            borderRadius: '8px',
            color: 'var(--text-body)',
          }}
        />

        {/* Fehler */}
        {error && (
          <p className="text-[11px] text-center mb-3" style={{ color: '#e57373' }}>
            {error}
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--glass-border)' }}
          >
            Abbrechen
          </button>
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="flex-1 py-2.5 rounded-full font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer transition-all"
            style={{
              background: canSend
                ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))'
                : 'var(--gold-bg)',
              color: canSend ? 'var(--text-on-gold)' : 'var(--text-muted)',
              opacity: canSend ? 1 : 0.5,
            }}
          >
            {sending ? 'Wird gesendet ...' : `${typeof amount === 'number' ? amount : 0} Seeds senden`}
          </button>
        </div>
      </div>
    </div>
  );
}
