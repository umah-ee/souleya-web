'use client';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { fetchF2FSlots, deleteF2FSlot } from '@/lib/studio';
import type { F2FSlot } from '@/types/studio';

export default function CalendarPage() {
  const [slots, setSlots] = useState<F2FSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchF2FSlots({ from_date: new Date().toISOString() })
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Slot loeschen?')) return;
    await deleteF2FSlot(id).catch(() => {});
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div>
      <h2 style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>
        Kalender & Termine
      </h2>
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 40 }}>Lade Termine...</p>
      ) : slots.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center" style={{ background: 'var(--card-bg)' }}>
          <Icon name="calendar-event" size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 14, color: 'var(--text-sec)', fontStyle: 'italic' }}>Keine kommenden Termine.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {slots.map((slot) => {
            const d = new Date(slot.starts_at);
            return (
              <div key={slot.id} className="glass-card rounded-xl p-4 flex items-center gap-4" style={{ background: 'var(--card-bg)' }}>
                <div className="text-center flex-shrink-0" style={{ width: 50 }}>
                  <div style={{ fontSize: 20, fontStyle: 'italic', color: 'var(--text-h)' }}>{d.getDate()}</div>
                  <div style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    {d.toLocaleDateString('de-DE', { month: 'short' })}
                  </div>
                </div>
                <div className="flex-1">
                  <div style={{ fontSize: 13, color: 'var(--text-h)' }}>
                    {d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-sec)' }}>{slot.duration_minutes} Minuten · {slot.status === 'booked' ? 'Gebucht' : 'Verfuegbar'}</div>
                </div>
                <span style={{
                  padding: '3px 10px', borderRadius: 8, fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase',
                  background: slot.status === 'booked' ? 'var(--gold-bg)' : 'var(--success-bg)',
                  color: slot.status === 'booked' ? 'var(--gold-text)' : 'var(--success)',
                }}>
                  {slot.status === 'booked' ? 'Gebucht' : 'Frei'}
                </span>
                {slot.status !== 'booked' && (
                  <button onClick={() => handleDelete(slot.id)} className="border-none cursor-pointer" style={{ background: 'none', padding: 4 }}>
                    <Icon name="trash" size={14} style={{ color: 'var(--danger)' }} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
