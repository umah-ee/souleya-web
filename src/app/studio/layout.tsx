'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import StudioSidebar from '@/components/studio/StudioSidebar';
import StudioTopbar from '@/components/studio/StudioTopbar';
import StudioFAB from '@/components/studio/StudioFAB';
import StudioBottomNav from '@/components/studio/StudioBottomNav';
import { useCurrentProfile } from '@/hooks/useCurrentProfile';

function StudioGuard({ children }: { children: React.ReactNode }) {
  const { profile, isLoading } = useCurrentProfile();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!profile || (profile.soul_level < 4)) {
      router.push('/pulse');
    } else {
      setAllowed(true);
    }
  }, [profile, isLoading, router]);

  if (!allowed) return null;
  return <>{children}</>;
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <StudioGuard>
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
      </StudioGuard>
    </AuthGuard>
  );
}
