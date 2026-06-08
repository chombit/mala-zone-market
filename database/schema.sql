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
-- USERS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  account_type ENUM('Individual', 'Business', 'Agent') DEFAULT 'Individual',
  preferred_language ENUM('am', 'en') DEFAULT 'am',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_phone (phone_number)
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
  description TEXT,
  category ENUM('property', 'motors', 'stay', 'ceremony', 'heavy') NOT NULL,
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
-- INITIAL SETUP
-- ─────────────────────────────────────────────
-- Note: Use 'node database/seed.js' for full production-ready data population.
INSERT IGNORE INTO users (full_name, phone_number, account_type, is_verified) 
VALUES ('System Admin', '0900000000', 'Business', 1);
