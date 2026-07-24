/**
 * routes/auth.js
 * Malazone.com — Authentication Routes (Local, Google)
 * © 2026 Malazone Technologies PLC
 */

"use strict";

const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const db = require("../database/db");
const rateLimit = require("express-rate-limit");
const { getUserActor, sanitizeForAudit, writeAuditLog } = require("../utils/auditLogger");

const router = express.Router();

// Rate limiting for login endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "development" ? 100 : 5, // Higher limit in dev
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
    message_am: "በጣም ብዙ የምግባት ሙከራዎች። ብቁ መልሱ ይሞክሩ።"
  }
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "malazone_secret_key_change_in_production";
const JWT_EXPIRES_IN = "7d";

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [users] = await db.execute("SELECT id, full_name, email, phone_number, account_type, provider FROM users WHERE id = ?", [id]);
    if (users.length > 0) {
      done(null, users[0]);
    } else {
      done(null, null);
    }
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback",
        scope: ["profile", "email"]
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          const [existingUsers] = await db.execute(
            "SELECT * FROM users WHERE provider = 'google' AND provider_id = ?",
            [profile.id]
          );

          if (existingUsers.length > 0) {
            return done(null, existingUsers[0]);
          }

          // Check if email exists
          if (email) {
            const [emailUsers] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
            if (emailUsers.length > 0) {
              // Update existing user with Google provider
              await db.execute(
                "UPDATE users SET provider = 'google', provider_id = ?, provider_profile = ? WHERE email = ?",
                [profile.id, JSON.stringify(profile), email]
              );
              const [updatedUsers] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
              return done(null, updatedUsers[0]);
            }
          }

          // Create new user
          const [result] = await db.execute(
            `INSERT INTO users (full_name, email, provider, provider_id, provider_profile, is_verified) 
             VALUES (?, ?, 'google', ?, ?, ?)`,
            [
              profile.displayName,
              email,
              profile.id,
              JSON.stringify(profile),
              true
            ]
          );

          const [newUsers] = await db.execute("SELECT * FROM users WHERE id = ?", [result.insertId]);
          return done(null, newUsers[0]);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

// Helper: Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, provider: user.provider },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Helper: Sanitize user for response
const sanitizeUser = (user) => {
  const { password_hash, provider_profile, ...sanitized } = user;
  return sanitized;
};

const getCurrentUserFromRequest = async (req) => {
  try {
    const token = req.cookies.malazone_token || req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const [users] = await db.execute("SELECT * FROM users WHERE id = ?", [decoded.id]);
    return users[0] || null;
  } catch (err) {
    return null;
  }
};

// Local Login
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        message_am: "ኢሜይል እና መለያ ቃል ያስፈልጋሉ"
      });
    }

    const [users] = await db.execute(
      "SELECT * FROM users WHERE email = ? AND provider = 'local'",
      [email]
    );

    if (users.length === 0) {
      await writeAuditLog({
        req,
        actorType: "anonymous",
        actorIdentifier: email,
        action: "user_login_failed",
        resourceType: "user_session",
        details: { reason: "email_not_found" },
      });
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        message_am: "የተሳሳተ ኢሜይል ወይም መለያ ቃል"
      });
    }

    const user = users[0];

    if (!user.password_hash) {
      await writeAuditLog({
        req,
        ...getUserActor(user),
        action: "user_login_failed",
        resourceType: "user_session",
        resourceId: user.id,
        details: { reason: "social_login_required" },
      });
      return res.status(401).json({
        success: false,
        message: "Please use social login for this account",
        message_am: "ለዚህ መለያ ማህበራዊ መግባት ይጠቀሙ"
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      await writeAuditLog({
        req,
        ...getUserActor(user),
        action: "user_login_failed",
        resourceType: "user_session",
        resourceId: user.id,
        details: { reason: "invalid_password" },
      });
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        message_am: "የተሳሳተ ኢሜይል ወይም መለያ ቃል"
      });
    }

    const token = generateToken(user);

    // Set HTTP-only cookie
    res.cookie("malazone_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: "Login successful",
      message_am: "በተሳካ ሁኔታ ገብተዋል",
      user: sanitizeUser(user),
      token
    });

    await writeAuditLog({
      req,
      ...getUserActor(user),
      action: "user_login_success",
      resourceType: "user_session",
      resourceId: user.id,
      details: { provider: user.provider },
    });
  } catch (err) {
    console.error("[Auth Login Error]", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      message_am: "የውስጥ ሰርቨር ስህተት"
    });
  }
});

// Local Register
router.post("/register", loginLimiter, async (req, res) => {
  try {
    const { full_name, email, password, phone_number, account_type } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required",
        message_am: "ሙሉ ስም፣ ኢሜይል እና መለያ ቃል ያስፈልጋሉ"
      });
    }

    // Check if email exists
    const [existingUsers] = await db.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      await writeAuditLog({
        req,
        actorType: "anonymous",
        actorIdentifier: email,
        action: "user_registration_failed",
        resourceType: "user_account",
        details: { reason: "email_already_registered" },
      });
      return res.status(409).json({
        success: false,
        message: "Email already registered",
        message_am: "ኢሜይሉ ቀድሞ ይመዝገባል"
      });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const [result] = await db.execute(
      `INSERT INTO users (full_name, email, password_hash, phone_number, account_type, provider) 
       VALUES (?, ?, ?, ?, ?, 'local')`,
      [full_name, email, password_hash, phone_number || null, account_type || "Individual"]
    );

    const [newUsers] = await db.execute("SELECT * FROM users WHERE id = ?", [result.insertId]);
    const user = newUsers[0];
    const token = generateToken(user);

    res.cookie("malazone_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      message_am: "በተሳካ ሁኔታ ተመዝግበዋል",
      user: sanitizeUser(user),
      token
    });

    await writeAuditLog({
      req,
      ...getUserActor(user),
      action: "user_registered",
      resourceType: "user_account",
      resourceId: user.id,
      details: {
        account_type: user.account_type,
        provider: user.provider,
      },
    });
  } catch (err) {
    console.error("[Auth Register Error]", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      message_am: "የውስጥ ሰርቨር ስህተት"
    });
  }
});

