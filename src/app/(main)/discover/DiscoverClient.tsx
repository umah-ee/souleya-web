'use client';

import { useState, useCallback, useEffect } from 'react';
import type { UserSearchResult } from '@/lib/users';
import type { ConnectionStatus } from '@/types/circles';
import { searchUsers } from '@/lib/users';
import { sendConnectionRequest, getConnectionStatus } from '@/lib/circles';

interface Props {
  userId: string | null;
}

export default function DiscoverClient({ userId }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, ConnectionStatus>>({});
  const [sending, setSending] = useState<Record<string, boolean>>({});

  // Debounced Search
  const handleSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    setSearching(true);
    try {
      const res = await searchUsers(q, 1, 30);
      setResults(res.data);
      setSearched(true);

      // Verbindungsstatus fuer alle Ergebnisse laden
      if (userId && res.data.length > 0) {
        const statusMap: Record<string, ConnectionStatus> = {};
        await Promise.all(
          res.data.map(async (user) => {
            try {
              const s = await getConnectionStatus(user.id);
              statusMap[user.id] = s.status;
            } catch {
              statusMap[user.id] = 'none';
            }
          }),
        );
        setStatuses(statusMap);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  }, [userId]);

  // Debounce: 400ms nach letztem Tastendruck suchen
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        handleSearch(query);
      } else {
        setResults([]);
        setSearched(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const handleConnect = async (targetId: string) => {
    setSending((s) => ({ ...s, [targetId]: true }));
    try {
      await sendConnectionRequest(targetId);
      setStatuses((s) => ({ ...s, [targetId]: 'pending_outgoing' }));
    } catch (e) {
      console.error(e);
    } finally {
      setSending((s) => ({ ...s, [targetId]: false }));
    }
  };

  const getStatusButton = (user: UserSearchResult) => {
    const status = statuses[user.id];
    const isSending = sending[user.id];

    if (status === 'connected') {
      return (
        <span className="px-3 py-1.5 border border-[#52B788]/30 rounded-full text-[#52B788] font-label text-[0.6rem] tracking-[0.1em] uppercase">
          Verbunden
        </span>
      );
    }
    if (status === 'pending_outgoing') {
      return (
        <span className="px-3 py-1.5 border border-gold-1/20 rounded-full text-[#5A5450] font-label text-[0.6rem] tracking-[0.1em] uppercase">
          Angefragt
        </span>
      );
    }
    if (status === 'pending_incoming') {
      return (
        <span className="px-3 py-1.5 border border-gold-1/30 rounded-full text-gold-1 font-label text-[0.6rem] tracking-[0.1em] uppercase">
          Antworten
        </span>
      );
    }

    return (
      <button
        onClick={() => handleConnect(user.id)}
        disabled={isSending || !userId}
        className={`
          px-3 py-1.5 rounded-full font-label text-[0.6rem] tracking-[0.1em] uppercase transition-all duration-200
          ${isSending
            ? 'bg-gold-1/20 text-[#5A5450] cursor-not-allowed'
            : 'bg-gradient-to-br from-gold-3 to-gold-2 text-dark cursor-pointer hover:opacity-90'
          }
        `}
      >
        {isSending ? '…' : 'Verbinden'}
      </button>
    );
  };

  return (
    <>
      {/* Desktop Header */}
      <div className="hidden md:block mb-6">
        <h1 className="font-heading text-2xl font-light text-gold-1 tracking-wide">
          Entdecken
        </h1>
        <p className="text-sm text-[#5A5450] font-body mt-1">
          Finde andere Souls
        </p>
      </div>

      {/* Suchfeld */}
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name, @username oder E-Mail suchen …"
          className="w-full py-3 px-5 bg-dark border border-gold-1/15 rounded-2xl text-[#F0EDE8] text-sm font-body outline-none focus:border-gold-1/40 transition-colors placeholder:text-[#5A5450]"
        />
      </div>

      {/* Ergebnisse */}
      {searching && (
        <div className="text-center py-8 text-[#5A5450]">
          <p className="font-label text-[0.7rem] tracking-[0.2em]">SUCHE …</p>
        </div>
      )}

      {!searching && searched && results.length === 0 && (
        <div className="text-center py-12 px-4 border border-dashed border-gold-1/15 rounded-2xl">
          <p className="text-gold-3 font-heading text-xl font-light mb-2">
            Keine Ergebnisse
          </p>
          <p className="text-[#5A5450] text-sm">
            Versuche einen anderen Suchbegriff.
          </p>
        </div>
      )}

      {!searching && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-[#5A5450] font-label text-[0.7rem] tracking-[0.15em] uppercase">
            {results.length} {results.length === 1 ? 'Ergebnis' : 'Ergebnisse'}
          </p>
          {results.map((user) => {
            const initials = (user.display_name ?? user.username ?? '?').slice(0, 1).toUpperCase();

            return (
              <div
                key={user.id}
                className="flex items-center gap-3 bg-dark rounded-2xl border border-gold-1/10 p-4"
              >
                {/* Avatar */}
                <div className={`
                  w-12 h-12 rounded-full bg-gold-1/15 flex-shrink-0
                  flex items-center justify-center font-heading text-lg text-gold-1
                  border ${user.is_origin_soul ? 'border-gold-1/50' : 'border-gold-1/20'}
                `}>
                  {user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-body font-medium text-sm text-[#F0EDE8] truncate">
                      {user.display_name ?? user.username ?? 'Anonym'}
                    </span>
                    {user.is_origin_soul && (
                      <span className="text-[0.55rem] tracking-[0.15em] uppercase text-gold-3 font-label border border-gold-3/30 rounded-full px-1.5 py-px flex-shrink-0">
                        Origin
                      </span>
                    )}
                  </div>
                  {user.username && (
                    <p className="text-xs text-[#5A5450] font-label">@{user.username}</p>
                  )}
                  {user.bio && (
                    <p className="text-xs text-[#5A5450] font-body mt-0.5 truncate">{user.bio}</p>
                  )}
                </div>

                {/* Action */}
                <div className="flex-shrink-0">
                  {getStatusButton(user)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Leerer Zustand (noch nicht gesucht) */}
      {!searching && !searched && (
        <div className="text-center py-16 px-4 border border-dashed border-gold-1/15 rounded-2xl">
          <p className="text-gold-3 font-heading text-2xl font-light mb-2">
            Souls entdecken
          </p>
          <p className="text-[#5A5450] text-sm">
            Suche nach Name, Username oder E-Mail, um andere Souls zu finden und dich zu verbinden.
          </p>
        </div>
      )}
    </>
  );
}
