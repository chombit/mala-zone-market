/**
 * server.js
 * Malazone.com — Node.js + Express API Server
 * Image upload pipeline: multer (memoryStorage) → sharp → WebP
 * © 2026 Malazone Technologies PLC
 */
// Restarted to free port 4002
// Second restart to kill PID 33812

"use strict";

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const net = require("net");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const cookie = require("cookie");
require("dotenv").config();

// ── Route imports
const listingsRouter = require("./routes/listings");
const agentsRouter = require("./routes/agents");
const statsRouter = require("./routes/stats");
const adminRouter = require("./routes/admin");
const siteRouter = require("./routes/site");
const g2bRouter = require("./routes/g2b");
const authRouter = require("./routes/auth");
const messagesRouter = require("./routes/messages");
const ratingsRouter = require("./routes/ratings");
const locationsRouter = require("./routes/locations");
const favoritesRouter = require("./routes/favorites");
const notificationsRouter = require("./routes/notifications");
const taxonomyRouter = require("./routes/taxonomy");
const brandsRouter = require("./routes/brands");
const bookingsRouter = require("./routes/bookings");
const savedSearchesRouter = require("./routes/savedSearches");
const reportsRouter = require("./routes/reports");
const pushesRouter = require("./routes/pushes");
const sellersRouter = require("./routes/sellers");
const verificationRouter = require("./routes/verification");
const { verifyAdminToken } = require("./middleware/adminAuth");
const { JWT_SECRET: USER_JWT_SECRET } = require("./middleware/userAuth");
const { JWT_SECRET: AGENT_JWT_SECRET } = require("./middleware/agentAuth");
const { requireProductionSecrets } = require("./utils/envGuards");

// ── App init (HTTP + Socket.io)
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const compression = require("compression");

const NODE_ENV = process.env.NODE_ENV || "development";

// ── Fail fast in production when secrets are missing or insecure defaults.
// In development we allow fallbacks so the app boots out of the box.
if (NODE_ENV === "production") {
  try {
    requireProductionSecrets(["JWT_SECRET", "ADMIN_JWT_SECRET", "SESSION_SECRET"]);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

// ── Reverse proxy support (nginx). Enable with TRUST_PROXY=true in prod so
// express-rate-limit sees the real client IP instead of the proxy IP.
if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS) || 1);
}

// ─────────────────────────────────────────────
// MIDDLEWARE STACK
// ─────────────────────────────────────────────

// Enable Gzip compression for slow networks
app.use(compression());

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allow image serving
  })
);

// Cookie parser
app.use(cookieParser());

// Session + Passport are ONLY required for the Google OAuth handshake.
// The rest of the app uses stateless JWT httpOnly cookies, so we avoid
// mounting the default MemoryStore session in production unnecessarily.
const oauthEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

if (oauthEnabled) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "malazone-session-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 15 * 60 * 1000 // OAuth handshake only — short-lived
      }
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
}

// CORS — allow React dev server + production domain
// Extra origins can be supplied via CORS_ORIGINS (comma-separated).
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:5173",
  "https://malazone.com",
  "https://www.malazone.com",
  ...(process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
    : []),
];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Malazone-Token"],
    credentials: true,
  })
);

// Request logging (concise in production)
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

// JSON + URL-encoded body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded images statically
app.use(
  "/uploads",
  express.static(path.join(__dirname, "public", "uploads"), {
    maxAge: "30d",
    etag: true,
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
    },
  })
);

// ── Socket.io — admin real-time feed + user interaction relay
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false); // silently reject
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"],
});

// Identify the socket owner from the JWT httpOnly cookie sent on the
// websocket handshake (same-origin / proxied requests include cookies).
// A normal user authenticates with `malazone_token` ({ id }); an agent with
// `agent_token` ({ agent_id, user_id }) whose chat identity is its underlying
// user, so buyer messages to the listing reach the agent's live socket.
io.use((socket, next) => {
  try {
    const cookies = cookie.parse(socket.request?.headers?.cookie || "");
    const token = cookies.malazone_token;
    if (token) {
      try {
        const decoded = jwt.verify(token, USER_JWT_SECRET);
        socket.authUserId = decoded.id;
      } catch {
        // Invalid/expired cookie — socket stays anonymous
      }
    } else {
      // No user token — try agent session (agents receive chat as their user)
      const agentToken = cookies.agent_token;
      if (agentToken) {
        try {
          const decoded = jwt.verify(agentToken, AGENT_JWT_SECRET);
          if (decoded.user_id) socket.authUserId = decoded.user_id;
        } catch {
          // Invalid/expired agent cookie — socket stays anonymous
        }
      }
    }
  } catch {
    // Malformed cookie header — ignore, treat as anonymous
  }
  next();
});

const adminSockets = new Set();

