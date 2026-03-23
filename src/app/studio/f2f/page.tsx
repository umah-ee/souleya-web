'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Icon } from '@/components/ui/Icon';
import {
  fetchF2FPricings, fetchF2FBookings, createF2FPricing, deleteF2FPricing,
  createF2FSession, updateBookingStatus,
} from '@/lib/studio';
import { searchUsers } from '@/lib/users';
import type { F2FPricing, F2FBooking } from '@/types/studio';
import VideoCallOverlay from '@/components/shared/VideoCallOverlay';
import F2FReviewModal from '@/components/studio/F2FReviewModal';
import SoDatePicker from '@/components/ui/SoDatePicker';
import SoTimePicker from '@/components/ui/SoTimePicker';

type Tab = 'upcoming' | 'past';
const DURATIONS = [30, 45, 60, 90];

interface UserResult {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export default function F2FPage() {
  const [pricings, setPricings] = useState<F2FPricing[]>([]);
  const [bookings, setBookings] = useState<F2FBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('upcoming');

  // Settings Panel
  const [showSettings, setShowSettings] = useState(false);
  const [newDuration, setNewDuration] = useState(60);
  const [newPrice, setNewPrice] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);

  // Create F2F Modal
  const [showCreate, setShowCreate] = useState(false);
  const [createClient, setCreateClient] = useState<UserResult | null>(null);
  const [createDate, setCreateDate] = useState('');
  const [createTime, setCreateTime] = useState('');
  const [createDuration, setCreateDuration] = useState(60);
  const [createTopic, setCreateTopic] = useState('');
  const [createPrice, setCreatePrice] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState<UserResult[]>([]);
  const [searchingClients, setSearchingClients] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // ── Client-Suche (debounced) ────────────────────────────
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (clientSearch.trim().length < 2) { setClientResults([]); return; }
    setSearchingClients(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await searchUsers(clientSearch, 1, 8);
        setClientResults((res as unknown as { data: UserResult[] }).data ?? []);
      } catch { setClientResults([]); }
      setSearchingClients(false);
    }, 300);
  }, [clientSearch]);

  // ── Auto-fill Preis wenn Dauer gewaehlt ─────────────────
  useEffect(() => {
    const match = pricings.find(p => p.duration_minutes === createDuration);
    if (match && !createPrice) {
      setCreatePrice((match.price_cents / 100).toFixed(0));
    }
  }, [createDuration, pricings, createPrice]);

  // ── F2F erstellen ───────────────────────────────────────
  const handleCreateF2F = async () => {
    if (!createClient || !createDate || !createTime) return;
    setSavingCreate(true);
    try {
      const starts_at = new Date(`${createDate}T${createTime}`).toISOString();
      await createF2FSession({
        client_id: createClient.id,
        starts_at,
        duration_minutes: createDuration,
        price_cents: createPrice ? Math.round(parseFloat(createPrice) * 100) : 0,
        topic: createTopic || undefined,
      });
      setShowCreate(false);
      setCreateClient(null);
      setCreateDate('');
      setCreateTime('');
      setCreateTopic('');
      setCreatePrice('');
      setClientSearch('');
      loadData();
    } catch (err) {
      console.warn('[F2F] Session erstellen fehlgeschlagen:', err);
    }
    setSavingCreate(false);
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

  const getCallStatus = (booking: F2FBooking): { canCall: boolean; label: string } => {
    if (booking.status !== 'confirmed') return { canCall: false, label: 'Nicht bestaetigt' };
    if (!booking.slot?.starts_at) return { canCall: false, label: '' };
    const diff = new Date(booking.slot.starts_at).getTime() - Date.now();
    if (diff > 60 * 60 * 1000) {
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      return { canCall: false, label: `In ${h} Std ${m} Min` };
    }
    if (diff > 15 * 60 * 1000) {
      const m = Math.floor(diff / 60000);
      return { canCall: false, label: `In ${m} Min` };
    }
    if (diff > -60 * 60 * 1000) {
      return { canCall: true, label: 'Jetzt starten' };
    }
    return { canCall: false, label: 'Abgelaufen' };
  };

  const handleStartCall = (booking: F2FBooking, video: boolean) => {
    setActiveCall({
      bookingId: booking.id,
      partnerName: booking.client?.display_name ?? 'Teilnehmer',
      partnerAvatar: booking.client?.avatar_url,
    });
    // Video-Flag speichern fuer Overlay
    setActiveCallVideo(video);
  };

  const [activeCallVideo, setActiveCallVideo] = useState(true);

  const handleCallEnd = async (duration: number) => {
    if (activeCall) {
      setReviewCall({ bookingId: activeCall.bookingId, partnerName: activeCall.partnerName, duration });
    }
    setActiveCall(null);
  };

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

  const cardBg = 'var(--card-bg)';
  const border = 'var(--gold-border-s)';
  const inputStyle: React.CSSProperties = { background: 'var(--glass)', border: `1px solid ${border}`, color: 'var(--text-h)', borderRadius: 8 };

  return (
    <div>
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <h2 style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Face2Face — 1:1 Sessions
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(s => !s)}
            className="border-none cursor-pointer p-2 rounded-[8px]"
            style={{ background: showSettings ? 'var(--gold-bg)' : 'var(--glass)', border: `1px solid ${border}` }}
            title="Tarife verwalten"
          >
            <Icon name="settings" size={16} style={{ color: showSettings ? 'var(--gold-text)' : 'var(--text-muted)' }} />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="border-none cursor-pointer flex items-center gap-1.5"
            style={{
              padding: '6px 14px', borderRadius: 9999, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase',
              background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))', color: 'var(--text-on-gold)',
            }}
          >
            <Icon name="plus" size={12} />
            Neue Session
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 40 }}>Lade …</p>
      ) : (
        <>
          {/* ── Settings Panel (Tarife) ─────────────────── */}
          {showSettings && (
            <div className="glass-card rounded-[8px] p-4 mb-5" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <h3 style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
                Deine Tarife
              </h3>
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
              <div className="flex items-end gap-2 flex-wrap">
                <div>
                  <label style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Dauer</label>
                  <div className="flex gap-1">
                    {DURATIONS.map(d => (
                      <button key={d} onClick={() => setNewDuration(d)} className="border-none cursor-pointer" style={{
                        padding: '5px 10px', borderRadius: 8, fontSize: 10,
                        background: newDuration === d ? 'var(--gold-bg)' : 'var(--glass)',
                        color: newDuration === d ? 'var(--gold-text)' : 'var(--text-muted)',
                        border: `1px solid ${newDuration === d ? border : 'var(--glass-border)'}`,
                      }}>{d} Min</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Preis (€)</label>
                  <input type="number" placeholder="z.B. 50" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="py-1.5 px-3 text-sm outline-none" style={{ ...inputStyle, width: 80 }} />
                </div>
                <div>
                  <label style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Bezeichnung</label>
                  <input type="text" placeholder="z.B. Coaching" value={newLabel} onChange={e => setNewLabel(e.target.value)} className="py-1.5 px-3 text-sm outline-none" style={{ ...inputStyle, width: 120 }} />
                </div>
                <button onClick={handleCreatePricing} disabled={savingPrice || !newPrice} className="border-none cursor-pointer" style={{
                  padding: '7px 16px', borderRadius: 9999, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase',
                  background: newPrice ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))' : 'var(--glass)',
                  color: newPrice ? 'var(--text-on-gold)' : 'var(--text-muted)',
                }}>{savingPrice ? '…' : 'Hinzufuegen'}</button>
              </div>
            </div>
          )}

          {/* ── Tabs ───────────────────────────────────── */}
          <div className="flex gap-1 mb-4">
            {([
              { key: 'upcoming' as Tab, label: 'Kommende', count: upcomingBookings.length },
              { key: 'past' as Tab, label: 'Vergangene', count: pastBookings.length },
            ]).map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} className="border-none cursor-pointer" style={{
                padding: '7px 16px', borderRadius: 8, fontSize: 11,
                background: tab === t.key ? 'var(--gold-bg)' : 'var(--glass)',
                color: tab === t.key ? 'var(--gold-text)' : 'var(--text-muted)',
                border: `1px solid ${tab === t.key ? border : 'var(--glass-border)'}`,
              }}>{t.label} ({t.count})</button>
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
                {tab === 'upcoming' && (
                  <button onClick={() => setShowCreate(true)} className="border-none cursor-pointer mt-3" style={{
                    padding: '6px 16px', borderRadius: 9999, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase',
                    background: 'var(--gold-bg)', color: 'var(--gold-text)', border: `1px solid ${border}`,
                  }}>
                    <Icon name="plus" size={10} /> Erste Session erstellen
                  </button>
                )}
              </div>
            ) : (tab === 'upcoming' ? upcomingBookings : pastBookings).map(b => {
              const slotDate = b.slot?.starts_at ? new Date(b.slot.starts_at) : null;
              const isPast = tab === 'past';
              return (
                <div key={b.id} className="glass-card rounded-[8px] p-4 flex items-center gap-3" style={{ background: cardBg, border: `1px solid ${border}` }}>
                  <div className="flex-shrink-0 rounded-full overflow-hidden" style={{ width: 44, height: 44, background: 'var(--avatar-bg)' }}>
                    {b.client?.avatar_url ? (
                      <img src={b.client.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="user" size={20} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-h)' }}>{b.client?.display_name ?? 'Teilnehmer'}</div>
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
                    {isPast && <div className="mt-1">{renderStars(b.rating)}</div>}
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {!isPast && (
                      <>
                        {(() => {
                          const cs = getCallStatus(b);
                          return (
                            <div className="flex items-center gap-1.5">
                              {/* Status Badge */}
                              <span style={{
                                padding: '3px 8px', borderRadius: 6, fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase',
                                background: b.status === 'confirmed' ? 'var(--success-bg)' : 'var(--gold-bg)',
                                color: b.status === 'confirmed' ? 'var(--success)' : 'var(--gold-text)',
                              }}>{b.status === 'confirmed' ? 'Bestaetigt' : 'Ausstehend'}</span>
                              {/* Call Buttons */}
                              {cs.canCall ? (
                                <>
                                  <button onClick={() => handleStartCall(b, true)} className="border-none cursor-pointer flex items-center gap-1" style={{
                                    padding: '5px 12px', borderRadius: 9999, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase',
                                    background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))', color: 'var(--text-on-gold)',
                                  }}>
                                    <Icon name="video" size={12} /> Video
                                  </button>
                                  <button onClick={() => handleStartCall(b, false)} className="border-none cursor-pointer flex items-center gap-1" style={{
                                    padding: '5px 10px', borderRadius: 9999, fontSize: 10,
                                    background: 'var(--glass)', color: 'var(--text-sec)', border: `1px solid ${border}`,
                                  }}>
                                    <Icon name="phone" size={12} />
                                  </button>
                                </>
                              ) : cs.label && (
                                <span style={{ fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic' }}>{cs.label}</span>
                              )}
                            </div>
                          );
                        })()}
                      </>
                    )}
                    {isPast && (
                      <span style={{
                        padding: '3px 8px', borderRadius: 6, fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase',
                        background: 'var(--glass)', color: 'var(--text-muted)',
                      }}>Abgeschlossen</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Create F2F Modal ───────────────────────────── */}
      {showCreate && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          onClick={() => setShowCreate(false)}
        >
          <div
            className="rounded-[8px] p-5 w-full max-w-md overflow-y-auto scrollbar-gold"
            style={{ background: cardBg, border: `1px solid ${border}`, maxHeight: '85vh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Neue Face2Face Session
              </h3>
              <button onClick={() => setShowCreate(false)} className="border-none cursor-pointer p-1" style={{ background: 'none' }}>
                <Icon name="x" size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Client suchen */}
              <div>
                <label style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Teilnehmer</label>
                {createClient ? (
                  <div className="flex items-center gap-2 rounded-[8px] px-3 py-2" style={{ background: 'var(--glass)', border: `1px solid ${border}` }}>
                    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'var(--avatar-bg)' }}>
                      {createClient.avatar_url && <img src={createClient.avatar_url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text-h)', flex: 1 }}>{createClient.display_name ?? createClient.username}</span>
                    <button onClick={() => { setCreateClient(null); setClientSearch(''); }} className="border-none cursor-pointer p-0" style={{ background: 'none' }}>
                      <Icon name="x" size={12} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Name oder Username suchen …"
                      value={clientSearch}
                      onChange={e => setClientSearch(e.target.value)}
                      className="w-full py-2 px-3 text-sm outline-none"
                      style={inputStyle}
                    />
                    {clientResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 rounded-[8px] overflow-hidden z-10" style={{ background: cardBg, border: `1px solid ${border}`, maxHeight: 200, overflowY: 'auto' }}>
                        {clientResults.map(u => (
                          <button
                            key={u.id}
                            onClick={() => { setCreateClient(u); setClientSearch(''); setClientResults([]); }}
                            className="w-full flex items-center gap-2 px-3 py-2 border-none cursor-pointer text-left"
                            style={{ background: 'transparent' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'var(--avatar-bg)' }}>
                              {u.avatar_url && <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <span style={{ fontSize: 12, color: 'var(--text-h)' }}>{u.display_name ?? u.username ?? 'User'}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchingClients && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Suche …</div>}
                  </div>
                )}
              </div>

              {/* Datum + Uhrzeit */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Datum</label>
                  <SoDatePicker value={createDate} onChange={setCreateDate} />
                </div>
                <div className="flex-1">
                  <label style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Uhrzeit</label>
                  <SoTimePicker value={createTime} onChange={setCreateTime} />
                </div>
              </div>

              {/* Dauer */}
              <div>
                <label style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Dauer</label>
                <div className="flex gap-1">
                  {DURATIONS.map(d => {
                    const pricing = pricings.find(p => p.duration_minutes === d);
                    return (
                      <button key={d} onClick={() => { setCreateDuration(d); if (pricing) setCreatePrice((pricing.price_cents / 100).toFixed(0)); }} className="border-none cursor-pointer flex flex-col items-center" style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 10,
                        background: createDuration === d ? 'var(--gold-bg)' : 'var(--glass)',
                        color: createDuration === d ? 'var(--gold-text)' : 'var(--text-muted)',
                        border: `1px solid ${createDuration === d ? border : 'var(--glass-border)'}`,
                      }}>
                        <span>{d} Min</span>
                        {pricing && <span style={{ fontSize: 9, opacity: 0.7 }}>{(pricing.price_cents / 100).toFixed(0)} €</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preis */}
              <div>
                <label style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Preis (€)</label>
                <input type="number" placeholder="z.B. 50" value={createPrice} onChange={e => setCreatePrice(e.target.value)} className="w-full py-2 px-3 text-sm outline-none" style={inputStyle} />
              </div>

              {/* Thema */}
              <div>
                <label style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Thema (optional)</label>
                <input type="text" placeholder="z.B. Meditation Grundlagen" value={createTopic} onChange={e => setCreateTopic(e.target.value)} className="w-full py-2 px-3 text-sm outline-none" style={inputStyle} />
              </div>

              {/* Erstellen Button */}
              <button
                onClick={handleCreateF2F}
                disabled={savingCreate || !createClient || !createDate || !createTime}
                className="border-none cursor-pointer w-full"
                style={{
                  padding: '10px 0', borderRadius: 9999, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase',
                  background: createClient && createDate && createTime ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))' : 'var(--glass)',
                  color: createClient && createDate && createTime ? 'var(--text-on-gold)' : 'var(--text-muted)',
                }}
              >
                {savingCreate ? 'Wird erstellt …' : 'Session erstellen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Video Call Overlay ──────────────────────────── */}
      {activeCall && (
        <VideoCallOverlay
          roomId={`f2f-${activeCall.bookingId}`}
          partnerId=""
          partnerName={activeCall.partnerName}
          partnerAvatar={activeCall.partnerAvatar}
          initialVideo={activeCallVideo}
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
