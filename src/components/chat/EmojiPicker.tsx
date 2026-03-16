'use client';

import { useEffect, useRef } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface Props {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ onSelect, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Klick außerhalb schließt den Picker
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const theme = typeof document !== 'undefined'
    ? document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
    : 'dark';

  return (
    <div ref={ref}>
      <Picker
        data={data}
        onEmojiSelect={(emoji: { native: string }) => onSelect(emoji.native)}
        theme={theme}
        locale="de"
        previewPosition="none"
        skinTonePosition="search"
        maxFrequentRows={2}
        perLine={8}
        set="native"
      />
    </div>
  );
}
