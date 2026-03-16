'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { fetchPulse } from '@/lib/pulse';
import type { Pulse } from '@/types/pulse';
import PulseCard from '@/components/pulse/PulseCard';
import { Icon } from '@/components/ui/Icon';

export default function PulseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pulseId = params.id as string;

  const [pulse, setPulse] = useState<Pulse | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id);
    });
  }, []);

  useEffect(() => {
    if (!pulseId) return;
    setLoading(true);
    fetchPulse(pulseId)
      .then((data) => {
        setPulse(data);
        setError(false);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [pulseId]);

  const handleDelete = () => {
    router.push('/pulse');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  if (error || !pulse) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <Icon name="message" size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
        <h2
          className="font-heading text-lg italic mb-2"
          style={{ color: 'var(--text-h)' }}
        >
          Beitrag nicht gefunden
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Dieser Beitrag existiert nicht mehr oder ist nicht sichtbar.
        </p>
        <button
          onClick={() => router.push('/pulse')}
          className="px-5 py-2.5 rounded-full text-sm font-label cursor-pointer border-none"
          style={{
            background: 'var(--gold)',
            color: '#fff',
          }}
        >
          Zum Feed
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Zurueck-Link */}
      <button
        onClick={() => router.push('/pulse')}
        className="flex items-center gap-1.5 mb-4 text-sm cursor-pointer border-none bg-transparent"
        style={{ color: 'var(--text-muted)' }}
      >
        <Icon name="arrow-left" size={16} />
        Zurueck zum Feed
      </button>

      {/* Pulse Card mit aufgeklappten Kommentaren */}
      <PulseCard
        pulse={pulse}
        currentUserId={currentUserId}
        onDelete={handleDelete}
      />
    </div>
  );
}
