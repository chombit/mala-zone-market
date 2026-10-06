/**
 * routes/savedSearches.js — Sprint 6 saved searches + alerts.
 *
 *   POST   /api/saved-searches        save a whitelisted search (+alerts on)
 *   GET    /api/saved-searches/mine   list mine (parsed query objects)
 *   PATCH  /api/saved-searches/:id    toggle notify on/off
 *   DELETE /api/saved-searches/:id    remove
 *
 * Alert delivery happens in utils/alerts.js when new listings are created.
 */
"use strict";

const express = require("express");
const db = require("../database/db");
const { requireUserAuth } = require("../middleware/userAuth");
const {
  MAX_SAVED_SEARCHES,
  normalizeSavedQuery,
} = require("../utils/alerts");

const router = express.Router();

function parseId(raw) {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// ── create ─────────────────────────────────────────────────────────────────
router.post("/", requireUserAuth, async (req, res) => {
  try {
    const name = req.body?.name ? String(req.body.name).trim().slice(0, 100) : null;
    const notify = req.body?.notify === false ? 0 : 1;

    const normalized = await normalizeSavedQuery(req.body?.query);
    if (!normalized.ok) {
      return res.status(422).json({
        success: false,
        message: "Invalid search query",
        errors: normalized.errors,
      });
    }

    const [[{ n }]] = await db.execute(
      "SELECT COUNT(*) AS n FROM saved_searches WHERE user_id = ?",
      [req.user.id]
    );
    if (n >= MAX_SAVED_SEARCHES) {
      return res.status(409).json({
        success: false,
        message: `You can save at most ${MAX_SAVED_SEARCHES} searches`,
      });
    }

    const [result] = await db.execute(
      `INSERT INTO saved_searches (user_id, name, query_json, notify)
       VALUES (?, ?, ?, ?)`,
      [req.user.id, name, JSON.stringify(normalized.query), notify]
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId, name, notify: !!notify, query: normalized.query },
    });
  } catch (err) {
    console.error("[POST /saved-searches]", err);
    res.status(500).json({ success: false, message: "Failed to save search" });
  }
});

// ── list mine ──────────────────────────────────────────────────────────────
router.get("/mine", requireUserAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, name, query_json, notify, created_at
       FROM saved_searches WHERE user_id = ?
       ORDER BY created_at DESC LIMIT 100`,
      [req.user.id]
    );
    const data = rows.map((r) => {
      let q = {};
      try { q = JSON.parse(r.query_json); } catch { /* corrupt row stays empty */ }
      return { id: r.id, name: r.name, notify: !!r.notify, query: q, created_at: r.created_at };
    });
    res.json({ success: true, data });
  } catch (err) {
    console.error("[GET /saved-searches/mine]", err);
    res.status(500).json({ success: false, message: "Failed to fetch saved searches" });
  }
});

// ── toggle alerts ──────────────────────────────────────────────────────────
router.patch("/:id(\\d+)", requireUserAuth, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (req.body?.notify === undefined || typeof req.body.notify !== "boolean") {
      return res.status(400).json({ success: false, message: "notify (boolean) is required" });
    }
    const [result] = await db.execute(
      "UPDATE saved_searches SET notify = ? WHERE id = ? AND user_id = ?",
      [req.body.notify ? 1 : 0, id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Saved search not found" });
    }
    res.json({ success: true, data: { id, notify: req.body.notify } });
  } catch (err) {
    console.error("[PATCH /saved-searches/:id]", err);
    res.status(500).json({ success: false, message: "Failed to update saved search" });
  }
});

// ── delete ─────────────────────────────────────────────────────────────────
router.delete("/:id(\\d+)", requireUserAuth, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const [result] = await db.execute(
      "DELETE FROM saved_searches WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Saved search not found" });
    }
    res.json({ success: true, data: { id } });
  } catch (err) {
    console.error("[DELETE /saved-searches/:id]", err);
    res.status(500).json({ success: false, message: "Failed to delete saved search" });
  }
});

module.exports = router;
