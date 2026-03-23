'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Icon } from '@/components/ui/Icon';
import { fetchF2FSlots, fetchF2FBookings, fetchCourses, deleteF2FSlot } from '@/lib/studio';
import { fetchMyEvents } from '@/lib/events';
import type { F2FSlot, F2FBooking, Course } from '@/types/studio';
import type { SoEvent } from '@/types/events';
import CreateEventModal from '@/components/discover/CreateEventModal';

// ── Typen ─────────────────────────────────────────────────
type CalendarItemType = 'event' | 'course' | 'f2f';

interface CalendarItem {
  id: string;
  type: CalendarItemType;
  title: string;
  subtitle: string;
  startsAt: Date;
  endsAt: Date;
  coverUrl?: string | null;
  status?: string;
  participants?: number;
  maxParticipants?: number | null;
  location?: string | null;
  raw: SoEvent | Course | (F2FSlot & { booking?: F2FBooking });
}

// ── Hilfsfunktionen ───────────────────────────────────────
function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Montag = Start
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MONTH_NAMES = ['Januar', 'Februar', 'Maerz', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7:00 bis 22:00

// ── Icon + Farbe pro Typ ──────────────────────────────────
function typeConfig(type: CalendarItemType) {
  switch (type) {
    case 'event': return { icon: 'calendar-event' as const, color: 'var(--gold)', bg: 'var(--gold-bg)', label: 'Event' };
    case 'course': return { icon: 'school' as const, color: '#6EAA78', bg: 'rgba(110,170,120,.12)', label: 'Kurs' };
    case 'f2f': return { icon: 'video' as const, color: '#7BA0D4', bg: 'rgba(123,160,212,.12)', label: 'Face2Face' };
  }
}

// ══════════════════════════════════════════════════════════
export default function CalendarPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [miniMonthOffset, setMiniMonthOffset] = useState(0); // 0 = aktueller Monat

  // Modals
  const [showCreateChoice, setShowCreateChoice] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);

  // ── Daten laden ─────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const weekEnd = addDays(weekStart, 7);
      const fromISO = weekStart.toISOString();
      const toISO = weekEnd.toISOString();

      const [slotsRes, bookingsRes, coursesRes, eventsRes] = await Promise.allSettled([
        fetchF2FSlots({ from_date: fromISO, to_date: toISO }),
        fetchF2FBookings({ status: 'confirmed' }),
        fetchCourses({ status: 'active' }),
        fetchMyEvents(),
      ]);

      const slots: F2FSlot[] = slotsRes.status === 'fulfilled' ? slotsRes.value : [];
      const bookings: F2FBooking[] = bookingsRes.status === 'fulfilled' ? (bookingsRes.value as { data: F2FBooking[] }).data ?? bookingsRes.value as F2FBooking[] : [];
      const courses: Course[] = coursesRes.status === 'fulfilled' ? (coursesRes.value as { data: Course[] }).data ?? [] : [];
      const events: SoEvent[] = eventsRes.status === 'fulfilled' ? (eventsRes.value as { data: SoEvent[] }).data ?? eventsRes.value as SoEvent[] : [];

      const bookingMap = new Map<string, F2FBooking>();
      for (const b of bookings) {
        if (b.slot_id) bookingMap.set(b.slot_id, b);
      }

      const calItems: CalendarItem[] = [];

      // F2F Slots
      for (const s of slots) {
        const start = new Date(s.starts_at);
        const end = new Date(start.getTime() + s.duration_minutes * 60_000);
        const booking = bookingMap.get(s.id);
        calItems.push({
          id: s.id,
          type: 'f2f',
          title: booking ? (booking.client?.display_name || 'Gebucht') : 'Verfuegbar',
          subtitle: `${s.duration_minutes} Min.`,
          startsAt: start,
          endsAt: end,
          status: s.status,
          raw: { ...s, booking },
        });
      }

      // Kurse mit festem Termin
      for (const c of courses) {
        if (!c.starts_at) continue;
        const start = new Date(c.starts_at);
        const end = c.ends_at ? new Date(c.ends_at) : new Date(start.getTime() + 90 * 60_000);
        calItems.push({
          id: c.id,
          type: 'course',
          title: c.title,
          subtitle: `${c.participants_count} Teilnehmer`,
          startsAt: start,
          endsAt: end,
          coverUrl: c.cover_url,
          participants: c.participants_count,
          maxParticipants: c.max_participants,
          location: c.location_name,
          status: c.status,
          raw: c,
        });
      }

      // Events
      for (const e of events) {
        const start = new Date(e.starts_at);
        const end = e.ends_at ? new Date(e.ends_at) : new Date(start.getTime() + 120 * 60_000);
        calItems.push({
          id: e.id,
          type: 'event',
          title: e.title,
          subtitle: `${e.participants_count}${e.max_participants ? '/' + e.max_participants : ''} Teilnehmer`,
          startsAt: start,
          endsAt: end,
          coverUrl: e.cover_url,
          participants: e.participants_count,
          maxParticipants: e.max_participants,
          location: e.location_name,
          raw: e,
        });
      }

      setItems(calItems);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, [weekStart]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Abgeleitete Daten ───────────────────────────────────
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const dayItems = useMemo(() => items.filter(it => isSameDay(it.startsAt, selectedDay)).sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime()), [items, selectedDay]);
  const daysWithItems = useMemo(() => {
    const set = new Set<string>();
    items.forEach(it => set.add(`${it.startsAt.getFullYear()}-${it.startsAt.getMonth()}-${it.startsAt.getDate()}`));
    return set;
  }, [items]);

  // ── Mini-Monat Daten ────────────────────────────────────
  const miniMonth = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + miniMonthOffset;
    const first = new Date(year, month, 1);
    const startDay = first.getDay() === 0 ? 6 : first.getDay() - 1; // Mo=0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { year: first.getFullYear(), month: first.getMonth(), startDay, daysInMonth, label: `${MONTH_NAMES[first.getMonth()]} ${first.getFullYear()}` };
  }, [miniMonthOffset]);

  // ── Navigation ──────────────────────────────────────────
  const goToPrevWeek = () => setWeekStart(addDays(weekStart, -7));
  const goToNextWeek = () => setWeekStart(addDays(weekStart, 7));
  const goToToday = () => {
    const today = new Date();
    setWeekStart(startOfWeek(today));
    setSelectedDay(today);
    setMiniMonthOffset(0);
  };

  const selectMiniDay = (day: number) => {
    const d = new Date(miniMonth.year, miniMonth.month, day);
    setSelectedDay(d);
    setWeekStart(startOfWeek(d));
  };

  // ── Item Klick ──────────────────────────────────────────
  const handleItemClick = (item: CalendarItem) => {
    setSelectedItem(item);
  };

  // ── F2F Slot loeschen ──────────────────────────────────
  const handleDeleteSlot = async (item: CalendarItem) => {
    if (item.type !== 'f2f') return;
    if (!confirm('Termin loeschen?')) return;
    await deleteF2FSlot(item.id).catch(() => {});
    loadData();
  };

  // ── Items fuer eine bestimmte Stunde an einem Tag ──────
  const getItemsForHour = (day: Date, hour: number) => {
    return items.filter(it => isSameDay(it.startsAt, day) && it.startsAt.getHours() === hour);
  };

  // ── Styles ──────────────────────────────────────────────
  const cardBg = 'var(--card-bg)';
  const borderColor = 'var(--gold-border-s)';
  const mutedText = 'var(--text-muted)';
  const secText = 'var(--text-sec)';
  const headText = 'var(--text-h)';

  return (
    <div className="flex flex-col gap-4">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: mutedText }}>
          Kalender
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={goToToday} className="border-none cursor-pointer" style={{ padding: '5px 12px', borderRadius: 8, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', background: 'var(--glass)', color: secText, border: `1px solid ${borderColor}` }}>
            Heute
          </button>
          <button onClick={() => setShowCreateChoice(true)} className="border-none cursor-pointer flex items-center gap-1.5" style={{ padding: '6px 14px', borderRadius: 9999, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))', color: 'var(--text-on-gold)' }}>
            <Icon name="plus" size={12} />
            Neuer Termin
          </button>
        </div>
      </div>

      {/* ── Main Grid: Mini-Monat + Wochenansicht + Tages-Panel */}
      <div className="flex gap-4" style={{ minHeight: 'calc(100vh - 180px)' }}>

        {/* ── Linke Spalte: Mini-Monat ─────────────────────── */}
        <div className="hidden lg:block flex-shrink-0" style={{ width: 220 }}>
          <div className="glass-card rounded-[8px] p-3" style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
            {/* Monat Navigation */}
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => setMiniMonthOffset(o => o - 1)} className="border-none cursor-pointer p-1" style={{ background: 'none' }}>
                <Icon name="chevron-left" size={14} style={{ color: secText }} />
              </button>
              <span style={{ fontSize: 11, fontWeight: 500, color: headText }}>{miniMonth.label}</span>
              <button onClick={() => setMiniMonthOffset(o => o + 1)} className="border-none cursor-pointer p-1" style={{ background: 'none' }}>
                <Icon name="chevron-right" size={14} style={{ color: secText }} />
              </button>
            </div>

            {/* Wochentag-Header */}
            <div className="grid grid-cols-7 gap-0 mb-1">
              {WEEKDAYS.map(d => (
                <div key={d} className="text-center" style={{ fontSize: 9, color: mutedText, padding: '2px 0' }}>{d}</div>
              ))}
            </div>

            {/* Tage */}
            <div className="grid grid-cols-7 gap-0">
              {Array.from({ length: miniMonth.startDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: miniMonth.daysInMonth }, (_, i) => i + 1).map(day => {
                const d = new Date(miniMonth.year, miniMonth.month, day);
                const isToday = isSameDay(d, new Date());
                const isSelected = isSameDay(d, selectedDay);
                const hasItems = daysWithItems.has(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
                return (
                  <button
                    key={day}
                    onClick={() => selectMiniDay(day)}
                    className="border-none cursor-pointer flex flex-col items-center justify-center"
                    style={{
                      width: 28, height: 28, margin: '1px auto',
                      borderRadius: '50%',
                      fontSize: 11,
                      fontWeight: isToday ? 600 : 400,
                      background: isSelected ? 'var(--gold)' : isToday ? 'var(--gold-bg)' : 'transparent',
                      color: isSelected ? 'var(--text-on-gold)' : isToday ? 'var(--gold-text)' : secText,
                    }}
                  >
                    {day}
                    {hasItems && !isSelected && (
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)', marginTop: -2 }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Legende ──────────────────────────────────── */}
          <div className="mt-3 flex flex-col gap-1.5 px-1">
            {(['event', 'course', 'f2f'] as CalendarItemType[]).map(t => {
              const cfg = typeConfig(t);
              return (
                <div key={t} className="flex items-center gap-2">
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: cfg.color }} />
                  <span style={{ fontSize: 10, color: secText }}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Mitte: Wochenansicht ─────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="glass-card rounded-[8px] overflow-hidden" style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
            {/* Wochennavigation */}
            <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: `1px solid var(--divider-l)` }}>
              <button onClick={goToPrevWeek} className="border-none cursor-pointer p-1" style={{ background: 'none' }}>
                <Icon name="chevron-left" size={16} style={{ color: secText }} />
              </button>
              <span style={{ fontSize: 12, fontWeight: 500, color: headText }}>
                {weekDays[0].toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })} – {weekDays[6].toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <button onClick={goToNextWeek} className="border-none cursor-pointer p-1" style={{ background: 'none' }}>
                <Icon name="chevron-right" size={16} style={{ color: secText }} />
              </button>
            </div>

            {/* Wochentag-Header */}
            <div className="grid" style={{ gridTemplateColumns: '48px repeat(7, 1fr)', borderBottom: `1px solid var(--divider-l)` }}>
              <div />
              {weekDays.map((d, i) => {
                const isToday = isSameDay(d, new Date());
                const isSelected = isSameDay(d, selectedDay);
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(d)}
                    className="border-none cursor-pointer text-center py-2"
                    style={{ background: isSelected ? 'var(--gold-bg)' : 'transparent' }}
                  >
                    <div style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: isToday ? 'var(--gold)' : mutedText }}>{WEEKDAYS[i]}</div>
                    <div style={{
                      fontSize: 16, fontWeight: isToday ? 600 : 400, fontStyle: 'italic',
                      color: isToday ? 'var(--gold)' : headText,
                    }}>{d.getDate()}</div>
                  </button>
                );
              })}
            </div>

            {/* Stunden-Grid */}
            <div className="overflow-y-auto scrollbar-gold" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              {HOURS.map(hour => (
                <div key={hour} className="grid" style={{ gridTemplateColumns: '48px repeat(7, 1fr)', minHeight: 56, borderBottom: `1px solid var(--divider-l)` }}>
                  {/* Stundenlabel */}
                  <div className="text-right pr-2 pt-1" style={{ fontSize: 10, color: mutedText }}>
                    {hour}:00
                  </div>
                  {/* 7 Tages-Zellen */}
                  {weekDays.map((day, di) => {
                    const cellItems = getItemsForHour(day, hour);
                    const isSelected = isSameDay(day, selectedDay);
                    return (
                      <div
                        key={di}
                        className="relative cursor-pointer"
                        style={{
                          borderLeft: `1px solid var(--divider-l)`,
                          background: isSelected ? 'rgba(200,169,110,.04)' : 'transparent',
                          padding: '2px 2px',
                          minHeight: 56,
                        }}
                        onClick={() => {
                          setSelectedDay(day);
                          if (cellItems.length === 0) setShowCreateChoice(true);
                        }}
                      >
                        {cellItems.map(item => {
                          const cfg = typeConfig(item.type);
                          return (
                            <div
                              key={item.id}
                              className="rounded-[4px] px-1.5 py-1 mb-0.5 cursor-pointer transition-all duration-150"
                              style={{
                                background: cfg.bg,
                                borderLeft: `3px solid ${cfg.color}`,
                                fontSize: 10,
                              }}
                              onClick={(e) => { e.stopPropagation(); handleItemClick(item); setSelectedDay(day); }}
                            >
                              <div className="truncate" style={{ fontWeight: 500, color: headText }}>{item.title}</div>
                              <div style={{ color: mutedText, fontSize: 9 }}>{formatTime(item.startsAt)}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Rechts: Tages-Panel ──────────────────────────── */}
        <div className="hidden md:block flex-shrink-0" style={{ width: 300 }}>
          <div className="glass-card rounded-[8px] p-4" style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: mutedText }}>
                  {selectedDay.toLocaleDateString('de-DE', { weekday: 'long' })}
                </div>
                <div style={{ fontSize: 22, fontStyle: 'italic', color: headText }}>
                  {selectedDay.toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}
                </div>
              </div>
              <div style={{ fontSize: 11, color: mutedText }}>
                {dayItems.length} {dayItems.length === 1 ? 'Termin' : 'Termine'}
              </div>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto scrollbar-gold" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              {loading ? (
                <p style={{ color: mutedText, fontSize: 12, textAlign: 'center', padding: '24px 0' }}>Lade …</p>
              ) : dayItems.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="calendar-event" size={32} style={{ color: mutedText, margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 12, color: secText, fontStyle: 'italic' }}>Keine Termine an diesem Tag.</p>
                  <button
                    onClick={() => setShowCreateChoice(true)}
                    className="border-none cursor-pointer mt-3"
                    style={{ padding: '6px 16px', borderRadius: 9999, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', background: 'var(--gold-bg)', color: 'var(--gold-text)', border: `1px solid ${borderColor}` }}
                  >
                    <Icon name="plus" size={10} /> Termin erstellen
                  </button>
                </div>
              ) : dayItems.map(item => {
                const cfg = typeConfig(item.type);
                return (
                  <div
                    key={item.id}
                    className="rounded-[8px] overflow-hidden cursor-pointer transition-all duration-200"
                    style={{ background: 'var(--glass)', border: `1px solid ${borderColor}` }}
                    onClick={() => handleItemClick(item)}
                  >
                    {/* Cover-Bild (Events + Kurse) */}
                    {item.coverUrl && (
                      <div style={{ height: 80, background: `url(${item.coverUrl}) center/cover`, position: 'relative' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 40%, rgba(0,0,0,.5))' }} />
                      </div>
                    )}
                    <div className="p-3">
                      {/* Typ-Badge */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Icon name={cfg.icon} size={12} style={{ color: cfg.color }} />
                        <span style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: cfg.color, fontWeight: 500 }}>{cfg.label}</span>
                        {item.type === 'f2f' && item.status === 'booked' && (
                          <span style={{ marginLeft: 'auto', fontSize: 9, padding: '1px 6px', borderRadius: 4, background: 'var(--gold-bg)', color: 'var(--gold-text)' }}>Gebucht</span>
                        )}
                        {item.type === 'f2f' && item.status !== 'booked' && (
                          <span style={{ marginLeft: 'auto', fontSize: 9, padding: '1px 6px', borderRadius: 4, background: 'var(--success-bg)', color: 'var(--success)' }}>Frei</span>
                        )}
                      </div>
                      {/* Titel */}
                      <div style={{ fontSize: 13, fontWeight: 500, color: headText, marginBottom: 2 }}>{item.title}</div>
                      {/* Zeit */}
                      <div className="flex items-center gap-1" style={{ fontSize: 11, color: secText }}>
                        <Icon name="clock" size={11} style={{ color: mutedText }} />
                        {formatTime(item.startsAt)} – {formatTime(item.endsAt)}
                      </div>
                      {/* Ort */}
                      {item.location && (
                        <div className="flex items-center gap-1 mt-1" style={{ fontSize: 11, color: secText }}>
                          <Icon name="map-pin" size={11} style={{ color: mutedText }} />
                          <span className="truncate">{item.location}</span>
                        </div>
                      )}
                      {/* Teilnehmer */}
                      {item.participants != null && (
                        <div className="flex items-center gap-1 mt-1" style={{ fontSize: 11, color: secText }}>
                          <Icon name="users" size={11} style={{ color: mutedText }} />
                          {item.participants}{item.maxParticipants ? `/${item.maxParticipants}` : ''} Teilnehmer
                        </div>
                      )}
                      {/* Aktionen */}
                      {item.type === 'f2f' && item.status !== 'booked' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteSlot(item); }}
                          className="border-none cursor-pointer mt-2 flex items-center gap-1"
                          style={{ background: 'none', padding: 0, fontSize: 10, color: 'var(--danger)' }}
                        >
                          <Icon name="trash" size={11} /> Loeschen
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal: Termin-Typ waehlen ──────────────────────── */}
      {showCreateChoice && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          onClick={() => setShowCreateChoice(false)}
        >
          <div
            className="rounded-[8px] p-6 w-full max-w-sm"
            style={{ background: cardBg, border: `1px solid ${borderColor}` }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: mutedText, marginBottom: 16 }}>
              Was moechtest du erstellen?
            </h3>
            <div className="flex flex-col gap-2">
              {([
                { type: 'event' as CalendarItemType, label: 'Event', desc: 'Meetup oder Veranstaltung', icon: 'calendar-event' as const },
                { type: 'course' as CalendarItemType, label: 'Kurs', desc: 'Online- oder Praesenz-Kurs', icon: 'school' as const },
                { type: 'f2f' as CalendarItemType, label: 'Face2Face Slot', desc: '1:1 Session verfuegbar machen', icon: 'video' as const },
              ]).map(opt => {
                const cfg = typeConfig(opt.type);
                return (
                  <button
                    key={opt.type}
                    className="flex items-center gap-3 rounded-[8px] border-none cursor-pointer text-left transition-all duration-200 w-full"
                    style={{ padding: '12px 14px', background: 'var(--glass)', border: `1px solid ${borderColor}` }}
                    onClick={() => {
                      setShowCreateChoice(false);
                      if (opt.type === 'event') setShowEventModal(true);
                      if (opt.type === 'course') window.location.href = '/studio/courses?create=1';
                      if (opt.type === 'f2f') window.location.href = '/studio/f2f?create=1';
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = cfg.bg; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass)'; }}
                  >
                    <div className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: 8, background: cfg.bg }}>
                      <Icon name={cfg.icon} size={18} style={{ color: cfg.color }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: headText }}>{opt.label}</div>
                      <div style={{ fontSize: 11, color: secText }}>{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── CreateEventModal ──────────────────────────────── */}
      {showEventModal && (
        <CreateEventModal
          onClose={() => setShowEventModal(false)}
          onCreated={() => { setShowEventModal(false); loadData(); }}
        />
      )}

      {/* ── Item Detail Modal ─────────────────────────────── */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="rounded-[8px] w-full max-w-lg overflow-hidden"
            style={{ background: cardBg, border: `1px solid ${borderColor}`, maxHeight: '80vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Cover */}
            {selectedItem.coverUrl && (
              <div style={{ height: 160, background: `url(${selectedItem.coverUrl}) center/cover`, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 40%, rgba(0,0,0,.6))' }} />
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-3 right-3 border-none cursor-pointer"
                  style={{ background: 'rgba(0,0,0,.3)', backdropFilter: 'blur(8px)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Icon name="x" size={16} style={{ color: '#fff' }} />
                </button>
              </div>
            )}
            <div className="p-5 overflow-y-auto scrollbar-gold" style={{ maxHeight: selectedItem.coverUrl ? 'calc(80vh - 160px)' : '80vh' }}>
              {!selectedItem.coverUrl && (
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-3 right-3 border-none cursor-pointer"
                  style={{ background: 'var(--glass)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${borderColor}` }}
                >
                  <Icon name="x" size={16} style={{ color: secText }} />
                </button>
              )}
              {/* Typ Badge */}
              {(() => { const cfg = typeConfig(selectedItem.type); return (
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon name={cfg.icon} size={14} style={{ color: cfg.color }} />
                  <span style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: cfg.color, fontWeight: 500 }}>{cfg.label}</span>
                </div>
              ); })()}
              {/* Titel */}
              <h3 style={{ fontSize: 20, fontStyle: 'italic', color: headText, marginBottom: 8, fontFamily: 'Cormorant Garamond, serif', fontWeight: 400 }}>
                {selectedItem.title}
              </h3>
              {/* Details */}
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center gap-2" style={{ fontSize: 13, color: secText }}>
                  <Icon name="calendar-event" size={14} style={{ color: mutedText }} />
                  {selectedItem.startsAt.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-2" style={{ fontSize: 13, color: secText }}>
                  <Icon name="clock" size={14} style={{ color: mutedText }} />
                  {formatTime(selectedItem.startsAt)} – {formatTime(selectedItem.endsAt)}
                </div>
                {selectedItem.location && (
                  <div className="flex items-center gap-2" style={{ fontSize: 13, color: secText }}>
                    <Icon name="map-pin" size={14} style={{ color: mutedText }} />
                    {selectedItem.location}
                  </div>
                )}
                {selectedItem.participants != null && (
                  <div className="flex items-center gap-2" style={{ fontSize: 13, color: secText }}>
                    <Icon name="users" size={14} style={{ color: mutedText }} />
                    {selectedItem.participants}{selectedItem.maxParticipants ? ` / ${selectedItem.maxParticipants}` : ''} Teilnehmer
                  </div>
                )}
              </div>
              {/* Subtitle / Status */}
              <p style={{ fontSize: 12, color: secText }}>{selectedItem.subtitle}</p>
              {/* Aktionen */}
              <div className="flex gap-2 mt-4">
                {selectedItem.type === 'f2f' && selectedItem.status !== 'booked' && (
                  <button
                    onClick={() => { handleDeleteSlot(selectedItem); setSelectedItem(null); }}
                    className="border-none cursor-pointer flex items-center gap-1.5"
                    style={{ padding: '8px 16px', borderRadius: 9999, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', background: 'rgba(220,50,50,.1)', color: 'var(--danger)', border: '1px solid rgba(220,50,50,.2)' }}
                  >
                    <Icon name="trash" size={12} /> Loeschen
                  </button>
                )}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="border-none cursor-pointer"
                  style={{ padding: '8px 16px', borderRadius: 9999, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', background: 'var(--glass)', color: secText, border: `1px solid ${borderColor}` }}
                >
                  Schliessen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
