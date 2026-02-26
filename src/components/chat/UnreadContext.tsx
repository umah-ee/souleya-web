'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
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

export function UnreadProvider({ children }: { children: ReactNode }) {
  const [totalUnread, setTotalUnread] = useState(0);

  const updateFromChannels = useCallback((channels: ChannelOverview[]) => {
    const total = channels.reduce((sum, ch) => sum + ch.unread_count, 0);
    setTotalUnread(total);
  }, []);

  const refreshUnread = useCallback(async () => {
    try {
      const channels = await fetchChannels();
      updateFromChannels(channels);
    } catch {
      // silent
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
