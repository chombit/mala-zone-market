/**
 * database/schema.sql
 * Malazone.com — Elite Relational Architecture
 * Optimized for rapid municipal search and multi-category assets
 * © 2026 Malazone Technologies PLC
 */

-- ─────────────────────────────────────────────
-- DATABASE INITIALIZATION
-- ─────────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS malazone 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE malazone;

-- ─────────────────────────────────────────────
-- ADMIN USERS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL, -- Never store plain passwords!
  full_name VARCHAR(100) NOT NULL,
  role ENUM('super_admin', 'admin', 'g2b_municipality', 'g2b_transport') DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_username (username),
  INDEX idx_admin_role (role)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- USERS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  account_type ENUM('Individual', 'Business', 'Agent') DEFAULT 'Individual',
  preferred_language ENUM('am', 'en') DEFAULT 'am',
  is_verified BOOLEAN DEFAULT FALSE,
  -- OAuth provider fields
  provider ENUM('local', 'google', 'facebook') DEFAULT 'local',
  provider_id VARCHAR(255),
  provider_profile JSON,
  -- Password reset fields
  reset_password_token VARCHAR(255),
  reset_password_expires DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_phone (phone_number),
  INDEX idx_user_email (email),
  INDEX idx_user_provider (provider, provider_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- AGENTS TABLE (Mala-Agents Hub)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  sub_city VARCHAR(50) NOT NULL, -- Tabor, Lakefront, Piassa, etc.
  earnings_total_etb DECIMAL(12, 2) DEFAULT 0.00,
  status ENUM('pending', 'active', 'suspended') DEFAULT 'pending',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_agent_status (status)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- LISTINGS TABLE (The Core Engine)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  
  -- Core Metadata
  title_am VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  description_am TEXT,
  description_en TEXT,
  category ENUM('property', 'motors', 'stay', 'ceremony', 'heavy', 'electronics') NOT NULL,
  sub_category VARCHAR(50),
  
  -- Location (Municipal Geography)
  location_key VARCHAR(50) NOT NULL, -- hawassa_tabor, hawassa_lakefront, etc.
  location_label_am VARCHAR(100),
  location_label_en VARCHAR(100),
  
  -- Pricing
  price DECIMAL(15, 2) NOT NULL,
  price_suffix ENUM('fixed', 'per_day', 'per_month', 'per_hour') DEFAULT 'fixed',
  
  -- Contact (Direct)
  phone VARCHAR(20) NOT NULL,
  whatsapp VARCHAR(20),
  voice_note_url VARCHAR(255), -- Support for Sidaamu Afoo/Amharic descriptions
  
  -- Asset Features (Cross-Industry)
  images JSON, -- Array of WebP paths
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE, -- "Verified Carta" or "Invoice Check"
  is_premium BOOLEAN DEFAULT FALSE,
  premium_until DATETIME DEFAULT NULL,
  
  -- Category-Specific Fields (Flattened for performance)
  -- Motors & Heavy Machinery
  plate_code VARCHAR(20),
  plate_region VARCHAR(50),
  fuel_type ENUM('benzine', 'diesel', 'electric', 'hybrid'),
  condition_type ENUM('new', 'invoiced', 'used'),
  machinery_brand VARCHAR(50),
  is_zero_km BOOLEAN DEFAULT FALSE,
  is_tax_free BOOLEAN DEFAULT FALSE,
  with_operator BOOLEAN DEFAULT FALSE,
  
  -- Property & Stay
  bedrooms INT DEFAULT NULL,
  bathrooms INT DEFAULT NULL,
  area_sqm DECIMAL(10, 2) DEFAULT NULL,
  title_deed VARCHAR(50) DEFAULT NULL, -- 'carta', 'village', etc.
  capacity INT DEFAULT NULL, -- Hall capacity or guest count
  
  -- Stats
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Constraints & Indices
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_listing_cat (category),
  INDEX idx_listing_location (location_key),
  INDEX idx_listing_active (is_active),
  INDEX idx_listing_premium (is_premium),
  INDEX idx_listing_price (price)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- AGENT EARNINGS LOG
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_earnings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agent_id INT NOT NULL,
  listing_id INT NOT NULL,
  amount_etb DECIMAL(10, 2) NOT NULL,
  transaction_type VARCHAR(50) DEFAULT 'listing_sale',
  status ENUM('pending_approval', 'paid') DEFAULT 'pending_approval',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- SITE PROMO BANNER TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promo_banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title_en VARCHAR(255) NOT NULL,
  title_am VARCHAR(255) NOT NULL,
  subtitle_en TEXT,
  subtitle_am TEXT,
  link_url VARCHAR(255),
  image_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- HERO SLIDES TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hero_slides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_url VARCHAR(255) NOT NULL,
  pillar_key VARCHAR(100) NOT NULL,
  category_id VARCHAR(50) NOT NULL,
  label_en VARCHAR(100) NOT NULL,
  label_am VARCHAR(100) NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- SITE STATS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(50) NOT NULL UNIQUE,
  value_int INT,
  value_str VARCHAR(255),
  description_en TEXT,
  description_am TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- LOCATIONS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'hawassa', 'yirgalem'
  label_en VARCHAR(100) NOT NULL,
  label_am VARCHAR(100) NOT NULL,
  sub_zones JSON, -- Array of sub-locations (e.g., [{"key":"tabor","label_en":"Tabor","label_am":"ታቦር"}, ...])
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- CATEGORIES TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'property', 'motors'
  label_en VARCHAR(100) NOT NULL,
  label_am VARCHAR(100) NOT NULL,
  description_en TEXT,
  description_am TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- AUDIT LOGS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  admin_user_id INT NULL,
  user_id INT NULL,
  actor_type ENUM('admin', 'user', 'system', 'anonymous') DEFAULT 'system',
  actor_identifier VARCHAR(255) NULL,
  actor_role VARCHAR(50) NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100) NULL,
  details JSON NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_admin_user (admin_user_id),
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_actor_type (actor_type),
  INDEX idx_audit_action (action),
  INDEX idx_audit_resource (resource_type, resource_id),
  INDEX idx_audit_created_at (created_at)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- INITIAL SETUP
