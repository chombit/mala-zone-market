import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface TrackingPayload {
  eventId: string;
  eventType: 'visit' | 'favorite' | 'click_call' | 'click_telegram';
  zone: 'property' | 'motors' | 'stay' | 'ceremony' | 'machinery' | 'electronics';
  assetId: string | number;
  assetTitleAm: string;
  timestamp: string;
  region: string;
}

export function useSocketTracker(adminToken?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const host = window.location.hostname;
    const isDev = host === 'localhost' || host === '127.0.0.1';
    const url = isDev ? 'http://localhost:4003' : 'https://malazone.com';

    const s = io(url, {
      transports: ['websocket'],
      autoConnect: true,
    });

    s.on('connect', () => {
      console.log(`[Socket] connected to ${url}, admin=${!!adminToken}`);
      if (adminToken) {
        s.emit('authenticate_admin', { token: adminToken });
      }
      setSocket(s);
    });

    s.on('connect_error', (err) => {
      console.error(`[Socket] connection error:`, err.message);
    });

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [adminToken]);

  const trackEvent = (actionType: TrackingPayload['eventType'], asset: any) => {
    if (!socket) return;

    const payload: TrackingPayload = {
      eventId: `EVT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      eventType: actionType,
      zone: asset.zone,
      assetId: asset.id,
      assetTitleAm: asset.titleAm || asset.title,
      timestamp: new Date().toISOString(),
      region: asset.location || 'Hawassa'
    };

    socket.emit('user_interaction_trigger', payload);
  };

  return { trackEvent, socket };
}
