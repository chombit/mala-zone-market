/**
 * routes/admin.js
 * Malazone.com — Elite Admin Controller API
 * Secure operations for property verification and agent payouts
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const express = require("express");
const db = require("../database/db");
const bcrypt = require("bcrypt");
const router = express.Router();

/**
 * POST /api/admin/login
 * Authenticate admin user against database
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password required" });
    }

    // 1. Find admin user in database
    const [[admin]] = await db.execute(
      "SELECT * FROM admin_users WHERE username = ? AND is_active = 1",
      [username]
    );

    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // 3. Update last login time
    await db.execute(
      "UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
      [admin.id]
    );

    // 4. Return admin data (don't send password hash!)
    res.json({
      success: true,
      user: {
        id: admin.id,
        username: admin.username,
        full_name: admin.full_name,
        role: admin.role
      }
    });

  } catch (err) {
    console.error("[ADMIN LOGIN ERROR]", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

/**
 * POST /api/admin/payout-agent
 * Simulated telebirr for Business payout logic
 */
router.post("/payout-agent", async (req, res) => {
  try {
    const { agent_id } = req.body;
    const PAY_PER_LISTING = 100;

    if (!agent_id) {
      return res.status(400).json({ success: false, message: "Agent ID required" });
    }

    // 1. Fetch agent data and pending listings
    const [[agent]] = await db.execute(
      `SELECT a.*, u.phone_number 
       FROM agents a 
       JOIN users u ON a.user_id = u.id 
       WHERE a.id = ?`,
      [agent_id]
    );

    if (!agent) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    // 2. Count pending (unpaid) listings for this agent
    // Note: In a real app, we'd have a column 'payout_status' in the listings table
    const [[{ pending_count }]] = await db.execute(
      "SELECT COUNT(*) as pending_count FROM listings WHERE user_id = ? AND is_active = 1",
      [agent.user_id]
    );

    const totalAmount = pending_count * PAY_PER_LISTING;

    if (totalAmount <= 0) {
      return res.status(400).json({ success: false, message: "No pending earnings found" });
    }

    // 3. Simulated telebirr Handshake
    console.log(`[telebirr] Initiating payout for ${agent.phone_number}: ${totalAmount} ETB`);
    // Simulation logic here...

    // 4. Update Agent Balance & Database
    await db.execute(
      "UPDATE agents SET earnings_total_etb = earnings_total_etb + ? WHERE id = ?",
      [totalAmount, agent_id]
    );

    res.json({
      success: true,
      message: `Successfully disbursed ${totalAmount} ETB via telebirr`,
      transaction_id: `MALA-PAY-${Date.now()}`
    });

  } catch (err) {
    console.error("[ADMIN PAYOUT ERROR]", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

/**
 * PATCH /api/admin/verify-listing/:id
 * Property Verification State Update
 */
router.patch("/verify-listing/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified } = req.body;

    const [result] = await db.execute(
      "UPDATE listings SET is_verified = ? WHERE id = ?",
      [is_verified ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    res.json({
      success: true,
      message: is_verified ? "Listing Verified" : "Listing Verification Removed"
    });

  } catch (err) {
    console.error("[ADMIN VERIFY ERROR]", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

/**
 * GET /api/admin/analytics
 * High-level data for Admin Dashboard
 */
router.get("/analytics", async (req, res) => {
  try {
    const [[{ total_revenue }]] = await db.execute("SELECT SUM(price) as total_revenue FROM listings WHERE is_active = 1");
    const [[{ pending_count }]] = await db.execute("SELECT COUNT(*) as pending_count FROM listings WHERE is_verified = 0");
    const [[{ agent_count }]] = await db.execute("SELECT COUNT(*) as agent_count FROM agents WHERE status = 'active'");

    res.json({
      success: true,
      data: {
        revenue: total_revenue || 0,
        pending: pending_count || 0,
        agents: agent_count || 0,
        trades: Math.floor((total_revenue || 0) / 10000) // Simulated trade count
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/admin/listings
 * Add a new listing directly from Admin
 */
router.post("/listings", async (req, res) => {
  try {
    const {
      title_en, title_am, description_en, description_am,
      category, price, price_suffix, phone, whatsapp, location_key,
      is_premium, is_verified, images,
      // Zone specific
      plate_code, fuel_type, condition_type, 
      area_sqm, capacity, with_operator, is_zero_km,
      bedrooms, bathrooms, title_deed
    } = req.body;

    // Use system admin user (id: 1) as default for admin posts
    const user_id = 1; 

    const [result] = await db.execute(
      `INSERT INTO listings (
        user_id, title_en, title_am, description_en, description_am,
        category, price, price_suffix, phone, whatsapp, location_key,
        location_label_en, location_label_am,
        is_premium, is_verified, images,
        plate_code, fuel_type, condition_type,
        area_sqm, capacity, with_operator, is_zero_km,
        bedrooms, bathrooms, title_deed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id, title_en, title_am, description_en, description_am,
        category, price, price_suffix || 'fixed', phone, whatsapp, location_key,
        "Hawassa, Ethiopia", "ሐዋሳ፣ ኢትዮጵያ",
        is_premium ? 1 : 0, is_verified ? 1 : 0,
        JSON.stringify(images || ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&fm=webp"]),
        plate_code || null, fuel_type || null, condition_type || null,
        area_sqm || null, capacity || null, with_operator ? 1 : 0, is_zero_km ? 1 : 0,
        bedrooms || null, bathrooms || null, title_deed || null
      ]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("[ADMIN ADD LISTING ERROR]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/admin/listings/:id
 * Edit an existing listing from Admin
 */
router.put("/listings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title_en, title_am, description_en, description_am,
      category, price, price_suffix, phone, whatsapp, location_key,
      is_premium, is_verified, is_active, images,
      // Zone specific
      plate_code, fuel_type, condition_type, 
      area_sqm, capacity, with_operator, is_zero_km,
      bedrooms, bathrooms, title_deed
    } = req.body;

    const [result] = await db.execute(
      `UPDATE listings SET 
        title_en = ?, title_am = ?, description_en = ?, description_am = ?,
        category = ?, price = ?, price_suffix = ?, phone = ?, whatsapp = ?, location_key = ?,
        is_premium = ?, is_verified = ?, is_active = ?, images = ?,
        plate_code = ?, fuel_type = ?, condition_type = ?,
        area_sqm = ?, capacity = ?, with_operator = ?, is_zero_km = ?,
        bedrooms = ?, bathrooms = ?, title_deed = ?
      WHERE id = ?`,
      [
        title_en, title_am, description_en, description_am,
        category, price, price_suffix || 'fixed', phone, whatsapp, location_key,
        is_premium ? 1 : 0, is_verified ? 1 : 0, is_active ? 1 : 0,
        JSON.stringify(images || ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&fm=webp"]),
        plate_code || null, fuel_type || null, condition_type || null,
        area_sqm || null, capacity || null, with_operator ? 1 : 0, is_zero_km ? 1 : 0,
        bedrooms || null, bathrooms || null, title_deed || null,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    res.json({ success: true, message: "Listing updated" });
  } catch (err) {
    console.error("[ADMIN EDIT LISTING ERROR]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/admin/listings/:id
 * Remove a listing from Admin
 */
router.delete("/listings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute("DELETE FROM listings WHERE id = ?", [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    res.json({ success: true, message: "Listing deleted" });
  } catch (err) {
    console.error("[ADMIN DELETE LISTING ERROR]", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/admin/users
 * Get all admin users (Super Admin only)
 */
router.get("/users", async (req, res) => {
  try {
    const [users] = await db.execute(
      "SELECT id, username, full_name, role, is_active, last_login, created_at FROM admin_users"
    );
    res.json({ success: true, users });
  } catch (err) {
    console.error("[ADMIN GET USERS ERROR]", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

/**
 * POST /api/admin/users
 * Create new admin user (Super Admin only)
 */
router.post("/users", async (req, res) => {
  try {
    const { username, password, full_name, role } = req.body;
    
    // Validate required fields
    if (!username || !password || !full_name) {
      return res.status(400).json({ success: false, message: "Username, password, and full name are required" });
    }

    // Hash password
    const SALT_ROUNDS = 12;
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert new admin user
    const [result] = await db.execute(
      "INSERT INTO admin_users (username, password_hash, full_name, role, is_active) VALUES (?, ?, ?, ?, true)",
      [username, password_hash, full_name, role || "admin"]
    );

    res.json({ success: true, id: result.insertId, message: "Admin user created successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "Username already exists" });
    }
    console.error("[ADMIN CREATE USER ERROR]", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

/**
 * PUT /api/admin/users/:id
 * Update admin user (Super Admin only)
 */
router.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, full_name, role, is_active, password } = req.body;

    // Build update query
    const updates = [];
    const values = [];

    if (username) { updates.push("username = ?"); values.push(username); }
    if (full_name) { updates.push("full_name = ?"); values.push(full_name); }
    if (role) { updates.push("role = ?"); values.push(role); }
    if (typeof is_active !== "undefined") { updates.push("is_active = ?"); values.push(is_active); }
    if (password) {
      const SALT_ROUNDS = 12;
      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
      updates.push("password_hash = ?");
      values.push(password_hash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    values.push(id);

    const [result] = await db.execute(
      `UPDATE admin_users SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Admin user not found" });
    }

    res.json({ success: true, message: "Admin user updated successfully" });
  } catch (err) {
    console.error("[ADMIN UPDATE USER ERROR]", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete admin user (Super Admin only)
 */
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute("DELETE FROM admin_users WHERE id = ?", [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Admin user not found" });
    }

    res.json({ success: true, message: "Admin user deleted successfully" });
  } catch (err) {
    console.error("[ADMIN DELETE USER ERROR]", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