-- ─────────────────────────────────────────────
-- Note: Use 'node database/seed.js' for full production-ready data population.
INSERT IGNORE INTO users (full_name, phone_number, account_type, is_verified) 
VALUES ('System Admin', '0900000000', 'Business', 1);

INSERT IGNORE INTO site_stats (key_name, value_int, description_en, description_am) VALUES
('clients', 1003, 'Total registered users', 'ጠቅላላ የተመዘገቡ ተጠቃሚዎች'),
('listings', 2547, 'Total active listings', 'ጠቅላላ ተግባራዊ ዝርዝሮች'),
('vehicles', 1412, 'Total vehicles listed', 'ጠቅላላ የተዘረዘሩ መኪናዎች'),
('trade_success_rate', 100, 'Trade success rate percentage', 'የንግድ ስኬት መጠነኛያ');

-- ─────────────────────────────────────────────
-- TESTIMONIALS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reviewer_name_en VARCHAR(100) NOT NULL,
  reviewer_name_am VARCHAR(100) NOT NULL,
  text_en TEXT NOT NULL,
  text_am TEXT NOT NULL,
  rating INT DEFAULT 5,
  avatar_emoji VARCHAR(10) DEFAULT '👤',
  accent_color VARCHAR(7) DEFAULT '#2563eb',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- CONTACT MESSAGES TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  subject VARCHAR(200),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- SITE CONFIG TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  config_key VARCHAR(50) NOT NULL UNIQUE,
  config_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- MESSAGES TABLE (Buyer-Seller Chat)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  listing_id INT DEFAULT NULL,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE SET NULL,
  INDEX idx_msg_sender (sender_id),
  INDEX idx_msg_receiver (receiver_id),
  INDEX idx_msg_listing (listing_id),
  INDEX idx_msg_read (is_read),
  INDEX idx_msg_created (created_at)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- RATINGS TABLE (Buyer → Seller Ratings)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  listing_id INT DEFAULT NULL,
  rater_id INT NOT NULL,
  seller_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE SET NULL,
  FOREIGN KEY (rater_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_rating_per_listing (rater_id, listing_id),
  INDEX idx_rating_seller (seller_id),
  INDEX idx_rating_created (created_at)
) ENGINE=InnoDB;
