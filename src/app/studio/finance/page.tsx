'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { fetchFinanceOverview, fetchCoupons, fetchPayouts, toggleCoupon, deleteCoupon, createCoupon } from '@/lib/studio';
import type { FinanceOverview, Coupon, MentorPayout } from '@/types/studio';

export default function FinancePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [payouts, setPayouts] = useState<MentorPayout[]>([]);
  const [loading, setLoading] = useState(true);

  // Create coupon form state
  const [creating, setCreating] = useState(searchParams.get('coupon') === '1');
  const [newCode, setNewCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [newDiscount, setNewDiscount] = useState('');
  const [newMaxUses, setNewMaxUses] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [o, c, p] = await Promise.all([
      fetchFinanceOverview().catch(() => null),
      fetchCoupons().catch(() => []),
      fetchPayouts().then((r) => r.data).catch(() => []),
    ]);
    setOverview(o);
    setCoupons(c);
    setPayouts(p);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (searchParams.get('coupon') === '1') setCreating(true);
  }, [searchParams]);

  const handleToggle = async (id: string) => {
    try {
      const updated = await toggleCoupon(id);
      setCoupons((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Coupon loeschen?')) return;
    try {
      await deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch {}
  };

  const handleCreate = async () => {
    if (!newCode.trim() || !newDiscount.trim()) return;
    setSaving(true);
    try {
      const data: any = { code: newCode.trim().toUpperCase() };
      if (discountType === 'percent') {
        data.discount_percent = parseInt(newDiscount);
      } else {
        data.discount_amount_cents = Math.round(parseFloat(newDiscount) * 100);
      }
      if (newMaxUses) data.max_uses = parseInt(newMaxUses);
      await createCoupon(data);
      setCreating(false);
      setNewCode('');
      setNewDiscount('');
      setNewMaxUses('');
      router.replace('/studio/finance');
      const updated = await fetchCoupons().catch(() => []);
      setCoupons(updated);
    } catch {
      alert('Coupon konnte nicht erstellt werden.');
    }
    setSaving(false);
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--glass)',
    border: '1px solid var(--gold-border-s)',
    color: 'var(--text-h)',
    borderRadius: 8,
  };

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
              <div key={item.label} className="glass-card rounded-[8px] p-4" style={{ background: 'var(--card-bg)' }}>
                <div style={{ fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>{item.label}</div>
                <div style={{ fontSize: 22, fontStyle: 'italic', color: 'var(--text-h)' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Coupons */}
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Coupons</h3>
            {!creating && (
              <button
                onClick={() => setCreating(true)}
                className="border-none cursor-pointer transition-all duration-200 flex items-center gap-1.5"
                style={{
                  padding: '6px 14px', borderRadius: 9999, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase',
                  background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                  color: 'var(--text-on-gold)',
                }}
              >
                <Icon name="plus" size={12} />
                Neuer Coupon
              </button>
            )}
          </div>

          {/* Create Coupon Form */}
          {creating && (
            <div className="glass-card rounded-[8px] p-5 mb-6" style={{ background: 'var(--card-bg)', border: '1.5px solid var(--gold-border)' }}>
              <h3 style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold-text)', marginBottom: 12 }}>
                Neuen Coupon erstellen
              </h3>
              <div className="flex flex-col gap-3">
                <input
                  autoFocus
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="Coupon-Code (z.B. WELCOME20)"
                  className="w-full py-2.5 px-4 text-sm font-body outline-none"
                  style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '2px' }}
                />
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, display: 'block', letterSpacing: '1px', textTransform: 'uppercase' }}>Rabatt-Typ</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDiscountType('percent')}
                        className="border-none cursor-pointer transition-all duration-200 flex-1"
                        style={{
                          padding: '6px 14px', borderRadius: 8, fontSize: 10, letterSpacing: '1px',
                          background: discountType === 'percent' ? 'var(--gold-bg)' : 'var(--glass)',
                          color: discountType === 'percent' ? 'var(--gold-text)' : 'var(--text-muted)',
                          border: discountType === 'percent' ? '1px solid var(--gold-border-s)' : '1px solid var(--glass-border)',
                        }}
                      >
                        Prozent (%)
                      </button>
                      <button
                        onClick={() => setDiscountType('fixed')}
                        className="border-none cursor-pointer transition-all duration-200 flex-1"
                        style={{
                          padding: '6px 14px', borderRadius: 8, fontSize: 10, letterSpacing: '1px',
                          background: discountType === 'fixed' ? 'var(--gold-bg)' : 'var(--glass)',
                          color: discountType === 'fixed' ? 'var(--gold-text)' : 'var(--text-muted)',
                          border: discountType === 'fixed' ? '1px solid var(--gold-border-s)' : '1px solid var(--glass-border)',
                        }}
                      >
                        Festbetrag (EUR)
                      </button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, display: 'block', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      {discountType === 'percent' ? 'Rabatt in %' : 'Rabatt in EUR'}
                    </label>
                    <input
                      type="number"
                      value={newDiscount}
                      onChange={(e) => setNewDiscount(e.target.value)}
                      placeholder={discountType === 'percent' ? '20' : '10.00'}
                      className="w-full py-2.5 px-4 text-sm font-body outline-none"
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, display: 'block', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Max. Nutzungen (leer = unbegrenzt)
                  </label>
                  <input
                    type="number"
                    value={newMaxUses}
                    onChange={(e) => setNewMaxUses(e.target.value)}
                    placeholder="z.B. 100"
                    className="w-full py-2.5 px-4 text-sm font-body outline-none"
                    style={inputStyle}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreate}
                    disabled={saving || !newCode.trim() || !newDiscount.trim()}
                    className="border-none cursor-pointer transition-all duration-200"
                    style={{
                      padding: '10px 24px', borderRadius: 9999, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase',
                      background: newCode.trim() && newDiscount.trim() ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))' : 'var(--glass)',
                      color: newCode.trim() && newDiscount.trim() ? 'var(--text-on-gold)' : 'var(--text-muted)',
                    }}
                  >
                    {saving ? 'Wird erstellt...' : 'Coupon erstellen'}
                  </button>
                  <button
                    onClick={() => { setCreating(false); setNewCode(''); setNewDiscount(''); setNewMaxUses(''); router.replace('/studio/finance'); }}
                    className="border-none cursor-pointer"
                    style={{ background: 'none', color: 'var(--text-muted)', fontSize: 11, padding: '10px 12px' }}
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          )}

          {coupons.length === 0 && !creating ? (
            <div className="glass-card rounded-[8px] p-6 text-center mb-8" style={{ background: 'var(--card-bg)' }}>
              <p style={{ fontSize: 13, color: 'var(--text-sec)', fontStyle: 'italic' }}>Keine Coupons.</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Nutze den + Button um einen Coupon zu erstellen.</p>
            </div>
          ) : coupons.length > 0 ? (
            <div className="flex flex-col gap-2 mb-8">
              {coupons.map((c) => (
                <div key={c.id} className="glass-card rounded-[8px] p-4 flex items-center gap-4" style={{ background: 'var(--card-bg)' }}>
                  <span style={{ fontSize: 14, fontWeight: 500, fontFamily: 'monospace', color: 'var(--gold-text)' }}>{c.code}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-sec)' }}>
                    {c.discount_percent ? `${c.discount_percent}%` : `${((c.discount_amount_cents ?? 0) / 100).toFixed(0)} EUR`}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.used_count}/{c.max_uses ?? '\u221E'}</span>
                  <button
                    onClick={() => handleToggle(c.id)}
                    className="ml-auto border-none cursor-pointer"
                    style={{
                      fontSize: 9, padding: '2px 8px', borderRadius: 6,
                      background: c.is_active ? 'var(--success-bg)' : 'var(--danger-bg)',
                      color: c.is_active ? 'var(--success)' : 'var(--danger)',
                    }}
                  >
                    {c.is_active ? 'Aktiv' : 'Inaktiv'}
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="border-none cursor-pointer"
                    style={{ background: 'none', padding: 4 }}
                  >
                    <Icon name="trash" size={14} style={{ color: 'var(--danger)' }} />
                  </button>
                </div>
              ))}
            </div>
          ) : <div className="mb-8" />}

          {/* Payouts */}
          <h3 style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Auszahlungen</h3>
          {payouts.length === 0 ? (
            <div className="glass-card rounded-[8px] p-6 text-center" style={{ background: 'var(--card-bg)' }}>
              <p style={{ fontSize: 13, color: 'var(--text-sec)', fontStyle: 'italic' }}>Noch keine Auszahlungen. Stripe Connect wird spaeter eingerichtet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {payouts.map((p) => (
                <div key={p.id} className="glass-card rounded-[8px] p-4 flex items-center gap-4" style={{ background: 'var(--card-bg)' }}>
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
