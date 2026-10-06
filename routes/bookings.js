/**
 * routes/bookings.js — Sprint 5 request-to-book engine + Sprint P1-P3 payment flow.
 *
 * Booking lifecycle (updated for payment verification):
 *
 *   guest creates ──▶ pending ──▶ payment_submitted ──▶ confirmed ──▶ completed
 *                       │  ▲            │    ▲              │        ▲
 *                       │  └─ expired    │    │              │        │
 *                       ▼                ▼    │              ▼        │
 *                  rejected     admin verifies│   cancelled_by_guest / cancelled_by_host
 *                              (or auto-confirm if evidence matches)
 *
 * Double-booking is prevented inside a transaction with SELECT ... FOR UPDATE
 * on the overlapping range before INSERT.
 */
"use strict";

const express = require("express");
const db = require("../database/db");
const { requireUserAuth } = require("../middleware/userAuth");
const { createNotification } = require("../utils/notify");

const router = express.Router();

const BOOKABLE_CATEGORIES = new Set(["stay", "furniture"]); // Sprint 9a: ceremony → furniture
const ACTIVE_BLOCKING_STATUSES = ["pending", "confirmed"];
const PENDING_TTL_HOURS = 48;
const MAX_STAY_NIGHTS = 30;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// ── helpers ────────────────────────────────────────────────────────────────

function todayLocal() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function isValidIsoDate(s) {
  if (typeof s !== "string" || !ISO_DATE.test(s)) return false;
  const d = new Date(`${s}T00:00:00`);
  return !Number.isNaN(d.getTime());
}

/** Normalize DATE column values (string or JS Date) to YYYY-MM-DD in LOCAL time. */
function isoDay(v) {
  if (!v) return null;
  if (v instanceof Date) {
    const p = (n) => String(n).padStart(2, "0");
    return `${v.getFullYear()}-${p(v.getMonth() + 1)}-${p(v.getDate())}`;
  }
  return String(v).slice(0, 10);
}

function nightsBetween(checkIn, checkOut) {
  const ms = new Date(`${checkOut}T00:00:00`) - new Date(`${checkIn}T00:00:00`);
  return Math.round(ms / 86400000);
}

/** Lazy expiry: stale pending requests die without a cron worker. */
async function expireStalePending() {
  await db.execute(
    `UPDATE bookings SET status = 'expired', decided_at = NOW()
     WHERE status = 'pending'
       AND created_at < NOW() - INTERVAL ${PENDING_TTL_HOURS} HOUR`
  );
}

