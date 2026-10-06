/**
 * utils/listingRealtime.js
 * Malazone.com — Real-time listing availability broadcasts
 *
 * Emits a lightweight `listings:changed` event to all connected sockets when a
 * listing is created, updated, activated, deactivated, or deleted, so the
 * buyer catalog, homepage sections, and agent dashboards can refresh live
 * without a manual page reload.
 *
 * Payload is intentionally small — clients refetch the filtered list they care
 * about rather than trusting a per-listing patch.
 * © 2026 Malazone Technologies PLC
 */

"use strict";

/**
 * Broadcast a listing change to every connected client.
 * @param {import("socket.io").Server} io  The socket.io instance.
 * @param {object} change
 * @param {"created"|"updated"|"deleted"} change.action
 * @param {number} change.id         Listing id.
 * @param {boolean} [change.is_active]
 * @param {string}  [change.category]
 * @param {string}  [change.location_key]
 */
function broadcastListingChange(io, change) {
  if (!io) return;
  try {
    io.emit("listings:changed", {
      action: change.action,
      id: Number(change.id),
      is_active: change.is_active,
      category: change.category || null,
      location_key: change.location_key || null,
      ts: Date.now(),
    });
  } catch (err) {
    // Broadcasting must never break a listing write.
    console.error("[listingRealTime] broadcast failed:", err.message);
  }
}

module.exports = { broadcastListingChange };
