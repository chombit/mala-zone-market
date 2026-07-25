/**
 * routes/agents.js
 * Malazone.com — Mala-Agents Gig Economy Router
 * Agent registration, listing submissions, earnings tracking
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const db = require("../database/db");
const { requireAdminAuth, requireAdminRoles } = require("../middleware/adminAuth");
const { requireAgentAuth, issueAgentToken, setAgentAuthCookie, clearAgentAuthCookie } = require("../middleware/agentAuth");

const router = express.Router();

// ── Image Upload Pipeline (same as listings.js)
const UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 4 },
});

async function processImage(buffer) {
  const filename = `mala_${uuidv4()}.webp`;
  const outputPath = path.join(UPLOAD_DIR, filename);
  await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true, fit: "inside" })
    .webp({ quality: 80, effort: 6 })
    .toFile(outputPath);
  return `/uploads/${filename}`;
}

// ─────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────
const ETH_PHONE_REGEX = /^(\+2519|09)\d{8}$/;

function validateAgentRegistration(body) {
  const errors = [];

  if (!body.full_name || body.full_name.trim().length < 3) {
    errors.push("full_name: Must be at least 3 characters");
  }
  if (!body.phone || !ETH_PHONE_REGEX.test(body.phone.replace(/\s/g, ""))) {
    errors.push("phone: Must be a valid Ethiopian phone number");
  }
  if (!body.sub_city) {
    errors.push("sub_city: Required (e.g. Tabor Sub-City, Lakefront)");
  }

  return errors;
}

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────

/**
 * POST /api/agents/register
 * Register a new agent (youth in Hawassa for gig economy)
 */
router.post("/register", async (req, res) => {
  try {
    const { full_name, phone, sub_city } = req.body;

    // Validate
    const errors = validateAgentRegistration(req.body);
    if (errors.length > 0) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        message_am: "ቅጾ ትክክል አይደለም",
        errors,
      });
    }

    const cleanPhone = phone.replace(/\s/g, "");

    // 1. Get or Create User
    let userId;
    const [[user]] = await db.execute("SELECT id FROM users WHERE phone_number = ?", [cleanPhone]);
    if (user) {
      userId = user.id;
    } else {
      const [ins] = await db.execute(
        "INSERT INTO users (full_name, phone_number, account_type) VALUES (?, ?, 'Agent')",
        [full_name.trim(), cleanPhone]
      );
      userId = ins.insertId;
    }

    // 2. Check if agent already exists for this user
    const [[existing]] = await db.execute(
      "SELECT id FROM agents WHERE user_id = ?",
      [userId]
    );
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Agent already registered with this phone number",
        message_am: "ይህ ስልክ ቁጥር ቀድሞ ተመዝግቧል",
      });
    }

    // 3. Insert agent record
    const [result] = await db.execute(
      `INSERT INTO agents (user_id, sub_city, status, earnings_total_etb)
       VALUES (?, ?, 'active', 0)`,
      [userId, sub_city]
    );

    // Successful registration
    res.status(201).json({
      success: true,
      message: "Agent registered successfully. You can start listing properties!",
      message_am: "በተሳካ ሁኔታ ተመዝግበዋል! አሁን ንብረቶች ማስገባት ይችላሉ።",
      data: {
        agent_id: result.insertId,
        user_id: userId,
        phone_number: cleanPhone,
        sub_city,
        status: "active",
      },
    });
  } catch (err) {
    console.error("[POST /agents/register]", err);
    res.status(500).json({
      success: false,
      message: "Failed to register agent",
      message_am: "ምዝገባ አልተሳካም",
    });
  }
});

/**
 * GET /api/agents/:phone
 * Get agent profile and earnings summary
 */
