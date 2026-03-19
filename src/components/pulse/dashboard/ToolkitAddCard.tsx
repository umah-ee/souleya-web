'use client';

import { Icon } from '@/components/ui/Icon';

interface Props {
  onClick: () => void;
}

export default function ToolkitAddCard({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="rounded-[8px] w-full py-6 flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 group"
      style={{
        background: 'transparent',
        border: '2px dashed color-mix(in srgb, var(--gold) 25%, transparent)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderStyle = 'solid';
        e.currentTarget.style.borderColor = 'var(--gold)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderStyle = 'dashed';
        e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--gold) 25%, transparent)';
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
        style={{ background: 'var(--gold-bg)', color: 'var(--gold-text)' }}
      >
        <Icon name="plus" size={20} />
      </div>
      <span
        className="font-label text-[0.6rem] tracking-[0.06em] uppercase"
        style={{ color: 'var(--text-muted)' }}
      >
        Modul hinzufuegen
      </span>
    </button>
  );
}
