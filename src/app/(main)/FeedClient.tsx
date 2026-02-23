'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { fetchFeed } from '@/lib/pulse';
import type { Pulse } from '@/types/pulse';
import PulseCard from '@/components/pulse/PulseCard';
import CreatePulseForm from '@/components/pulse/CreatePulseForm';

interface Props {
  user: User | null;
}

export default function FeedClient({ user }: Props) {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadFeed = useCallback(async (pageNum: number, replace: boolean) => {
    try {
      const result = await fetchFeed(pageNum, 20);
      setPulses((prev) => replace ? result.pulses : [...prev, ...result.pulses]);
      setHasMore(result.hasMore);
    } catch (e) {
      console.error(e);
    }
  }, [user?.id]);

  useEffect(() => {
    setLoading(true);
    loadFeed(1, true).finally(() => setLoading(false));
  }, [loadFeed]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    await loadFeed(nextPage, false);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const handleCreated = (pulse: Pulse) => {
    setPulses((prev) => [pulse, ...prev]);
  };

  const handleDelete = (id: string) => {
    setPulses((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <>
      {/* Desktop Header */}
      <div className="hidden md:block mb-6">
        <h1 className="font-heading text-2xl" style={{ color: 'var(--gold-text)' }}>
          Pulse
        </h1>
        <p className="text-sm font-body mt-1" style={{ color: 'var(--text-muted)' }}>
          Impulse aus der Community
        </p>
      </div>

      {/* Create Form */}
      {user && <CreatePulseForm onCreated={handleCreated} />}

      {/* Pulses */}
      {loading ? (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          <p className="font-label text-[0.7rem] tracking-[0.2em]">
            WIRD GELADEN …
          </p>
        </div>
      ) : pulses.length === 0 ? (
        <div
          className="text-center py-16 px-4 rounded-2xl"
          style={{ border: '1px dashed var(--gold-border-s)' }}
        >
          <p className="font-heading text-2xl mb-2" style={{ color: 'var(--gold)' }}>
            Der Pulse wartet
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Teile als erstes deinen Impuls mit der Community.
          </p>
        </div>
      ) : (
        <>
          {pulses.map((pulse) => (
            <PulseCard
              key={pulse.id}
              pulse={pulse}
              currentUserId={user?.id}
              onDelete={handleDelete}
            />
          ))}
          {hasMore && (
            <div className="text-center py-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 bg-transparent rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase cursor-pointer transition-colors duration-200"
                style={{
                  border: '1px solid var(--gold-border-s)',
                  color: 'var(--gold-text)',
                }}
              >
                {loadingMore ? '…' : 'Mehr laden'}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
