'use client';

import { useState, useRef } from 'react';
import type { Message } from '@/types/chat';
import { searchMessages } from '@/lib/chat';
import { Icon } from '@/components/ui/Icon';

interface Props {
  channelId: string;
  onClose: () => void;
  onScrollToMessage: (messageId: string) => void;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function MessageSearch({ channelId, onClose, onScrollToMessage }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await searchMessages(channelId, q);
      setResults(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="px-4 py-2 space-y-2"
      style={{ borderBottom: '1px solid var(--divider-l)', background: 'var(--glass)' }}
    >
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          placeholder="Nachrichten durchsuchen …"
          autoFocus
          className="flex-1 px-3 py-2 text-sm font-body outline-none"
          style={{
            background: 'var(--input-bg)',
            border: '1px solid var(--input-border)',
            borderRadius: '8px',
            color: 'var(--text-body)',
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shrink-0"
          style={{ color: 'var(--gold-text)' }}
        >
          <Icon name="search" size={16} />
        </button>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shrink-0"
          style={{ color: 'var(--text-muted)' }}
        >
          <Icon name="x" size={16} />
        </button>
      </div>

      {loading && (
        <p className="text-[11px] text-center py-2" style={{ color: 'var(--text-muted)' }}>
          Wird gesucht …
        </p>
      )}

      {!loading && searched && results.length === 0 && (
        <p className="text-[11px] text-center py-2" style={{ color: 'var(--text-muted)' }}>
          Keine Ergebnisse gefunden
        </p>
      )}

      {!loading && results.length > 0 && (
        <div className="max-h-[200px] overflow-y-auto space-y-1">
          {results.map((msg) => (
            <button
              key={msg.id}
              onClick={() => onScrollToMessage(msg.id)}
              className="w-full text-left px-3 py-2 rounded-lg cursor-pointer transition-colors"
              style={{ background: 'transparent' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-heading truncate" style={{ color: 'var(--gold-text)' }}>
                  {msg.author?.display_name ?? 'Anonym'}
                </span>
                <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  {formatDate(msg.created_at)}
                </span>
              </div>
              <p className="text-[12px] truncate" style={{ color: 'var(--text-body)' }}>
                {msg.content}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
