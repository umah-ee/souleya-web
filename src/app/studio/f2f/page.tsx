'use client';

import { useEffect, useState, useCallback } from 'react';
import { Icon } from '@/components/ui/Icon';
import { fetchF2FPricings, fetchF2FBookings, createF2FPricing, deleteF2FPricing, updateBookingStatus } from '@/lib/studio';
import type { F2FPricing, F2FBooking } from '@/types/studio';
import VideoCallOverlay from '@/components/shared/VideoCallOverlay';
import F2FReviewModal from '@/components/studio/F2FReviewModal';

// ── Typen ─────────────────────────────────────────────────
type Tab = 'upcoming' | 'past';

const DURATIONS = [30, 45, 60, 90];

export default function F2FPage() {
  const [pricings, setPricings] = useState<F2FPricing[]>([]);
  const [bookings, setBookings] = useState<F2FBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('upcoming');

  // Preis-Formular
  const [newDuration, setNewDuration] = useState(60);
  const [newPrice, setNewPrice] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);

  // Video-Call
  const [activeCall, setActiveCall] = useState<{ bookingId: string; partnerName: string; partnerAvatar?: string | null } | null>(null);
  const [reviewCall, setReviewCall] = useState<{ bookingId: string; partnerName: string; duration: number } | null>(null);

  // ── Daten laden ─────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [p, bRes] = await Promise.all([
        fetchF2FPricings().catch(() => []),
        fetchF2FBookings().catch(() => ({ data: [] })),
      ]);
      setPricings(p);
      const bData = (bRes as unknown as { data: F2FBooking[] }).data ?? [];
      setBookings(bData);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Preis erstellen ─────────────────────────────────────
  const handleCreatePricing = async () => {
    if (!newPrice) return;
    setSavingPrice(true);
    try {
      await createF2FPricing({
        duration_minutes: newDuration,
        price_cents: Math.round(parseFloat(newPrice) * 100),
        label: newLabel || undefined,
      });
      setNewPrice('');
      setNewLabel('');
      loadData();
    } catch { /* ignore */ }
    setSavingPrice(false);
  };

  const handleDeletePricing = async (id: string) => {
    if (!confirm('Preismodell loeschen?')) return;
    await deleteF2FPricing(id).catch(() => {});
    loadData();
  };

  // ── Buchungen filtern ───────────────────────────────────
  const now = new Date();
  const upcomingBookings = bookings.filter(b => {
    const slotTime = b.slot?.starts_at ? new Date(b.slot.starts_at) : null;
    return slotTime && slotTime >= now && (b.status === 'confirmed' || b.status === 'pending');
  }).sort((a, b) => new Date(a.slot?.starts_at ?? 0).getTime() - new Date(b.slot?.starts_at ?? 0).getTime());

  const pastBookings = bookings.filter(b => {
    const slotTime = b.slot?.starts_at ? new Date(b.slot.starts_at) : null;
    return b.status === 'completed' || (slotTime && slotTime < now);
  }).sort((a, b) => new Date(b.slot?.starts_at ?? 0).getTime() - new Date(a.slot?.starts_at ?? 0).getTime());

  // ── Call starten (±15 Min zum Termin) ───────────────────
  const canStartCall = (booking: F2FBooking) => {
    if (!booking.slot?.starts_at) return false;
    const slotTime = new Date(booking.slot.starts_at).getTime();
    const diff = Math.abs(Date.now() - slotTime);
    return diff < 15 * 60 * 1000 && booking.status === 'confirmed';
  };

  const handleStartCall = (booking: F2FBooking) => {
    setActiveCall({
      bookingId: booking.id,
      partnerName: booking.client?.display_name ?? 'Teilnehmer',
      partnerAvatar: booking.client?.avatar_url,
    });
  };

  const handleCallEnd = async (duration: number) => {
    if (activeCall) {
      setReviewCall({
        bookingId: activeCall.bookingId,
        partnerName: activeCall.partnerName,
        duration,
      });
    }
    setActiveCall(null);
  };

  // ── Sterne rendern ──────────────────────────────────────
  const renderStars = (rating: number | null) => {
    if (!rating) return <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>Keine Bewertung</span>;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(s => (
          <Icon key={s} name="star-filled" size={14} style={{ color: s <= rating ? 'var(--gold)' : 'var(--text-muted)' }} />
        ))}
      </div>
    );
  };

  // ── Styles ──────────────────────────────────────────────
  const cardBg = 'var(--card-bg)';
  const border = 'var(--gold-border-s)';
  const inputStyle: React.CSSProperties = { background: 'var(--glass)', border: `1px solid ${border}`, color: 'var(--text-h)', borderRadius: 8 };

  return (
    <div>
      <h2 style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20 }}>
        Face2Face — 1:1 Sessions
      </h2>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 40 }}>Lade …</p>
      ) : (
        <>
          {/* ── Preis-Einstellung (kompakt) ─────────────── */}
          <div className="glass-card rounded-[8px] p-4 mb-6" style={{ background: cardBg, border: `1px solid ${border}` }}>
            <div className="flex items-center justify-between mb-3">
              <h3 style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Deine Preise
              </h3>
            </div>

            {/* Bestehende Preise */}
            {pricings.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {pricings.map(p => (
                  <div key={p.id} className="flex items-center gap-2 rounded-[8px] px-3 py-2" style={{ background: 'var(--glass)', border: `1px solid ${border}` }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-h)' }}>{p.duration_minutes} Min</span>
                    <span style={{ fontSize: 12, color: 'var(--gold-text)' }}>{(p.price_cents / 100).toFixed(0)} €</span>
                    {p.label && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>({p.label})</span>}
                    <button onClick={() => handleDeletePricing(p.id)} className="border-none cursor-pointer p-0" style={{ background: 'none' }}>
                      <Icon name="x" size={12} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Neues Preismodell */}
            <div className="flex items-end gap-2 flex-wrap">
              <div>
                <label style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Dauer</label>
                <div className="flex gap-1">
                  {DURATIONS.map(d => (
                    <button
                      key={d}
                      onClick={() => setNewDuration(d)}
                      className="border-none cursor-pointer"
                      style={{
                        padding: '5px 10px', borderRadius: 8, fontSize: 10,
                        background: newDuration === d ? 'var(--gold-bg)' : 'var(--glass)',
                        color: newDuration === d ? 'var(--gold-text)' : 'var(--text-muted)',
                        border: `1px solid ${newDuration === d ? border : 'var(--glass-border)'}`,
                      }}
                    >
                      {d} Min
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Preis (€)</label>
                <input
                  type="number"
                  placeholder="z.B. 50"
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  className="py-1.5 px-3 text-sm outline-none"
                  style={{ ...inputStyle, width: 80 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Bezeichnung</label>
                <input
                  type="text"
                  placeholder="z.B. Coaching"
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  className="py-1.5 px-3 text-sm outline-none"
                  style={{ ...inputStyle, width: 120 }}
                />
              </div>
              <button
                onClick={handleCreatePricing}
                disabled={savingPrice || !newPrice}
                className="border-none cursor-pointer"
                style={{
                  padding: '7px 16px', borderRadius: 9999, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase',
                  background: newPrice ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))' : 'var(--glass)',
                  color: newPrice ? 'var(--text-on-gold)' : 'var(--text-muted)',
                }}
              >
                {savingPrice ? '…' : 'Hinzufuegen'}
              </button>
            </div>
          </div>

          {/* ── Tabs ───────────────────────────────────── */}
          <div className="flex gap-1 mb-4">
            {([
              { key: 'upcoming' as Tab, label: 'Kommende', count: upcomingBookings.length },
              { key: 'past' as Tab, label: 'Vergangene', count: pastBookings.length },
            ]).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="border-none cursor-pointer"
                style={{
                  padding: '7px 16px', borderRadius: 8, fontSize: 11,
                  background: tab === t.key ? 'var(--gold-bg)' : 'var(--glass)',
                  color: tab === t.key ? 'var(--gold-text)' : 'var(--text-muted)',
                  border: `1px solid ${tab === t.key ? border : 'var(--glass-border)'}`,
                }}
              >
                {t.label} ({t.count})
              </button>
            ))}
          </div>

          {/* ── Buchungs-Liste ──────────────────────────── */}
          <div className="flex flex-col gap-3">
            {(tab === 'upcoming' ? upcomingBookings : pastBookings).length === 0 ? (
              <div className="glass-card rounded-[8px] p-8 text-center" style={{ background: cardBg }}>
                <Icon name={tab === 'upcoming' ? 'calendar-event' : 'clock'} size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 12, color: 'var(--text-sec)', fontStyle: 'italic' }}>
                  {tab === 'upcoming' ? 'Keine kommenden Sessions.' : 'Noch keine vergangenen Sessions.'}
                </p>
              </div>
            ) : (tab === 'upcoming' ? upcomingBookings : pastBookings).map(b => {
              const slotDate = b.slot?.starts_at ? new Date(b.slot.starts_at) : null;
              const isPast = tab === 'past';
              return (
                <div key={b.id} className="glass-card rounded-[8px] p-4 flex items-center gap-3" style={{ background: cardBg, border: `1px solid ${border}` }}>
                  {/* Avatar */}
                  <div className="flex-shrink-0 rounded-full overflow-hidden" style={{ width: 44, height: 44, background: 'var(--avatar-bg)' }}>
                    {b.client?.avatar_url ? (
                      <img src={b.client.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="user" size={20} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-h)' }}>
                      {b.client?.display_name ?? 'Teilnehmer'}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap" style={{ fontSize: 11, color: 'var(--text-sec)' }}>
                      {slotDate && (
                        <>
                          <span className="flex items-center gap-1">
                            <Icon name="calendar-event" size={11} style={{ color: 'var(--text-muted)' }} />
                            {slotDate.toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="clock" size={11} style={{ color: 'var(--text-muted)' }} />
                            {slotDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                          </span>
                        </>
                      )}
                      <span>{b.slot?.duration_minutes ?? '?'} Min</span>
                      <span>{(b.amount_cents / 100).toFixed(0)} €</span>
                    </div>
                    {/* Bewertung (nur vergangene) */}
                    {isPast && (
                      <div className="mt-1">
                        {renderStars(b.rating)}
                      </div>
                    )}
                  </div>

                  {/* Status / Aktion */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {!isPast && (
                      <>
                        <span style={{
                          padding: '3px 8px', borderRadius: 6, fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase',
                          background: b.status === 'confirmed' ? 'var(--success-bg)' : 'var(--gold-bg)',
                          color: b.status === 'confirmed' ? 'var(--success)' : 'var(--gold-text)',
                        }}>
                          {b.status === 'confirmed' ? 'Bestaetigt' : 'Ausstehend'}
                        </span>
                        {canStartCall(b) && (
                          <button
                            onClick={() => handleStartCall(b)}
                            className="border-none cursor-pointer flex items-center gap-1"
                            style={{
                              padding: '6px 14px', borderRadius: 9999, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase',
                              background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                              color: 'var(--text-on-gold)',
                            }}
                          >
                            <Icon name="video" size={12} />
                            Session starten
                          </button>
                        )}
                      </>
                    )}
                    {isPast && (
                      <span style={{
                        padding: '3px 8px', borderRadius: 6, fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase',
                        background: 'var(--glass)', color: 'var(--text-muted)',
                      }}>
                        Abgeschlossen
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Video Call Overlay ──────────────────────────── */}
      {activeCall && (
        <VideoCallOverlay
          roomId={`f2f-${activeCall.bookingId}`}
          partnerId=""
          partnerName={activeCall.partnerName}
          partnerAvatar={activeCall.partnerAvatar}
          initialVideo={true}
          onEnd={handleCallEnd}
        />
      )}

      {/* ── Bewertungs-Modal nach Call ──────────────────── */}
      {reviewCall && (
        <F2FReviewModal
          bookingId={reviewCall.bookingId}
          mentorName={reviewCall.partnerName}
          duration={reviewCall.duration}
          onClose={() => { setReviewCall(null); loadData(); }}
          onSubmitted={() => { setReviewCall(null); loadData(); }}
        />
      )}
    </div>
  );
}