// Google OAuth
router.get("/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(501).json({
      success: false,
      message: "Google login not configured",
      message_am: "የጉግል መግባት አላዘጋጅም"
    });
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/signin" }), (req, res) => {
  const token = generateToken(req.user);
  res.cookie("malazone_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  const frontendUrl = process.env.REACT_APP_BASE_URL || "http://localhost:3000";
  res.redirect(`${frontendUrl}/`);
});

// Logout
router.post("/logout", async (req, res) => {
  const currentUser = await getCurrentUserFromRequest(req);
  res.clearCookie("malazone_token");
  req.logout(async () => {
    if (currentUser) {
      await writeAuditLog({
        req,
        ...getUserActor(currentUser),
        action: "user_logout",
        resourceType: "user_session",
        resourceId: currentUser.id,
      });
    }

    res.json({
      success: true,
      message: "Logged out successfully",
      message_am: "በተሳካ ሁኔታ ወጥተዋል"
    });
  });
});

// Get Current User
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies.malazone_token || req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
        message_am: "አልተታመረም"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const [users] = await db.execute("SELECT * FROM users WHERE id = ?", [decoded.id]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        message_am: "ተጠቃሚው አልተገኘም"
      });
    }

    res.json({
      success: true,
      user: sanitizeUser(users[0])
    });
  } catch (err) {
    console.error("[Auth Me Error]", err);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      message_am: "የተሳሳተ ወይም የጊዜው ያለፈ ቶከን"
    });
  }
});

// Forgot Password
router.post("/forgot-password", loginLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
        message_am: "ኢሜይል ያስፈልጋል"
      });
    }

    const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      await writeAuditLog({
        req,
        actorType: "anonymous",
        actorIdentifier: email,
        action: "password_reset_requested_unknown",
        resourceType: "user_account",
        details: { email },
      });
      // Return success even if user not found (to prevent email enumeration)
      return res.json({
        success: true,
        message: "If an account with that email exists, we've sent a password reset link.",
        message_am: "በዚህ ኢሜይል መለያ ከነበረ የይለፍ ቃል ለመዳመጥ አገናኝ ልከንልዎታለን።"
      });
    }

    const user = users[0];
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    // Update user with reset token
    await db.execute(
      "UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?",
      [resetPasswordToken, resetPasswordExpires, user.id]
    );

    // Create reset URL
    const resetUrl = `${process.env.REACT_APP_BASE_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

    if (process.env.NODE_ENV === "development") {
      // In development mode: log to console AND return link in response
      console.log("🔑 [DEV MODE] Password Reset Link:", resetUrl);
    } else {
      // Send email in production
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.NODE_ENV === "production",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });

      const mailOptions = {
        from: process.env.SMTP_FROM || "Malazone <noreply@malazone.com>",
        to: user.email,
        subject: "Reset Your Password - Malazone",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>Hi ${user.full_name},</p>
            <p>You requested a password reset for your Malazone account. Click the link below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #00A86B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br/>The Malazone Team</p>
          </div>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
      } catch (emailErr) {
        console.warn("⚠️ [Forgot Password] Email sending failed (dev mode okay):", emailErr.message);
        // Still return success to user, we logged the link to console
      }
    }

    res.json({
      success: true,
      message: "If an account with that email exists, we've sent a password reset link.",
      message_am: "በዚህ ኢሜይል መለያ ከነበረ የይለፍ ቃል ለመዳመጥ አገናኝ ልከንልዎታለን。",
      ...(process.env.NODE_ENV === "development" && { resetUrl }),
    });

    await writeAuditLog({
      req,
      ...getUserActor(user),
      action: "password_reset_requested",
      resourceType: "user_account",
      resourceId: user.id,
      details: {
        email: user.email,
        expires_at: resetPasswordExpires,
      },
    });
  } catch (err) {
    console.error("[Forgot Password Error]", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      message_am: "የውስጥ ሰርቨር ስህተት"
    });
  }
});

// Reset Password
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
        message_am: "መለያ ቃል ያስፈልጋል"
      });
    }

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid reset token
    const [users] = await db.execute(
      "SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()",
      [resetPasswordToken]
    );

    if (users.length === 0) {
      await writeAuditLog({
        req,
        actorType: "anonymous",
        action: "password_reset_failed",
        resourceType: "user_account",
        details: { reason: "invalid_or_expired_token" },
      });
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
        message_am: "የተሳሳተ ወይም የጊዜው ያለፈ የይለፍ ቃል ለመዳመጥ ቶከን"
      });
    }

    const user = users[0];
    const password_hash = await bcrypt.hash(password, 12);

    // Update user password and clear reset token
    await db.execute(
      "UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?",
      [password_hash, user.id]
    );

    res.json({
      success: true,
      message: "Password reset successful. You can now log in.",
      message_am: "የይለፍ ቃል መዳመጥ ተሳክቷል። አሁን መግባት ይችላሉ።"
    });

    await writeAuditLog({
      req,
      ...getUserActor(user),
      action: "password_reset_completed",
      resourceType: "user_account",
      resourceId: user.id,
      details: sanitizeForAudit({ email: user.email }),
    });
  } catch (err) {
    console.error("[Reset Password Error]", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      message_am: "የውስጥ ሰርቨር ስህተት"
    });
  }
});

module.exports = router;
