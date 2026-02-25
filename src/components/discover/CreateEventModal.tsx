'use client';

import { useState, useRef, useEffect } from 'react';
import type { CreateEventData } from '@/types/events';
import { createEvent, geocodeLocation } from '@/lib/events';
import { Icon } from '@/components/ui/Icon';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

interface GeoSuggestion {
  place_name: string;
  lat: number;
  lng: number;
}

export default function CreateEventModal({ onClose, onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'meetup' | 'course'>('meetup');
  const [locationName, setLocationName] = useState('');
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Geocoding
  const [geoSuggestions, setGeoSuggestions] = useState<GeoSuggestion[]>([]);
  const [showGeoDropdown, setShowGeoDropdown] = useState(false);
  const geoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Ort-Eingabe: Debounced Geocoding
  useEffect(() => {
    if (geoTimer.current) clearTimeout(geoTimer.current);
    if (locationName.trim().length < 3) {
      setGeoSuggestions([]);
      setShowGeoDropdown(false);
      return;
    }
    geoTimer.current = setTimeout(async () => {
      try {
        const res = await geocodeLocation(locationName, 'forward');
        if (res.results && res.results.length > 0) {
          setGeoSuggestions(res.results.map((r) => ({
            place_name: r.place_name,
            lat: r.lat,
            lng: r.lng,
          })));
          setShowGeoDropdown(true);
        } else {
          setGeoSuggestions([]);
          setShowGeoDropdown(false);
        }
      } catch {
        setGeoSuggestions([]);
        setShowGeoDropdown(false);
      }
    }, 500);
    return () => {
      if (geoTimer.current) clearTimeout(geoTimer.current);
    };
  }, [locationName]);

  const handleGeoSelect = (geo: GeoSuggestion) => {
    setLocationName(geo.place_name);
    setLocationLat(geo.lat);
    setLocationLng(geo.lng);
    setShowGeoDropdown(false);
  };

  const handleSubmit = async () => {
    setError('');

    if (!title.trim()) { setError('Bitte gib einen Titel ein.'); return; }
    if (!locationName.trim()) { setError('Bitte gib einen Ort ein.'); return; }
    if (locationLat == null || locationLng == null) { setError('Bitte waehle einen Ort aus der Liste.'); return; }
    if (!date) { setError('Bitte waehle ein Datum.'); return; }
    if (!startTime) { setError('Bitte gib eine Startzeit ein.'); return; }

    const startsAt = new Date(`${date}T${startTime}`).toISOString();
    const endsAt = endTime ? new Date(`${date}T${endTime}`).toISOString() : undefined;

    const data: CreateEventData = {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      location_name: locationName.trim(),
      location_lat: locationLat,
      location_lng: locationLng,
      starts_at: startsAt,
      ends_at: endsAt,
      max_participants: maxParticipants ? parseInt(maxParticipants, 10) : undefined,
    };

    setSaving(true);
    try {
      await createEvent(data);
      onCreated();
    } catch (e) {
      console.error(e);
      setError('Event konnte nicht erstellt werden.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--glass)',
    border: '1px solid var(--gold-border-s)',
    color: 'var(--text-h)',
  };

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,.5)' }}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="glass-card rounded-2xl overflow-hidden mx-4 max-w-[440px] w-full max-h-[85vh] flex flex-col"
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold-Leiste */}
        <div
          className="h-[2px] flex-shrink-0"
          style={{ background: 'linear-gradient(to right, transparent, var(--gold-glow), transparent)' }}
        />

        {/* Header */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between flex-shrink-0">
          <h2 className="font-heading text-lg" style={{ color: 'var(--text-h)' }}>Event erstellen</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: 'var(--glass)', color: 'var(--text-muted)' }}
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Scrollbarer Body */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-3">
          {/* Titel */}
          <div>
            <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              Titel *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Yoga im Park"
              className="w-full py-2.5 px-4 rounded-[8px] text-sm font-body outline-none"
              style={inputStyle}
            />
          </div>

          {/* Beschreibung */}
          <div>
            <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              Beschreibung
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Was erwartet die Teilnehmer?"
              rows={3}
              className="w-full py-2.5 px-4 rounded-[8px] text-sm font-body outline-none resize-none"
              style={inputStyle}
            />
          </div>

          {/* Kategorie */}
          <div>
            <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              Kategorie
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setCategory('meetup')}
                className="flex-1 py-2 rounded-full font-label text-[0.6rem] tracking-[0.1em] uppercase transition-all duration-200 cursor-pointer"
                style={{
                  background: category === 'meetup' ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))' : 'transparent',
                  color: category === 'meetup' ? 'var(--text-on-gold)' : 'var(--text-muted)',
                  border: category === 'meetup' ? 'none' : '1px solid var(--divider)',
                }}
              >
                Meetup
              </button>
              <button
                onClick={() => setCategory('course')}
                className="flex-1 py-2 rounded-full font-label text-[0.6rem] tracking-[0.1em] uppercase transition-all duration-200 cursor-pointer"
                style={{
                  background: category === 'course' ? 'var(--event-purple)' : 'transparent',
                  color: category === 'course' ? '#fff' : 'var(--text-muted)',
                  border: category === 'course' ? 'none' : '1px solid var(--divider)',
                }}
              >
                Kurs
              </button>
            </div>
          </div>

          {/* Ort mit Geocoding */}
          <div className="relative">
            <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              Ort *
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => {
                setLocationName(e.target.value);
                setLocationLat(null);
                setLocationLng(null);
              }}
              placeholder="Ort suchen ..."
              className="w-full py-2.5 px-4 rounded-[8px] text-sm font-body outline-none"
              style={inputStyle}
            />
            {locationLat != null && (
              <span className="absolute right-3 top-[26px] text-[0.55rem]" style={{ color: 'var(--success)' }}>
                <Icon name="map-pin" size={12} />
              </span>
            )}

            {/* Geocoding-Dropdown */}
            {showGeoDropdown && geoSuggestions.length > 0 && (
              <div
                className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg overflow-hidden"
                style={{
                  background: 'var(--glass-nav)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid var(--glass-border)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                }}
              >
                {geoSuggestions.map((geo, i) => (
                  <button
                    key={i}
                    onClick={() => handleGeoSelect(geo)}
                    className="w-full text-left px-3 py-2.5 text-sm font-body flex items-center gap-2 cursor-pointer transition-colors"
                    style={{ color: 'var(--text-h)', borderBottom: i < geoSuggestions.length - 1 ? '1px solid var(--divider-l)' : undefined }}
                  >
                    <Icon name="map-pin" size={12} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                    <span className="truncate">{geo.place_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Datum + Zeiten */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                Datum *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full py-2.5 px-3 rounded-[8px] text-sm font-body outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                Start *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full py-2.5 px-3 rounded-[8px] text-sm font-body outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                Ende
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full py-2.5 px-3 rounded-[8px] text-sm font-body outline-none"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Max. Teilnehmer */}
          <div>
            <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              Max. Teilnehmer
            </label>
            <input
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              placeholder="Unbegrenzt"
              min={2}
              className="w-full py-2.5 px-4 rounded-[8px] text-sm font-body outline-none"
              style={inputStyle}
            />
          </div>

          {/* Fehler */}
          {error && (
            <p className="text-sm font-body py-2 px-3 rounded-lg" style={{ color: 'var(--error)', background: 'var(--error-bg)' }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-3 rounded-full font-label text-[0.7rem] tracking-[0.12em] uppercase transition-all duration-200 mt-2"
            style={{
              background: saving ? 'var(--gold-bg)' : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
              color: saving ? 'var(--text-muted)' : 'var(--text-on-gold)',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Wird erstellt ...' : 'Event erstellen'}
          </button>
        </div>
      </div>
    </div>
  );
}
