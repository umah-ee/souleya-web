'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError('Fehler beim Senden. Bitte versuche es erneut.');
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#18161F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      fontFamily: 'var(--font-quicksand), sans-serif',
    }}>
      <div style={{
        backgroundColor: '#2C2A35',
        border: '1px solid rgba(200,169,110,0.15)',
        borderRadius: '24px',
        padding: '3rem 2.5rem',
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center',
      }}>
        {/* Enso Logo */}
        <div style={{ marginBottom: '1.5rem' }}>
          <svg width="64" height="64" viewBox="0 0 100 100" style={{ margin: '0 auto' }}>
            <defs>
              <linearGradient id="enso-login" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A8894E" />
                <stop offset="100%" stopColor="#D4BC8B" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="36"
              fill="none" stroke="url(#enso-login)" strokeWidth="8"
              strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15" />
          </svg>
        </div>

        {/* Wordmark */}
        <h1 style={{
          fontFamily: 'var(--font-cormorant), Georgia, serif',
          fontSize: '2rem',
          fontWeight: 300,
          letterSpacing: '0.36em',
          textTransform: 'uppercase',
          color: '#C8A96E',
          marginBottom: '0.5rem',
        }}>
          Souleya
        </h1>

        {!sent ? (
          <>
            <p style={{
              fontFamily: 'var(--font-josefin), sans-serif',
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#a09a90',
              marginBottom: '2rem',
            }}>
              Dein Zugang
            </p>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Deine E-Mail-Adresse"
                required
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(200,169,110,0.2)',
                  borderRadius: '9999px',
                  color: '#F0EDE8',
                  fontSize: '0.875rem',
                  textAlign: 'center',
                  fontFamily: 'var(--font-quicksand), sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#C8A96E';
                  e.target.style.boxShadow = '0 0 20px rgba(200,169,110,0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(200,169,110,0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />

              {error && (
                <p style={{ color: '#E63946', fontSize: '0.8rem' }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.75rem 2rem',
                  background: loading ? 'rgba(200,169,110,0.3)' : 'linear-gradient(135deg, #A8894E, #D4BC8B)',
                  border: 'none',
                  borderRadius: '9999px',
                  color: '#2C2A35',
                  fontFamily: 'var(--font-josefin), sans-serif',
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: loading ? 'none' : '0 0 30px rgba(200,169,110,0.3)',
                }}
              >
                {loading ? '...' : 'Magic Link senden'}
              </button>
            </form>

            <p style={{
              marginTop: '1.5rem',
              fontSize: '0.75rem',
              color: '#5A5450',
            }}>
              Du erhältst einen einmaligen Login-Link per E-Mail.
              <br />Kein Passwort nötig.
            </p>
          </>
        ) : (
          /* Success State */
          <>
            <div style={{
              width: '48px', height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(82,183,136,0.15)',
              border: '1px solid rgba(82,183,136,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '1.25rem',
            }}>
              ✓
            </div>
            <p style={{
              fontFamily: 'var(--font-josefin), sans-serif',
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#52B788',
              marginBottom: '1rem',
            }}>
              Magic Link gesendet
            </p>
            <p style={{ color: '#a09a90', fontSize: '0.875rem', lineHeight: 1.8 }}>
              Prüfe dein Postfach für <strong style={{ color: '#D4BC8B' }}>{email}</strong>.
              <br />Klicke den Link um dich anzumelden.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              style={{
                marginTop: '1.5rem',
                background: 'none',
                border: '1px solid rgba(200,169,110,0.3)',
                borderRadius: '9999px',
                padding: '0.5rem 1.5rem',
                color: '#C8A96E',
                fontFamily: 'var(--font-josefin), sans-serif',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Andere E-Mail
            </button>
          </>
        )}
      </div>
    </main>
  );
}
