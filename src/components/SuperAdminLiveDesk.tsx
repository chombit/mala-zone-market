import React, { useState, useEffect } from 'react';
import { useSocketTracker, TrackingPayload } from '../hooks/useSocketTracker';
import { ShieldAlert, Layers, Package, AlertTriangle, Wallet, CalendarCheck } from 'lucide-react';

interface AdminEvent {
  id: string;
  type: 'tracking' | 'new_listing' | 'new_report' | 'new_payout_request' | 'booking_update';
  title: string;
  detail: string;
  timestamp: number;
}

export function SuperAdminLiveDesk() {
  const [logs, setLogs] = useState<AdminEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const token = "MALAZONE_SUPER_ADMIN_SECURE_HASH_999";
  const { socket } = useSocketTracker(token);

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      console.log('[LiveDesk] socket connected');
      setConnected(true);
    };
    const onDisconnect = () => {
      console.log('[LiveDesk] socket disconnected');
      setConnected(false);
    };
    const onTracking = (data: TrackingPayload) => {
      const event: AdminEvent = {
        id: data.eventId,
        type: 'tracking',
        title: data.eventType.toUpperCase(),
        detail: `${data.zone} — ${data.assetTitleAm}`,
        timestamp: Date.now(),
      };
      setLogs(prev => [event, ...prev].slice(0, 80));
    };
    const onNewListing = (data: { id: number; title_en: string; category: string; price: number; timestamp: number }) => {
      const event: AdminEvent = {
        id: `listing_${data.id}_${data.timestamp}`,
        type: 'new_listing',
        title: 'NEW LISTING',
        detail: `${data.title_en} (${data.category}) — ETB ${data.price}`,
        timestamp: data.timestamp,
      };
      setLogs(prev => [event, ...prev].slice(0, 80));
    };
    const onNewReport = (data: { report_id: number; listing_id: number; reason: string; timestamp: number }) => {
      const event: AdminEvent = {
        id: `report_${data.report_id}_${data.timestamp}`,
        type: 'new_report',
        title: 'NEW REPORT',
        detail: `Listing #${data.listing_id} — ${data.reason}`,
        timestamp: data.timestamp,
      };
      setLogs(prev => [event, ...prev].slice(0, 80));
    };
    const onNewPayout = (data: { request_id: number; agent_id: number; amount_etb: number; timestamp: number }) => {
      const event: AdminEvent = {
        id: `payout_${data.request_id}_${data.timestamp}`,
        type: 'new_payout_request',
        title: 'PAYOUT REQUEST',
        detail: `Agent #${data.agent_id} — ETB ${data.amount_etb}`,
        timestamp: data.timestamp,
      };
      setLogs(prev => [event, ...prev].slice(0, 80));
    };
    const onBookingUpdate = (data: { booking_id: number; status: string; timestamp: number }) => {
      const event: AdminEvent = {
        id: `booking_${data.booking_id}_${data.status}_${data.timestamp}`,
        type: 'booking_update',
        title: 'BOOKING UPDATE',
        detail: `Booking #${data.booking_id} → ${data.status.replace(/_/g, ' ')}`,
        timestamp: data.timestamp,
      };
      setLogs(prev => [event, ...prev].slice(0, 80));
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('broadcast_admin_notification', onTracking);
    socket.on('admin:new_listing', onNewListing);
    socket.on('admin:new_report', onNewReport);
    socket.on('admin:new_payout_request', onNewPayout);
    socket.on('admin:booking_update', onBookingUpdate);

    if (socket.connected) {
      console.log('[LiveDesk] already connected');
      setConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('broadcast_admin_notification', onTracking);
      socket.off('admin:new_listing', onNewListing);
      socket.off('admin:new_report', onNewReport);
      socket.off('admin:new_payout_request', onNewPayout);
      socket.off('admin:booking_update', onBookingUpdate);
    };
  }, [socket]);

  const getActionBadge = (type: AdminEvent['type']) => {
    const map = {
      tracking: { label: "👁 Visit", style: "bg-blue-50 border-blue-100 text-blue-700" },
      new_listing: { label: "📦 New Listing", style: "bg-emerald-50 border-emerald-100 text-emerald-700" },
      new_report: { label: "⚠ Report", style: "bg-rose-50 border-rose-100 text-rose-600" },
      new_payout_request: { label: "💰 Payout", style: "bg-amber-50 border-amber-100 text-amber-700" },
      booking_update: { label: "📅 Booking", style: "bg-purple-50 border-purple-100 text-purple-700" },
    }[type];
    return <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider leading-relaxed ${map.style}`}>{map.label}</span>;
  };

  return (
    <section className="bg-slate-50 text-[#0B132B] min-h-screen py-10 px-4 sm:px-8 lg:px-16 text-left font-sans antialiased select-none">
      <div className="max-w-6xl mx-auto space-y-6">

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1 text-left">
            <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${connected ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
              <ShieldAlert className="size-3.5 animate-pulse" />
              <span>{connected ? '🔴 Live Socket Connected' : '⚪ Connecting to Secure Socket...'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">malazone Live Activity Feed</h2>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black tracking-wider">
            <span className={`size-2 rounded-full ${connected ? 'bg-[#00A86B] animate-ping' : 'bg-amber-400'} shrink-0`} />
            <span>{connected ? 'Streaming Live Logs' : 'Waiting for Connection'}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[32px] shadow-xl overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-12 gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">
            <div className="col-span-2">Event ID</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-6">Details</div>
            <div className="col-span-2 text-right">Timestamp</div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {logs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-bold text-xs uppercase tracking-wider space-y-2">
                <Layers className="size-8 text-slate-200 mx-auto animate-bounce" />
                <p className="leading-relaxed">Awaiting live traffic — listings, reports, bookings, payouts and user interactions...</p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-4 grid grid-cols-12 gap-2 items-center text-xs font-bold text-slate-700 hover:bg-slate-50/50 transition-colors animate-in slide-in-from-top-2 duration-300">
                  <div className="col-span-2 font-mono text-slate-400 font-black leading-relaxed truncate">{log.id.split('_').slice(0, 2).join('_')}</div>
                  <div className="col-span-2 leading-relaxed">{getActionBadge(log.type)}</div>
                  <div className="col-span-6 text-slate-900 font-black tracking-tight truncate pr-4 font-sans leading-relaxed">{log.detail}</div>
                  <div className="col-span-2 text-right font-mono text-[11px] text-slate-400 leading-relaxed">{new Date(log.timestamp).toLocaleTimeString()}</div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
