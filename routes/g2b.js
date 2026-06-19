/**
 * routes/g2b.js
 * Malazone.com — G2B Compliance Portal API
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const express = require("express");
const db = require("../database/db");

const router = express.Router();

// 1. Get pending audits
router.get("/pending", async (req, res) => {
  try {
    const { audit_type } = req.query; // 'land' or 'vehicle'
    
    let sql = `
      SELECT l.id, l.title, l.price, l.category, l.location_label_am, l.location_label_en, 
             l.location_key, l.images, l.plate_code, l.fuel_type, u.full_name as seller_name, l.created_at,
             l.cata_registry, l.chassis_number, l.engine_number, l.legal_document_url
      FROM listings l 
      JOIN users u ON l.user_id = u.id 
      WHERE l.is_active = 1 AND l.is_verified = 0
    `;
    const params = [];

    if (audit_type === 'land') {
      sql += " AND l.category = 'property'";
    } else if (audit_type === 'vehicle') {
      sql += " AND l.category = 'motors'";
    } else {
      sql += " AND l.category IN ('property', 'motors')";
    }
    
    sql += " ORDER BY l.created_at ASC";

    const [rows] = await db.execute(sql, params);

    // parse images JSON
    const processedRows = rows.map(r => ({
      ...r,
      images: r.images ? (typeof r.images === 'string' ? JSON.parse(r.images) : r.images) : []
    }));

    res.json({ success: true, data: processedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Submit audit decision
router.post("/audit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { officer_name, audit_type, status, notes } = req.body;

    if (!officer_name || !audit_type || !status) {
      return res.status(400).json({ success: false, message: "Missing required audit fields." });
    }

    // insert into g2b_audits
    await db.execute(
      `INSERT INTO g2b_audits (listing_id, officer_name, audit_type, status, notes) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, officer_name, audit_type, status, notes || ""]
    );

    // update listing status based on decision
    if (status === 'verified') {
      await db.execute(`UPDATE listings SET is_verified = 1 WHERE id = ?`, [id]);
    } else if (status === 'fraudulent') {
      // Soft-delete listing if flagged as fraudulent
      await db.execute(`UPDATE listings SET is_active = 0 WHERE id = ?`, [id]);
    }

    res.json({ success: true, message: `Audit recorded successfully for listing ${id}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Audit submission failed" });
  }
});

module.exports = router;
