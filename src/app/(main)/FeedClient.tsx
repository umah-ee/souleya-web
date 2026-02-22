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
        <h1 className="font-heading text-2xl font-light text-gold-1 tracking-wide">
          Pulse
        </h1>
        <p className="text-sm text-[#5A5450] font-body mt-1">
          Impulse aus der Community
        </p>
      </div>

      {/* Create Form */}
      {user && <CreatePulseForm onCreated={handleCreated} />}

      {/* Pulses */}
      {loading ? (
        <div className="text-center py-12 text-[#5A5450]">
          <p className="font-label text-[0.7rem] tracking-[0.2em]">
            WIRD GELADEN …
          </p>
        </div>
      ) : pulses.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-gold-1/15 rounded-2xl">
          <p className="text-gold-3 font-heading text-2xl font-light mb-2">
            Der Pulse wartet
          </p>
          <p className="text-[#5A5450] text-sm">
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
                className="px-6 py-2.5 bg-transparent border border-gold-1/30 rounded-full text-gold-1 font-label text-[0.7rem] tracking-[0.1em] uppercase cursor-pointer hover:border-gold-1/50 transition-colors duration-200"
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