router.get("/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    const cleanPhone = phone.replace(/\s/g, "");

    // Join agents table with users table to get agent info with phone number
    const [[agent]] = await db.execute(
      `SELECT a.id, a.user_id, a.sub_city, a.earnings_total_etb, a.status,
              u.full_name, u.phone_number
       FROM agents a
       JOIN users u ON a.user_id = u.id
       WHERE u.phone_number = ?`,
      [cleanPhone]
    );

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
        message_am: "ወኪሉ አልተገኘም",
      });
    }

    // Fetch agent's recent listings
    const [listings] = await db.execute(
      `SELECT id, title_en, title_am, category, price, price_suffix, is_active, created_at, view_count
       FROM listings
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 10`,
      [agent.user_id]
    );

    // Calculate stats
    const activeListings = listings.filter((l) => l.is_active).length;
    const totalViews = listings.reduce((sum, l) => sum + (l.view_count || 0), 0);

    res.json({
      success: true,
      data: {
        id: agent.id,
        user_id: agent.user_id,
        full_name: agent.full_name,
        phone_number: agent.phone_number,
        sub_city: agent.sub_city,
        status: agent.status,
        earnings_total_etb: agent.earnings_total_etb,
        recent_listings: listings,
        stats: {
          total_listings: listings.length,
          active_listings: activeListings,
          total_views: totalViews,
        },
      },
    });
  } catch (err) {
    console.error("[GET /agents/:phone]", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch agent profile",
    });
  }
});

/**
 * POST /api/agents/earnings
 * Record earnings transaction for an agent
 * (Called internally when a listing is sold/rented)
 */
router.post("/earnings/record", async (req, res) => {
  try {
    const { phone, amount_etb, listing_id, transaction_type } = req.body;

    if (!phone || !amount_etb || !listing_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const cleanPhone = phone.replace(/\s/g, "");

    // Verify agent exists
    const [[agent]] = await db.execute(
      `SELECT a.id FROM agents a
       JOIN users u ON a.user_id = u.id
       WHERE u.phone_number = ?`,
      [cleanPhone]
    );
    if (!agent) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    // Insert earnings record
    await db.execute(
      `INSERT INTO agent_earnings (agent_id, listing_id, amount_etb, transaction_type, status)
       VALUES (?, ?, ?, ?, 'pending_approval')`,
      [agent.id, listing_id, Number(amount_etb), transaction_type || "listing_sale"]
    );

    // Update agent total (will be confirmed after TeleBirr verification)
    await db.execute(
      "UPDATE agents SET earnings_total_etb = earnings_total_etb + ? WHERE id = ?",
      [Number(amount_etb), agent.id]
    );

    res.json({
      success: true,
      message: "Earnings recorded. Payment pending TeleBirr verification.",
      message_am: "ገቢ ተመዝግቧል። ክፍያ ቴሌብር በታወቁ ነው።",
    });
  } catch (err) {
    console.error("[POST /agents/earnings/record]", err);
    res.status(500).json({
      success: false,
      message: "Failed to record earnings",
    });
  }
});

/**
 * GET /api/agents/leaderboard
 * Top agents by earnings (for gamification)
 */
router.get("/leaderboard/top", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const [agents] = await db.execute(
      `SELECT a.id, a.user_id, u.full_name, u.phone_number, a.sub_city, a.earnings_total_etb, a.status
       FROM agents a
       JOIN users u ON a.user_id = u.id
       WHERE a.status = 'active'
       ORDER BY a.earnings_total_etb DESC
       LIMIT ?`,
      [limit]
    );

    res.json({
      success: true,
      data: agents.map((agent, index) => ({
        rank: index + 1,
        ...agent,
      })),
    });
  } catch (err) {
    console.error("[GET /agents/leaderboard/top]", err);
    res.status(500).json({ success: false, message: "Failed to fetch leaderboard" });
  }
});

/**
 * GET /api/agents/stats
 * Overall Mala-Agents program statistics
 */
router.get("/stats/program", async (req, res) => {
  try {
    const [[stats]] = await db.execute(
      `SELECT
        COUNT(DISTINCT id) AS total_agents,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_agents,
        COALESCE(SUM(earnings_total_etb), 0) AS total_earnings_distributed
       FROM agents`
    );

    const [[listingStats]] = await db.execute(
      `SELECT
        COUNT(DISTINCT user_id) AS agents_with_listings,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) AS active_listings,
        COUNT(*) AS total_listings_posted
       FROM listings
       WHERE user_id IN (
         SELECT DISTINCT u.id FROM users u
         JOIN agents a ON a.user_id = u.id
       )`
    );

    res.json({
      success: true,
      data: {
        agents: {
          total_registered: stats.total_agents || 0,
          active: stats.active_agents || 0,
        },
        listings: {
          agents_with_listings: listingStats.agents_with_listings || 0,
          active_listings: listingStats.active_listings || 0,
          total_posted: listingStats.total_listings_posted || 0,
        },
        earnings: {
          total_distributed_etb: stats.total_earnings_distributed || 0,
          average_per_agent:
            stats.total_agents > 0
              ? Math.round(stats.total_earnings_distributed / stats.total_agents)
              : 0,
        },
      },
    });
  } catch (err) {
    console.error("[GET /agents/stats/program]", err);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
});

/**
 * POST /api/agents/status
 * Update agent status (admin only)
 */
router.post("/status", requireAdminAuth, requireAdminRoles("super_admin", "admin"), async (req, res) => {
  try {
    const { agent_id, status } = req.body;

    if (!agent_id || !status) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: agent_id, status"
      });
    }

    if (!['pending', 'active', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be: pending, active, or suspended"
      });
    }

    await db.execute(
      "UPDATE agents SET status = ? WHERE id = ?",
      [status, agent_id]
    );

    res.json({
      success: true,
      message: "Agent status updated successfully"
    });
  } catch (err) {
    console.error("[POST /agents/status]", err);
    res.status(500).json({ success: false, message: "Failed to update agent status" });
  }
});

