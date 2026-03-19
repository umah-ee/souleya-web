'use client';
import { Icon } from '@/components/ui/Icon';

export default function AnalyticsPage() {
  return (
    <div>
      <h2 style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>Analytics</h2>
      <div className="glass-card rounded-[8px] p-8 text-center" style={{ background: 'var(--card-bg)' }}>
        <Icon name="chart-line" size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
        <p style={{ fontSize: 16, fontStyle: 'italic', color: 'var(--text-h)', marginBottom: 8 }}>Bald verfuegbar</p>
        <p style={{ fontSize: 12, color: 'var(--text-sec)' }}>Detaillierte Analytics mit Umsatzdiagrammen, Teilnehmer-Trends und Engagement-Metriken kommen in Kuerze.</p>
      </div>
    </div>
  );
}
