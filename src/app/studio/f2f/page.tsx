'use client';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { fetchF2FPricings, fetchF2FBookings, deleteF2FPricing } from '@/lib/studio';
import type { F2FPricing, F2FBooking } from '@/types/studio';

export default function F2FPage() {
  const [pricings, setPricings] = useState<F2FPricing[]>([]);
  const [bookings, setBookings] = useState<F2FBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchF2FPricings().catch(() => []), fetchF2FBookings().then((r) => r.data).catch(() => [])])
      .then(([p, b]) => { setPricings(p); setBookings(b); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>
        Face2Face – 1:1 Sessions
      </h2>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 40 }}>Lade...</p>
      ) : (
        <>
          {/* Pricing Cards */}
          <h3 style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Preismodelle</h3>
          {pricings.length === 0 ? (
            <div className="glass-card rounded-xl p-6 text-center mb-8" style={{ background: 'var(--card-bg)' }}>
              <p style={{ fontSize: 13, color: 'var(--text-sec)', fontStyle: 'italic' }}>Noch keine Preismodelle erstellt.</p>
            </div>
          ) : (
            <div className="grid gap-3 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
              {pricings.map((p) => (
                <div key={p.id} className="glass-card rounded-xl p-5 text-center" style={{ background: 'var(--card-bg)', border: '1.5px solid var(--gold-border-s)' }}>
                  <div style={{ fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                    {p.duration_minutes} Min
                  </div>
                  <div style={{ fontSize: 24, fontStyle: 'italic', color: 'var(--text-h)', marginBottom: 4 }}>
                    {(p.price_cents / 100).toFixed(0)} EUR
                  </div>
                  {p.label && <div style={{ fontSize: 10, color: 'var(--text-sec)' }}>{p.label}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Bookings */}
          <h3 style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Buchungen</h3>
          {bookings.length === 0 ? (
            <div className="glass-card rounded-xl p-6 text-center" style={{ background: 'var(--card-bg)' }}>
              <p style={{ fontSize: 13, color: 'var(--text-sec)', fontStyle: 'italic' }}>Noch keine Buchungen.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {bookings.map((b) => (
                <div key={b.id} className="glass-card rounded-xl p-4 flex items-center gap-3" style={{ background: 'var(--card-bg)' }}>
                  <div className="flex-shrink-0 rounded-full overflow-hidden" style={{ width: 36, height: 36, background: 'var(--avatar-bg)' }}>
                    {b.client?.avatar_url && <img src={b.client.avatar_url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <div style={{ fontSize: 13, color: 'var(--text-h)' }}>{b.client?.display_name ?? 'Teilnehmer'}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-sec)' }}>{(b.amount_cents / 100).toFixed(2)} EUR · {b.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
