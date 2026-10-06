/**
 * utils/webpush.js
 * Web Push (VAPID) sender + subscription store.
 *
 * Null-safe: if VAPID is not configured (dev/local), every function becomes a
 * no-op so the rest of the app never breaks. Configure via .env:
 *
 *   PUSH_PUBLIC_KEY=
 *   PUSH_PRIVATE_KEY=
 *   PUSH_SUBJECT=mailto:you@example.com
 *
 * Generate keys: npx web-push generate-vapid-keys
 */
"use strict";

const db = require("../database/db");
let webpush = null;
let ready = false;

function init() {
  if (ready) return true;
  const publicKey = process.env.PUSH_PUBLIC_KEY;
  const privateKey = process.env.PUSH_PRIVATE_KEY;
  const subject = process.env.PUSH_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    return false;
  }
  try {
    webpush = require("web-push");
    webpush.setVapidDetails(subject, publicKey, privateKey);
    ready = true;
  } catch (err) {
    console.error("[webpush] init failed:", err.message);
    return false;
  }
  return true;
}

/** Save a new push subscription for a user. Returns insert id. */
async function subscribe({ userId, subscription, userAgent }) {
  const { endpoint, keys } = subscription || {};
  if (!endpoint || !keys || !keys.p256dh || !keys.auth) return null;
  try {
    // Upsert on endpoint (a user may re-subscribe from the same device).
    const [result] = await db.execute(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, user_agent)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE user_id = VALUES(user_id),
         p256dh = VALUES(p256dh), auth = VALUES(auth), user_agent = VALUES(user_agent)`,
      [userId, String(endpoint).slice(0, 500), String(keys.p256dh), String(keys.auth),
       userAgent ? String(userAgent).slice(0, 255) : null]
    );
    return result.insertId;
  } catch (err) {
    console.error("[webpush] save subscription failed:", err.message);
    return null;
  }
}

/** Remove a subscription (e.g. after a 404 Gone from the push service). */
async function unsubscribe({ userId, endpoint }) {
  if (!endpoint) return;
  try {
    await db.execute(
      "DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?",
      [userId, String(endpoint)]
    );
  } catch (err) {
    console.error("[webpush] unsubscribe failed:", err.message);
  }
}

/** Send a push notification to every subscription belonging to a user. */
async function sendToUser({ userId, title, body, icon, url, tag }) {
  if (!init() || !userId || !title) return 0;
  let subs;
  try {
    const [rows] = await db.execute(
      "SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ?",
      [userId]
    );
    subs = rows;
  } catch (err) {
    console.error("[webpush] load subs failed:", err.message);
    return 0;
  }
  if (!subs || subs.length === 0) return 0;

  const payload = JSON.stringify({
    title: String(title).slice(0, 255),
    body: body ? String(body).slice(0, 300) : undefined,
    icon: icon || "/assets/malazone-m-emblem.webp",
    badge: "/assets/malazone-m-emblem.webp",
    url: url || "/",
    tag: tag || "malazone",
  });
  const options = { TTL: 86400 };

  let sent = 0;
  for (const sub of subs) {
    const pushSub = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    };
    try {
      await webpush.sendNotification(pushSub, payload, options);
      sent += 1;
    } catch (err) {
      // 404/410 means the subscription is no longer valid — drop it.
      if (err.statusCode === 404 || err.statusCode === 410) {
        await db.execute("DELETE FROM push_subscriptions WHERE id = ?", [sub.id]).catch(() => {});
      } else if (err.statusCode !== 429) {
        console.error(`[webpush] send failed for ${sub.endpoint}:`, err.message);
      }
    }
  }
  return sent;
}

module.exports = { init, subscribe, unsubscribe, sendToUser, isEnabled: () => init() };
