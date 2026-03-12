'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProfile } from '@/lib/profile';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile()
      .then((profile) => {
        if (profile.is_admin) {
          setAllowed(true);
        } else {
          router.replace('/pulse');
        }
      })
      .catch(() => {
        router.replace('/pulse');
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{
            borderColor: 'var(--glass-border)',
            borderTopColor: 'var(--gold)',
          }}
        />
      </div>
    );
  }

  if (!allowed) return null;

  return <>{children}</>;
}
