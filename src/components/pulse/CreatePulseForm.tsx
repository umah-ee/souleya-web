'use client';

import { useState, useRef } from 'react';
import { createPulse, uploadPulseImage } from '@/lib/pulse';
import type { Pulse } from '@/types/pulse';
import { Icon } from '@/components/ui/Icon';

interface Props {
  onCreated: (pulse: Pulse) => void;
}

interface LocationData {
  lat: number;
  lng: number;
  name: string;
}

interface PollData {
  question: string;
  options: string[];
}

export default function CreatePulseForm({ onCreated }: Props) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const maxLen = 1000;

  // ── Bilder (File Upload, max 10) ────────────────────────────
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxImages = 10;

  // ── Ort ───────────────────────────────────────────────────
  const [location, setLocation] = useState<LocationData | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationResults, setLocationResults] = useState<LocationData[]>([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const locationDebounce = useRef<ReturnType<typeof setTimeout>>(null);

  // ── Umfrage ───────────────────────────────────────────────
  const [poll, setPoll] = useState<PollData | null>(null);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const hasContent = content.trim().length > 0;
  const hasAttachment = imageFiles.length > 0 || !!location || !!poll;
  const isEmpty = !hasContent && !hasAttachment;
  const isDisabled = isEmpty || loading || uploading;

  // ── Bilder auswaehlen ────────────────────────────────────────
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    const remaining = maxImages - imageFiles.length;

    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const file = files[i];
      // Max 10 MB pro Bild
      if (file.size > 10 * 1024 * 1024) {
        setError('Jedes Bild darf maximal 10 MB gross sein');
        continue;
      }
      newFiles.push(file);
    }

    if (newFiles.length === 0) return;
    setError('');

    // Vorschauen erstellen
    let loaded = 0;
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        newPreviews.push(ev.target?.result as string);
        loaded++;
        if (loaded === newFiles.length) {
          setImageFiles((prev) => [...prev, ...newFiles]);
          setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    // File-Input zuruecksetzen (damit gleiche Datei erneut gewaehlt werden kann)
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (index?: number) => {
    if (index !== undefined) {
      setImageFiles((prev) => prev.filter((_, i) => i !== index));
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Alle entfernen
      setImageFiles([]);
      setImagePreviews([]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Geocoding-Suche (Mapbox) ──────────────────────────────
  const handleLocationSearch = (query: string) => {
    setLocationSearch(query);
    if (locationDebounce.current) clearTimeout(locationDebounce.current);

    if (query.trim().length < 2) {
      setLocationResults([]);
      return;
    }

    locationDebounce.current = setTimeout(async () => {
      setSearchingLocation(true);
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=5&language=de`,
        );
        const data = await res.json();
        const results: LocationData[] = (data.features ?? []).map(
          (f: { place_name: string; center: [number, number] }) => ({
            name: f.place_name,
            lng: f.center[0],
            lat: f.center[1],
          }),
        );
        setLocationResults(results);
      } catch {
        setLocationResults([]);
      } finally {
        setSearchingLocation(false);
      }
    }, 400);
  };

  const selectLocation = (loc: LocationData) => {
    setLocation(loc);
    setShowLocationPicker(false);
    setLocationSearch('');
    setLocationResults([]);
  };

  // ── Poll hinzufuegen ──────────────────────────────────────
  const handleAddPollOption = () => {
    if (pollOptions.length < 10) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemovePollOption = (idx: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== idx));
    }
  };

  const handleSavePoll = () => {
    const validOptions = pollOptions.filter((o) => o.trim().length > 0);
    if (pollQuestion.trim() && validOptions.length >= 2) {
      setPoll({ question: pollQuestion.trim(), options: validOptions });
      setShowPollCreator(false);
    }
  };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled) return;

    setLoading(true);
    setError('');
    try {
      // Bilder hochladen (falls vorhanden)
      const imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        setUploading(true);
        try {
          for (const file of imageFiles) {
            const url = await uploadPulseImage(file);
            imageUrls.push(url);
          }
        } catch (uploadErr) {
          setError(uploadErr instanceof Error ? uploadErr.message : 'Bild-Upload fehlgeschlagen');
          setLoading(false);
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      const pulse = await createPulse({
        content: content.trim() || undefined,
        // Abwaertskompatibilitaet: image_url = erstes Bild
        image_url: imageUrls.length > 0 ? imageUrls[0] : undefined,
        image_urls: imageUrls.length > 0 ? imageUrls : undefined,
        location_lat: location?.lat,
        location_lng: location?.lng,
        location_name: location?.name,
        poll: poll
          ? {
              question: poll.question,
              options: poll.options.map((label) => ({ label })),
            }
          : undefined,
      });

      // Reset
      setContent('');
      handleRemoveImage();
      setLocation(null);
      setPoll(null);
      setPollQuestion('');
      setPollOptions(['', '']);
      setShowLocationPicker(false);
      setShowPollCreator(false);
      onCreated(pulse);
    } catch {
      setError('Fehler beim Erstellen. Bitte erneut versuchen.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-5 mb-6">
      {/* Hidden File Input (mehrere Bilder) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleImageSelect}
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Teile einen Gedanken, eine Erfahrung, einen Impuls …"
        maxLength={maxLen}
        rows={3}
        className="w-full bg-transparent border-none resize-none font-body text-[0.95rem] leading-[1.8] outline-none"
        style={{ color: 'var(--text-h)' }}
      />

      {/* ── Anhaenge Vorschau ────────────────────────────── */}
      <div className="space-y-2 mb-2">
        {/* Bilder Vorschau */}
        {imagePreviews.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {imagePreviews.map((preview, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt=""
                  className="h-[80px] w-[80px] rounded-lg object-cover"
                  style={{ border: '1px solid var(--glass-border)' }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(i)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer"
                  style={{ background: 'var(--bg-solid)', border: '1px solid var(--divider)', color: 'var(--text-muted)' }}
                >
                  <Icon name="x" size={10} />
                </button>
              </div>
            ))}
            {imageFiles.length < maxImages && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-[80px] w-[80px] rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                style={{ border: '1px dashed var(--glass-border)', color: 'var(--text-muted)', background: 'transparent' }}
                title="Weitere Bilder hinzufuegen"
              >
                <Icon name="plus" size={20} />
              </button>
            )}
          </div>
        )}

        {/* Ort Vorschau */}
        {location && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: 'var(--gold-bg)', border: '1px solid var(--gold-border-s)' }}
          >
            <Icon name="map-pin" size={14} style={{ color: 'var(--gold)' }} />
            <span className="flex-1 text-xs font-body truncate" style={{ color: 'var(--text-h)' }}>
              {location.name}
            </span>
            <button
              type="button"
              onClick={() => setLocation(null)}
              className="bg-transparent border-none cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              <Icon name="x" size={12} />
            </button>
          </div>
        )}

        {/* Poll Vorschau */}
        {poll && (
          <div
            className="px-3 py-2 rounded-lg"
            style={{ background: 'var(--gold-bg)', border: '1px solid var(--gold-border-s)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-label text-[0.65rem] tracking-[0.1em] uppercase" style={{ color: 'var(--gold)' }}>
                Umfrage
              </span>
              <button
                type="button"
                onClick={() => setPoll(null)}
                className="bg-transparent border-none cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
              >
                <Icon name="x" size={12} />
              </button>
            </div>
            <p className="text-sm font-body font-medium" style={{ color: 'var(--text-h)' }}>
              {poll.question}
            </p>
            <p className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>
              {poll.options.length} Optionen
            </p>
          </div>
        )}
      </div>

      {/* ── Location Picker ──────────────────────────────── */}
      {showLocationPicker && !location && (
        <div className="mb-3">
          <input
            type="text"
            value={locationSearch}
            onChange={(e) => handleLocationSearch(e.target.value)}
            placeholder="Ort suchen …"
            className="w-full py-2 px-3 rounded-[8px] text-sm font-body outline-none"
            style={{
              background: 'var(--glass)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-h)',
            }}
          />
          {searchingLocation && (
            <p className="text-[0.65rem] font-label mt-1 px-1" style={{ color: 'var(--text-muted)' }}>Suche …</p>
          )}
          {locationResults.length > 0 && (
            <div
              className="mt-1 rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--glass-border)', background: 'var(--bg-solid)' }}
            >
              {locationResults.map((loc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectLocation(loc)}
                  className="w-full text-left px-3 py-2 text-sm font-body cursor-pointer transition-colors flex items-center gap-2"
                  style={{ color: 'var(--text-h)', borderBottom: i < locationResults.length - 1 ? '1px solid var(--divider-l)' : 'none' }}
                >
                  <Icon name="map-pin" size={12} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                  <span className="truncate">{loc.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Poll Creator ─────────────────────────────────── */}
      {showPollCreator && !poll && (
        <div
          className="mb-3 p-3 rounded-lg space-y-2"
          style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}
        >
          <input
            type="text"
            value={pollQuestion}
            onChange={(e) => setPollQuestion(e.target.value)}
            placeholder="Frage …"
            maxLength={300}
            className="w-full py-2 px-3 rounded-[8px] text-sm font-body font-medium outline-none"
            style={{
              background: 'var(--bg-solid)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-h)',
            }}
          />
          {pollOptions.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={opt}
                onChange={(e) => {
                  const next = [...pollOptions];
                  next[idx] = e.target.value;
                  setPollOptions(next);
                }}
                placeholder={`Option ${idx + 1}`}
                maxLength={200}
                className="flex-1 py-1.5 px-3 rounded-[8px] text-sm font-body outline-none"
                style={{
                  background: 'var(--bg-solid)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-h)',
                }}
              />
              {pollOptions.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemovePollOption(idx)}
                  className="bg-transparent border-none cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Icon name="x" size={12} />
                </button>
              )}
            </div>
          ))}
          <div className="flex items-center justify-between pt-1">
            {pollOptions.length < 10 && (
              <button
                type="button"
                onClick={handleAddPollOption}
                className="text-xs font-label bg-transparent border-none cursor-pointer"
                style={{ color: 'var(--gold)' }}
              >
                + Option
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={() => { setShowPollCreator(false); setPollQuestion(''); setPollOptions(['', '']); }}
                className="px-3 py-1 rounded-full text-xs font-label bg-transparent cursor-pointer"
                style={{ color: 'var(--text-muted)', border: '1px solid var(--divider)' }}
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleSavePoll}
                disabled={!pollQuestion.trim() || pollOptions.filter((o) => o.trim()).length < 2}
                className="px-3 py-1 rounded-full text-xs font-label cursor-pointer border-none"
                style={{
                  background: 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                  color: 'var(--text-on-gold)',
                }}
              >
                Hinzufuegen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toolbar + Actions ────────────────────────────── */}
      <div className="flex items-center justify-between pt-3 mt-2" style={{ borderTop: '1px solid var(--divider-l)' }}>
        {/* Attachment-Buttons */}
        <div className="flex items-center gap-1">
          {/* Bilder (File Picker) */}
          <button
            type="button"
            onClick={() => {
              if (imageFiles.length > 0 && imageFiles.length >= maxImages) {
                handleRemoveImage();
              } else {
                fileInputRef.current?.click();
              }
              setShowLocationPicker(false);
              setShowPollCreator(false);
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-transparent border-none cursor-pointer transition-colors"
            style={{ color: imageFiles.length > 0 ? 'var(--gold)' : 'var(--text-muted)' }}
            title={imageFiles.length > 0 ? `${imageFiles.length}/${maxImages} Bilder` : 'Bilder hinzufuegen'}
          >
            <Icon name="photo" size={16} />
          </button>

          {/* Ort */}
          <button
            type="button"
            onClick={() => { setShowLocationPicker(!showLocationPicker); setShowPollCreator(false); }}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-transparent border-none cursor-pointer transition-colors"
            style={{ color: showLocationPicker || location ? 'var(--gold)' : 'var(--text-muted)' }}
            title="Ort hinzufuegen"
          >
            <Icon name="map-pin" size={16} />
          </button>

          {/* Umfrage */}
          <button
            type="button"
            onClick={() => { setShowPollCreator(!showPollCreator); setShowLocationPicker(false); }}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-transparent border-none cursor-pointer transition-colors"
            style={{ color: showPollCreator || poll ? 'var(--gold)' : 'var(--text-muted)' }}
            title="Umfrage erstellen"
          >
            <Icon name="chart-bar" size={16} />
          </button>

          {/* Zeichenzaehler */}
          <span
            className="text-[0.65rem] font-label ml-2"
            style={{ color: content.length > maxLen * 0.9 ? 'var(--warning)' : 'var(--text-muted)' }}
          >
            {content.length}/{maxLen}
          </span>
        </div>

        <div className="flex gap-2 items-center">
          {error && <span className="text-xs" style={{ color: 'var(--error)' }}>{error}</span>}
          <button
            type="submit"
            disabled={isDisabled}
            className="px-5 py-2 border-none rounded-full font-label text-[0.7rem] tracking-[0.1em] uppercase transition-all duration-200"
            style={{
              background: isDisabled ? 'var(--gold-bg)' : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
              color: isDisabled ? 'var(--text-muted)' : 'var(--text-on-gold)',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            {uploading ? 'Hochladen …' : loading ? '…' : 'Teilen'}
          </button>
        </div>
      </div>
    </form>
  );
}
