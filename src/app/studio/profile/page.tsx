'use client';
import { Icon } from '@/components/ui/Icon';

export default function StudioProfilePage() {
  return (
    <div>
      <h2 style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>Profil & Branding</h2>
      <div className="glass-card rounded-2xl p-8 text-center" style={{ background: 'var(--card-bg)' }}>
        <Icon name="id-badge" size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
        <p style={{ fontSize: 16, fontStyle: 'italic', color: 'var(--text-h)', marginBottom: 8 }}>Bald verfuegbar</p>
        <p style={{ fontSize: 12, color: 'var(--text-sec)' }}>Hier kannst du dein Mentor-Profil, Bio, Spezialisierungen und dein Branding bearbeiten.</p>
      </div>
    </div>
  );
}
