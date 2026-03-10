'use client';

import { useSidebar } from './SidebarContext';

export default function DynamicMain({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <>
      <style>{`@media(min-width:768px){.dynamic-main{margin-left:${sidebarWidth}px}}`}</style>
      <main className="dynamic-main pb-20 md:pb-0 pt-14 md:pt-0" style={{ transition: 'margin-left 0.3s' }}>
        {children}
      </main>
    </>
  );
}
