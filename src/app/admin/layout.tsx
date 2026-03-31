import type { Metadata } from 'next';
import AuthGuard from '@/components/auth/AuthGuard';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Souleya Admin',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen font-body" style={{ background: 'var(--bg)' }}>
        {/* Admin Header */}
        <header style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Enso Logo */}
            <svg viewBox="0 0 100 100" width={28} height={28}>
              <defs>
                <linearGradient id="admin-enso" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A8894E" />
                  <stop offset="100%" stopColor="#D4BC8B" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="36" fill="none" stroke="url(#admin-enso)" strokeWidth="9" strokeLinecap="round" strokeDasharray="196 30" strokeDashoffset="15" />
            </svg>
            <span style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 16,
              fontWeight: 400,
              letterSpacing: '0.36em',
              color: 'var(--text-h)',
            }}>
              Souleya
            </span>
            <span style={{
              fontSize: 9,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: 'var(--gold-text)',
              padding: '2px 10px',
              borderRadius: 8,
              background: 'var(--gold-bg)',
              border: '1px solid var(--glass-border)',
            }}>
              Admin
            </span>
          </div>
          <a href="/pulse" style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            textDecoration: 'none',
          }}>
            ← Zurück zur App
          </a>
        </header>

        {/* Full-width content */}
        <main>
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
