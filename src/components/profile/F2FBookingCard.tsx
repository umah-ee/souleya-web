'use client';

import { useEffect, useState, useCallback } from 'react';
import { Icon } from '@/components/ui/Icon';
import { fetchMentorPricing, fetchMentorSlots, bookF2FSlot } from '@/lib/studio';
import type { F2FPricing, F2FSlot } from '@/types/studio';

interface Props {
  mentorId: string;
  mentorName: string;
  currentUserId?: string | null;
}

export default function F2FBookingCard({ mentorId, mentorName, currentUserId }: Props) {
  const [pricings, setPricings] = useState<F2FPricing[]>([]);
  const [slots, setSlots] = useState<F2FSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPricing, setSelectedPricing] = useState<F2FPricing | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<F2FSlot | null>(null);
  const [topic, setTopic] = useState('');
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([
        fetchMentorPricing(mentorId).catch(() => []),
        fetchMentorSlots(mentorId).catch(() => []),
      ]);
      setPricings(p);
      setSlots(s);
      if (p.length > 0) setSelectedPricing(p[0]);
    } catch { /* ignore */ }
    setLoading(false);
  }, [mentorId]);

  useEffect(() => { loadData(); }, [loadData]);

  // Slots nach Datum gruppieren
  const slotsByDate = slots.reduce<Record<string, F2FSlot[]>>((acc, s) => {
    const dateKey = new Date(s.starts_at).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(s);
    return acc;
  }, {});

  const handleBook = async () => {
    if (!selectedSlot || !selectedPricing || !currentUserId) return;
    setBooking(true);
    setError('');
    try {
      await bookF2FSlot(selectedSlot.id, selectedPricing.id, topic || undefined);
      setBooked(true);
    } catch {
      setError('Buchung fehlgeschlagen. Probier es nochmal.');
    }
    setBooking(false);
  };

  if (loading) return null;
  if (pricings.length === 0 && slots.length === 0) return null;

  const border = 'var(--gold-border-s)';
  const inputStyle: React.CSSProperties = { background: 'var(--glass)', border: `1px solid ${border}`, color: 'var(--text-h)', borderRadius: 8 };

  if (booked) {
    return (
      <div className="glass-card rounded-[8px] p-5 text-center" style={{ background: 'var(--card-bg)', border: `1px solid ${border}` }}>
        <Icon name="circle-check" size={36} style={{ color: 'var(--gold)', margin: '0 auto 8px' }} />
        <h3 style={{ fontSize: 16, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: 'var(--text-h)', marginBottom: 4 }}>
          Anfrage gesendet
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text-sec)' }}>
          {mentorName} wurde benachrichtigt. Du erhaeltst eine Bestaetigung sobald die Session angenommen wird.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-[8px] p-5" style={{ background: 'var(--card-bg)', border: `1px solid ${border}` }}>
      <h3 style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
        Face2Face buchen
      </h3>

      {/* Schritt 1: Tarif waehlen */}
      {pricings.length > 0 && (
        <div className="mb-4">
          <label style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            Waehle deine Session
          </label>
          <div className="flex flex-wrap gap-2">
            {pricings.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPricing(p)}
                className="border-none cursor-pointer flex flex-col items-center"
                style={{
                  padding: '8px 14px', borderRadius: 8,
                  background: selectedPricing?.id === p.id ? 'var(--gold-bg)' : 'var(--glass)',
                  color: selectedPricing?.id === p.id ? 'var(--gold-text)' : 'var(--text-sec)',
                  border: `1px solid ${selectedPricing?.id === p.id ? border : 'var(--glass-border)'}`,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 500 }}>{p.duration_minutes} Min</span>
                <span style={{ fontSize: 11 }}>{(p.price_cents / 100).toFixed(0)} €</span>
                {p.label && <span style={{ fontSize: 9, opacity: 0.7 }}>{p.label}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Schritt 2: Termin waehlen */}
      {slots.length > 0 ? (
        <div className="mb-4">
          <label style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            Verfuegbare Termine
          </label>
          <div className="flex flex-col gap-3 max-h-48 overflow-y-auto scrollbar-gold">
            {Object.entries(slotsByDate).map(([dateLabel, daySlots]) => (
              <div key={dateLabel}>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-h)', marginBottom: 4 }}>{dateLabel}</div>
                <div className="flex flex-wrap gap-1.5">
                  {daySlots.map(s => {
                    const time = new Date(s.starts_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                    const isSelected = selectedSlot?.id === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSlot(s)}
                        className="border-none cursor-pointer"
                        style={{
                          padding: '4px 10px', borderRadius: 8, fontSize: 12,
                          background: isSelected ? 'var(--gold)' : 'var(--glass)',
                          color: isSelected ? 'var(--text-on-gold)' : 'var(--text-sec)',
                          border: `1px solid ${isSelected ? 'var(--gold)' : 'var(--glass-border)'}`,
                        }}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-4 text-center py-3">
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Aktuell keine freien Termine verfuegbar.
          </p>
        </div>
      )}

      {/* Schritt 3: Thema (optional) */}
      {selectedSlot && (
        <div className="mb-4">
          <label style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>
            Thema oder Nachricht (optional)
          </label>
          <input
            type="text"
            placeholder="Worueber moechtest du sprechen?"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            className="w-full py-2 px-3 text-sm outline-none"
            style={inputStyle}
          />
        </div>
      )}

      {/* Fehler */}
      {error && <p style={{ fontSize: 11, color: 'var(--danger)', marginBottom: 8 }}>{error}</p>}

      {/* Buchen Button */}
      {currentUserId ? (
        <button
          onClick={handleBook}
          disabled={booking || !selectedSlot || !selectedPricing}
          className="w-full border-none cursor-pointer"
          style={{
            padding: '10px 0', borderRadius: 9999, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase',
            background: selectedSlot && selectedPricing ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))' : 'var(--glass)',
            color: selectedSlot && selectedPricing ? 'var(--text-on-gold)' : 'var(--text-muted)',
          }}
        >
          {booking ? 'Wird gebucht …' : selectedSlot ? `Session buchen · ${selectedPricing ? (selectedPricing.price_cents / 100).toFixed(0) + ' €' : ''}` : 'Waehle einen Termin'}
        </button>
      ) : (
        <a
          href="/login"
          className="block w-full text-center no-underline"
          style={{
            padding: '10px 0', borderRadius: 9999, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase',
            background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))', color: 'var(--text-on-gold)',
          }}
        >
          Einloggen um zu buchen
        </a>
      )}
    </div>
  );
}
