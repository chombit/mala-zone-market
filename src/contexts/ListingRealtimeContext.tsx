import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';

export interface ListingChangePayload {
  action: 'created' | 'updated' | 'deleted';
  id: number;
  is_active?: boolean;
  category?: string | null;
  location_key?: string | null;
  ts?: number;
}

interface ListingRealtimeValue {
  /** Incremented every time a listings:changed event arrives. */
  revision: number;
  /** Latest listings:changed payload — lets consumers react only when the
   *  changed listing is relevant to them (e.g. the current detail page). */
  lastChange: ListingChangePayload | null;
  /** Manual bump — lets callers force a refresh (e.g. create/delete via non-socket flows). */
  bump: () => void;
}

const ListingRealtimeContext = createContext<ListingRealtimeValue | null>(null);

function resolveSocketUrl(): string {
  if (typeof window === 'undefined') return 'http://localhost:4003';
  const host = window.location.hostname;
  const isDev = host === 'localhost' || host === '127.0.0.1';
  return isDev ? 'http://localhost:4003' : 'https://malazone.com';
}

export function ListingRealtimeProvider({ children }: { children: React.ReactNode }) {
  const [revision, setRevision] = useState(0);
  const [lastChange, setLastChange] = useState<ListingChangePayload | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const url = resolveSocketUrl();
    const s = io(url, {
      transports: ['websocket'],
      autoConnect: true,
    });
    socketRef.current = s;

    const onListingsChanged = (payload: ListingChangePayload) => {
      setLastChange(payload);
      setRevision((r) => r + 1);
    };

    s.on('listings:changed', onListingsChanged);
    s.on('connect_error', (err: Error) => {
      console.warn('[ListingRealtime] connection error:', err.message);
    });

    return () => {
      s.off('listings:changed', onListingsChanged);
      s.disconnect();
      socketRef.current = null;
    };
  }, []);

  const value = useMemo<ListingRealtimeValue>(
    () => ({
      revision,
      lastChange,
      bump: () => setRevision((r) => r + 1),
    }),
    [revision, lastChange]
  );

  return (
    <ListingRealtimeContext.Provider value={value}>{children}</ListingRealtimeContext.Provider>
  );
}

export function useListingRevision(): ListingRealtimeValue {
  const ctx = useContext(ListingRealtimeContext);
  if (!ctx) {
    throw new Error('useListingRevision must be used within a ListingRealtimeProvider');
  }
  return ctx;
}
