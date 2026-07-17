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
const path = require("path");
const net = require("net");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
require("dotenv").config();

// ── Route imports
const listingsRouter = require("./routes/listings");
const agentsRouter = require("./routes/agents");
const statsRouter = require("./routes/stats");
const adminRouter = require("./routes/admin");
const siteRouter = require("./routes/site");
const g2bRouter = require("./routes/g2b");
const authRouter = require("./routes/auth");

// ── App init (HTTP + Socket.io)
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const compression = require("compression");

const NODE_ENV = process.env.NODE_ENV || "development";

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

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "malazone-session-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// CORS — allow React dev server + production domain
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:5173",
  "https://malazone.com",
  "https://www.malazone.com",
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

const adminSockets = new Set();

io.on("connection", (socket) => {
  // Admin authentication
  socket.on("authenticate_admin", (data) => {
    if (data && data.token) {
      adminSockets.add(socket);
      socket.isAdmin = true;
      socket.emit("authenticated", { success: true });
    }
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

// ── Global rate limiter (protect from abuse on 3G/4G mobile clients)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // allow 200 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
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
app.use("/api/auth", authRouter);

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
// SERVE REACT FRONTEND IN PRODUCTION
// ─────────────────────────────────────────────
if (NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "build");
  app.use(express.static(buildPath));
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(buildPath, "index.html"));
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
const PORT = 4003;
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

module.exports = app; // for testing
