import Sidebar from '@/components/layout/Sidebar';
import BottomTabs from '@/components/layout/BottomTabs';
import MobileHeader from '@/components/layout/MobileHeader';
import UserMenu from '@/components/layout/UserMenu';
import AuthGuard from '@/components/auth/AuthGuard';
import { UnreadProvider } from '@/components/chat/UnreadContext';
import { NotificationProvider } from '@/components/notifications/NotificationContext';
import { SidebarProvider } from '@/components/layout/SidebarContext';
import DynamicMain from '@/components/layout/DynamicMain';
import PreLaunchOverlay from '@/components/layout/PreLaunchOverlay';
import { createClient } from '@/lib/supabase/server';

const isPreLaunch = process.env.NEXT_PUBLIC_PRE_LAUNCH === 'true';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Admin + Beta-Tester Check: beide sehen keine Pre-Launch-Einschraenkungen
  let showPreLaunch = isPreLaunch;
  if (isPreLaunch) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin, is_beta_tester')
          .eq('id', user.id)
          .single();
        if (profile?.is_admin || profile?.is_beta_tester) {
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
        <NotificationProvider>
        <SidebarProvider>
          <div className="min-h-screen font-body">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Desktop: User Menu (oben rechts) */}
            <UserMenu />

            {/* Mobile Header */}
            <MobileHeader />

            {/* Content Area — dynamischer Margin basierend auf Sidebar-State */}
            <DynamicMain>
              <div className="max-w-[640px] mx-auto px-4 py-6">
                {children}
              </div>
            </DynamicMain>

            {/* Mobile Bottom Tabs */}
            <BottomTabs />

            {/* Pre-Launch: Nav-Overlays (blockieren Klicks + visuelles Blur) */}
            {showPreLaunch && <PreLaunchOverlay />}
          </div>
        </SidebarProvider>
        </NotificationProvider>
      </UnreadProvider>
    </AuthGuard>
  );
}
