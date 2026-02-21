'use client';

import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Props {
  user: User;
}

export default function DashboardClient({ user }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#18161F',
      padding: '2rem 1.5rem',
      fontFamily: 'var(--font-quicksand), sans-serif',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '3rem', paddingBottom: '1.5rem',
          borderBottom: '1px solid rgba(200,169,110,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <svg width="32" height="32" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="enso-dash" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A8894E" />
                  <stop offset="100%" stopColor="#D4BC8B" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="36" fill="none" stroke="url(#enso-dash)"
                strokeWidth="9" strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15" />
            </svg>
            <span style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: '1.3rem', fontWeight: 400,
              letterSpacing: '0.36em', textTransform: 'uppercase',
              color: '#C8A96E',
            }}>Souleya</span>
          </div>

          <button onClick={handleLogout} style={{
            fontFamily: 'var(--font-josefin), sans-serif',
            fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase',
            color: '#5A5450', background: 'none', border: 'none', cursor: 'pointer',
          }}>
            Abmelden
          </button>
        </div>

        {/* Welcome */}
        <div style={{
          backgroundColor: '#2C2A35',
          border: '1px solid rgba(200,169,110,0.1)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '1.5rem',
        }}>
          <p style={{
            fontFamily: 'var(--font-josefin), sans-serif',
            fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: '#A8894E', marginBottom: '0.5rem',
          }}>
            Willkommen zurück
          </p>
          <h2 style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: '2rem', fontWeight: 300,
            color: '#D4BC8B', letterSpacing: '0.1em',
          }}>
            {user.email}
          </h2>
          <p style={{ color: '#5A5450', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Profile-Features folgen in Kürze.
          </p>
        </div>
      </div>
    </main>
  );
}
