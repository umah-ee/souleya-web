'use client';

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { fetchChannels } from '@/lib/chat';
import type { ChannelOverview } from '@/types/chat';

interface UnreadContextValue {
  totalUnread: number;
  refreshUnread: () => Promise<void>;
  updateFromChannels: (channels: ChannelOverview[]) => void;
}

const UnreadContext = createContext<UnreadContextValue>({
  totalUnread: 0,
  refreshUnread: async () => {},
  updateFromChannels: () => {},
});

// Daten gelten 30 Sekunden als frisch – verhindert doppelte API-Calls
const STALE_MS = 30_000;

export function UnreadProvider({ children }: { children: ReactNode }) {
  const [totalUnread, setTotalUnread] = useState(0);
  const lastUpdatedRef = useRef(0);
  const isFetchingRef = useRef(false);

  const updateFromChannels = useCallback((channels: ChannelOverview[]) => {
    const total = channels.reduce((sum, ch) => sum + ch.unread_count, 0);
    setTotalUnread(total);
    lastUpdatedRef.current = Date.now();
  }, []);

  const refreshUnread = useCallback(async () => {
    // Skip wenn Daten noch frisch sind oder bereits ein Fetch läuft
    if (isFetchingRef.current) return;
    if (Date.now() - lastUpdatedRef.current < STALE_MS) return;
    isFetchingRef.current = true;
    try {
      const channels = await fetchChannels();
      updateFromChannels(channels);
    } catch {
      // silent
    } finally {
      isFetchingRef.current = false;
    }
  }, [updateFromChannels]);

  return (
    <UnreadContext.Provider value={{ totalUnread, refreshUnread, updateFromChannels }}>
      {children}
    </UnreadContext.Provider>
  );
}

export function useUnread() {
  return useContext(UnreadContext);
}
