'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { fetchFeed } from '@/lib/pulse';
import type { Pulse } from '@/types/pulse';
import PulseCard from '@/components/pulse/PulseCard';
import CreatePulseForm from '@/components/pulse/CreatePulseForm';
import { useRouter } from 'next/navigation';

interface Props {
  user: User;
}

export default function DashboardClient({ user }: Props) {
  const router = useRouter();
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadFeed = useCallback(async (pageNum: number, replace: boolean) => {
    try {
      const result = await fetchFeed(pageNum, 20, user.id);
      setPulses((prev) => replace ? result.pulses : [...prev, ...result.pulses]);
      setHasMore(result.hasMore);
    } catch (e) {
      console.error(e);
    }
  }, [user.id]);

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

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#18161F', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        backgroundColor: 'rgba(24,22,31,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(200,169,110,0.1)',
        padding: '0.875rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="hdr" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A8894E" />
                <stop offset="100%" stopColor="#D4BC8B" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="36" fill="none" stroke="url(#hdr)"
              strokeWidth="9" strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15" />
          </svg>
          <span style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 400,
            letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C8A96E',
          }}>Souleya</span>
        </div>
        <button onClick={handleLogout} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-label)', fontSize: '0.65rem',
          letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5A5450',
        }}>Abmelden</button>
      </header>

      {/* Feed */}
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '1.5rem 1rem' }}>
        {/* Create Form */}
        <CreatePulseForm onCreated={handleCreated} />

        {/* Pulses */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#5A5450' }}>
            <p style={{ fontFamily: 'var(--font-label)', fontSize: '0.7rem', letterSpacing: '0.2em' }}>
              WIRD GELADEN …
            </p>
          </div>
        ) : pulses.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '4rem 1rem',
            border: '1px dashed rgba(200,169,110,0.15)',
            borderRadius: 16,
          }}>
            <p style={{ color: '#A8894E', fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 300, marginBottom: 8 }}>
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
                currentUserId={user.id}
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
                    fontFamily: 'var(--font-label)', fontSize: '0.7rem',
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
      </main>
    </div>
  );
}
