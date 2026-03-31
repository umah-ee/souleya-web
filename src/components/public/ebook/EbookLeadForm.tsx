'use client';

import { useState } from 'react';
import { submitEbookLead, trackEbookDownload } from '@/lib/ebooks';

interface Props {
  articleId: string;
  source: 'blog_cta' | 'sticky_footer' | 'exit_intent' | 'flip_preview';
  onSuccess?: (pdfUrl: string) => void;
  compact?: boolean;
}

const DISPOSABLE_DOMAINS = [
  'tempmail.com', 'throwaway.email', 'mailinator.com', 'guerrillamail.com',
  'yopmail.com', 'trashmail.com', 'sharklasers.com',
];

export default function EbookLeadForm({ articleId, source, onSuccess, compact }: Props) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Bitte gib eine gueltige E-Mail-Adresse ein.');
      return;
    }

    const domain = email.split('@')[1]?.toLowerCase();
    if (DISPOSABLE_DOMAINS.includes(domain)) {
      setError('Bitte verwende eine echte E-Mail-Adresse.');
      return;
    }

    setLoading(true);
    try {
      await submitEbookLead(articleId, email.trim(), name.trim() || undefined, source);
      const downloadRes = await trackEbookDownload(articleId);
      if (downloadRes?.pdf_url) {
        setPdfUrl(downloadRes.pdf_url);
        onSuccess?.(downloadRes.pdf_url);
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Das hat leider nicht geklappt. Versuch es nochmal.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: compact ? '8px 0' : '16px 0' }}>
        <div style={{ fontSize: compact ? 12 : 14, color: 'var(--gold-text)', marginBottom: 8 }}>
          Dein eBook ist bereit!
        </div>
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block', padding: '10px 24px', borderRadius: 20,
              background: 'linear-gradient(135deg, #A8894E, #D4BC8B)', color: '#fff',
              textDecoration: 'none', fontSize: 12,
            }}
          >
            Jetzt herunterladen
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: compact ? 6 : 10 }}>
      <input
        type="email"
        placeholder="Deine E-Mail-Adresse"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{
          padding: compact ? '8px 12px' : '12px 16px', borderRadius: 8,
          border: error ? '1px solid #c44' : '1px solid var(--glass-border)',
          background: 'var(--glass)', color: 'var(--text-body)',
          fontSize: compact ? 13 : 15, outline: 'none',
        }}
      />
      {!compact && (
        <input
          type="text"
          placeholder="Dein Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: '12px 16px', borderRadius: 8,
            border: '1px solid var(--glass-border)', background: 'var(--glass)',
            color: 'var(--text-body)', fontSize: 15, outline: 'none',
          }}
        />
      )}
      {error && <div style={{ fontSize: 10, color: '#c44' }}>{error}</div>}
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: compact ? '10px 18px' : '14px 24px', borderRadius: 24,
          background: 'linear-gradient(135deg, #A8894E, #D4BC8B)', color: '#fff',
          border: 'none', fontSize: compact ? 13 : 15, fontWeight: 500,
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.6 : 1,
          transition: 'transform 0.15s, box-shadow 0.15s',
          boxShadow: '0 4px 16px rgba(168, 137, 78, 0.3)',
        }}
        onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'scale(1.02)' }}
        onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'scale(1)' }}
      >
        {loading ? 'Einen Moment …' : 'Kostenlos herunterladen'}
      </button>
    </form>
  );
}