/**
 * POST /api/agents/listings
 * Create a new listing as an agent
 */
router.post("/listings", upload.array("images", 4), async (req, res) => {
  try {
    const { phone, title_en, title_am, category, price, price_suffix, location_key, description_en, description_am, whatsapp, is_premium, is_verified } = req.body;

    if (!phone || !title_en || !title_am || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: phone, title_en, title_am, category",
      });
    }

    const cleanPhone = phone.replace(/\s/g, "");

    const [[agent]] = await db.execute(
      `SELECT a.id, a.user_id FROM agents a
       JOIN users u ON a.user_id = u.id
       WHERE u.phone_number = ? AND a.status = 'active'`,
      [cleanPhone]
    );

    if (!agent) {
      return res.status(404).json({ success: false, message: "Agent not found or inactive" });
    }

    const contactPhone = cleanPhone;
    const imageFiles = req.files || [];
    const imageUrls = await Promise.all(imageFiles.map(f => processImage(f.buffer)));
    const locationLabels = {
      hawassa_piassa: { en: "Piassa, Hawassa", am: "ፒያሳ፣ ሀዋሳ" },
      hawassa_tabor: { en: "Tabor, Hawassa", am: "ታቦር፣ ሀዋሳ" },
      hawassa_lakefront: { en: "Lakefront, Hawassa", am: "የሐይቅ ጫፍ፣ ሀዋሳ" },
      yirgalem: { en: "Yirgalem", am: "ይርጋለም" },
      bensa: { en: "Bensa", am: "በንሳ" },
      chuko: { en: "Chuko", am: "ጭகቆ" },
      aleta_wondo: { en: "Aleta Wondo", am: "አለታ ወንዶ" },
    };
    const loc = locationLabels[location_key] || { en: "Hawassa", am: "ሀዋሳ" };

    const [result] = await db.execute(
      `INSERT INTO listings (
        user_id, title_en, title_am, category, price, price_suffix,
        location_key, location_label_am, location_label_en,
        phone, whatsapp, images, is_active, is_premium, is_verified,
        description_en, description_am, view_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, 0)`,
      [
        agent.user_id, title_en, title_am, category,
        Number(price) || 0, price_suffix || "fixed",
        location_key || "hawassa_piassa", loc.am, loc.en,
        contactPhone, whatsapp || contactPhone,
        JSON.stringify(imageUrls),
        is_premium === "true" || is_premium === 1 ? 1 : 0,
        is_verified === "true" || is_verified === 1 ? 1 : 0,
        description_en || null, description_am || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Listing created successfully",
      data: { id: result.insertId },
    });
  } catch (err) {
    console.error("[POST /agents/listings]", err);
    res.status(500).json({ success: false, message: "Failed to create listing" });
  }
});

// ─────────────────────────────────────────────
// AGENT AUTH ENDPOINTS
// ─────────────────────────────────────────────

