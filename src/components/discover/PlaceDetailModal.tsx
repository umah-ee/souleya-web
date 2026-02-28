'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Place, PlaceReview, PlacePhoto, CreateReviewData } from '@/types/places';
import {
  fetchPlaceReviews,
  createPlaceReview,
  updatePlaceReview,
  deletePlaceReview,
  fetchPlacePhotos,
  uploadPlacePhoto,
} from '@/lib/places';
import { Icon } from '@/components/ui/Icon';

// ── Star SVGs (inline, Tabler-konform) ───────────────────
function StarFilled({ size = 14 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="var(--gold)"
      stroke="var(--gold)"
    >
      <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
    </svg>
  );
}

function StarEmpty({ size = 14 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      stroke="var(--text-muted)"
    >
      <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
    </svg>
  );
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-[1px]">
      {[1, 2, 3, 4, 5].map((i) =>
        i <= full ? <StarFilled key={i} size={size} /> : <StarEmpty key={i} size={size} />,
      )}
    </span>
  );
}

// ── Clickable Star Selector ──────────────────────────────
function StarSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <span className="inline-flex items-center gap-[2px]">
      {[1, 2, 3, 4, 5].map((i) => {
        const active = i <= (hover || value);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5 cursor-pointer transition-transform duration-150 hover:scale-110"
            style={{ background: 'none', border: 'none', lineHeight: 0 }}
          >
            {active ? <StarFilled size={22} /> : <StarEmpty size={22} />}
          </button>
        );
      })}
    </span>
  );
}

// ── Props ────────────────────────────────────────────────
interface Props {
  place: Place;
  userId: string | null;
  onClose: () => void;
  onSaveToggle: () => void;
}

