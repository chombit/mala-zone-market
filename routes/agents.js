/**
 * routes/agents.js
 * Malazone.com — Mala-Agents Gig Economy Router
 * Agent registration, listing submissions, earnings tracking
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const express = require("express");
const multer = require("multer");
const bcrypt = require("bcrypt");
const db = require("../database/db");
const { requireAdminAuth, requireAdminRoles } = require("../middleware/adminAuth");
const { requireAgentAuth, issueAgentToken, setAgentAuthCookie, clearAgentAuthCookie } = require("../middleware/agentAuth");
const { broadcastListingChange } = require("../utils/listingRealtime");
const { processImage } = require("../utils/imageProcessor");

const router = express.Router();

// ── Multer Config (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 4 },
});

// ─────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────
const ETH_PHONE_REGEX = /^(\+2519|09)\d{8}$/;
const PRICE_SUFFIXES = new Set(["fixed", "per_day", "per_month", "per_hour"]);

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
  if (!body.password || String(body.password).length < 8) {
    errors.push("password: Must be at least 8 characters");
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
    const { full_name, phone, sub_city, password } = req.body;

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
    const passwordHash = await bcrypt.hash(String(password), 12);

    // 1. Get or Create User
    let userId;
    const [[user]] = await db.execute(
      "SELECT id, password_hash FROM users WHERE phone_number = ?",
      [cleanPhone]
    );
    if (user) {
      // Existing account: only claimable if it has no password yet.
      if (user.password_hash) {
        return res.status(409).json({
          success: false,
          message: "An account with this phone number already exists. Please log in instead.",
          message_am: "በዚህ ስልክ ቁጥር መለያ አለ። እባክዎ ይግቡ።",
        });
      }
      userId = user.id;
      await db.execute(
        "UPDATE users SET password_hash = ?, account_type = 'Agent' WHERE id = ?",
        [passwordHash, userId]
      );
    } else {
      const [ins] = await db.execute(
        "INSERT INTO users (full_name, phone_number, account_type, password_hash) VALUES (?, ?, 'Agent', ?)",
        [full_name.trim(), cleanPhone, passwordHash]
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

    // 3. Insert agent record — pending until a coordinator approves
    // (POST /api/agents/status, admin-only; see F7 lifecycle)
    const [result] = await db.execute(
      `INSERT INTO agents (user_id, sub_city, status, earnings_total_etb)
       VALUES (?, ?, 'pending', 0)`,
      [userId, sub_city]
    );

    // Successful registration
    res.status(201).json({
      success: true,
      message: "Agent registered successfully. Your application is pending coordinator approval.",
      message_am: "በተሳካ ሁኔታ ተመዝግበዋል! ማመልከቻዎ በአስተባባሪ ውሳኔ ላይ ነው።",
      data: {
        agent_id: result.insertId,
        user_id: userId,
        phone_number: cleanPhone,
        sub_city,
        status: "pending",
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
 * GET /api/agents/all
 * Admin-only: returns EVERY agent regardless of status (pending, active,
 * suspended) so coordinators can review and approve new applications.
 * NOTE: must be declared BEFORE the /:phone route or "all" would be
 * swallowed as a phone number.
 */
router.get("/all", requireAdminAuth, requireAdminRoles("super_admin", "admin"), async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 200, 500);
    const [agents] = await db.execute(
      `SELECT a.id, a.user_id, u.full_name, u.phone_number, a.sub_city,
              a.status, a.earnings_total_etb, a.created_at
       FROM agents a
       JOIN users u ON a.user_id = u.id
       ORDER BY a.id DESC
       LIMIT ?`,
      [limit]
    );
    res.json({ success: true, data: agents });
  } catch (err) {
    console.error("[GET /agents/all]", err);
    res.status(500).json({ success: false, message: "Failed to fetch agents" });
  }
});

/**
 * GET /api/agents/:phone
 * Get agent profile and earnings summary
 */