/**
 * POST /api/agents/login
 * Agent login with phone + password (cookie-based session)
 */
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    const cleanPhone = phone.replace(/\s/g, "");

    // Look up agent by phone number
    const [rows] = await db.execute(
      `SELECT a.id, a.user_id, a.sub_city, a.status, a.earnings_total_etb, a.created_at,
              u.full_name, u.phone_number
       FROM agents a
       JOIN users u ON a.user_id = u.id
       WHERE u.phone_number = ?
       LIMIT 1`,
      [cleanPhone]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Agent not found" });
    }

    const agent = rows[0];

    // Check agent status
    if (agent.status === "suspended") {
      return res.status(403).json({ success: false, message: "Account suspended. Contact support." });
    }

    if (agent.status !== "active") {
      return res.status(403).json({ success: false, message: "Account pending activation. Please wait for coordinator approval." });
    }

    // Issue JWT token and set cookie
    const token = issueAgentToken({
      agent_id: agent.id,
      user_id: agent.user_id,
      phone_number: agent.phone_number,
    });

    setAgentAuthCookie(res, token);

    res.json({
      success: true,
      data: {
        id: agent.id,
        user_id: agent.user_id,
        full_name: agent.full_name,
        phone_number: agent.phone_number,
        sub_city: agent.sub_city,
        status: agent.status,
        earnings_total_etb: agent.earnings_total_etb,
        created_at: agent.created_at,
      },
    });
  } catch (err) {
    console.error("[POST /agents/login]", err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

/**
 * POST /api/agents/logout
 * Clear agent session cookie
 */
router.post("/logout", (req, res) => {
  clearAgentAuthCookie(res);
  res.json({ success: true, message: "Logged out" });
});

/**
 * GET /api/agents/me
 * Get authenticated agent's profile (cookie-based)
 */
router.get("/me", requireAgentAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT a.id, a.user_id, a.sub_city, a.status, a.earnings_total_etb, a.created_at,
              u.full_name, u.phone_number
       FROM agents a
       JOIN users u ON a.user_id = u.id
       WHERE a.id = ?
       LIMIT 1`,
      [req.agent.agent_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    const agent = rows[0];

    // Fetch recent listings for stats
    const [listings] = await db.execute(
      `SELECT id, title_en, title_am, category, price, price_suffix, is_active, created_at, view_count
       FROM listings
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 10`,
      [agent.user_id]
    );

    const activeListings = listings.filter((l) => l.is_active).length;
    const totalViews = listings.reduce((sum, l) => sum + (l.view_count || 0), 0);

    res.json({
      success: true,
      data: {
        id: agent.id,
        user_id: agent.user_id,
        full_name: agent.full_name,
        phone_number: agent.phone_number,
        sub_city: agent.sub_city,
        status: agent.status,
        earnings_total_etb: agent.earnings_total_etb,
        created_at: agent.created_at,
        recent_listings: listings,
        stats: {
          total_listings: listings.length,
          active_listings: activeListings,
          total_views: totalViews,
        },
      },
    });
  } catch (err) {
    console.error("[GET /agents/me]", err);
    res.status(500).json({ success: false, message: "Failed to fetch agent profile" });
  }
});

/**
 * GET /api/agents/me/listings
 * Get authenticated agent's own listings (cookie-based)
 */
router.get("/me/listings", requireAgentAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, title_en, title_am, category, price, price_suffix, is_active, view_count, created_at
       FROM listings
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.agent.user_id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("[GET /agents/me/listings]", err);
    res.status(500).json({ success: false, message: "Failed to fetch listings" });
  }
});

/**
 * GET /api/agents/listings/:id
 * Get a single listing for edit form (ownership required)
 */
router.get("/listings/:id", requireAgentAuth, async (req, res) => {
  try {
    const [[listing]] = await db.execute(
      `SELECT id, title_en, title_am, category, price, price_suffix,
              location_key, description_en, description_am, whatsapp, images, is_active
       FROM listings
       WHERE id = ? AND user_id = ?`,
      [req.params.id, req.agent.user_id]
    );

    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found or access denied" });
    }

    if (listing.images && typeof listing.images === "string") {
      listing.images = JSON.parse(listing.images);
    }

    res.json({ success: true, data: listing });
  } catch (err) {
    console.error("[GET /agents/listings/:id]", err);
    res.status(500).json({ success: false, message: "Failed to fetch listing" });
  }
});

/**
 * PUT /api/agents/listings/:id
 * Update a listing (ownership required, optional new images)
 */
router.put("/listings/:id", requireAgentAuth, upload.array("images", 4), async (req, res) => {
  try {
    const listingId = req.params.id;

    // Verify ownership
    const [[existing]] = await db.execute(
      "SELECT id, images FROM listings WHERE id = ? AND user_id = ?",
      [listingId, req.agent.user_id]
    );

    if (!existing) {
      return res.status(404).json({ success: false, message: "Listing not found or access denied" });
    }

    const { title_en, title_am, category, price, price_suffix, location_key, description_en, description_am, whatsapp, existing_images } = req.body;

    // Process new images if uploaded
    const newImageFiles = req.files || [];
    const newImageUrls = await Promise.all(newImageFiles.map(f => processImage(f.buffer)));

    // Merge with existing images (sent as JSON string from frontend)
    let finalImages;
    try {
      const kept = existing_images ? JSON.parse(existing_images) : JSON.parse(existing.images || "[]");
      finalImages = [...kept, ...newImageUrls].slice(0, 4);
    } catch {
      finalImages = newImageUrls.length > 0 ? newImageUrls.slice(0, 4) : JSON.parse(existing.images || "[]");
    }

    const locationLabels = {
      hawassa_piassa: { en: "Piassa, Hawassa", am: "ፒያሳ፣ ሀዋሳ" },
      hawassa_tabor: { en: "Tabor, Hawassa", am: "ታቦር፣ ሀዋሳ" },
      hawassa_lakefront: { en: "Lakefront, Hawassa", am: "የሐይቅ ጫፍ፣ ሀዋሳ" },
      yirgalem: { en: "Yirgalem", am: "ይርጋለም" },
      bensa: { en: "Bensa", am: "በንሳ" },
      chuko: { en: "Chuko", am: "ጭকቆ" },
      aleta_wondo: { en: "Aleta Wondo", am: "አለታ ወንዶ" },
    };
    const loc = locationLabels[location_key] || { en: "Hawassa", am: "ሀዋሳ" };

    await db.execute(
      `UPDATE listings SET
        title_en = COALESCE(?, title_en),
        title_am = COALESCE(?, title_am),
        category = COALESCE(?, category),
        price = COALESCE(?, price),
        price_suffix = COALESCE(?, price_suffix),
        location_key = COALESCE(?, location_key),
        location_label_en = ?,
        location_label_am = ?,
        description_en = ?,
        description_am = ?,
        whatsapp = COALESCE(?, whatsapp),
        images = ?
       WHERE id = ? AND user_id = ?`,
      [
        title_en || null, title_am || null, category || null,
        price ? Number(price) : null, price_suffix || null,
        location_key || null, loc.en, loc.am,
        description_en || null, description_am || null,
        whatsapp || null,
        JSON.stringify(finalImages),
        listingId, req.agent.user_id,
      ]
    );

    res.json({ success: true, message: "Listing updated successfully" });
  } catch (err) {
    console.error("[PUT /agents/listings/:id]", err);
    res.status(500).json({ success: false, message: "Failed to update listing" });
  }
});

/**
 * DELETE /api/agents/listings/:id
 * Soft-delete a listing (ownership required)
 */
router.delete("/listings/:id", requireAgentAuth, async (req, res) => {
  try {
    const listingId = req.params.id;

    const [[existing]] = await db.execute(
      "SELECT id FROM listings WHERE id = ? AND user_id = ?",
      [listingId, req.agent.user_id]
    );

    if (!existing) {
      return res.status(404).json({ success: false, message: "Listing not found or access denied" });
    }

    await db.execute("UPDATE listings SET is_active = 0 WHERE id = ?", [listingId]);

    res.json({ success: true, message: "Listing deleted successfully" });
  } catch (err) {
    console.error("[DELETE /agents/listings/:id]", err);
    res.status(500).json({ success: false, message: "Failed to delete listing" });
  }
});

/**
 * PUT /api/agents/me/profile
 * Update authenticated agent's profile (name, sub_city)
 */
router.put("/me/profile", requireAgentAuth, async (req, res) => {
  try {
    const { full_name, sub_city } = req.body;

    if (!full_name || full_name.trim().length < 3) {
      return res.status(422).json({ success: false, message: "full_name must be at least 3 characters" });
    }

    if (!sub_city || sub_city.trim().length === 0) {
      return res.status(422).json({ success: false, message: "sub_city is required" });
    }

    // Update user name
    await db.execute("UPDATE users SET full_name = ? WHERE id = ?", [full_name.trim(), req.agent.user_id]);

    // Update agent sub_city
    await db.execute("UPDATE agents SET sub_city = ? WHERE id = ?", [sub_city.trim(), req.agent.agent_id]);

    // Return updated profile
    const [[agent]] = await db.execute(
      `SELECT a.id, a.user_id, a.sub_city, a.status, a.earnings_total_etb, a.created_at,
              u.full_name, u.phone_number
       FROM agents a
       JOIN users u ON a.user_id = u.id
       WHERE a.id = ?`,
      [req.agent.agent_id]
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: agent,
    });
  } catch (err) {
    console.error("[PUT /agents/me/profile]", err);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
});

/**
 * GET /api/agents/me/earnings
 * Get authenticated agent's earnings history with summary
 */
router.get("/me/earnings", requireAgentAuth, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    // Fetch earnings with listing context
    const [earnings] = await db.execute(
      `SELECT ae.id, ae.amount_etb, ae.transaction_type, ae.status, ae.created_at,
              l.title_en, l.title_am, l.category
       FROM agent_earnings ae
       JOIN listings l ON ae.listing_id = l.id
       WHERE ae.agent_id = ?
       ORDER BY ae.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.agent.agent_id, limit, offset]
    );

    // Get total count for pagination
    const [[{ total }]] = await db.execute(
      "SELECT COUNT(*) AS total FROM agent_earnings WHERE agent_id = ?",
      [req.agent.agent_id]
    );

    // Summary stats
    const [[summary]] = await db.execute(
      `SELECT
        COALESCE(SUM(amount_etb), 0) AS total_earned,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount_etb ELSE 0 END), 0) AS total_paid,
        COALESCE(SUM(CASE WHEN status = 'pending_approval' THEN amount_etb ELSE 0 END), 0) AS total_pending
       FROM agent_earnings
       WHERE agent_id = ?`,
      [req.agent.agent_id]
    );

    res.json({
      success: true,
      data: earnings,
      summary: {
        total_earned: Number(summary.total_earned),
        total_paid: Number(summary.total_paid),
        total_pending: Number(summary.total_pending),
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("[GET /agents/me/earnings]", err);
    res.status(500).json({ success: false, message: "Failed to fetch earnings" });
  }
});

// ─────────────────────────────────────────────
// PAYOUT REQUESTS
// ─────────────────────────────────────────────

/**
 * POST /api/agents/payout/request
 * Agent requests payout of earned commission via TeleBirr
 */
router.post("/payout/request", requireAgentAuth, async (req, res) => {
  try {
    const { amount_etb, telebirr_phone } = req.body;

    if (!amount_etb || !telebirr_phone) {
      return res.status(400).json({ success: false, message: "amount_etb and telebirr_phone are required" });
    }

    const amount = Number(amount_etb);
    if (amount <= 0) {
      return res.status(422).json({ success: false, message: "Amount must be greater than 0" });
    }

    // Check agent has sufficient balance
    const [[agent]] = await db.execute(
      "SELECT earnings_total_etb FROM agents WHERE id = ?",
      [req.agent.agent_id]
    );

    if (!agent || Number(agent.earnings_total_etb) < amount) {
      return res.status(422).json({
        success: false,
        message: `Insufficient balance. Available: ${agent ? Number(agent.earnings_total_etb).toLocaleString() : 0} ETB`,
      });
    }

    // Deduct from agent balance and create payout request
    await db.execute(
      "UPDATE agents SET earnings_total_etb = earnings_total_etb - ? WHERE id = ?",
      [amount, req.agent.agent_id]
    );

    const [result] = await db.execute(
      `INSERT INTO agent_payout_requests (agent_id, amount_etb, telebirr_phone, status)
       VALUES (?, ?, ?, 'pending')`,
      [req.agent.agent_id, amount, telebirr_phone]
    );

    res.status(201).json({
      success: true,
      message: "Payout request submitted. Processing within 48 hours.",
      data: { id: result.insertId, amount_etb: amount, status: 'pending' },
    });
  } catch (err) {
    console.error("[POST /agents/payout/request]", err);
    res.status(500).json({ success: false, message: "Failed to submit payout request" });
  }
});

/**
 * GET /api/agents/payout/history
 * Agent views their payout request history
 */
router.get("/payout/history", requireAgentAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, amount_etb, telebirr_phone, status, admin_note, created_at, processed_at
       FROM agent_payout_requests
       WHERE agent_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.agent.agent_id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("[GET /agents/payout/history]", err);
    res.status(500).json({ success: false, message: "Failed to fetch payout history" });
  }
});

module.exports = router;
