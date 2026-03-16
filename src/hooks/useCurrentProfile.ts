'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '@/lib/api';

export interface CurrentProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  soul_level: number;
  is_first_light: boolean;
}

const STALE_MS = 60_000; // 60s Cache

let cachedProfile: CurrentProfile | null = null;
let lastFetched = 0;

export function useCurrentProfile() {
  const [profile, setProfile] = useState<CurrentProfile | null>(cachedProfile);
  const [isLoading, setIsLoading] = useState(!cachedProfile);
  const isFetchingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (isFetchingRef.current) return;
    if (Date.now() - lastFetched < STALE_MS && cachedProfile) {
      setProfile(cachedProfile);
      setIsLoading(false);
      return;
    }
    isFetchingRef.current = true;
    try {
      const data = await apiFetch<CurrentProfile>('/users/me');
      cachedProfile = data;
      lastFetched = Date.now();
      setProfile(data);
    } catch {
      // silent
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { profile, isLoading, refresh };
}
