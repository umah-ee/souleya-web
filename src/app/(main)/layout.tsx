import Sidebar from '@/components/layout/Sidebar';
import BottomTabs from '@/components/layout/BottomTabs';
import MobileHeader from '@/components/layout/MobileHeader';
import AuthGuard from '@/components/auth/AuthGuard';
import { UnreadProvider } from '@/components/chat/UnreadContext';
import { createClient } from '@/lib/supabase/server';

const isPreLaunch = process.env.NEXT_PUBLIC_PRE_LAUNCH === 'true';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Admin-Check: Admins sehen keine Pre-Launch-Einschraenkungen
  let showPreLaunch = isPreLaunch;
  if (isPreLaunch) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        if (profile?.is_admin) {
          showPreLaunch = false;
        }
      }
    } catch {
      // Fallback: Pre-Launch bleibt aktiv
    }
  }

  return (
    <AuthGuard>
      <UnreadProvider>
        <div className="min-h-screen font-body">
          {/* Desktop Sidebar */}
          <Sidebar />

          {/* Mobile Header */}
          <MobileHeader />

          {/* Content Area */}
          <main className="md:ml-16 pb-20 md:pb-0 pt-14 md:pt-0">
            <div className="max-w-[640px] mx-auto px-4 py-6">
              {children}
            </div>
          </main>

          {/* Mobile Bottom Tabs */}
          <BottomTabs />

          {/* Pre-Launch: Nav-Overlays (blockieren Klicks + visuelles Blur) */}
          {showPreLaunch && (
            <>
              {/* Sidebar-Overlay (Desktop) */}
              <div
                className="hidden md:block"
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: 64,
                  bottom: 0,
                  zIndex: 50,
                  backdropFilter: 'blur(3px)',
                  background: 'rgba(0,0,0,0.18)',
                  cursor: 'not-allowed',
                }}
              />
              {/* Mobile Header Overlay */}
              <div
                className="md:hidden"
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 56,
                  zIndex: 50,
                  backdropFilter: 'blur(3px)',
                  background: 'rgba(0,0,0,0.18)',
                  cursor: 'not-allowed',
                }}
              />
              {/* Bottom Tabs Overlay (Mobile) */}
              <div
                className="md:hidden"
                style={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 80,
                  zIndex: 50,
                  backdropFilter: 'blur(3px)',
                  background: 'rgba(0,0,0,0.18)',
                  cursor: 'not-allowed',
                }}
              />
              {/* Launch-Banner */}
              <div
                style={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 60,
                  textAlign: 'center',
                  padding: '8px 16px',
                  fontSize: '0.8rem',
                  background: 'var(--gold-bg)',
                  color: 'var(--gold-text)',
                  borderTop: '1px solid var(--gold-border)',
                }}
              >
                Souleya öffnet am 01.07.2026 – dein Profil ist schon bereit 🌿
              </div>
            </>
          )}
        </div>
      </UnreadProvider>
    </AuthGuard>
  );
}
