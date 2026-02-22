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
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#5A5450' }}>
          <p style={{ fontFamily: 'var(--font-josefin)', fontSize: '0.7rem', letterSpacing: '0.2em' }}>
            WIRD GELADEN …
          </p>
        </div>
      ) : pulses.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 1rem',
          border: '1px dashed rgba(200,169,110,0.15)',
          borderRadius: 16,
        }}>
          <p style={{ color: '#A8894E', fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 300, marginBottom: 8 }}>
            Der Pulse wartet
          </p>
          <p style={{ color: '#5A5450', fontSize: '0.875rem' }}>
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
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                style={{
                  padding: '10px 24px',
                  background: 'none',
                  border: '1px solid rgba(200,169,110,0.3)',
                  borderRadius: 99,
                  color: '#C8A96E',
                  fontFamily: 'var(--font-josefin)', fontSize: '0.7rem',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  cursor: 'pointer',
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
