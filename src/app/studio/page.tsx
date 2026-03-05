'use client';

import { useEffect, useState } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';
import { fetchDashboardKPIs, fetchRecentActivity } from '@/lib/studio';
import type { StudioDashboardKPIs } from '@/types/studio';

interface KPICard {
  label: string;
  key: keyof StudioDashboardKPIs;
  icon: IconName;
  format?: 'number' | 'currency' | 'rating';
}

const KPI_CARDS: KPICard[] = [
  { label: 'Teilnehmer', key: 'total_students', icon: 'users-group', format: 'number' },
  { label: 'Aktive Kurse', key: 'active_courses', icon: 'school', format: 'number' },
  { label: 'Umsatz gesamt', key: 'total_revenue_cents', icon: 'wallet', format: 'currency' },
  { label: 'Bewertung', key: 'avg_rating', icon: 'star', format: 'rating' },
];

function formatValue(value: number, format?: string): string {
  switch (format) {
    case 'currency':
      return `${(value / 100).toFixed(2).replace('.', ',')} EUR`;
    case 'rating':
      return value > 0 ? `${value.toFixed(1)} / 5.0` : '—';
    default:
      return String(value);
  }
}

export default function StudioDashboard() {
  const [kpis, setKpis] = useState<StudioDashboardKPIs | null>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchDashboardKPIs().catch(() => null),
      fetchRecentActivity(5).catch(() => []),
    ]).then(([k, a]) => {
      setKpis(k);
      setActivity(Array.isArray(a) ? a : []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Lade Dashboard...</span>
      </div>
    );
  }

  return (
    <div>
      {/* KPI Cards */}
      <div
        className="grid gap-4 mb-6"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
      >
        {KPI_CARDS.map((card) => (
          <div
            key={card.key}
            className="glass-card rounded-[8px] p-5 transition-transform duration-200 hover:-translate-y-0.5"
            style={{ background: 'var(--card-bg)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 36, height: 36,
                  borderRadius: 8,
                  background: 'var(--gold-bg)',
                }}
              >
                <Icon name={card.icon} size={18} style={{ color: 'var(--gold)' }} />
              </div>
              <span
                style={{
                  fontSize: 9,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}
              >
                {card.label}
              </span>
            </div>
            <div
              className="italic"
              style={{ fontSize: 28, color: 'var(--text-h)' }}
            >
              {kpis ? formatValue(kpis[card.key], card.format) : '—'}
            </div>
          </div>
        ))}
      </div>

      {/* Zusatz-KPIs */}
      <div
        className="grid gap-4 mb-8"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}
      >
        {[
          { label: 'Neue Enrollments (Monat)', value: kpis?.new_enrollments_this_month ?? 0, icon: 'plus' as IconName },
          { label: 'Kommende Sessions', value: kpis?.upcoming_sessions ?? 0, icon: 'calendar-event' as IconName },
          { label: 'Offene Bewertungen', value: kpis?.pending_reviews ?? 0, icon: 'star' as IconName },
          { label: 'Ungelesene Nachrichten', value: kpis?.unread_messages ?? 0, icon: 'mail' as IconName },
        ].map((item) => (
          <div
            key={item.label}
            className="glass-card rounded-[8px] p-4"
            style={{ background: 'var(--card-bg)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon name={item.icon} size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {item.label}
              </span>
            </div>
            <div className="italic" style={{ fontSize: 20, color: 'var(--text-h)' }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Letzte Aktivitaeten */}
      <div className="glass-card rounded-[8px] p-5" style={{ background: 'var(--card-bg)' }}>
        <h3
          style={{
            fontSize: 11,
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: 16,
          }}
        >
          Letzte Aktivitaeten
        </h3>
        {activity.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-sec)', fontStyle: 'italic' }}>
            Noch keine Aktivitaeten.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {activity.map((item: any, i: number) => (
              <div
                key={i}
                className="flex items-center gap-3 py-2"
                style={{ borderBottom: i < activity.length - 1 ? '1px solid var(--divider-l)' : 'none' }}
              >
                <div
                  className="flex-shrink-0 rounded-full overflow-hidden"
                  style={{
                    width: 32, height: 32,
                    background: 'var(--avatar-bg)',
                  }}
                >
                  {item.user?.avatar_url && (
                    <img src={item.user.avatar_url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span style={{ fontSize: 12, color: 'var(--text-h)' }}>
                    {item.user?.display_name ?? 'Jemand'}
                  </span>{' '}
                  <span style={{ fontSize: 12, color: 'var(--text-sec)' }}>
                    hat sich fuer {item.course?.title ?? 'einen Kurs'} angemeldet
                  </span>
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                  {item.date ? new Date(item.date).toLocaleDateString('de-DE') : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
