'use client';

import { useSidebar } from './SidebarContext';

export default function PreLaunchOverlay() {
  const { collapsed } = useSidebar();
  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <>
      {/* Sidebar-Overlay (Desktop) – passt sich der Sidebar-Breite an */}
      <div
        className="hidden md:block"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: sidebarWidth,
          bottom: 0,
          zIndex: 50,
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          background: 'rgba(0,0,0,0.18)',
          cursor: 'not-allowed',
          transition: 'width 0.3s ease',
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
          WebkitBackdropFilter: 'blur(3px)',
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
          WebkitBackdropFilter: 'blur(3px)',
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
        Souleya öffnet im Sommer 2026 – dein Profil ist schon bereit 🌿
      </div>
    </>
  );
}
