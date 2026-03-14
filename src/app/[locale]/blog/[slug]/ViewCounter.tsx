'use client';

import { useEffect, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export function ViewCounter({ articleId }: { articleId: string }) {
  const counted = useRef(false);

  useEffect(() => {
    if (counted.current) return;
    counted.current = true;

    // Einmal pro Session den View-Counter incrementieren
    const key = `souleya_viewed_${articleId}`;
    if (sessionStorage.getItem(key)) return;

    fetch(`${API_URL}/articles/${articleId}/view`, { method: 'POST' })
      .then(() => sessionStorage.setItem(key, '1'))
      .catch(() => {});
  }, [articleId]);

  return null;
}