io.on("connection", (socket) => {
  // Admin authentication — token is cryptographically verified; presence of
  // any string is NOT enough. Only payloads signed with ADMIN_JWT_SECRET and
  // carrying type:"admin" are admitted to the admin feed.
  socket.on("authenticate_admin", (data) => {
    const payload = verifyAdminToken(data && data.token);
    if (payload) {
      adminSockets.add(socket);
      socket.isAdmin = true;
      socket.adminId = payload.sub;
      socket.join("admin_feed");
      socket.emit("authenticated", { success: true });
    } else {
      socket.emit("authenticated", { success: false, message: "Invalid admin token" });
    }
  });

  // User chat room — join personal room for real-time messages.
  // The claimed userId must match a verified identity: either the JWT from
  // the handshake cookie or an explicit valid JWT in the payload.
  // Accepts legacy payloads (number) and { userId, token } objects.
  socket.on("join_chat", (data) => {
    const isObject = data !== null && typeof data === "object";
    const requestedUserId = isObject ? data.userId : data;

    let verifiedUserId = socket.authUserId ?? null;
    if (!verifiedUserId && isObject && data.token) {
      try {
        verifiedUserId = jwt.verify(data.token, USER_JWT_SECRET).id ?? null;
      } catch {
        verifiedUserId = null;
      }
    }

    if (
      requestedUserId != null &&
      verifiedUserId != null &&
      String(verifiedUserId) === String(requestedUserId)
    ) {
      socket.join(`user_${verifiedUserId}`);
      socket.chatUserId = verifiedUserId;
    }
  });

  // Typing indicator — relay to the conversation partner's room so the
  // other party sees a real-time "typing…" bubble without an HTTP round-trip.
  socket.on("chat:typing", (data) => {
    if (!socket.chatUserId) return;
    const receiverId = data && Number(data.receiver_id);
    if (!receiverId) return;
    io.to(`user_${receiverId}`).emit("user_typing", {
      sender_id: socket.chatUserId,
      is_typing: data.is_typing !== false,
    });
  });

  // Read receipt — the partner's UI flips their unread badge for this
  // conversation to zero the instant the messages are viewed.
  socket.on("chat:read", (data) => {
    if (!socket.chatUserId) return;
    const partnerId = data && Number(data.partner_id);
    if (!partnerId) return;
    io.to(`user_${partnerId}`).emit("messages_read", {
      reader_id: socket.chatUserId,
      partner_id: partnerId,
    });
  });

  // Relay user interactions to all admin sockets
  socket.on("user_interaction_trigger", (payload) => {
    for (const adminSocket of adminSockets) {
      if (adminSocket.connected) {
        adminSocket.emit("broadcast_admin_notification", payload);
      }
    }
  });

  socket.on("disconnect", () => {
    if (socket.isAdmin) {
      adminSockets.delete(socket);
    }
  });
});

// Make io accessible to routes
app.set("io", io);

// ── Global rate limiter (protect public/anonymous endpoints from abuse).
// Logged-in sessions (user / agent / admin) are already verified by JWT and
// drive many parallel dashboard calls, so they are exempt. Because every dev
// request shares one proxy IP, the anonymous cap is set generously.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1500, // allow 1500 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  // Only rate-limit anonymous traffic; authenticated clients bypass.
  skip: (req) =>
    Boolean(
      (req.cookies && req.cookies.malazone_token) ||
        (req.cookies && req.cookies.agent_token) ||
        (req.headers && req.headers.authorization && req.headers.authorization.startsWith("Bearer "))
    ),
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
    message_am: "በጣም ብዙ ጥያቄዎች። እባክዎ ቆዩ።",
  },
});
app.use("/api", apiLimiter);

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────
app.use("/api/listings", listingsRouter);
app.use("/api/agents", agentsRouter);
app.use("/api/stats", statsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/site", siteRouter);
app.use("/api/g2b", g2bRouter);
app.use("/api/verification", verificationRouter);
app.use("/api/auth", authRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/ratings", ratingsRouter);
app.use("/api/locations", locationsRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/categories", taxonomyRouter);
app.use("/api/brands", brandsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/saved-searches", savedSearchesRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/push", pushesRouter);
app.use("/api/sellers", sellersRouter);

// ── Root route (Welcome message)
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Malazone.com API — Operational",
    documentation: "/api/health",
    endpoints: {
      listings: "/api/listings",
      agents: "/api/agents",
    },
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "Malazone API",
    version: "1.0.0",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─────────────────────────────────────────────
// SERVE REACT FRONTEND
// ─────────────────────────────────────────────
const distPath = path.join(__dirname, "dist");
const buildPath = path.join(__dirname, "build");
const frontendPath = fs.existsSync(distPath) ? distPath : buildPath;

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  app.get("*", (req, res, next) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(frontendPath, "index.html"));
    } else {
      // Let unknown API routes fall through to the JSON 404 handler below
      // instead of hanging forever.
      next();
    }
  });
}

// ─────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error("[Malazone Error]", err.message, err.stack);

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: "Image too large. Maximum 5MB per file.",
      message_am: "ፎቶ ከ5MB ማለፍ አይችልም።",
    });
  }

  // Multer file count error
  if (err.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({
      success: false,
      message: "Too many images. Maximum 8 files allowed.",
      message_am: "ከፍተኛ 8 ፎቶዎች ብቻ ይፈቀዳሉ።",
    });
  }

  // Multer unexpected field
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      message: "Unexpected file field.",
    });
  }

  // CORS error
  if (err.message && err.message.startsWith("CORS policy")) {
    return res.status(403).json({ success: false, message: err.message });
  }

  // Default 500
  return res.status(500).json({
    success: false,
    message:
      NODE_ENV === "production"
        ? "Internal server error. Please try again."
        : err.message,
    message_am: "ሰርቨሩ ላይ ስህተት ተፈጥሯል። ዳግም ይሞክሩ።",
  });
});

// 404 for API routes only
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ─────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────
const PORT = parseInt(process.env.PORT, 10) || 4003;

// Only bind the port when run directly — importing this module (tests,
// tooling) must not start a listener or clash with a running dev server.
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════╗
║  🟢  Malazone API Server                        ║
║      Port   : ${PORT}                              ║
║      Env    : ${NODE_ENV.padEnd(12)}                  ║
║      © 2026 Malazone Technologies PLC            ║
╚══════════════════════════════════════════════════╝
  `);
  });
}

// Export the express app (default) plus server/io for tests & tooling.
module.exports = app;
module.exports.server = server;
module.exports.io = io;
