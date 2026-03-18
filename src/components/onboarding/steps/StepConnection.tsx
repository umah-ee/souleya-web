'use client';

import { useState, useRef, useEffect } from 'react';
import { searchUsers, type UserSearchResult } from '@/lib/users';
import { sendConnectionRequest } from '@/lib/circles';

interface Props {
  onComplete: () => void;
  onBack: () => void;
  isFirst: boolean;
}

export default function StepConnection({ onComplete, onBack, isFirst }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState<string | null>(null);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const hasSent = sentTo.size > 0;

  // Debounced Suche
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchUsers(query, 1, 8);
        setResults(res.data);
      } catch {
        // silent
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const handleConnect = async (userId: string) => {
    setSending(userId);
    setError('');
    try {
      await sendConnectionRequest(userId);
      setSentTo((prev) => new Set(prev).add(userId));
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('already') || msg.includes('bereits')) {
        setSentTo((prev) => new Set(prev).add(userId));
      } else {
        setError('Anfrage konnte nicht gesendet werden.');
      }
    } finally {
      setSending(null);
    }
  };

  return (
    <div>
      {/* Suche */}
      <div className="relative mb-3">
        <svg
          viewBox="0 0 24 24" width="16" height="16" fill="none"
          stroke="var(--text-muted, #B0A898)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          className="absolute left-3 top-1/2 -translate-y-1/2"
        >
          <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
          <path d="M21 21l-6 -6" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name oder Username suchen …"
          className="w-full pl-9 pr-3.5 py-2.5 text-[13px] rounded-lg outline-none"
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-body)',
            fontFamily: "'Quicksand', sans-serif",
            borderRadius: '8px',
          }}
        />
      </div>

      {/* Ergebnisse */}
      <div className="max-h-[200px] overflow-y-auto scrollbar-gold">
        {searching && (
          <p className="text-center text-[12px] py-4" style={{ color: 'var(--text-muted)' }}>Suche …</p>
        )}

        {!searching && query.trim().length >= 2 && results.length === 0 && (
          <div className="text-center py-4">
            <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
              Noch keine Mitglieder gefunden. Du kannst diesen Schritt ueberspringen.
            </p>
          </div>
        )}

        {results.map((user) => {
          const isSent = sentTo.has(user.id);
          const isSending = sending === user.id;

          return (
            <div
              key={user.id}
              className="flex items-center gap-3 py-2.5 px-2 rounded-lg transition-all"
              style={{ borderBottom: '1px solid var(--glass-border)' }}
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                {user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
                    {(user.display_name || user.username || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-body)' }}>
                  {user.display_name || user.username || 'Unbekannt'}
                </p>
                {user.bio && (
                  <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                    {user.bio}
                  </p>
                )}
              </div>

              {/* Connect Button */}
              {isSent ? (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full" style={{ background: 'rgba(200,169,110,0.08)' }}>
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--accent, #C8A96E)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5l10 -10" />
                  </svg>
                  <span className="text-[10px] font-label tracking-[0.06em] uppercase" style={{ color: 'var(--accent)' }}>
                    Gesendet
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(user.id)}
                  disabled={isSending}
                  className="text-[10px] font-label tracking-[0.06em] uppercase px-3 py-1.5 rounded-full border-none cursor-pointer transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #A8894E, #C8A96E)',
                    color: 'var(--text-on-gold)',
                    opacity: isSending ? 0.6 : 1,
                  }}
                >
                  {isSending ? '…' : 'Verbinden'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-[12px] mt-2" style={{ color: '#E57373' }}>{error}</p>
      )}

      {/* Buttons */}
      <div className="flex items-center justify-between mt-4">
        {!isFirst ? (
          <button
            onClick={onBack}
            className="text-[12px] border-none bg-transparent cursor-pointer"
            style={{ color: 'var(--text-muted)', fontFamily: "'Quicksand', sans-serif" }}
          >
            Zurueck
          </button>
        ) : <span />}
        <div className="flex items-center gap-3">
          <button
            onClick={onComplete}
            className="text-[12px] border-none bg-transparent cursor-pointer"
            style={{ color: 'var(--text-muted)', fontFamily: "'Quicksand', sans-serif" }}
          >
            Ueberspringen
          </button>
          {hasSent && (
            <button
              onClick={onComplete}
              className="font-label text-[0.65rem] tracking-[0.1em] uppercase px-6 py-2.5 rounded-full border-none cursor-pointer transition-all hover:-translate-y-px"
              style={{
                background: 'linear-gradient(135deg, #A8894E, #C8A96E)',
                color: 'var(--text-on-gold)',
                boxShadow: '0 4px 16px rgba(200,169,110,0.25)',
              }}
            >
              Weiter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
