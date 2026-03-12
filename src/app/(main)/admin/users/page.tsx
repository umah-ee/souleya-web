'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';
import { searchUsers, type UserSearchResult } from '@/lib/users';
import { toggleUserAdmin } from '@/lib/admin';

export default function AdminUsersPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ id: string; msg: string; ok: boolean } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await searchUsers(q.trim());
      setResults(res.data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  };

  // Feedback auto-hide
  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  const handleToggle = async (userId: string, newAdmin: boolean) => {
    setConfirmId(null);
    setToggling(userId);
    try {
      const result = await toggleUserAdmin(userId, newAdmin);
      // Ergebnis in lokale Liste uebernehmen
      setResults((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_admin: result.is_admin } : u,
        ),
      );
      setFeedback({
        id: userId,
        msg: newAdmin ? 'Als Admin gesetzt' : 'Admin-Status entfernt',
        ok: true,
      });
    } catch (err: unknown) {
      setFeedback({
        id: userId,
        msg: err instanceof Error ? err.message : 'Fehler aufgetreten',
        ok: false,
      });
    } finally {
      setToggling(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Icon name="shield" size={24} style={{ color: 'var(--gold)' }} />
        <h1
          className="font-heading"
          style={{ fontSize: 'clamp(22px, 4vw, 28px)', color: 'var(--text-h)', fontWeight: 400 }}
        >
          User-Verwaltung
        </h1>
      </div>

      {/* Suchfeld */}
      <div className="relative mb-6">
        <span className="absolute left-3 top-1/2 -translate-y-1/2">
          <Icon name="search" size={18} style={{ color: 'var(--text-muted)' }} />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="User suchen (Name, Username, E-Mail)..."
          className="w-full font-body"
          style={{
            padding: '10px 12px 10px 40px',
            borderRadius: 8,
            border: '1px solid var(--glass-border)',
            background: 'var(--glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            color: 'var(--text)',
            fontSize: '0.875rem',
            fontWeight: 500,
            outline: 'none',
          }}
        />
      </div>

      {/* Ergebnisse */}
      {loading && (
        <div className="flex justify-center py-8">
          <div
            className="w-6 h-6 rounded-full border-2 animate-spin"
            style={{ borderColor: 'var(--glass-border)', borderTopColor: 'var(--gold)' }}
          />
        </div>
      )}

      {!loading && query.length >= 2 && results.length === 0 && (
        <p className="text-center py-8 font-body" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>
          Keine User gefunden
        </p>
      )}

      <div className="flex flex-col gap-3">
        {results.map((user) => {
          const isAdmin = user.is_admin;
          const isToggling = toggling === user.id;
          const isConfirming = confirmId === user.id;

          return (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 rounded-[12px]"
              style={{
                background: 'var(--glass)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid var(--glass-border)',
              }}
            >
              {/* Avatar */}
              <div
                className="flex-shrink-0 rounded-full overflow-hidden"
                style={{ width: 40, height: 40, background: 'var(--glass-border)' }}
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt=""
                    className="w-full h-full"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="user" size={20} style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  className="font-body truncate"
                  style={{ color: 'var(--text)', fontSize: '0.875rem', fontWeight: 500 }}
                >
                  {user.display_name || user.username || 'Unbekannt'}
                </p>
                {user.username && (
                  <p
                    className="font-body truncate"
                    style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500 }}
                  >
                    @{user.username}
                  </p>
                )}
                {/* Feedback */}
                {feedback?.id === user.id && (
                  <p
                    className="font-body mt-0.5"
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      color: feedback.ok ? 'var(--gold)' : 'var(--error, #e74c3c)',
                    }}
                  >
                    {feedback.msg}
                  </p>
                )}
              </div>

              {/* Admin Badge */}
              {isAdmin && (
                <span
                  className="flex-shrink-0 font-label px-2 py-0.5 rounded-full"
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 500,
                    letterSpacing: '0.5px',
                    background: 'var(--gold)',
                    color: 'var(--text-on-gold)',
                  }}
                >
                  ADMIN
                </span>
              )}

              {/* Toggle / Confirm */}
              {isConfirming ? (
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleToggle(user.id, confirmAction)}
                    className="font-label px-3 py-1.5 rounded-full border-none cursor-pointer transition-opacity"
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      letterSpacing: '0.5px',
                      background: confirmAction ? 'var(--gold)' : 'var(--error, #e74c3c)',
                      color: 'var(--text-on-gold)',
                    }}
                  >
                    {confirmAction ? 'Ja, setzen' : 'Ja, entfernen'}
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="font-label px-3 py-1.5 rounded-full cursor-pointer transition-opacity"
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      letterSpacing: '0.5px',
                      background: 'var(--glass)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-sec)',
                    }}
                  >
                    Abbrechen
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setConfirmId(user.id);
                    setConfirmAction(!isAdmin);
                  }}
                  disabled={isToggling}
                  className="flex-shrink-0 font-label px-3 py-1.5 rounded-full border-none cursor-pointer transition-opacity"
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    letterSpacing: '0.5px',
                    background: isAdmin ? 'var(--glass)' : 'var(--gold)',
                    border: isAdmin ? '1px solid var(--glass-border)' : 'none',
                    color: isAdmin ? 'var(--text-sec)' : 'var(--text-on-gold)',
                    opacity: isToggling ? 0.5 : 1,
                  }}
                >
                  {isToggling ? '...' : isAdmin ? 'Admin entfernen' : 'Als Admin setzen'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
