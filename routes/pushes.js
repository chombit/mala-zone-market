/**
 * routes/pushes.js
 * User push-subscription endpoints (Web Push / VAPID).
 * Identity comes from the session — users can only ever touch their own rows.
 */
"use strict";

const express = require("express");
const { requireUserAuth } = require("../middleware/userAuth");
const webpush = require("../utils/webpush");

const router = express.Router();

// GET /api/push/enabled — whether push is configured server-side + VAPID public key
router.get("/enabled", async (req, res) => {
  res.json({
    success: true,
    enabled: webpush.isEnabled(),
    applicationServerKey: process.env.PUSH_PUBLIC_KEY || null,
  });
});
// POST /api/push/subscribe — save (or refresh) a subscription
router.post("/subscribe", requireUserAuth, async (req, res) => {
  try {
    const subscription = req.body && req.body.subscription;
    const id = await webpush.subscribe({
      userId: req.user.id,
      subscription,
      userAgent: req.get("user-agent"),
    });
    res.json({ success: true, enabled: webpush.isEnabled(), subscriptionId: id });
  } catch (err) {
    console.error("[POST /api/push/subscribe]", err);
    res.status(500).json({ success: false, message: "Failed to save subscription" });
  }
});

// POST /api/push/unsubscribe — remove a subscription by endpoint
router.post("/unsubscribe", requireUserAuth, async (req, res) => {
  try {
    const endpoint = req.body && req.body.endpoint;
    await webpush.unsubscribe({ userId: req.user.id, endpoint });
    res.json({ success: true });
  } catch (err) {
    console.error("[POST /api/push/unsubscribe]", err);
    res.status(500).json({ success: false, message: "Failed to remove subscription" });
  }
});

module.exports = router;