router.get("/:phone", async (req, res, next) => {
  try {
    const { phone } = req.params;
    const cleanPhone = phone.replace(/\s/g, "");

    // Reserve non-phone path segments (e.g. /me, /leaderboard) for later-defined routes
    if (!ETH_PHONE_REGEX.test(cleanPhone)) {
      return next("route");
    }

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
/**
 * POST /api/agents/earnings/record
 * Record an earnings transaction for the AUTHENTICATED agent.
 * Identity comes from the session cookie; amounts are capped and typed.
 */
const EARNING_TYPES = new Set(["listing_sale", "listing_rental", "service_fee"]);
const MAX_EARNING_ETB = 50_000;

router.post("/earnings/record", requireAgentAuth, async (req, res) => {
  try {
    const amount = Number(req.body.amount_etb);
    const listingIdRaw = Number(req.body.listing_id);
    const transactionType = EARNING_TYPES.has(req.body.transaction_type)
      ? req.body.transaction_type
      : "listing_sale";

    if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(listingIdRaw) || listingIdRaw <= 0) {
      return res.status(400).json({
        success: false,
        message: "amount_etb and listing_id must be positive values",
      });
    }

    if (amount > MAX_EARNING_ETB) {
      return res.status(400).json({
        success: false,
        message: `Amount exceeds the maximum of ${MAX_EARNING_ETB} ETB per record`,
      });
    }

    // Agent identity is bound to the session — verify it is still active
    const [[agent]] = await db.execute(
      "SELECT id FROM agents WHERE id = ? AND status = 'active'",
      [req.agent.agent_id]
    );
    if (!agent) {
      return res.status(403).json({ success: false, message: "Agent account is not active" });
    }

    const listingId = listingIdRaw;
    const roundedAmount = Math.round(amount * 100) / 100;

    // Insert earnings record
    await db.execute(
      `INSERT INTO agent_earnings (agent_id, listing_id, amount_etb, transaction_type, status)
       VALUES (?, ?, ?, ?, 'pending_approval')`,
      [agent.id, listingId, roundedAmount, transactionType]
    );

    // Update agent total (will be confirmed after TeleBirr verification)
    await db.execute(
      "UPDATE agents SET earnings_total_etb = earnings_total_etb + ? WHERE id = ?",
      [roundedAmount, agent.id]
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
 * Create a new listing as the AUTHENTICATED agent.
 * Identity comes from the session cookie; privilege fields are
 * server-controlled (is_premium/is_verified start at 0).
 */
router.post("/listings", requireAgentAuth, upload.array("images", 4), async (req, res) => {
  try {
    const { title_en, title_am, category, price, price_suffix, location_key, description_en, description_am, whatsapp } = req.body;

    if (!title_en || !title_am || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title_en, title_am, category",
      });
    }

    // Agent identity is bound to the session; must still be active
    const [[agent]] = await db.execute(
      "SELECT a.id, a.user_id, u.full_name FROM agents a JOIN users u ON u.id = a.user_id WHERE a.id = ? AND a.status = 'active'",
      [req.agent.agent_id]
    );
    if (!agent) {
      return res.status(403).json({ success: false, message: "Agent account is not active" });
    }

    // Contact number defaults to the agent's own registered phone
    const [[user]] = await db.execute(
      "SELECT phone_number FROM users WHERE id = ?",
      [agent.user_id]
    );
    const contactPhone = (user?.phone_number || "").replace(/\s/g, "");

    const imageFiles = req.files || [];
    const imageUrls = await Promise.all(imageFiles.map(f =>
      processImage(f.buffer, { watermark: { name: agent?.full_name || "" } })
    ));
    const locationLabels = {
      hawassa_tabor: { en: "Tabor Sub City, Hawassa", am: "ታቦር ክፍለ ከተማ፣ ሀዋሳ" },
      hawassa_addis_ketema: { en: "Addis Ketema Sub City, Hawassa", am: "አዲስ ከተማ ክፍለ ከተማ፣ ሀዋሳ" },
      hawassa_hayek_dar: { en: "Hayek Dar Sub City, Hawassa", am: "ሐይክ ዳር ክፍለ ከተማ፣ ሀዋሳ" },
      hawassa_mehal: { en: "Mehal Sub City, Hawassa", am: "መሃል ክፍለ ከተማ፣ ሀዋሳ" },
      hawassa_bahil_adarash: { en: "Bahil Adarash Sub City, Hawassa", am: "ባህል አደራሽ ክፍለ ከተማ፣ ሀዋሳ" },
      hawassa_misrak: { en: "Misrak Sub City, Hawassa", am: "ምስራቅ ክፍለ ከተማ፣ ሀዋሳ" },
      hawassa_menahreya: { en: "Menahreya Sub City, Hawassa", am: "መናሕሪያ ክፍለ ከተማ፣ ሀዋሳ" },
      hawassa_tulla: { en: "Tulla Sub City, Hawassa", am: "ሆዌላ ቱላ ክፍለ ከተማ፣ ሀዋሳ" },
      yirgalem: { en: "Yirgalem", am: "ይርጋለም" },
      bensa: { en: "Bensa", am: "በንሳ" },
      chuko: { en: "Chuko", am: "ጭንቆ" },
      aleta_wondo: { en: "Aleta Wondo", am: "አለታ ወንዶ" },
    };
    const loc = locationLabels[location_key] || { en: "Hawassa", am: "ሀዋሳ" };

    const [result] = await db.execute(
      `INSERT INTO listings (
        user_id, title_en, title_am, category, price, price_suffix,
        location_key, location_label_am, location_label_en,
        phone, whatsapp, images, is_active, is_premium, is_verified,
        description_en, description_am, view_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 0, ?, ?, 0)`,
      [
        agent.user_id, title_en, title_am, category,
        Number(price) || 0, PRICE_SUFFIXES.has(price_suffix) ? price_suffix : "fixed",
        location_key || "hawassa_tabor", loc.am, loc.en,
        contactPhone, whatsapp || contactPhone,
        JSON.stringify(imageUrls),
        description_en || null, description_am || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Listing created successfully",
      data: { id: result.insertId },
    });

    // Real-time availability to all visitors / agents
    broadcastListingChange(req.app.get("io"), {
      action: "created",
      id: result.insertId,
      is_active: true,
      category,
      location_key: location_key || "hawassa_tabor",
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

    // Look up agent by phone number (including credential state)
    const [rows] = await db.execute(
      `SELECT a.id, a.user_id, a.sub_city, a.status, a.earnings_total_etb, a.created_at,
              u.full_name, u.phone_number, u.password_hash
       FROM agents a
       JOIN users u ON a.user_id = u.id
       WHERE u.phone_number = ?
       LIMIT 1`,
      [cleanPhone]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone number or password",
        message_am: "የስልክ ቁጥሩ ወይም የይለፍ ቃሉ ተሳስቷል",
      });
    }

    const agent = rows[0];

    // Check agent status
    if (agent.status === "suspended") {
      return res.status(403).json({ success: false, message: "Account suspended. Contact support." });
    }

    if (agent.status !== "active") {
      return res.status(403).json({ success: false, message: "Account pending activation. Please wait for coordinator approval." });
    }

    let mustSetPassword = false;

    if (agent.password_hash) {
      // Normal path: verify credentials
      const match = await bcrypt.compare(String(password), agent.password_hash);
      if (!match) {
        return res.status(401).json({
          success: false,
          message: "Invalid phone number or password",
          message_am: "የስልክ ቁጥሩ ወይም የይለፍ ቃሉ ተሳስቷል",
        });
      }
    } else {
      // Legacy account created before passwords existed.
      // Issue a short-lived enrollment session; a password must be set
      // immediately via PUT /api/agents/me/password.
      mustSetPassword = true;
    }

    // Issue JWT token and set cookie. Enrollment sessions expire in 1 hour.
    const payload = {
      agent_id: agent.id,
      user_id: agent.user_id,
      phone_number: agent.phone_number,
    };
    if (mustSetPassword) payload.must_set_password = true;

    const { JWT_SECRET } = require("../middleware/agentAuth");
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: mustSetPassword ? "1h" : "7d",
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
        must_set_password: mustSetPassword,
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
 * PUT /api/agents/me/password
 * Set or change the authenticated agent's password.
 * Legacy accounts (no password yet) enroll here after their first login;
 * established accounts must confirm their current password first.
 */
router.put("/me/password", requireAgentAuth, async (req, res) => {
  try {
    const newPassword = String(req.body.new_password || "");
    const currentPassword = req.body.current_password;

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
        message_am: "የይለፍ ቃል ቢያንስ 8 ቁምፊዎች መሆን አለበት",
      });
    }

    const [[user]] = await db.execute(
      "SELECT id, password_hash FROM users WHERE id = ?",
      [req.agent.user_id]
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "Account not found" });
    }

    if (user.password_hash && !req.agent.must_set_password) {
      // Established account: require the current password
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to set a new one",
        });
      }
      const match = await bcrypt.compare(String(currentPassword), user.password_hash);
      if (!match) {
        return res.status(401).json({ success: false, message: "Current password is incorrect" });
      }
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.execute("UPDATE users SET password_hash = ? WHERE id = ?", [
      passwordHash,
      user.id,
    ]);

    // If this was an enrollment session, upgrade to a full-length session token
    let reissued = false;
    if (req.agent.must_set_password) {
      const { JWT_SECRET } = require("../middleware/agentAuth");
      const jwt = require("jsonwebtoken");
      const freshToken = jwt.sign(
        {
          agent_id: req.agent.agent_id,
          user_id: req.agent.user_id,
          phone_number: req.agent.phone_number,
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      setAgentAuthCookie(res, freshToken);
      reissued = true;
    }

    res.json({
      success: true,
      message: "Password updated successfully",
      message_am: "የይለፍ ቃል በተሳካ ሁኔታ ተዘምኗል",
      data: { reissued_session: reissued },
    });
  } catch (err) {
    console.error("[PUT /agents/me/password]", err);
    res.status(500).json({ success: false, message: "Failed to update password" });
  }
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

    // Seller name for the image watermark (JWT only carries agent_id/user_id)
    const [[seller]] = await db.execute(
      "SELECT full_name FROM users WHERE id = ?",
      [req.agent.user_id]
    );

    const { title_en, title_am, category, price, price_suffix, location_key, description_en, description_am, whatsapp, existing_images } = req.body;

    // Process new images if uploaded
    const newImageFiles = req.files || [];
    const newImageUrls = await Promise.all(newImageFiles.map(f =>
      processImage(f.buffer, { watermark: { name: seller?.full_name || "" } })
    ));

    // Merge with existing images (sent as JSON string from frontend)
    let finalImages;
    try {
      const kept = existing_images ? JSON.parse(existing_images) : JSON.parse(existing.images || "[]");
      finalImages = [...kept, ...newImageUrls].slice(0, 4);
    } catch {
      finalImages = newImageUrls.length > 0 ? newImageUrls.slice(0, 4) : JSON.parse(existing.images || "[]");
    }

    const locationLabels = {
      hawassa_tabor: { en: "Tabor Sub City, Hawassa", am: "ታቦር ክፍለ ከተማ፣ ሀዋሳ" },
      hawassa_addis_ketema: { en: "Addis Ketema Sub City, Hawassa", am: "አዲስ ከተማ ክፍለ ከተማ፣ ሀዋሳ" },
      hawassa_hayek_dar: { en: "Hayek Dar Sub City, Hawassa", am: "ሐይክ ዳር ክፍለ ከተማ፣ ሀዋሳ" },
      hawassa_mehal: { en: "Mehal Sub City, Hawassa", am: "መሃል ክፍለ ከተማ፣ ሀዋሳ" },
      hawassa_bahil_adarash: { en: "Bahil Adarash Sub City, Hawassa", am: "ባህል አደራሽ ክፍለ ከተማ፣ ሀዋሳ" },
      hawassa_misrak: { en: "Misrak Sub City, Hawassa", am: "ምስራቅ ክፍለ ከተማ፣ ሀዋሳ" },
      hawassa_menahreya: { en: "Menahreya Sub City, Hawassa", am: "መናሕሪያ ክፍለ ከተማ፣ ሀዋሳ" },
      hawassa_tulla: { en: "Tulla Sub City, Hawassa", am: "ሆዌላ ቱላ ክፍለ ከተማ፣ ሀዋሳ" },
      yirgalem: { en: "Yirgalem", am: "ይርጋለም" },
      bensa: { en: "Bensa", am: "በንሳ" },
      chuko: { en: "Chuko", am: "ጭንቆ" },
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

    // Real-time availability: reflect agent edits everywhere
    broadcastListingChange(req.app.get("io"), {
      action: "updated",
      id: Number(listingId),
      is_active: true,
      category: category || null,
      location_key: location_key || null,
    });
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

    // Real-time availability: agent-deleted listings vanish live
    broadcastListingChange(req.app.get("io"), {
      action: "deleted",
      id: Number(listingId),
      is_active: false,
    });
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
 * Agent requests payout of earned commission via TeleBirr.
 *
 * Money-safety rules:
 *  - Reservation model: balance is deducted inside the same transaction that
 *    creates the request, so a failed insert can never orphan a deduction
 *    (previously the deduction committed and then the INSERT 500-ed — silent
 *    loss of the agent's earnings on every attempt while the table was missing).
 *  - Row is locked FOR UPDATE to prevent double-spend via concurrent requests.
 *  - Max 3 open (pending/approved) requests per agent to limit spam exposure.
 */
const MAX_OPEN_PAYOUT_REQUESTS = 3;

router.post("/payout/request", requireAgentAuth, async (req, res) => {
  try {
    const { amount_etb, telebirr_phone } = req.body;

    const amount = Number(amount_etb);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(422).json({ success: false, message: "Amount must be greater than 0" });
    }
    if (amount > 1000000) {
      return res.status(422).json({ success: false, message: "Amount exceeds single-payout limit" });
    }

    const phone = String(telebirr_phone || "").replace(/\s/g, "");
    if (!ETH_PHONE_REGEX.test(phone)) {
      return res.status(422).json({ success: false, message: "A valid Ethiopian phone number is required" });
    }

    const result = await db.transaction(async (conn) => {
      // Lock the agent row so concurrent requests cannot both pass the check
      const [[agent]] = await conn.execute(
        "SELECT earnings_total_etb FROM agents WHERE id = ? FOR UPDATE",
        [req.agent.agent_id]
      );

      if (!agent) {
        const err = new Error("Agent not found");
        err.statusCode = 404;
        throw err;
      }

      const available = Number(agent.earnings_total_etb);
      if (available < amount) {
        const err = new Error(`Insufficient balance. Available: ${available.toLocaleString()} ETB`);
        err.statusCode = 422;
        throw err;
      }

      const [[{ open_count }]] = await conn.execute(
        "SELECT COUNT(*) AS open_count FROM agent_payout_requests WHERE agent_id = ? AND status IN ('pending','approved')",
        [req.agent.agent_id]
      );
      if (open_count >= MAX_OPEN_PAYOUT_REQUESTS) {
        const err = new Error("You already have 3 open payout requests. Wait for them to be processed.");
        err.statusCode = 429;
        throw err;
      }

      await conn.execute(
        "UPDATE agents SET earnings_total_etb = earnings_total_etb - ? WHERE id = ?",
        [amount, req.agent.agent_id]
      );

      const [insert] = await conn.execute(
        `INSERT INTO agent_payout_requests (agent_id, amount_etb, telebirr_phone, status)
         VALUES (?, ?, ?, 'pending')`,
        [req.agent.agent_id, amount, phone]
      );

      return { id: insert.insertId, amount_etb: amount, status: "pending" };
    });

    res.status(201).json({
      success: true,
      message: "Payout request submitted. Processing within 48 hours.",
      data: result,
    });

    // Admin live feed — push new payout request
    const io = req.app.get("io");
    if (io) {
      io.to("admin_feed").emit("admin:new_payout_request", {
        request_id: result.id,
        agent_id: req.agent.agent_id,
        amount_etb: amount,
        telebirr_phone: phone,
        timestamp: Date.now(),
      });
    }
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
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
