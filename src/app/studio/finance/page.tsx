'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import {
  fetchFinanceOverview, fetchCoupons, fetchPayouts, toggleCoupon, deleteCoupon, createCoupon,
  fetchF2FBookings, fetchCourses, fetchEnrollments,
} from '@/lib/studio';
import type { FinanceOverview, Coupon, MentorPayout, F2FBooking, Course, Enrollment } from '@/types/studio';

// ── Transaktion (unified) ─────────────────────────────────
interface Transaction {
  id: string;
  type: 'f2f' | 'course';
  label: string;
  clientName: string;
  clientAvatar: string | null;
  amount: number; // cents
  date: string;
  status: 'paid' | 'pending' | 'refunded' | 'free';
  paidOut: boolean;
}

type TxFilter = 'all' | 'f2f' | 'course' | 'pending' | 'paid';

export default function FinancePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [payouts, setPayouts] = useState<MentorPayout[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [txFilter, setTxFilter] = useState<TxFilter>('all');
  const [showCoupons, setShowCoupons] = useState(false);

  // Create coupon form
  const [creating, setCreating] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [newDiscount, setNewDiscount] = useState('');
  const [newMaxUses, setNewMaxUses] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [o, c, p, bRes, coursesRes] = await Promise.all([
        fetchFinanceOverview().catch(() => null),
        fetchCoupons().catch(() => []),
        fetchPayouts().then(r => (r as unknown as { data: MentorPayout[] }).data ?? []).catch(() => []),
        fetchF2FBookings({ limit: 100 }).catch(() => ({ data: [] })),
        fetchCourses({ limit: 100 }).catch(() => ({ data: [] })),
      ]);

      setOverview(o);
      setCoupons(c);
      setPayouts(p);

      const bookings: F2FBooking[] = (bRes as unknown as { data: F2FBooking[] }).data ?? [];
      const courses: Course[] = (coursesRes as unknown as { data: Course[] }).data ?? [];

      // Transaktionen aus F2F Bookings
      const txList: Transaction[] = [];
      for (const b of bookings) {
        txList.push({
          id: b.id,
          type: 'f2f',
          label: `F2F Session · ${b.slot?.duration_minutes ?? '?'} Min`,
          clientName: b.client?.display_name ?? b.client?.username ?? 'User',
          clientAvatar: b.client?.avatar_url ?? null,
          amount: b.amount_cents,
          date: b.created_at,
          status: b.amount_cents === 0 ? 'free' : b.status === 'completed' ? 'paid' : 'pending',
          paidOut: false, // TODO: mit Payouts abgleichen
        });
      }

      // Transaktionen aus Kurs-Enrollments
      for (const course of courses) {
        if (course.price_cents <= 0) continue;
        try {
          const eRes = await fetchEnrollments(course.id, { limit: 100 });
          const enrollments: Enrollment[] = (eRes as unknown as { data: Enrollment[] }).data ?? [];
          for (const e of enrollments) {
            txList.push({
              id: e.id,
              type: 'course',
              label: course.title,
              clientName: e.user?.display_name ?? e.user?.username ?? 'User',
              clientAvatar: e.user?.avatar_url ?? null,
              amount: course.price_cents,
              date: e.enrolled_at,
              status: 'paid',
              paidOut: false,
            });
          }
        } catch { /* ignore */ }
      }

      txList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(txList);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Coupon Handlers ─────────────────────────────────────
  const handleToggle = async (id: string) => {
    const updated = await toggleCoupon(id).catch(() => null);
    if (updated) setCoupons(prev => prev.map(c => c.id === id ? updated : c));
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Coupon loeschen?')) return;
    await deleteCoupon(id).catch(() => {});
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  const handleCreate = async () => {
    if (!newCode.trim() || !newDiscount.trim()) return;
    setSaving(true);
    try {
      const data: Record<string, unknown> = { code: newCode.trim().toUpperCase() };
      if (discountType === 'percent') data.discount_percent = parseInt(newDiscount);
      else data.discount_amount_cents = Math.round(parseFloat(newDiscount) * 100);
      if (newMaxUses) data.max_uses = parseInt(newMaxUses);
      await createCoupon(data as any);
      setCreating(false);
      setNewCode('');
      setNewDiscount('');
      setNewMaxUses('');
      const updated = await fetchCoupons().catch(() => []);
      setCoupons(updated);
    } catch { /* ignore */ }
    setSaving(false);
  };

  // ── Filter ──────────────────────────────────────────────
  const filteredTx = useMemo(() => {
    switch (txFilter) {
      case 'f2f': return transactions.filter(t => t.type === 'f2f');
      case 'course': return transactions.filter(t => t.type === 'course');
      case 'pending': return transactions.filter(t => t.status === 'pending');
      case 'paid': return transactions.filter(t => t.status === 'paid');
      default: return transactions;
    }
  }, [transactions, txFilter]);

  const totalRevenue = transactions.filter(t => t.status === 'paid').reduce((s, t) => s + t.amount, 0);

  const cardBg = 'var(--card-bg)';
  const border = 'var(--gold-border-s)';
  const inputStyle: React.CSSProperties = { background: 'var(--glass)', border: `1px solid ${border}`, color: 'var(--text-h)', borderRadius: 8 };

  return (
    <div>
      <h2 style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>Finanzen</h2>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 40 }}>Lade …</p>
      ) : (
        <>
          {/* ── Overview KPIs ──────────────────────────── */}
          <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            {[
              { label: 'Gesamtumsatz', value: overview ? `${(overview.total_revenue_cents / 100).toFixed(0)} €` : '—', icon: 'wallet' as const },
              { label: 'Dieser Monat', value: overview ? `${(overview.this_month_cents / 100).toFixed(0)} €` : '—', icon: 'calendar' as const },
              { label: 'Ausstehend', value: overview ? `${(overview.pending_payout_cents / 100).toFixed(0)} €` : '—', icon: 'clock' as const },
              { label: 'Transaktionen', value: transactions.length, icon: 'chart-bar' as const },
              { label: 'Enrollments', value: overview?.total_enrollments ?? 0, icon: 'school' as const },
            ].map(kpi => (
              <div key={kpi.label} className="glass-card rounded-[8px] p-3" style={{ background: cardBg, border: `1px solid ${border}` }}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon name={kpi.icon} size={14} style={{ color: 'var(--gold)' }} />
                  <span style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{kpi.label}</span>
                </div>
                <div style={{ fontSize: 20, fontStyle: 'italic', color: 'var(--text-h)', fontFamily: 'Cormorant Garamond, serif' }}>{kpi.value}</div>
              </div>
            ))}
          </div>

          {/* ── Transaktionsliste ──────────────────────── */}
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Transaktionen</h3>
            <button onClick={() => setShowCoupons(s => !s)} className="border-none cursor-pointer flex items-center gap-1" style={{
              padding: '5px 10px', borderRadius: 8, fontSize: 9,
              background: showCoupons ? 'var(--gold-bg)' : 'var(--glass)', color: showCoupons ? 'var(--gold-text)' : 'var(--text-muted)',
              border: `1px solid ${showCoupons ? border : 'var(--glass-border)'}`,
            }}>
              <Icon name="gift" size={10} /> Coupons
            </button>
          </div>

          {/* Filter */}
          <div className="flex gap-1.5 mb-4">
            {([
              { key: 'all' as TxFilter, label: 'Alle' },
              { key: 'f2f' as TxFilter, label: 'F2F' },
              { key: 'course' as TxFilter, label: 'Kurse' },
              { key: 'pending' as TxFilter, label: 'Ausstehend' },
              { key: 'paid' as TxFilter, label: 'Bezahlt' },
            ]).map(f => (
              <button key={f.key} onClick={() => setTxFilter(f.key)} className="border-none cursor-pointer" style={{
                padding: '5px 10px', borderRadius: 8, fontSize: 10,
                background: txFilter === f.key ? 'var(--gold-bg)' : 'var(--glass)',
                color: txFilter === f.key ? 'var(--gold-text)' : 'var(--text-muted)',
                border: `1px solid ${txFilter === f.key ? border : 'var(--glass-border)'}`,
              }}>{f.label}</button>
            ))}
          </div>

          {/* Liste */}
          {filteredTx.length === 0 ? (
            <div className="glass-card rounded-[8px] p-8 text-center mb-6" style={{ background: cardBg }}>
              <Icon name="wallet" size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
              <p style={{ fontSize: 12, color: 'var(--text-sec)', fontStyle: 'italic' }}>Keine Transaktionen.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mb-6">
              {filteredTx.map(tx => (
                <div key={tx.id} className="glass-card rounded-[8px] p-3 flex items-center gap-3" style={{ background: cardBg, border: `1px solid ${border}` }}>
                  {/* Avatar */}
                  <div className="flex-shrink-0 rounded-full overflow-hidden" style={{ width: 36, height: 36, background: 'var(--avatar-bg)' }}>
                    {tx.clientAvatar ? (
                      <img src={tx.clientAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="user" size={16} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-h)' }}>{tx.clientName}</span>
                      <span style={{ padding: '1px 5px', borderRadius: 4, fontSize: 8, letterSpacing: '0.5px', textTransform: 'uppercase', background: tx.type === 'f2f' ? 'rgba(123,160,212,.12)' : 'rgba(110,170,120,.12)', color: tx.type === 'f2f' ? '#7BA0D4' : '#6EAA78' }}>
                        {tx.type === 'f2f' ? 'F2F' : 'Kurs'}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-sec)' }}>{tx.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      {new Date(tx.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  {/* Betrag */}
                  <div className="flex-shrink-0 text-right">
                    <div style={{ fontSize: 14, fontWeight: 500, color: tx.amount > 0 ? 'var(--text-h)' : 'var(--text-muted)' }}>
                      {tx.amount > 0 ? `${(tx.amount / 100).toFixed(0)} €` : 'Gratis'}
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <span style={{
                        padding: '1px 5px', borderRadius: 4, fontSize: 8, letterSpacing: '0.5px', textTransform: 'uppercase',
                        background: tx.status === 'paid' ? 'var(--success-bg)' : tx.status === 'pending' ? 'var(--gold-bg)' : 'var(--glass)',
                        color: tx.status === 'paid' ? 'var(--success)' : tx.status === 'pending' ? 'var(--gold-text)' : 'var(--text-muted)',
                      }}>
                        {tx.status === 'paid' ? 'Bezahlt' : tx.status === 'pending' ? 'Ausstehend' : tx.status === 'free' ? 'Gratis' : 'Erstattet'}
                      </span>
                      {tx.paidOut ? (
                        <span style={{ padding: '1px 5px', borderRadius: 4, fontSize: 8, background: 'var(--success-bg)', color: 'var(--success)' }}>Ausgezahlt</span>
                      ) : tx.status === 'paid' && (
                        <span style={{ padding: '1px 5px', borderRadius: 4, fontSize: 8, background: 'var(--gold-bg)', color: 'var(--gold-text)' }}>Nicht ausgezahlt</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Coupons (einklappbar) ──────────────────── */}
          {showCoupons && (
            <div className="glass-card rounded-[8px] p-4 mb-6" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="flex items-center justify-between mb-3">
                <h3 style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Coupons</h3>
                <button onClick={() => setCreating(true)} className="border-none cursor-pointer flex items-center gap-1" style={{
                  padding: '4px 10px', borderRadius: 9999, fontSize: 9, background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))', color: 'var(--text-on-gold)',
                }}><Icon name="plus" size={10} /> Neu</button>
              </div>

              {creating && (
                <div className="mb-4 p-3 rounded-[8px]" style={{ background: 'var(--glass)', border: `1px solid ${border}` }}>
                  <div className="flex flex-col gap-2">
                    <input autoFocus value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())} placeholder="CODE (z.B. WELCOME20)" className="w-full py-2 px-3 text-sm outline-none font-mono" style={{ ...inputStyle, letterSpacing: '2px' }} />
                    <div className="flex gap-2">
                      <button onClick={() => setDiscountType('percent')} className="border-none cursor-pointer flex-1" style={{ padding: '5px', borderRadius: 8, fontSize: 10, background: discountType === 'percent' ? 'var(--gold-bg)' : 'var(--glass)', color: discountType === 'percent' ? 'var(--gold-text)' : 'var(--text-muted)', border: `1px solid ${discountType === 'percent' ? border : 'var(--glass-border)'}` }}>%</button>
                      <button onClick={() => setDiscountType('fixed')} className="border-none cursor-pointer flex-1" style={{ padding: '5px', borderRadius: 8, fontSize: 10, background: discountType === 'fixed' ? 'var(--gold-bg)' : 'var(--glass)', color: discountType === 'fixed' ? 'var(--gold-text)' : 'var(--text-muted)', border: `1px solid ${discountType === 'fixed' ? border : 'var(--glass-border)'}` }}>€</button>
                      <input type="number" value={newDiscount} onChange={e => setNewDiscount(e.target.value)} placeholder={discountType === 'percent' ? '20' : '10'} className="flex-1 py-1.5 px-2 text-sm outline-none" style={inputStyle} />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleCreate} disabled={saving || !newCode.trim() || !newDiscount.trim()} className="border-none cursor-pointer flex-1" style={{ padding: '6px', borderRadius: 9999, fontSize: 10, background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))', color: 'var(--text-on-gold)' }}>{saving ? '…' : 'Erstellen'}</button>
                      <button onClick={() => setCreating(false)} className="border-none cursor-pointer" style={{ background: 'none', color: 'var(--text-muted)', fontSize: 10 }}>Abbrechen</button>
                    </div>
                  </div>
                </div>
              )}

              {coupons.length === 0 ? (
                <p style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '8px 0' }}>Keine Coupons.</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {coupons.map(c => (
                    <div key={c.id} className="flex items-center gap-3 py-1.5">
                      <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 500, color: 'var(--gold-text)' }}>{c.code}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-sec)' }}>{c.discount_percent ? `${c.discount_percent}%` : `${((c.discount_amount_cents ?? 0) / 100).toFixed(0)} €`}</span>
                      <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{c.used_count}/{c.max_uses ?? '∞'}</span>
                      <button onClick={() => handleToggle(c.id)} className="ml-auto border-none cursor-pointer" style={{ fontSize: 8, padding: '2px 6px', borderRadius: 4, background: c.is_active ? 'var(--success-bg)' : 'var(--glass)', color: c.is_active ? 'var(--success)' : 'var(--text-muted)' }}>{c.is_active ? 'Aktiv' : 'Aus'}</button>
                      <button onClick={() => handleDeleteCoupon(c.id)} className="border-none cursor-pointer p-0" style={{ background: 'none' }}><Icon name="x" size={12} style={{ color: 'var(--text-muted)' }} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Auszahlungen ───────────────────────────── */}
          <h3 style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Auszahlungen</h3>
          {payouts.length === 0 ? (
            <div className="glass-card rounded-[8px] p-6 text-center" style={{ background: cardBg }}>
              <p style={{ fontSize: 11, color: 'var(--text-sec)', fontStyle: 'italic' }}>Stripe Connect wird vor Launch eingerichtet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {payouts.map(p => (
                <div key={p.id} className="glass-card rounded-[8px] p-3 flex items-center gap-3" style={{ background: cardBg, border: `1px solid ${border}` }}>
                  <Icon name="wallet" size={16} style={{ color: p.status === 'completed' ? 'var(--success)' : 'var(--gold)' }} />
                  <div className="flex-1">
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-h)' }}>{(p.amount_cents / 100).toFixed(2)} {p.currency}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      {new Date(p.period_start).toLocaleDateString('de-DE')} – {new Date(p.period_end).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                  <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 8, background: p.status === 'completed' ? 'var(--success-bg)' : 'var(--gold-bg)', color: p.status === 'completed' ? 'var(--success)' : 'var(--gold-text)' }}>
                    {p.status === 'completed' ? 'Ausgezahlt' : 'Ausstehend'}
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
