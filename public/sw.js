/* eslint-disable no-restricted-globals */
/**
 * public/sw.js
 * Custom service worker (injectManifest) — app shell precaching via workbox
 * plus web-push (VAPID) handlers.
 *
 * The `self.__WB_MANIFEST` placeholder is injected at build time with the
 * list of precached assets.
 */
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { registerRoute } from "workbox-routing";
import { CacheFirst, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Image cache — CacheFirst, 30 days
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images",
    plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  })
);

// JS/CSS assets — StaleWhileRevalidate, 7 days
registerRoute(
  ({ request }) => request.destination === "script" || request.destination === "style",
  new StaleWhileRevalidate({
    cacheName: "assets",
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 })],
  })
);

// ── Web Push handlers ─────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    /* non-JSON payload — ignore */
  }
  const title = data.title || "Malazone";
  const options = {
    body: data.body || "",
    icon: data.icon || "/assets/malazone-m-emblem.webp",
    badge: data.badge || "/assets/malazone-m-emblem.webp",
    data: { url: data.url || "/" },
    tag: data.tag || "malazone",
    renotify: true,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of all) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })()
  );
});
