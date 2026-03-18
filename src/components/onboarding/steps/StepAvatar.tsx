'use client';

import { useState, useRef } from 'react';
import { uploadAvatar, updateProfile } from '@/lib/profile';

interface Props {
  currentAvatarUrl?: string | null;
  onComplete: () => void;
  onBack: () => void;
  isFirst: boolean;
}

export default function StepAvatar({ currentAvatarUrl, onComplete, onBack, isFirst }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploaded, setUploaded] = useState(!!currentAvatarUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Bild darf maximal 5 MB gross sein.');
      return;
    }
    setError('');
    setUploading(true);

    // Sofortige Vorschau
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    try {
      const url = await uploadAvatar(file);
      await updateProfile({ avatar_url: url });
      setPreviewUrl(url);
      setUploaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen');
      setPreviewUrl(currentAvatarUrl ?? null);
      setUploaded(!!currentAvatarUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {/* Avatar-Vorschau */}
      <div className="flex justify-center mb-5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="relative w-24 h-24 rounded-full overflow-hidden border-none cursor-pointer transition-all hover:scale-105 group"
          style={{
            background: 'var(--bg-tertiary)',
            border: '2px dashed rgba(200,169,110,0.3)',
          }}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-1">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--accent, #C8A96E)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2" />
                <path d="M12 13m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
              </svg>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full" style={{ background: 'rgba(0,0,0,0.5)' }}>
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent, #C8A96E)', borderTopColor: 'transparent' }} />
            </div>
          )}
          {/* Hover-Overlay */}
          {previewUrl && !uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.4)' }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2" />
                <path d="M12 13m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
              </svg>
            </div>
          )}
        </button>
      </div>

      {!previewUrl && (
        <p className="text-center text-[12px] mb-4" style={{ color: 'var(--text-muted)' }}>
          Klicke auf den Kreis um ein Bild hochzuladen
        </p>
      )}

      {error && (
        <p className="text-center text-[12px] mb-3" style={{ color: '#E57373' }}>{error}</p>
      )}

      {/* Buttons */}
      <div className="flex items-center justify-between mt-5">
        {!isFirst ? (
          <button
            onClick={onBack}
            className="text-[12.5px] border-none bg-transparent cursor-pointer px-3 py-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-body)', fontFamily: "'Quicksand', sans-serif" }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            ← Zurueck
          </button>
        ) : <span />}
        <button
          onClick={onComplete}
          disabled={!uploaded || uploading}
          className="font-label text-[0.7rem] tracking-[0.1em] uppercase px-7 py-3 rounded-full border-none cursor-pointer transition-all hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          style={{
            background: uploaded && !uploading ? 'linear-gradient(135deg, #A8894E, #C8A96E)' : 'var(--bg-tertiary)',
            color: uploaded && !uploading ? 'var(--text-on-gold, #1A1714)' : 'var(--text-muted)',
            boxShadow: uploaded && !uploading ? '0 4px 16px rgba(200,169,110,0.25)' : 'none',
            fontWeight: 600,
          }}
        >
          Weiter →
        </button>
      </div>
    </div>
  );
}