function parseId(raw) {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// ── create booking request (guest) ────────────────────────────────────────
router.post("/", requireUserAuth, async (req, res) => {
  try {
    const listingId = parseId(req.body?.listing_id);
    if (!listingId) {
      return res.status(400).json({ success: false, message: "listing_id is required" });
    }

    const [[listing]] = await db.execute(
      `SELECT l.id, l.user_id AS host_user_id, l.category, l.price,
              l.capacity, l.title_en, l.is_active, l.status
       FROM listings l WHERE l.id = ?`,
      [listingId]
    );
    if (!listing || !listing.is_active || listing.status !== "active") {
      return res.status(404).json({ success: false, message: "Listing not available" });
    }
    if (!BOOKABLE_CATEGORIES.has(listing.category)) {
      return res.status(400).json({
        success: false,
        message: `Category "${listing.category}" is not bookable (stay/furniture only)`,
      });
    }
    if (listing.host_user_id === req.user.id) {
      return res.status(403).json({ success: false, message: "You cannot book your own listing" });
    }

    // ── date validation per category ──
    let checkIn = null;
    let checkOut = null;
    let eventDate = null;
    let nights = null;

    const today = todayLocal();

    if (listing.category === "stay") {
      ({ check_in: checkIn, check_out: checkOut } = req.body || {});
      if (!isValidIsoDate(checkIn) || !isValidIsoDate(checkOut)) {
        return res.status(400).json({ success: false, message: "check_in and check_out (YYYY-MM-DD) are required" });
      }
      nights = nightsBetween(checkIn, checkOut);
      if (!Number.isInteger(nights) || nights < 1 || nights > MAX_STAY_NIGHTS) {
        return res.status(400).json({
          success: false,
          message: `stay length must be between 1 and ${MAX_STAY_NIGHTS} nights`,
        });
      }
      if (checkIn < today) {
        return res.status(400).json({ success: false, message: "check_in cannot be in the past" });
      }
    } else {
      eventDate = req.body?.event_date;
      if (!isValidIsoDate(eventDate)) {
        return res.status(400).json({ success: false, message: "event_date (YYYY-MM-DD) is required" });
      }
      if (eventDate < today) {
        return res.status(400).json({ success: false, message: "event_date cannot be in the past" });
      }
    }

    // guests: optional, bounded by the listing capacity when set
    let guests = null;
    if (req.body?.guests !== undefined && req.body.guests !== null && req.body.guests !== "") {
      guests = Number(req.body.guests);
      if (!Number.isInteger(guests) || guests < 1 || guests > 1000) {
        return res.status(400).json({ success: false, message: "guests must be an integer between 1 and 1000" });
      }
      if (listing.capacity && guests > Number(listing.capacity)) {
        return res.status(400).json({
          success: false,
          message: `This venue holds at most ${Number(listing.capacity)} guests`,
        });
      }
    }

    const contactPhone = String(
      req.body?.contact_phone ?? req.user.phone_number ?? ""
    ).replace(/\s/g, "").slice(0, 20);
    if (!contactPhone) {
      return res.status(400).json({ success: false, message: "A contact phone is required" });
    }
    const guestMessage = req.body?.guest_message
      ? String(req.body.guest_message).slice(0, 1000)
      : null;

    // Price snapshot at request time — later listing edits never rewrite history
    const unitPrice = Number(listing.price);
    const totalPrice =
      listing.category === "stay"
        ? Math.round(unitPrice * nights * 100) / 100
        : unitPrice;

    // ── race-safe overlap check + insert ──
    let bookingId = null;
    try {
      await db.transaction(async (conn) => {
        if (listing.category === "stay") {
          const [rows] = await conn.execute(
            `SELECT id FROM bookings
             WHERE listing_id = ?
               AND status IN ('pending','confirmed')
               AND check_in IS NOT NULL
               AND check_in < ? AND check_out > ?
             FOR UPDATE`,
            [listingId, checkOut, checkIn]
          );
          if (rows.length > 0) throw new Error("DATES_TAKEN");
        } else {
          const [rows] = await conn.execute(
            `SELECT id FROM bookings
             WHERE listing_id = ?
               AND status IN ('pending','confirmed')
               AND (
                 event_date = ?
                 OR (check_in IS NOT NULL AND check_in <= ? AND check_out > ?)
               )
             FOR UPDATE`,
            [listingId, eventDate, eventDate, eventDate]
          );
          if (rows.length > 0) throw new Error("DATES_TAKEN");
        }

        const [result] = await conn.execute(
          `INSERT INTO bookings
             (listing_id, guest_user_id, host_user_id, check_in, check_out,
              event_date, nights, guests, price_per_unit, total_price,
              contact_phone, guest_message)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            listingId, req.user.id, listing.host_user_id,
            checkIn, checkOut, eventDate, nights, guests,
            unitPrice, totalPrice, contactPhone, guestMessage,
          ]
        );
        bookingId = result.insertId;
      });
    } catch (err) {
      if (err.message === "DATES_TAKEN") {
        return res.status(409).json({
          success: false,
          message: "Those dates are already booked or pending confirmation",
        });
      }
      throw err;
    }

    createNotification({
      userId: listing.host_user_id,
      type: "booking_requested",
      title: "New booking request",
      body: `${req.user.full_name} requested "${listing.title_en}"${
        nights ? ` (${nights} night${nights > 1 ? "s" : ""})` : ""
      }`,
      payload: { booking_id: bookingId },
      listingId,
    }).catch(() => {});

    // Real-time push to host + admin feed
    const io = req.app.get("io");
    if (io) {
      const bookingEvent = {
        booking_id: bookingId,
        listing_id: listingId,
        guest_user_id: req.user.id,
        host_user_id: listing.host_user_id,
        guest_name: req.user.full_name,
        listing_title: listing.title_en,
        status: "pending",
        timestamp: Date.now(),
      };
      io.to(`user_${listing.host_user_id}`).emit("booking:status_changed", bookingEvent);
      io.to("admin_feed").emit("admin:booking_update", bookingEvent);
    }

    res.status(201).json({
      success: true,
      data: {
        id: bookingId,
        status: "pending",
        nights,
        total_price: totalPrice,
      },
    });
  } catch (err) {
    console.error("[POST /bookings]", err);
    res.status(500).json({ success: false, message: "Failed to create booking request" });
  }
});

// ── guest: my bookings ─────────────────────────────────────────────────────
router.get("/mine", requireUserAuth, async (req, res) => {
  try {
    await expireStalePending();
    const [rows] = await db.execute(
      `SELECT b.id, b.listing_id, b.guest_user_id, b.host_user_id,
              CAST(b.check_in AS CHAR) AS check_in,
              CAST(b.check_out AS CHAR) AS check_out,
              CAST(b.event_date AS CHAR) AS event_date,
              b.nights, b.guests, b.price_per_unit, b.total_price,
              b.currency, b.status, b.created_at,
              l.title_en, l.title_am, l.category, l.images, l.location_label_en
       FROM bookings b JOIN listings l ON l.id = b.listing_id
       WHERE b.guest_user_id = ?
       ORDER BY b.created_at DESC LIMIT 100`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("[GET /bookings/mine]", err);
    res.status(500).json({ success: false, message: "Failed to fetch your bookings" });
  }
});

// ── host: inbox for my listings ────────────────────────────────────────────
router.get("/hosted", requireUserAuth, async (req, res) => {
  try {
    await expireStalePending();
    const [rows] = await db.execute(
      `SELECT b.id, b.listing_id, b.guest_user_id, b.host_user_id,
              CAST(b.check_in AS CHAR) AS check_in,
              CAST(b.check_out AS CHAR) AS check_out,
              CAST(b.event_date AS CHAR) AS event_date,
              b.nights, b.guests, b.total_price, b.currency, b.status,
              b.guest_message, b.contact_phone, b.created_at,
              l.title_en, u.full_name AS guest_name
       FROM bookings b
       JOIN listings l ON l.id = b.listing_id
       JOIN users u ON u.id = b.guest_user_id
       WHERE b.host_user_id = ?
       ORDER BY FIELD(b.status,'pending','confirmed','completed','rejected',
                      'cancelled_by_guest','cancelled_by_host','expired'),
                b.created_at DESC
       LIMIT 200`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("[GET /bookings/hosted]", err);
    res.status(500).json({ success: false, message: "Failed to fetch hosted bookings" });
  }
});

// ── detail (guest or host only) ────────────────────────────────────────────
router.get("/:id(\\d+)", requireUserAuth, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const [[booking]] = await db.execute(
      `SELECT id, listing_id, guest_user_id, host_user_id,
              CAST(check_in AS CHAR) AS check_in,
              CAST(check_out AS CHAR) AS check_out,
              CAST(event_date AS CHAR) AS event_date,
              nights, guests, price_per_unit, total_price, currency,
              contact_phone, guest_message, status,
              decided_at, created_at, updated_at
       FROM bookings WHERE id = ?`,
      [id]
    );
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    if (booking.guest_user_id !== req.user.id && booking.host_user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    console.error("[GET /bookings/:id]", err);
    res.status(500).json({ success: false, message: "Failed to fetch booking" });
  }
});

// ── state machine ──────────────────────────────────────────────────────────
// target -> allowed source states -> who may act
const TRANSITIONS = {
  payment_submitted:  { from: ["pending"],                          actor: "guest", notify: "booking_payment_submitted" },
  confirmed:           { from: ["pending", "payment_submitted"],    actor: "host",  notify: "booking_confirmed" },
  rejected:            { from: ["pending", "payment_submitted"],    actor: "host",  notify: "booking_rejected" },
  cancelled_by_host:   { from: ["confirmed"],                       actor: "host",  notify: "booking_cancelled_by_host" },
  cancelled_by_guest:  { from: ["pending", "payment_submitted", "confirmed"], actor: "guest", notify: "booking_cancelled_by_guest" },
  completed:           { from: ["confirmed"],                       actor: "host",  notify: "booking_completed" },
};

router.patch("/:id(\\d+)/status", requireUserAuth, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const target = req.body?.status;
    const rule = TRANSITIONS[target];
    if (!rule) {
      return res.status(400).json({ success: false, message: "Invalid target status" });
    }

    const [[booking]] = await db.execute("SELECT * FROM bookings WHERE id = ?", [id]);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const isHost = booking.host_user_id === req.user.id;
    const isGuest = booking.guest_user_id === req.user.id;
    if ((rule.actor === "host" && !isHost) || (rule.actor === "guest" && !isGuest)) {
      return res.status(403).json({
        success: false,
        message: `Only the ${rule.actor} can perform this action`,
      });
    }

    await expireStalePending();
    const [[fresh]] = await db.execute("SELECT status FROM bookings WHERE id = ?", [id]);
    if (!rule.from.includes(fresh.status)) {
      return res.status(409).json({
        success: false,
        message: `Cannot move a ${fresh.status} booking to ${target}`,
      });
    }

    const [result] = await db.execute(
      `UPDATE bookings SET status = ?, decided_at = NOW()
       WHERE id = ? AND status = ?`,
      [target, id, fresh.status]
    );
    if (result.affectedRows !== 1) {
      return res.status(409).json({ success: false, message: "Booking changed concurrently, retry" });
    }

    // Notify the OTHER party about the decision
    const notifyUserId = rule.actor === "host" ? booking.guest_user_id : booking.host_user_id;
    createNotification({
      userId: notifyUserId,
      type: rule.notify,
      title: `Booking #${booking.id} ${target.replace(/_/g, " ")}`,
      payload: { booking_id: booking.id, status: target },
      listingId: booking.listing_id,
    }).catch(() => {});

    // Real-time push to both guest and host rooms
    const io = req.app.get("io");
    if (io) {
      const bookingEvent = {
        booking_id: booking.id,
        listing_id: booking.listing_id,
        status: target,
        actor: rule.actor,
        timestamp: Date.now(),
      };
      io.to(`user_${booking.guest_user_id}`).emit("booking:status_changed", bookingEvent);
      io.to(`user_${booking.host_user_id}`).emit("booking:status_changed", bookingEvent);
      io.to("admin_feed").emit("admin:booking_update", {
        ...bookingEvent,
        guest_user_id: booking.guest_user_id,
        host_user_id: booking.host_user_id,
      });
    }

    res.json({ success: true, data: { id, status: target } });
  } catch (err) {
    console.error("[PATCH /bookings/:id/status]", err);
    res.status(500).json({ success: false, message: "Failed to update booking" });
  }
});

// ── public availability: blocked dates for a listing's calendar ───────────
router.get("/availability", async (req, res) => {
  try {
    const listingId = parseId(req.query?.listing_id);
    if (!listingId) {
      return res.status(400).json({ success: false, message: "listing_id is required" });
    }
    const [rows] = await db.execute(
      `SELECT check_in, check_out, event_date, status
       FROM bookings
       WHERE listing_id = ?
         AND status IN ('pending','confirmed')
         AND (COALESCE(check_out, event_date) >= CURDATE())
       ORDER BY COALESCE(check_in, event_date)
       LIMIT 365`,
      [listingId]
    );
    const bookedDates = [];
    for (const r of rows) {
      const event = isoDay(r.event_date);
      const ci = isoDay(r.check_in);
      const co = isoDay(r.check_out);
      if (event) {
        bookedDates.push(event);
      } else if (ci && co) {
        // expand stay ranges into concrete blocked days
        let cur = ci;
        let guard = 0;
        while (cur < co && guard < MAX_STAY_NIGHTS + 1) {
          bookedDates.push(cur);
          const d = new Date(`${cur}T00:00:00`);
          d.setDate(d.getDate() + 1);
          cur = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          guard += 1;
        }
      }
    }
    res.json({ success: true, data: { listing_id: listingId, booked_dates: bookedDates } });
  } catch (err) {
    console.error("[GET /bookings/availability]", err);
    res.status(500).json({ success: false, message: "Failed to load availability" });
  }
});

// ── Sprint P1: Payment evidence upload ────────────────────────────────────
// POST /api/bookings/:id/payment-evidence
// Guest submits payment proof (screenshots) after paying the property directly.
// Transitions booking from pending → payment_submitted, stopping the 48h expiry.
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

const PAYMENT_UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads", "payments");
if (!fs.existsSync(PAYMENT_UPLOAD_DIR)) fs.mkdirSync(PAYMENT_UPLOAD_DIR, { recursive: true });

const paymentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 3 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
  },
});