export default function PlaceDetailModal({ place, userId, onClose, onSaveToggle }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── State ──────────────────────────────────────────────
  const [reviews, setReviews] = useState<PlaceReview[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [photos, setPhotos] = useState<PlacePhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  // Review Form
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState(false);

  // Photo Upload
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // ── Daten laden ────────────────────────────────────────
  useEffect(() => {
    setLoadingReviews(true);
    fetchPlaceReviews(place.id)
      .then((res) => {
        setReviews(res.data);
        setReviewsTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setLoadingReviews(false));

    setLoadingPhotos(true);
    fetchPlacePhotos(place.id)
      .then(setPhotos)
      .catch(() => {})
      .finally(() => setLoadingPhotos(false));
  }, [place.id]);

  // Bestehende eigene Bewertung vorladen
  useEffect(() => {
    if (!userId) return;
    const own = reviews.find((r) => r.user_id === userId);
    if (own) {
      setReviewRating(own.rating);
      setReviewContent(own.content ?? '');
      setEditingReview(true);
    }
  }, [reviews, userId]);

  // ── Backdrop + Escape ──────────────────────────────────
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === backdropRef.current) onClose();
    },
    [onClose],
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // ── Review senden / aktualisieren ──────────────────────
  const handleSubmitReview = async () => {
    if (!userId || reviewRating === 0 || submittingReview) return;
    setSubmittingReview(true);
    try {
      const data: CreateReviewData = { rating: reviewRating, content: reviewContent || undefined };
      if (editingReview) {
        const updated = await updatePlaceReview(place.id, data);
        setReviews((prev) => prev.map((r) => (r.user_id === userId ? updated : r)));
      } else {
        const created = await createPlaceReview(place.id, data);
        setReviews((prev) => [created, ...prev]);
        setReviewsTotal((prev) => prev + 1);
        setEditingReview(true);
      }
    } catch {
      // Fehler still ignorieren
    } finally {
      setSubmittingReview(false);
    }
  };

  // ── Review loeschen ────────────────────────────────────
  const handleDeleteReview = async () => {
    if (!userId || deletingReview) return;
    setDeletingReview(true);
    try {
      await deletePlaceReview(place.id);
      setReviews((prev) => prev.filter((r) => r.user_id !== userId));
      setReviewsTotal((prev) => Math.max(0, prev - 1));
      setReviewRating(0);
      setReviewContent('');
      setEditingReview(false);
    } catch {
      // still
    } finally {
      setDeletingReview(false);
    }
  };

  // ── Foto hochladen ─────────────────────────────────────
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadingPhoto) return;
    setUploadingPhoto(true);
    try {
      const photo = await uploadPlacePhoto(place.id, file);
      setPhotos((prev) => [photo, ...prev]);
    } catch {
      // still
    } finally {
      setUploadingPhoto(false);
      // Input zuruecksetzen
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Google Maps Link ───────────────────────────────────
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.location_lat},${place.location_lng}`;

  // ── Datum formatieren ──────────────────────────────────
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="absolute inset-0 z-30 flex items-center justify-center overflow-y-auto py-4"
      style={{ background: 'rgba(0,0,0,.5)' }}
    >
      <div
        className="relative mx-4 w-full max-w-[520px] animate-slide-up"
        style={{ maxHeight: 'calc(100% - 32px)' }}
      >
        <div
          className="rounded-[18px] overflow-hidden overflow-y-auto"
          style={{
            background: 'var(--bg-solid)',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
            maxHeight: 'calc(100vh - 64px)',
          }}
        >
          {/* ═══════════════════════════════════════════
              HEADER – Cover + Close
          ═══════════════════════════════════════════ */}
          <div className="relative w-full overflow-hidden" style={{ height: place.cover_url ? '200px' : '80px' }}>
            {place.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={place.cover_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full"
                style={{ background: 'linear-gradient(135deg, #D8CFBE 0%, var(--gold) 50%, #B08840 100%)' }}
              />
            )}
            {/* Gradient */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, var(--bg-solid) 0%, transparent 60%)' }}
            />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer z-10 transition-colors"
              style={{
                background: 'rgba(0,0,0,.35)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,.2)',
              }}
            >
              <Icon name="x" size={14} />
            </button>
          </div>

          {/* ═══════════════════════════════════════════
              BODY
          ═══════════════════════════════════════════ */}
          <div className="px-5 pb-5 -mt-4 relative z-10">
            {/* ── Name ─────────────────────────────── */}
            <h2
              className="text-[20px] font-heading italic leading-snug mb-1"
              style={{ color: 'var(--text-h)' }}
            >
              {place.name}
            </h2>

            {/* ── Category Badge ───────────────────── */}
            <div
              className="inline-block text-[8px] tracking-[1.5px] uppercase px-[10px] py-[3px] rounded-[8px] mb-3"
              style={{
                background: 'var(--gold-bg)',
                color: 'var(--gold-text)',
                border: '1px solid var(--gold-border)',
              }}
            >
              {place.category}
            </div>

            {/* ── Description ──────────────────────── */}
            {place.description && (
              <p
                className="text-[12px] leading-[1.65] mb-4"
                style={{ color: 'var(--text-body)' }}
              >
                {place.description}
              </p>
            )}

            {/* ── Tags ─────────────────────────────── */}
            {place.tags.length > 0 && (
              <div className="flex flex-wrap gap-[5px] mb-4">
                {place.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[8px] tracking-[1.5px] uppercase px-[9px] py-[3px] rounded-[12px] inline-block"
                    style={{
                      color: 'var(--gold-text)',
                      border: '1px solid var(--gold-border)',
                      background: 'var(--gold-bg)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* ── Rating Summary ───────────────────── */}
            <div
              className="glass-card rounded-[14px] p-3.5 flex items-center gap-3 mb-4"
            >
              <div className="flex items-center gap-1.5">
                <StarFilled size={22} />
                <span
                  className="text-[22px] font-heading"
                  style={{ color: 'var(--text-h)' }}
                >
                  {place.avg_rating.toFixed(1)}
                </span>
              </div>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {reviewsTotal} {reviewsTotal === 1 ? 'Bewertung' : 'Bewertungen'}
              </span>
            </div>

            {/* ── Address ──────────────────────────── */}
            {(place.address || place.city) && (
              <div
                className="flex items-center gap-1.5 text-[11px] mb-2"
                style={{ color: 'var(--text-sec)' }}
              >
                <Icon name="map-pin" size={14} style={{ flexShrink: 0 }} />
                <span>{[place.address, place.city, place.country].filter(Boolean).join(', ')}</span>
              </div>
            )}

            {/* ── Action Buttons ───────────────────── */}
            <div className="flex items-center gap-2 mb-5 mt-3">
              {/* Save / Unsave */}
              {userId && (
                <button
                  onClick={(e) => { e.stopPropagation(); onSaveToggle(); }}
                  className="flex items-center gap-1.5 py-2.5 px-5 rounded-[24px] font-label text-[0.65rem] tracking-[0.1em] uppercase cursor-pointer transition-all duration-200"
                  style={{
                    background: place.is_saved
                      ? 'linear-gradient(135deg, var(--gold-deep), var(--gold))'
                      : 'transparent',
                    border: `1px solid ${place.is_saved ? 'var(--gold)' : 'var(--gold-border-s)'}`,
                    color: place.is_saved ? 'var(--text-on-gold)' : 'var(--gold-text)',
                    boxShadow: place.is_saved ? '0 0 12px rgba(200,169,110,0.35)' : 'none',
                  }}
                >
                  <Icon name={place.is_saved ? 'bookmark-filled' : 'bookmark'} size={14} />
                  {place.is_saved ? 'Gespeichert' : 'Speichern'}
                </button>
              )}

              {/* Route planen */}
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 py-2.5 px-5 rounded-[24px] font-label text-[0.65rem] tracking-[0.1em] uppercase transition-all duration-200"
                style={{
                  border: '1px solid var(--divider)',
                  color: 'var(--text-sec)',
                  textDecoration: 'none',
                }}
              >
                <Icon name="map-2" size={14} />
                Route planen
              </a>
            </div>

            {/* ═══════════════════════════════════════
                BEWERTUNGEN
            ═══════════════════════════════════════ */}
            <div
              className="pt-4 mb-4"
              style={{ borderTop: '1px solid var(--divider-l)' }}
            >
              <h3
                className="text-[14px] font-heading italic mb-3"
                style={{ color: 'var(--text-h)' }}
              >
                Bewertungen
              </h3>

              {/* ── Review Form (nur eingeloggt) ───── */}
              {userId && (
                <div
                  className="glass-card rounded-[14px] p-3.5 mb-4"
                >
                  <div className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>
                    {editingReview ? 'Deine Bewertung bearbeiten' : 'Bewertung schreiben'}
                  </div>

                  {/* Star Selector */}
                  <div className="mb-2">
                    <StarSelector value={reviewRating} onChange={setReviewRating} />
                  </div>

                  {/* Textarea */}
                  <textarea
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Was hat dir gefallen? (optional)"
                    rows={3}
                    className="w-full text-[12px] leading-[1.5] px-3 py-2 mb-2 resize-none"
                    style={{
                      background: 'var(--glass)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      color: 'var(--text-body)',
                      outline: 'none',
                    }}
                  />

                  {/* Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSubmitReview}
                      disabled={reviewRating === 0 || submittingReview}
                      className="py-2 px-5 rounded-[24px] font-label text-[0.65rem] tracking-[0.1em] uppercase transition-all duration-200"
                      style={{
                        background: reviewRating === 0 || submittingReview
                          ? 'var(--gold-bg)'
                          : 'linear-gradient(135deg, var(--gold-deep), var(--gold))',
                        color: reviewRating === 0 || submittingReview
                          ? 'var(--text-muted)'
                          : 'var(--text-on-gold)',
                        cursor: reviewRating === 0 || submittingReview ? 'not-allowed' : 'pointer',
                        border: 'none',
                      }}
                    >
                      {submittingReview ? '...' : editingReview ? 'Aktualisieren' : 'Absenden'}
                    </button>

                    {editingReview && (
                      <button
                        onClick={handleDeleteReview}
                        disabled={deletingReview}
                        className="py-2 px-4 rounded-[24px] font-label text-[0.65rem] tracking-[0.1em] uppercase transition-all duration-200 cursor-pointer"
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--error-border)',
                          color: 'var(--error)',
                        }}
                      >
                        {deletingReview ? '...' : 'Loeschen'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ── Review List ────────────────────── */}
              {loadingReviews ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-[60px] rounded-[12px] animate-pulse"
                      style={{ background: 'var(--glass)' }}
                    />
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-[11px] text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  Noch keine Bewertungen vorhanden.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="glass-card rounded-[12px] p-3"
                    >
                      {/* Author Row */}
                      <div className="flex items-center gap-2 mb-1.5">
                        {/* Avatar */}
                        <div
                          className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden"
                          style={{
                            background: 'var(--avatar-bg)',
                            color: 'var(--gold-text)',
                            border: '1.5px solid var(--gold-border)',
                            fontSize: '10px',
                          }}
                        >
                          {review.profile?.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={review.profile.avatar_url}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            (review.profile?.display_name ?? review.profile?.username ?? 'A').slice(0, 1).toUpperCase()
                          )}
                        </div>

                        {/* Name + Date */}
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] truncate" style={{ color: 'var(--text-h)' }}>
                            {review.profile?.display_name ?? review.profile?.username ?? 'Anonym'}
                          </div>
                          <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                            {formatDate(review.created_at)}
                          </div>
                        </div>

                        {/* Stars */}
                        <StarRating rating={review.rating} size={12} />
                      </div>

                      {/* Content */}
                      {review.content && (
                        <p
                          className="text-[11px] leading-[1.55]"
                          style={{ color: 'var(--text-body)' }}
                        >
                          {review.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ═══════════════════════════════════════
                FOTOS
            ═══════════════════════════════════════ */}
            <div
              className="pt-4"
              style={{ borderTop: '1px solid var(--divider-l)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="text-[14px] font-heading italic"
                  style={{ color: 'var(--text-h)' }}
                >
                  Fotos
                </h3>

                {/* Upload Button */}
                {userId && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="flex items-center gap-1.5 py-1.5 px-4 rounded-[24px] font-label text-[0.6rem] tracking-[0.1em] uppercase cursor-pointer transition-all duration-200"
                      style={{
                        border: '1px solid var(--gold-border-s)',
                        color: 'var(--gold-text)',
                        background: 'transparent',
                      }}
                    >
                      <Icon name="camera" size={13} />
                      {uploadingPhoto ? 'Hochladen...' : 'Foto hochladen'}
                    </button>
                  </>
                )}
              </div>

              {/* Photo Grid */}
              {loadingPhotos ? (
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-[10px] animate-pulse"
                      style={{ background: 'var(--glass)' }}
                    />
                  ))}
                </div>
              ) : photos.length === 0 ? (
                <div className="text-[11px] text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  Noch keine Fotos vorhanden.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="aspect-square rounded-[10px] overflow-hidden"
                      style={{
                        border: '1px solid var(--glass-border)',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url ?? photo.storage_path}
                        alt={photo.caption ?? ''}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
