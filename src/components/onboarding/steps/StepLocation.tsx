'use client';

import { useState, useRef, useEffect } from 'react';
import { updateProfile } from '@/lib/profile';
import { geocodeLocation } from '@/lib/events';

interface Props {
  currentLocation?: string | null;
  onComplete: () => void;
  onBack: () => void;
  isFirst: boolean;
}

export default function StepLocation({ currentLocation, onComplete, onBack, isFirst }: Props) {
  const [location, setLocation] = useState(currentLocation ?? '');
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ place_name: string; lat: number; lng: number }>>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const isValid = !!locationLat || !!currentLocation;

  // Debounced Forward-Geocode
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (location.trim().length < 2 || locationLat) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await geocodeLocation(location, 'forward');
        setSuggestions(res.results.slice(0, 5));
        setShowDropdown(true);
      } catch {
        // silent
      }
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [location, locationLat]);

  const handleDetect = async () => {
    if (!navigator.geolocation) {
      setError('Standorterkennung wird von deinem Browser nicht unterstuetzt.');
      return;
    }
    setDetecting(true);
    setError('');
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 10000 });
      });
      const { latitude, longitude } = pos.coords;
      const res = await geocodeLocation(`${longitude},${latitude}`, 'reverse');
      if (res.results.length > 0) {
        const place = res.results[0];
        setLocation(place.place_name.split(',').slice(0, 2).join(',').trim());
        setLocationLat(place.lat);
        setLocationLng(place.lng);
      }
    } catch {
      setError('Standort konnte nicht ermittelt werden. Gib ihn manuell ein.');
    } finally {
      setDetecting(false);
    }
  };

  const handleSelect = (s: { place_name: string; lat: number; lng: number }) => {
    setLocation(s.place_name.split(',').slice(0, 2).join(',').trim());
    setLocationLat(s.lat);
    setLocationLng(s.lng);
    setShowDropdown(false);
    setSuggestions([]);
  };

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    setError('');
    try {
      await updateProfile({
        location,
        ...(locationLat != null ? { location_lat: locationLat } : {}),
        ...(locationLng != null ? { location_lng: locationLng } : {}),
      });
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* GPS Button */}
      <button
        onClick={handleDetect}
        disabled={detecting}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-none cursor-pointer transition-all hover:scale-[1.01] mb-4"
        style={{
          background: 'var(--accent-muted, rgba(200,169,110,0.12))',
          color: 'var(--accent, #C8A96E)',
          fontFamily: "'Quicksand', sans-serif",
          fontSize: '13px',
          fontWeight: 500,
        }}
      >
        {detecting ? (
          <>
            <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
            Wird ermittelt …
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
              <path d="M12 2l0 2" /><path d="M12 20l0 2" />
              <path d="M2 12l2 0" /><path d="M20 12l2 0" />
            </svg>
            Standort automatisch erkennen
          </>
        )}
      </button>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <span className="text-[11px]" style={{ color: 'var(--text-muted, #807870)' }}>oder manuell eingeben</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Text-Input mit Autocomplete */}
      <div className="relative mb-3">
        <input
          type="text"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            setLocationLat(null);
            setLocationLng(null);
          }}
          placeholder="Stadt oder Ort eingeben …"
          className="w-full px-3.5 py-2.5 text-[13px] rounded-lg outline-none"
          style={{
            background: 'var(--bg-tertiary, rgba(255,255,255,0.04))',
            border: locationLat ? '1px solid rgba(200,169,110,0.3)' : '1px solid rgba(255,255,255,0.08)',
            color: 'var(--text-body, #D0C8B8)',
            fontFamily: "'Quicksand', sans-serif",
            borderRadius: '8px',
          }}
        />
        {locationLat && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--accent, #C8A96E)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5l10 -10" />
            </svg>
          </div>
        )}

        {/* Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div
            className="absolute left-0 right-0 top-full mt-1 rounded-lg overflow-hidden z-10"
            style={{
              background: 'var(--bg-elevated, #242424)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSelect(s)}
                className="w-full text-left px-3.5 py-2.5 text-[12px] border-none cursor-pointer transition-colors"
                style={{
                  background: 'transparent',
                  color: 'var(--text-body, #D0C8B8)',
                  fontFamily: "'Quicksand', sans-serif",
                  borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(200,169,110,0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {s.place_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-[12px] mb-3" style={{ color: '#E57373' }}>{error}</p>
      )}

      {/* Buttons */}
      <div className="flex items-center justify-between mt-4">
        {!isFirst ? (
          <button
            onClick={onBack}
            className="text-[12.5px] border-none bg-transparent cursor-pointer px-3 py-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-body, #D0C8B8)', fontFamily: "'Quicksand', sans-serif" }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            ← Zurueck
          </button>
        ) : <span />}
        <button
          onClick={handleSave}
          disabled={!isValid || saving}
          className="font-label text-[0.7rem] tracking-[0.1em] uppercase px-7 py-3 rounded-full border-none cursor-pointer transition-all hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          style={{
            background: isValid && !saving ? 'linear-gradient(135deg, #A8894E, #C8A96E)' : 'var(--bg-tertiary)',
            color: isValid && !saving ? 'var(--text-on-gold, #1A1714)' : 'var(--text-muted)',
            boxShadow: isValid && !saving ? '0 4px 16px rgba(200,169,110,0.25)' : 'none',
            fontWeight: 600,
          }}
        >
          {saving ? '…' : 'Weiter →'}
        </button>
      </div>
    </div>
  );
}
