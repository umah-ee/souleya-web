'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { fetchChannels } from '@/lib/chat';

interface UnreadContextValue {
  totalUnread: number;
  refreshUnread: () => Promise<void>;
}

const UnreadContext = createContext<UnreadContextValue>({
  totalUnread: 0,
  refreshUnread: async () => {},
});

export function UnreadProvider({ children }: { children: ReactNode }) {
  const [totalUnread, setTotalUnread] = useState(0);

  const refreshUnread = useCallback(async () => {
    try {
      const channels = await fetchChannels();
      const total = channels.reduce((sum, ch) => sum + ch.unread_count, 0);
      setTotalUnread(total);
    } catch {
      // silent
    }
  }, []);

  return (
    <UnreadContext.Provider value={{ totalUnread, refreshUnread }}>
      {children}
    </UnreadContext.Provider>
  );
}

export function useUnread() {
  return useContext(UnreadContext);
}
