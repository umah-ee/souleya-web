'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function AuthDebugPage() {
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [sessionInfo, setSessionInfo] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const supabase = createClient();

      // 1. Session-Status pruefen
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();

      setSessionInfo({
        hasUser: !!user,
        userError: userError?.message ?? null,
        userId: user?.id?.slice(0, 8) + '...',
        userEmail: user?.email,
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        tokenLength: session?.access_token?.length ?? 0,
        expiresAt: session?.expires_at
          ? new Date(session.expires_at * 1000).toISOString()
          : null,
      });

      // 2. Debug-Endpoint aufrufen
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      try {
        const res = await fetch(`${API_URL}/auth/debug`, { headers });
        const data = await res.json();
        setResult(data);
      } catch (e) {
        setResult({ fetchError: (e as Error).message });
      }

      setLoading(false);
    };

    run();
  }, []);

  return (
    <main style={{ background: '#1E1C26', color: '#F0EDE8', minHeight: '100vh', padding: 32, fontFamily: 'monospace' }}>
      <h1 style={{ color: '#C8A96E', marginBottom: 24 }}>Auth Debug</h1>

      {loading ? (
        <p>Lade...</p>
      ) : (
        <>
          <h2 style={{ color: '#C8A96E', marginTop: 24 }}>Client Session</h2>
          <pre style={{ background: '#2C2A35', padding: 16, borderRadius: 8, overflow: 'auto', fontSize: 13 }}>
            {JSON.stringify(sessionInfo, null, 2)}
          </pre>

          <h2 style={{ color: '#C8A96E', marginTop: 24 }}>API /auth/debug Response</h2>
          <pre style={{ background: '#2C2A35', padding: 16, borderRadius: 8, overflow: 'auto', fontSize: 13 }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </>
      )}
    </main>
  );
}
