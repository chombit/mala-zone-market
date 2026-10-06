/**
 * utils/notify.js
 * In-app notification writer (F10 matrix).
 *
 * createNotification NEVER throws into the caller's flow: a failed insert is
 * logged and swallowed so lifecycle operations (verdicts, payouts) cannot fail
 * because of a notification.
 */
const db = require("../database/db");
const webpush = require("./webpush");

async function createNotification({ userId, type, title, body, payload, listingId }) {
  let insertId = null;
  try {
    if (!userId || !type || !title) {
      console.error("[notify] missing userId/type/title — skipped");
      return null;
    }
    const [result] = await db.execute(
      `INSERT INTO notifications (user_id, type, title, body, payload, listing_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        String(type).slice(0, 64),
        String(title).slice(0, 255),
        body ? String(body).slice(0, 500) : null,
        payload ? JSON.stringify(payload).slice(0, 4000) : null,
        listingId || null,
      ]
    );
    insertId = result.insertId;
  } catch (err) {
    console.error("[notify] failed to persist notification:", err.message);
    return null;
  }

  // Fire the device push in parallel and never let it block the caller.
  // If VAPID is not configured this is a no-op.
  webpush
    .sendToUser({
      userId,
      title,
      body,
      url: payload && payload.url ? payload.url : undefined,
      tag: type ? `malazone-${type}-${insertId}` : undefined,
    })
    .catch((err) => console.error("[notify] push send failed:", err.message));

  return insertId;
}

module.exports = { createNotification };
