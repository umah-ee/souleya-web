'use client';

interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  site_name?: string;
}

interface Props {
  preview: LinkPreview;
}

export default function LinkPreviewCard({ preview }: Props) {
  const domain = (() => {
    try { return new URL(preview.url).hostname.replace('www.', ''); }
    catch { return preview.site_name ?? ''; }
  })();

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block mt-1.5 rounded-lg overflow-hidden no-underline transition-opacity hover:opacity-90"
      style={{
        background: 'var(--glass)',
        border: '1px solid var(--glass-border)',
      }}
    >
      {preview.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview.image}
          alt=""
          className="w-full object-cover"
          style={{ maxHeight: '160px' }}
        />
      )}
      <div className="px-3 py-2">
        {(preview.site_name || domain) && (
          <p className="text-[9px] font-label tracking-[0.05em] uppercase mb-0.5" style={{ color: 'var(--gold-text)' }}>
            {preview.site_name ?? domain}
          </p>
        )}
        {preview.title && (
          <p className="text-[12px] font-medium leading-snug line-clamp-2" style={{ color: 'var(--text-heading)' }}>
            {preview.title}
          </p>
        )}
        {preview.description && (
          <p className="text-[10px] mt-0.5 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {preview.description}
          </p>
        )}
      </div>
    </a>
  );
}
