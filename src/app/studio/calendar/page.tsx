'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { fetchF2FSlots, createF2FSlot, deleteF2FSlot } from '@/lib/studio';
import type { F2FSlot } from '@/types/studio';

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [slots, setSlots] = useState<F2FSlot[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form state
  const [creating, setCreating] = useState(searchParams.get('create') === '1');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDuration, setNewDuration] = useState(60);
  const [saving, setSaving] = useState(false);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const data = await fetchF2FSlots({ from_date: new Date().toISOString() });
      setSlots(data);
    } catch { setSlots([]); }
    setLoading(false);
  };

  useEffect(() => { loadSlots(); }, []);

  useEffect(() => {
    if (searchParams.get('create') === '1') setCreating(true);
  }, [searchParams]);

  const handleDelete = async (id: string) => {
    if (!confirm('Slot loeschen?')) return;
    await deleteF2FSlot(id).catch(() => {});
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleCreate = async () => {
    if (!newDate || !newTime) return;
    setSaving(true);
    try {
      const starts_at = new Date(`${newDate}T${newTime}`).toISOString();
      await createF2FSlot({ starts_at, duration_minutes: newDuration });
      setCreating(false);
      setNewDate('');
      setNewTime('');
      router.replace('/studio/calendar');
      loadSlots();
    } catch {
      alert('Termin konnte nicht erstellt werden.');
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
      <div className="flex items-center justify-between mb-6">
        <h2 style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Kalender & Termine
        </h2>
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
            Neuer Termin
          </button>
        )}
      </div>

      {/* Create Form */}
      {creating && (
        <div className="glass-card rounded-[8px] p-5 mb-6" style={{ background: 'var(--card-bg)', border: '1.5px solid var(--gold-border)' }}>
          <h3 style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold-text)', marginBottom: 12 }}>
            Neuen Termin erstellen
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <label style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, display: 'block', letterSpacing: '1px', textTransform: 'uppercase' }}>Datum</label>
                <input
                  autoFocus
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full py-2.5 px-4 text-sm font-body outline-none"
                  style={inputStyle}
                />
              </div>
              <div className="flex-1">
                <label style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, display: 'block', letterSpacing: '1px', textTransform: 'uppercase' }}>Uhrzeit</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full py-2.5 px-4 text-sm font-body outline-none"
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, display: 'block', letterSpacing: '1px', textTransform: 'uppercase' }}>Dauer</label>
              <div className="flex gap-2">
                {[30, 45, 60, 90].map((d) => (
                  <button
                    key={d}
                    onClick={() => setNewDuration(d)}
                    className="border-none cursor-pointer transition-all duration-200"
                    style={{
                      padding: '6px 14px', borderRadius: 8, fontSize: 10, letterSpacing: '1px',
                      background: newDuration === d ? 'var(--gold-bg)' : 'var(--glass)',
                      color: newDuration === d ? 'var(--gold-text)' : 'var(--text-muted)',
                      border: newDuration === d ? '1px solid var(--gold-border-s)' : '1px solid var(--glass-border)',
                    }}
                  >
                    {d} Min
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={saving || !newDate || !newTime}
                className="border-none cursor-pointer transition-all duration-200"
                style={{
                  padding: '10px 24px', borderRadius: 9999, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase',
                  background: newDate && newTime ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))' : 'var(--glass)',
                  color: newDate && newTime ? 'var(--text-on-gold)' : 'var(--text-muted)',
                }}
              >
                {saving ? 'Wird erstellt...' : 'Termin erstellen'}
              </button>
              <button
                onClick={() => { setCreating(false); setNewDate(''); setNewTime(''); router.replace('/studio/calendar'); }}
                className="border-none cursor-pointer"
                style={{ background: 'none', color: 'var(--text-muted)', fontSize: 11, padding: '10px 12px' }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 40 }}>Lade Termine...</p>
      ) : slots.length === 0 ? (
        <div className="glass-card rounded-[8px] p-8 text-center" style={{ background: 'var(--card-bg)' }}>
          <Icon name="calendar-event" size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 14, color: 'var(--text-sec)', fontStyle: 'italic' }}>Keine kommenden Termine.</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Nutze den + Button um einen Termin zu erstellen.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {slots.map((slot) => {
            const d = new Date(slot.starts_at);
            return (
              <div key={slot.id} className="glass-card rounded-[8px] p-4 flex items-center gap-4" style={{ background: 'var(--card-bg)' }}>
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
                  <div style={{ fontSize: 11, color: 'var(--text-sec)' }}>{slot.duration_minutes} Minuten &middot; {slot.status === 'booked' ? 'Gebucht' : 'Verfuegbar'}</div>
                </div>
                <span style={{
                  padding: '3px 10px', borderRadius: 6, fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase',
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
