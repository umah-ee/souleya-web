import Sidebar from '@/components/layout/Sidebar';
import BottomTabs from '@/components/layout/BottomTabs';
import MobileHeader from '@/components/layout/MobileHeader';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
    </div>
  );
}