async function processPaymentImage(buffer) {
  const filename = `pay_${uuidv4()}.webp`;
  const outputPath = path.join(PAYMENT_UPLOAD_DIR, filename);
  await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true, fit: "inside" })
    .webp({ quality: 80, effort: 6 })
    .toFile(outputPath);
  return `/uploads/payments/${filename}`;
}

router.post(
  "/:id(\\d+)/payment-evidence",
  requireUserAuth,
  paymentUpload.array("evidence", 3),
  async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) {
        return res.status(400).json({ success: false, message: "Invalid booking id" });
      }

      const [[booking]] = await db.execute("SELECT * FROM bookings WHERE id = ?", [id]);
      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }
      if (booking.guest_user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: "Only the guest can submit payment evidence" });
      }
      if (booking.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: `Cannot submit payment for a ${booking.status} booking`,
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: "At least one evidence image is required" });
      }

      const evidenceUrls = [];
      for (const file of req.files) {
        const url = await processPaymentImage(file.buffer);
        evidenceUrls.push(url);
      }

      const amountClaimed = Number(booking.total_price);
      const note = typeof req.body.note === "string" ? req.body.note.slice(0, 500) : null;

      // Insert payment record + transition booking in a transaction
      let paymentId = null;
      try {
        await db.transaction(async (conn) => {
          // Re-check status inside transaction
          const [[fresh]] = await conn.execute("SELECT status FROM bookings WHERE id = ? FOR UPDATE", [id]);
          if (fresh.status !== "pending") throw new Error("CONCURRENT_CHANGE");

          const [payResult] = await conn.execute(
            `INSERT INTO payments (booking_id, user_id, amount_claimed, evidence_urls, note)
             VALUES (?, ?, ?, ?, ?)`,
            [id, req.user.id, amountClaimed, JSON.stringify(evidenceUrls), note]
          );
          paymentId = payResult.insertId;

          await conn.execute(
            "UPDATE bookings SET status = 'payment_submitted' WHERE id = ? AND status = 'pending'",
            [id]
          );
        });
      } catch (err) {
        if (err.message === "CONCURRENT_CHANGE") {
          return res.status(409).json({ success: false, message: "Booking status changed, please refresh" });
        }
        throw err;
      }

      // Notify host + admin feed
      const io = req.app.get("io");
      if (io) {
        io.to(`user_${booking.host_user_id}`).emit("booking:status_changed", {
          booking_id: id,
          status: "payment_submitted",
          timestamp: Date.now(),
        });
        io.to("admin_feed").emit("admin:payment_submitted", {
          booking_id: id,
          guest_user_id: req.user.id,
          amount_claimed: amountClaimed,
          evidence_count: evidenceUrls.length,
          timestamp: Date.now(),
        });
      }

      createNotification({
        userId: booking.host_user_id,
        type: "booking_payment_submitted",
        title: "Payment evidence submitted",
        body: `Guest submitted payment proof for Booking #${id} (ETB ${amountClaimed})`,
        payload: { booking_id: id, payment_id: paymentId },
        listingId: booking.listing_id,
      }).catch(() => {});

      res.status(201).json({
        success: true,
        data: { payment_id: paymentId, status: "payment_submitted", evidence_urls: evidenceUrls },
      });
    } catch (err) {
      console.error("[POST /bookings/:id/payment-evidence]", err);
      res.status(500).json({ success: false, message: "Failed to submit payment evidence" });
    }
  }
);

