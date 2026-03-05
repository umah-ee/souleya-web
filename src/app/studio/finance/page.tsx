'use client';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { fetchFinanceOverview, fetchCoupons, fetchPayouts, toggleCoupon, deleteCoupon } from '@/lib/studio';
import type { FinanceOverview, Coupon, MentorPayout } from '@/types/studio';

export default function FinancePage() {
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [payouts, setPayouts] = useState<MentorPayout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchFinanceOverview().catch(() => null),
      fetchCoupons().catch(() => []),
      fetchPayouts().then((r) => r.data).catch(() => []),
    ]).then(([o, c, p]) => {
      setOverview(o);
      setCoupons(c);
      setPayouts(p);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>Finanzen</h2>
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 40 }}>Lade Finanzdaten...</p>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            {[
              { label: 'Gesamtumsatz', value: overview ? `${(overview.total_revenue_cents / 100).toFixed(2).replace('.', ',')} EUR` : '—' },
              { label: 'Dieser Monat', value: overview ? `${(overview.this_month_cents / 100).toFixed(2).replace('.', ',')} EUR` : '—' },
              { label: 'Ausstehend', value: overview ? `${(overview.pending_payout_cents / 100).toFixed(2).replace('.', ',')} EUR` : '—' },
              { label: 'Enrollments', value: overview?.total_enrollments ?? 0 },
            ].map((item) => (
              <div key={item.label} className="glass-card rounded-lg p-4" style={{ background: 'var(--card-bg)' }}>
                <div style={{ fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>{item.label}</div>
                <div style={{ fontSize: 22, fontStyle: 'italic', color: 'var(--text-h)' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Coupons */}
          <h3 style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Coupons</h3>
          {coupons.length === 0 ? (
            <div className="glass-card rounded-lg p-6 text-center mb-8" style={{ background: 'var(--card-bg)' }}>
              <p style={{ fontSize: 13, color: 'var(--text-sec)', fontStyle: 'italic' }}>Keine Coupons.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mb-8">
              {coupons.map((c) => (
                <div key={c.id} className="glass-card rounded-lg p-4 flex items-center gap-4" style={{ background: 'var(--card-bg)' }}>
                  <span style={{ fontSize: 14, fontWeight: 500, fontFamily: 'monospace', color: 'var(--gold-text)' }}>{c.code}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-sec)' }}>
                    {c.discount_percent ? `${c.discount_percent}%` : `${((c.discount_amount_cents ?? 0) / 100).toFixed(0)} EUR`}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.used_count}/{c.max_uses ?? '\u221E'}</span>
                  <span className="ml-auto" style={{ fontSize: 9, padding: '2px 8px', borderRadius: 6, background: c.is_active ? 'var(--success-bg)' : 'var(--danger-bg)', color: c.is_active ? 'var(--success)' : 'var(--danger)' }}>
                    {c.is_active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Payouts */}
          <h3 style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Auszahlungen</h3>
          {payouts.length === 0 ? (
            <div className="glass-card rounded-lg p-6 text-center" style={{ background: 'var(--card-bg)' }}>
              <p style={{ fontSize: 13, color: 'var(--text-sec)', fontStyle: 'italic' }}>Noch keine Auszahlungen. Stripe Connect wird spaeter eingerichtet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {payouts.map((p) => (
                <div key={p.id} className="glass-card rounded-lg p-4 flex items-center gap-4" style={{ background: 'var(--card-bg)' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-h)' }}>{(p.amount_cents / 100).toFixed(2)} {p.currency}</div>
                  <span style={{ fontSize: 10, color: 'var(--text-sec)' }}>{p.status}</span>
                  <span className="ml-auto" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {new Date(p.period_start).toLocaleDateString('de-DE')} – {new Date(p.period_end).toLocaleDateString('de-DE')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
