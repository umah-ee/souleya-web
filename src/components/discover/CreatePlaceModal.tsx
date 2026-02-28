'use client';

import { useState, useRef, useEffect } from 'react';
import type { CreatePlaceData } from '@/types/places';
import { createPlace, PLACE_TAGS } from '@/lib/places';
import { geocodeLocation } from '@/lib/events';
import { Icon } from '@/components/ui/Icon';

interface Props {
  onClose: () => void;
  onCreated: () => void;
  defaultLat?: number;
  defaultLng?: number;
}

interface GeoSuggestion {
  place_name: string;
  text: string;
  lat: number;
  lng: number;
  feature_type: string;
}

export default function CreatePlaceModal({ onClose, onCreated, defaultLat, defaultLng }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [locationLat, setLocationLat] = useState<number | null>(defaultLat ?? null);
  const [locationLng, setLocationLng] = useState<number | null>(defaultLng ?? null);
  const [coverUrl, setCoverUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Geocoding
  const [geoSuggestions, setGeoSuggestions] = useState<GeoSuggestion[]>([]);
  const [showGeoDropdown, setShowGeoDropdown] = useState(false);
  const geoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Wenn defaultLat/defaultLng gesetzt, Hinweis anzeigen
  const hasDefaultLocation = defaultLat != null && defaultLng != null;

  // Ort-Eingabe: Debounced Geocoding
  useEffect(() => {
    if (geoTimer.current) clearTimeout(geoTimer.current);
    if (locationQuery.trim().length < 3) {
      setGeoSuggestions([]);
      setShowGeoDropdown(false);
      return;
    }
    geoTimer.current = setTimeout(async () => {
      try {
        const res = await geocodeLocation(locationQuery, 'forward');
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
  }, [locationQuery]);

  const handleGeoSelect = (geo: GeoSuggestion) => {
    if (geo.feature_type === 'poi' || geo.feature_type === 'address') {
      setLocationQuery(geo.text);
      setLocationAddress(geo.place_name);
    } else {
      setLocationQuery(geo.place_name);
      setLocationAddress('');
    }
    setLocationLat(geo.lat);
    setLocationLng(geo.lng);
    setShowGeoDropdown(false);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = async () => {
    setError('');

    if (!name.trim()) {
      setError('Bitte gib einen Namen ein.');
      return;
    }
    if (name.trim().length > 200) {
      setError('Der Name darf maximal 200 Zeichen lang sein.');
      return;
    }
    if (locationLat == null || locationLng == null) {
      setError('Bitte waehle einen Standort aus der Liste oder nutze die Kartenposition.');
      return;
    }

    // Adresse aus Geocoding oder leer
    const addressParts = locationAddress ? locationAddress.split(', ') : [];
    const city = addressParts.length >= 2 ? addressParts[addressParts.length - 2] : undefined;
    const country = addressParts.length >= 1 ? addressParts[addressParts.length - 1] : undefined;

    const data: CreatePlaceData = {
      name: name.trim(),
      description: description.trim() || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      address: locationAddress.trim() || locationQuery.trim() || undefined,
      city,
      country,
      location_lat: locationLat,
      location_lng: locationLng,
      cover_url: coverUrl.trim() || undefined,
    };

    setSaving(true);
    try {
      await createPlace(data);
      onCreated();
    } catch (e) {
      console.error(e);
      setError('Ort konnte nicht erstellt werden. Bitte versuche es erneut.');
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
        className="rounded-2xl overflow-hidden mx-4 max-w-lg w-full max-h-[85vh] flex flex-col"
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
          <h2 className="font-heading text-lg" style={{ color: 'var(--text-h)' }}>
            Soul Place vorschlagen
          </h2>
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
          {/* Name */}
          <div>
            <label
              className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Yoga Loft Berlin"
              maxLength={200}
              className="w-full py-2.5 px-4 rounded-[8px] text-sm font-body outline-none"
              style={inputStyle}
            />
          </div>

          {/* Beschreibung */}
          <div>
            <label
              className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Beschreibung
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Was macht diesen Ort besonders?"
              rows={3}
              maxLength={3000}
              className="w-full py-2.5 px-4 rounded-[8px] text-sm font-body outline-none resize-none"
              style={inputStyle}
            />
          </div>

          {/* Tags */}
          <div>
            <label
              className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PLACE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="px-3 py-1 rounded-full text-[0.65rem] font-label tracking-[0.08em] transition-all duration-200 cursor-pointer"
                    style={{
                      background: isSelected
                        ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))'
                        : 'var(--glass)',
                      color: isSelected ? 'var(--text-on-gold)' : 'var(--text-muted)',
                      border: isSelected ? 'none' : '1px solid var(--divider)',
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Standort mit Geocoding */}
          <div className="relative">
            <label
              className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Standort *
            </label>
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => {
                setLocationQuery(e.target.value);
                setLocationAddress('');
                // Nur zuruecksetzen wenn kein Default
                if (!hasDefaultLocation || locationLat !== defaultLat || locationLng !== defaultLng) {
                  setLocationLat(null);
                  setLocationLng(null);
                } else {
                  // Wenn User tippt, Default-Koordinaten verwerfen
                  setLocationLat(null);
                  setLocationLng(null);
                }
              }}
              placeholder="Adresse oder Ort suchen ..."
              className="w-full py-2.5 px-4 rounded-[8px] text-sm font-body outline-none"
              style={inputStyle}
            />
            {locationLat != null && (
              <span className="absolute right-3 top-[26px] text-[0.55rem]" style={{ color: 'var(--success)' }}>
                <Icon name="map-pin" size={12} />
              </span>
            )}

            {/* Selektierte Adresse anzeigen */}
            {locationAddress && locationLat != null && (
              <p className="text-xs font-body mt-1 truncate" style={{ color: 'var(--text-muted)' }}>
                {locationAddress}
              </p>
            )}

            {/* Default-Standort Hinweis */}
            {hasDefaultLocation && locationLat === defaultLat && locationLng === defaultLng && !locationAddress && (
              <p className="text-xs font-body mt-1" style={{ color: 'var(--text-muted)' }}>
                Aktuelle Kartenposition wird verwendet
              </p>
            )}

            {/* Geocoding-Dropdown */}
            {showGeoDropdown && geoSuggestions.length > 0 && (
              <div
                className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg overflow-hidden max-h-[220px] overflow-y-auto"
                style={{
                  background: 'var(--glass-nav)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid var(--glass-border)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                }}
              >
                {geoSuggestions.map((geo, i) => {
                  const typeLabel =
                    geo.feature_type === 'poi' ? 'Ort' :
                    geo.feature_type === 'address' ? 'Adresse' :
                    geo.feature_type === 'place' ? 'Stadt' :
                    geo.feature_type === 'neighborhood' ? 'Viertel' : 'Gebiet';
                  const iconName = geo.feature_type === 'poi' ? 'building-store' : 'map-pin';
                  return (
                    <button
                      key={i}
                      onClick={() => handleGeoSelect(geo)}
                      className="w-full text-left px-3 py-2.5 font-body flex items-start gap-2 cursor-pointer transition-colors"
                      style={{
                        color: 'var(--text-h)',
                        borderBottom: i < geoSuggestions.length - 1 ? '1px solid var(--divider-l)' : undefined,
                      }}
                    >
                      <Icon name={iconName} size={14} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '2px' }} />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm truncate block">{geo.place_name}</span>
                        <span
                          className="text-[0.6rem] font-label uppercase tracking-[0.1em]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {typeLabel}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cover-Bild */}
          <div>
            <label
              className="block font-label text-[0.6rem] tracking-[0.15em] uppercase mb-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Cover-Bild
            </label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://... (kommt spaeter)"
              className="w-full py-2.5 px-4 rounded-[8px] text-sm font-body outline-none"
              style={inputStyle}
            />
            <p className="text-[0.6rem] font-body mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Optional – kann auch spaeter hinzugefuegt werden.
            </p>
          </div>

          {/* Fehler */}
          {error && (
            <p
              className="text-sm font-body py-2 px-3 rounded-lg"
              style={{ color: 'var(--error)', background: 'var(--error-bg)' }}
            >
              {error}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-full font-label text-[0.7rem] tracking-[0.12em] uppercase transition-all duration-200 cursor-pointer"
              style={{
                background: 'transparent',
                color: 'var(--text-muted)',
                border: '1px solid var(--divider)',
              }}
            >
              Abbrechen
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 py-3 rounded-full font-label text-[0.7rem] tracking-[0.12em] uppercase transition-all duration-200"
              style={{
                background: saving
                  ? 'var(--gold-bg)'
                  : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                color: saving ? 'var(--text-muted)' : 'var(--text-on-gold)',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Wird erstellt ...' : 'Ort vorschlagen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