// ── Sprint P3: Digital receipt / confirmation ─────────────────────────────
// GET /api/bookings/:id/receipt — returns a structured confirmation object
router.get("/:id(\\d+)/receipt", requireUserAuth, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const [[booking]] = await db.execute(
      `SELECT b.id, b.listing_id, b.guest_user_id, b.host_user_id,
              CAST(b.check_in AS CHAR) AS check_in,
              CAST(b.check_out AS CHAR) AS check_out,
              CAST(b.event_date AS CHAR) AS event_date,
              b.nights, b.guests, b.price_per_unit, b.total_price, b.currency,
              b.contact_phone, b.status, b.created_at,
              l.title_en, l.title_am, l.category,
              l.payment_phone, l.payment_bank_name, l.payment_bank_account,
              l.location_label_en, l.location_label_am,
              u.full_name AS guest_name,
              h.full_name AS host_name
       FROM bookings b
       JOIN listings l ON l.id = b.listing_id
       JOIN users u ON u.id = b.guest_user_id
       JOIN users h ON h.id = b.host_user_id
       WHERE b.id = ?`,
      [id]
    );
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    if (booking.guest_user_id !== req.user.id && booking.host_user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const receipt = {
      confirmation_id: `MZ-${String(booking.id).padStart(6, "0")}`,
      status: booking.status,
      listing: {
        title: booking.title_en,
        title_am: booking.title_am,
        category: booking.category,
        location: booking.location_label_en,
        location_am: booking.location_label_am,
      },
      dates: {
        check_in: booking.check_in,
        check_out: booking.check_out,
        event_date: booking.event_date,
        nights: booking.nights,
      },
      guests: booking.guests,
      pricing: {
        unit_price: Number(booking.price_per_unit),
        total_price: Number(booking.total_price),
        currency: booking.currency,
      },
      payment_info: {
        phone: booking.payment_phone,
        bank_name: booking.payment_bank_name,
        bank_account: booking.payment_bank_account,
      },
      guest: { name: booking.guest_name, id: booking.guest_user_id },
      host: { name: booking.host_name, id: booking.host_user_id },
      booked_at: booking.created_at,
    };

    res.json({ success: true, data: receipt });
  } catch (err) {
    console.error("[GET /bookings/:id/receipt]", err);
    res.status(500).json({ success: false, message: "Failed to generate receipt" });
  }
});

module.exports = router;
