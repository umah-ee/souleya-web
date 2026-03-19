'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { CreateEventData } from '@/types/events';
import { createEvent, geocodeLocation, searchUnsplashImages, triggerUnsplashDownload } from '@/lib/events';
import type { UnsplashImage } from '@/lib/events';
import { Icon } from '@/components/ui/Icon';
import SoDatePicker from '@/components/ui/SoDatePicker';
import SoTimePicker from '@/components/ui/SoTimePicker';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

interface GeoSuggestion {
  place_name: string;
  text: string;
  lat: number;
  lng: number;
  feature_type: string;
}

export default function CreateEventModal({ onClose, onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'meetup' | 'course'>('meetup');
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Cover-Bild
  const [coverUrl, setCoverUrl] = useState('');
  const [unsplashResults, setUnsplashResults] = useState<UnsplashImage[]>([]);
  const [unsplashLoading, setUnsplashLoading] = useState(false);
  const [selectedUnsplash, setSelectedUnsplash] = useState<UnsplashImage | null>(null);
  const [showUnsplashPicker, setShowUnsplashPicker] = useState(false);
  const unsplashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Geocoding
  const [geoSuggestions, setGeoSuggestions] = useState<GeoSuggestion[]>([]);
  const [showGeoDropdown, setShowGeoDropdown] = useState(false);
  const geoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // ── Unsplash-Vorschlag basierend auf Titel (debounced) ──────
  const searchUnsplash = useCallback(async (query: string) => {
    if (query.trim().length < 3) {
      setUnsplashResults([]);
      return;
    }
    setUnsplashLoading(true);
    try {
      const res = await searchUnsplashImages(query, 6);
      setUnsplashResults(res.results ?? []);
      // Automatisch erstes Bild als Vorschlag setzen (wenn noch kein Bild gewählt)
      if (!coverUrl && !selectedUnsplash && res.results?.length > 0) {
        setSelectedUnsplash(res.results[0]);
        setCoverUrl(res.results[0].imageUrl);
      }
    } catch {
      setUnsplashResults([]);
    } finally {
      setUnsplashLoading(false);
    }
  }, [coverUrl, selectedUnsplash]);

  // Debounced Unsplash-Suche wenn Titel sich aendert
  useEffect(() => {
    if (unsplashTimer.current) clearTimeout(unsplashTimer.current);
    if (title.trim().length < 3) return;
    unsplashTimer.current = setTimeout(() => {
      searchUnsplash(title);
    }, 800);
    return () => {
      if (unsplashTimer.current) clearTimeout(unsplashTimer.current);
    };
  }, [title, searchUnsplash]);

  // ── Geocoding (debounced) ──────────────────────────────────
  useEffect(() => {
    if (geoTimer.current) clearTimeout(geoTimer.current);
    if (locationName.trim().length < 3 || locationLat != null) {
      setGeoSuggestions([]);
      setShowGeoDropdown(false);
      return;
    }
    geoTimer.current = setTimeout(async () => {
      try {
        // Events: Auch POIs, Adressen und Strassen durchsuchen
        const res = await geocodeLocation(locationName, 'forward', undefined, undefined, 'poi,address,place,locality');
        if (res.results && res.results.length > 0) {
          setGeoSuggestions(res.results.map((r) => ({
            place_name: r.place_name,
            text: r.text,
            lat: r.lat,
            lng: r.lng,
            feature_type: r.feature_type,
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
  }, [locationName, locationLat]);

  const handleGeoSelect = (geo: GeoSuggestion) => {
    // Volle Adresse ins Eingabefeld (Strasse + Stadt + Land)
    setLocationName(geo.place_name);
    setLocationAddress(geo.place_name);
    setLocationLat(geo.lat);
    setLocationLng(geo.lng);
    setShowGeoDropdown(false);
  };

  // GPS-Standort erkennen
  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      setError('Standorterkennung wird nicht unterstuetzt.');
      return;
    }
    setDetectingLocation(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
      });
      const { latitude, longitude } = pos.coords;
      // Reverse Geocoding — genaue Adresse holen (nicht nur Stadt)
      const res = await geocodeLocation(`${longitude},${latitude}`, 'reverse', undefined, undefined, 'address');
      if (res.results.length > 0) {
        const place = res.results[0];
        setLocationName(place.place_name);
        setLocationAddress(place.place_name);
        setLocationLat(place.lat);
        setLocationLng(place.lng);
      }
    } catch {
      setError('Standort konnte nicht erkannt werden.');
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleSelectUnsplash = (img: UnsplashImage) => {
    setSelectedUnsplash(img);
    setCoverUrl(img.imageUrl);
    setShowUnsplashPicker(false);
    // Unsplash API Guideline: Download-Event triggern
    triggerUnsplashDownload(img.downloadUrl).catch(() => {});
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
      location_address: locationAddress.trim() || undefined,
      location_lat: locationLat,
      location_lng: locationLng,
      starts_at: startsAt,
      ends_at: endsAt,
      max_participants: maxParticipants ? parseInt(maxParticipants, 10) : undefined,
      cover_url: coverUrl || undefined,
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
        className="rounded-2xl overflow-hidden mx-4 max-w-[440px] w-full max-h-[85vh] flex flex-col"
        style={{
          background: 'var(--bg-solid)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
        }}
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

          {/* ── Cover-Bild Vorschau ── */}
          <div>
            <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              Cover-Bild
            </label>
            <div
              className="relative w-full rounded-[8px] overflow-hidden cursor-pointer group"
              style={{ height: 140, background: 'var(--glass)' }}
              onClick={() => setShowUnsplashPicker(!showUnsplashPicker)}
            >
              {coverUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverUrl}
                    alt="Event Cover"
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay bei Hover */}
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(0,0,0,0.4)' }}
                  >
                    <span className="font-label text-[0.6rem] tracking-[0.1em] uppercase text-white">
                      Bild aendern
                    </span>
                  </div>
                  {/* Fotograf-Credit */}
                  {selectedUnsplash && (
                    <div className="absolute bottom-1 left-2 text-[0.5rem] font-body" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Foto: {selectedUnsplash.photographer} / Unsplash
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                  <Icon name="photo" size={24} />
                  <span className="font-label text-[0.55rem] tracking-[0.1em] uppercase">
                    {unsplashLoading ? 'Suche Bilder ...' : 'Titeleingabe schlaegt Bilder vor'}
                  </span>
                </div>
              )}
            </div>

            {/* Unsplash-Picker (6 Thumbnails) */}
            {showUnsplashPicker && unsplashResults.length > 0 && (
              <div className="mt-2">
                <div className="grid grid-cols-3 gap-1.5">
                  {unsplashResults.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectUnsplash(img)}
                      className="relative rounded-lg overflow-hidden cursor-pointer group/thumb"
                      style={{
                        height: 64,
                        border: coverUrl === img.imageUrl ? '2px solid var(--gold)' : '1px solid var(--divider)',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.thumbUrl} alt={img.photographer} className="w-full h-full object-cover" />
                      <div
                        className="absolute bottom-0 inset-x-0 text-[7px] font-body px-1 py-0.5 truncate"
                        style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.7)' }}
                      >
                        {img.photographer}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-[0.5rem] font-body mt-1.5 text-center" style={{ color: 'var(--text-muted)' }}>
                  Oder eigenes Bild per URL einfuegen:
                </p>
                <input
                  type="url"
                  value={selectedUnsplash ? '' : coverUrl}
                  onChange={(e) => {
                    setCoverUrl(e.target.value);
                    setSelectedUnsplash(null);
                  }}
                  placeholder="https://..."
                  className="w-full py-1.5 px-3 rounded-[8px] text-xs font-body outline-none mt-1"
                  style={inputStyle}
                />
              </div>
            )}
          </div>

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

          {/* Ort mit Geocoding + GPS */}
          <div className="relative" style={{ overflow: 'visible' }}>
            <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              Ort *
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => {
                    setLocationName(e.target.value);
                    setLocationAddress('');
                    setLocationLat(null);
                    setLocationLng(null);
                  }}
                  placeholder="Adresse oder Ort suchen ..."
                  className="w-full py-2.5 px-4 pr-8 rounded-[8px] text-sm font-body outline-none"
                  style={inputStyle}
                />
                {locationLat != null && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--success)' }}>
                    <Icon name="map-pin" size={12} />
                  </span>
                )}
              </div>
              {/* GPS Button */}
              <button
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                className="flex-shrink-0 w-10 h-10 rounded-[8px] flex items-center justify-center cursor-pointer transition-colors"
                style={{ background: 'var(--glass)', border: '1px solid var(--gold-border-s)', color: 'var(--gold)' }}
                title="Standort erkennen"
              >
                {detectingLocation ? (
                  <span className="text-[0.5rem]">...</span>
                ) : (
                  <Icon name="current-location" size={16} />
                )}
              </button>
            </div>

            {/* Geocoding-Dropdown */}
            {showGeoDropdown && geoSuggestions.length > 0 && (
              <div
                className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg overflow-hidden max-h-[220px] overflow-y-auto"
                style={{
                  background: 'var(--bg-solid)',
                  border: '1px solid var(--glass-border)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                }}
              >
                {geoSuggestions.map((geo, i) => {
                  const typeLabel = geo.feature_type === 'poi' ? 'Ort' : geo.feature_type === 'address' ? 'Adresse' : geo.feature_type === 'place' ? 'Stadt' : geo.feature_type === 'neighborhood' ? 'Viertel' : 'Gebiet';
                  const iconName = geo.feature_type === 'poi' ? 'building-store' : 'map-pin';
                  return (
                    <button
                      key={i}
                      onClick={() => handleGeoSelect(geo)}
                      className="w-full text-left px-3 py-2.5 font-body flex items-start gap-2 cursor-pointer transition-colors"
                      style={{ color: 'var(--text-h)', borderBottom: i < geoSuggestions.length - 1 ? '1px solid var(--divider-l)' : undefined }}
                    >
                      <Icon name={iconName} size={14} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '2px' }} />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm truncate block">{geo.place_name}</span>
                        <span className="text-[0.6rem] font-label uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>{typeLabel}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Datum + Start + Ende auf einer Zeile */}
          <div>
            <label className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              Wann *
            </label>
            <div className="grid grid-cols-[1fr_auto_auto] gap-1.5 items-center">
              <SoDatePicker
                value={date}
                onChange={setDate}
                placeholder="Datum"
              />
              <SoTimePicker
                value={startTime}
                onChange={setStartTime}
                placeholder="Von"
              />
              <SoTimePicker
                value={endTime}
                onChange={setEndTime}
                placeholder="Bis"
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
