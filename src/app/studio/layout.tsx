import AuthGuard from '@/components/auth/AuthGuard';
import StudioSidebar from '@/components/studio/StudioSidebar';
import StudioTopbar from '@/components/studio/StudioTopbar';
import StudioFAB from '@/components/studio/StudioFAB';
import StudioBottomNav from '@/components/studio/StudioBottomNav';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden font-body">
        {/* Desktop Sidebar */}
        <StudioSidebar />

        {/* Main Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Topbar */}
          <StudioTopbar />

          {/* Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-7 pb-20 md:pb-7 studio-scrollbar">
            {children}
          </main>
        </div>

        {/* FAB (Desktop) */}
        <StudioFAB />

        {/* Bottom Nav (Mobile) */}
        <StudioBottomNav />
      </div>
    </AuthGuard>
  );
}
