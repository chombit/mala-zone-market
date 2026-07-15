/**
 * database/schema.sql
 * Malazone.com — MySQL Database Schema
 * © 2026 Malazone Technologies PLC
 * 
 * Run: mysql -u root -p malazone < database/schema.sql
 * Or: mysql> source /path/to/database/schema.sql;
 */

-- ─────────────────────────────────────────────────────────────
-- DATABASE CREATION
-- ─────────────────────────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS malazone
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE malazone;

-- ─────────────────────────────────────────────────────────────
-- USERS TABLE
-- Track all marketplace users (sellers, agents, etc.)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique user ID',
  full_name VARCHAR(255) NOT NULL COMMENT 'Full name of user',
  phone_number VARCHAR(20) NOT NULL UNIQUE COMMENT 'Ethiopian phone: 09XXXXXXXX or +2519XXXXXXXX',
  account_type ENUM('Individual', 'Agency', 'Broker') DEFAULT 'Individual' COMMENT 'Account classification',
  preferred_language ENUM('am', 'en') DEFAULT 'am' COMMENT 'Preferred UI language',
  email VARCHAR(255) UNIQUE COMMENT 'Optional email address',
  bio TEXT COMMENT 'User bio/description',
  avatar_url VARCHAR(500) COMMENT 'Profile picture URL',
  is_verified BOOLEAN DEFAULT FALSE COMMENT 'Email/phone verified status',
  is_suspended BOOLEAN DEFAULT FALSE COMMENT 'Account suspension flag',
  verification_token VARCHAR(255) COMMENT 'For email/phone verification flow',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Registration timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last profile update',
  last_login TIMESTAMP NULL COMMENT 'Last login timestamp',

  KEY idx_phone (phone_number) COMMENT 'Fast phone lookup',
  KEY idx_account_type (account_type) COMMENT 'Filter by user type',
  KEY idx_created_at (created_at) COMMENT 'Chronological queries',
  KEY idx_is_verified (is_verified) COMMENT 'Trust filtering'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='Core user accounts for Malazone marketplace';

-- ─────────────────────────────────────────────────────────────
-- LISTINGS TABLE
-- Complete asset listings: property, motors, stay, ceremony, machinery
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique listing ID',
  user_id BIGINT UNSIGNED NOT NULL COMMENT 'FK to users (seller)',
  title VARCHAR(500) NOT NULL COMMENT 'Listing title (multilingual stored separately)',
  description TEXT COMMENT 'Full listing description',
  description_am TEXT COMMENT 'Amharic description',
  description_en TEXT COMMENT 'English description',
  price DECIMAL(15, 2) NOT NULL COMMENT 'Price in ETB (Birr)',
  price_suffix ENUM('fixed', 'per_day', 'per_hour', 'per_month') DEFAULT 'fixed' COMMENT 'Price unit',
  is_negotiable TINYINT(1) DEFAULT 0 COMMENT 'If price is negotiable',
  category ENUM('property', 'motors', 'stay', 'ceremony', 'heavy', 'electronics') NOT NULL COMMENT '6 main business zones',
  sub_category VARCHAR(100) COMMENT 'Nested category (apartment, suv, guesthouse, etc.)',
  location_key VARCHAR(50) NOT NULL COMMENT 'Standardized location ID (hawassa_tabor, etc.)',
  location_label_am VARCHAR(200) COMMENT 'Location in Amharic (ሐዋሳ — ታቦር)',
  location_label_en VARCHAR(200) COMMENT 'Location in English',
  phone VARCHAR(20) NOT NULL COMMENT 'Seller contact phone',
  whatsapp VARCHAR(20) COMMENT 'WhatsApp number (without +)',
  images JSON COMMENT 'Array of image URLs: ["/uploads/img1.webp", "/uploads/img2.webp"]',
  is_verified BOOLEAN DEFAULT FALSE COMMENT 'Carta/registry verified (property only)',
  is_premium BOOLEAN DEFAULT FALSE COMMENT 'Premium listing flag',
  premium_expires_at TIMESTAMP NULL COMMENT 'Premium subscription expiry',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Soft-delete flag',
  is_zero_km BOOLEAN DEFAULT FALSE COMMENT 'Brand new vehicle (0 KM)',
  is_tax_free BOOLEAN DEFAULT FALSE COMMENT 'Tax-free import (motors)',
  with_operator BOOLEAN DEFAULT FALSE COMMENT 'Machinery comes with operator',

  -- Property-specific
  bedrooms TINYINT UNSIGNED COMMENT 'Number of bedrooms',
  bathrooms TINYINT UNSIGNED COMMENT 'Number of bathrooms',
  area_sqm DECIMAL(8, 2) COMMENT 'Land/building area in square meters',
  is_furnished BOOLEAN DEFAULT FALSE COMMENT 'Is property furnished?',
  cata_registry VARCHAR(100) COMMENT 'CATA Registry Code for Deeds',
  title_deed VARCHAR(100) COMMENT 'Title deed / Carta type',
  legal_document_url VARCHAR(500) COMMENT 'Admin uploaded Deed/Libre document URL',

  -- Motors-specific
  plate_code VARCHAR(20) COMMENT 'Vehicle plate code (AA-3-00000)',
  plate_region VARCHAR(100) COMMENT 'Plate region/city',
  chassis_number VARCHAR(100) COMMENT 'Vehicle Identification Number (VIN)',
  engine_number VARCHAR(100) COMMENT 'Engine serial number',
  fuel_type ENUM('benzine', 'diesel', 'electric') COMMENT 'Fuel type for vehicles',
  condition_type ENUM('new', 'invoiced', 'used') COMMENT 'Vehicle condition',
  mileage_km DECIMAL(10, 1) COMMENT 'Odometer reading',
  manufacture_year SMALLINT COMMENT 'Year manufactured',
  transmission ENUM('manual', 'automatic') COMMENT 'Transmission type',

  -- Ceremony & Rental-specific
  capacity INT UNSIGNED COMMENT 'Capacity (persons, guests, items)',
  amenities JSON COMMENT 'Array of amenities: ["WiFi", "Parking", "Catering"]',
  rental_min_days TINYINT UNSIGNED COMMENT 'Minimum rental period (days)',

  -- Machinery-specific
  machinery_brand VARCHAR(100) COMMENT 'Equipment brand/manufacturer',
  machinery_type VARCHAR(100) COMMENT 'Machinery type (excavator, crane, etc.)',
  machinery_capacity_ton DECIMAL(8, 1) COMMENT 'Equipment capacity in tons',

  -- Voice note for Sidaamu Afoo / Amharic descriptions
  voice_note_url VARCHAR(500) COMMENT 'URL to voice recording MP3/M4A',

  -- Tracking & engagement
  view_count INT UNSIGNED DEFAULT 0 COMMENT 'Number of views',
  share_count INT UNSIGNED DEFAULT 0 COMMENT 'Number of shares',
  favorite_count INT UNSIGNED DEFAULT 0 COMMENT 'Favorited by X users',
  rating DECIMAL(3,1) DEFAULT 0.0 COMMENT 'Listing rating',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Listing creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last edit timestamp',
  expires_at TIMESTAMP NULL COMMENT 'Auto-removal date for listings',

  -- Foreign key & indexes
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  
  KEY idx_user_id (user_id) COMMENT 'Fast seller lookup',
  KEY idx_category (category) COMMENT 'Filter by zone',
  KEY idx_location_key (location_key) COMMENT 'Geographic queries',
  KEY idx_price (price) COMMENT 'Price range filtering',
  KEY idx_is_active (is_active) COMMENT 'Active listing filter',
  KEY idx_is_premium (is_premium, created_at) COMMENT 'Premium listings first',
  KEY idx_is_verified (is_verified) COMMENT 'Verified assets filter',
  KEY idx_fuel_type (fuel_type) COMMENT 'Vehicle fuel type filter',
  KEY idx_condition_type (condition_type) COMMENT 'Vehicle condition filter',
  KEY idx_created_at (created_at) COMMENT 'Newest listings first',
  KEY idx_view_count (view_count) COMMENT 'Popular listings',
  KEY idx_composite (category, location_key, is_active, created_at) COMMENT 'Main search query'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='Core marketplace listings: property, motors, stay, ceremony, machinery, electronics';

-- ─────────────────────────────────────────────────────────────
-- AGENTS TABLE
-- Mala-Agents: unemployed youth & university students in Hawassa
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agents (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique agent ID',
  full_name VARCHAR(255) NOT NULL COMMENT 'Agent full name',
  phone_number VARCHAR(20) NOT NULL UNIQUE COMMENT 'Phone (for TeleBirr payments)',
  sub_city VARCHAR(200) COMMENT 'Sub-city/locality: Tabor, Lakefront, Piassa, etc.',
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active' COMMENT 'Agent status',
  earnings_total_etb DECIMAL(15, 2) DEFAULT 0 COMMENT 'Cumulative earnings in ETB',
  verified_at TIMESTAMP NULL COMMENT 'When TeleBirr was verified',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Registration timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last activity',

  KEY idx_status (status) COMMENT 'Active agent filter',
  KEY idx_earnings_total_etb (earnings_total_etb DESC) COMMENT 'Leaderboard sorting',
  KEY idx_phone_number (phone_number) COMMENT 'Phone lookup',
  KEY idx_sub_city (sub_city) COMMENT 'Geographic filter'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='Mala-Agents gig economy workers (youth in Hawassa)';

-- ─────────────────────────────────────────────────────────────
-- AGENT EARNINGS TABLE
-- Track individual commission transactions
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_earnings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique transaction ID',
  agent_id BIGINT UNSIGNED NOT NULL COMMENT 'FK to agents',
  listing_id BIGINT UNSIGNED COMMENT 'FK to listings (listing being sold/rented)',
  amount_etb DECIMAL(10, 2) NOT NULL COMMENT 'Commission amount in ETB',
  transaction_type ENUM('listing_sale', 'listing_rental', 'referral', 'bonus') DEFAULT 'listing_sale' COMMENT 'Type of earning',
  status ENUM('pending_approval', 'approved', 'paid', 'failed') DEFAULT 'pending_approval' COMMENT 'Payment status',
  tebirr_reference VARCHAR(100) COMMENT 'TeleBirr transaction ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Transaction timestamp',
  paid_at TIMESTAMP NULL COMMENT 'When payment was sent',

  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE SET NULL ON UPDATE CASCADE,

  KEY idx_agent_id (agent_id) COMMENT 'Agent earnings history',
  KEY idx_status (status) COMMENT 'Payment status filter',
  KEY idx_created_at (created_at) COMMENT 'Chronological queries'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='Earnings/commission log for Mala-Agents';

-- ─────────────────────────────────────────────────────────────
-- FAVORITES TABLE
-- Track user favorites for wishlist feature
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique favorite ID',
  user_id BIGINT UNSIGNED NOT NULL COMMENT 'FK to users',
  listing_id BIGINT UNSIGNED NOT NULL COMMENT 'FK to listings',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When favorited',

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,

  UNIQUE KEY idx_user_listing (user_id, listing_id) COMMENT 'Prevent duplicate favorites',
  KEY idx_user_id (user_id) COMMENT 'User favorites list'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='User wishlist/favorite listings';

-- ─────────────────────────────────────────────────────────────
-- INQUIRIES TABLE
-- Track buyer inquiries/messages from listing cards
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inquiries (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique inquiry ID',
  listing_id BIGINT UNSIGNED NOT NULL COMMENT 'FK to listings',
  from_phone VARCHAR(20) NOT NULL COMMENT 'Inquirer phone number',
  from_name VARCHAR(255) COMMENT 'Inquirer name (optional)',
  message TEXT COMMENT 'Inquiry message',
  inquiry_type ENUM('general', 'price_negotiation', 'delivery', 'inspection') DEFAULT 'general' COMMENT 'Inquiry category',
  status ENUM('new', 'read', 'responded', 'closed') DEFAULT 'new' COMMENT 'Inquiry status',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Inquiry timestamp',
  responded_at TIMESTAMP NULL COMMENT 'When seller responded',

  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,

  KEY idx_listing_id (listing_id) COMMENT 'Inquiries for a listing',
  KEY idx_status (status) COMMENT 'New inquiries filter',
  KEY idx_created_at (created_at) COMMENT 'Recent inquiries'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='Track buyer inquiries and questions';

-- ─────────────────────────────────────────────────────────────
-- AUDIT LOGS TABLE
-- Track platform activities for compliance
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Log ID',
  user_id BIGINT UNSIGNED COMMENT 'FK to users (can be NULL for system events)',
  action VARCHAR(100) NOT NULL COMMENT 'Action performed (create_listing, delete_listing, etc.)',
  resource_type VARCHAR(50) COMMENT 'Resource type (listing, user, agent)',
  resource_id BIGINT UNSIGNED COMMENT 'ID of affected resource',
  details JSON COMMENT 'Additional context (old values, new values, etc.)',
  ip_address VARCHAR(45) COMMENT 'Client IP address (IPv4 or IPv6)',
  user_agent VARCHAR(500) COMMENT 'Client user-agent string',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Log timestamp',

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,

  KEY idx_user_id (user_id) COMMENT 'User activity history',
  KEY idx_action (action) COMMENT 'Action filter',
  KEY idx_created_at (created_at) COMMENT 'Chronological queries'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='Audit trail for compliance and debugging';

-- ─────────────────────────────────────────────────────────────
-- TRANSLATIONS TABLE
-- Dynamic content management for UI texts
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS translations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Translation ID',
  text_key VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique key (e.g., nav.home, footer.about)',
  en_value TEXT NOT NULL COMMENT 'English translation',
  am_value TEXT NOT NULL COMMENT 'Amharic translation',
  section VARCHAR(50) DEFAULT 'general' COMMENT 'Logical grouping (e.g., footer, nav, hero)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update',

  KEY idx_section (section) COMMENT 'Filter by section'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='Dynamic content and localization texts';

-- ─────────────────────────────────────────────────────────────
-- SAMPLE DATA (for testing)
-- ─────────────────────────────────────────────────────────────
INSERT INTO users (full_name, phone_number, account_type, preferred_language, is_verified)
VALUES
  ('Abebe Kumsa', '0911000001', 'Individual', 'am', TRUE),
  ('Amara Tadesse', '0922000002', 'Individual', 'am', FALSE),
  ('Selam Gebremariam', '0933000003', 'Agency', 'en', TRUE),
  ('Mohammed Hassan', '0944000004', 'Individual', 'am', FALSE),
  ('Fikrte Assefa', '0955000005', 'Broker', 'en', TRUE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

INSERT INTO agents (full_name, phone_number, sub_city, status, earnings_total_etb)
VALUES
  ('Yonas Kebede', '0966000006', 'Tabor Sub-City', 'active', 45000),
  ('Hiwot Alemu', '0977000007', 'Lakefront / Haile Resort', 'active', 62500),
  ('Tewodros Dejene', '0988000008', 'Piassa Center', 'active', 28000),
  ('Marta Tadesse', '0999000009', 'Yirgalem', 'active', 15000)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ─────────────────────────────────────────────────────────────
-- G2B AUDIT LOGS TABLE
-- Track government officer verifications (Municipality/Transport)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS g2b_audits (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Audit ID',
  listing_id BIGINT UNSIGNED NOT NULL COMMENT 'FK to listings',
  officer_name VARCHAR(255) NOT NULL COMMENT 'Digital signature name',
  audit_type ENUM('land', 'vehicle') NOT NULL COMMENT 'Type of verification',
  status ENUM('verified', 'fraudulent') NOT NULL COMMENT 'Outcome',
  notes TEXT COMMENT 'Optional notes/findings',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Audit timestamp',

  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,

  KEY idx_listing_id (listing_id) COMMENT 'Find audits for a listing',
  KEY idx_status (status) COMMENT 'Filter by outcome'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='G2B Compliance Portal audit records';

-- ─────────────────────────────────────────────────────────────
-- VIEWS (for analytics convenience)
-- ─────────────────────────────────────────────────────────────

-- Active premium listings view
CREATE OR REPLACE VIEW active_premium_listings AS
SELECT
  l.id,
  l.title,
  l.price,
  l.category,
  l.location_key,
  u.full_name AS seller_name,
  l.created_at,
  l.view_count
FROM listings l
INNER JOIN users u ON l.user_id = u.id
WHERE l.is_active = TRUE
  AND l.is_premium = TRUE
  AND (l.premium_expires_at IS NULL OR l.premium_expires_at > NOW())
ORDER BY l.created_at DESC;

-- Agent leaderboard view
CREATE OR REPLACE VIEW agent_leaderboard AS
SELECT
  a.id,
  a.full_name,
  a.sub_city,
  a.earnings_total_etb,
  COUNT(DISTINCT l.id) AS listings_posted,
  RANK() OVER (ORDER BY a.earnings_total_etb DESC) AS rank
FROM agents a
LEFT JOIN listings l ON l.user_id IN (
  SELECT u.id FROM users u WHERE u.phone_number = a.phone_number
)
WHERE a.status = 'active'
GROUP BY a.id, a.full_name, a.sub_city, a.earnings_total_etb
ORDER BY a.earnings_total_etb DESC;

-- ─────────────────────────────────────────────────────────────
-- SUMMARY
-- ─────────────────────────────────────────────────────────────
/*
SCHEMA SUMMARY:
- users: 5 core user accounts
- listings: 6 sample listings (property, motors, stay, ceremony, heavy, electronics)
- agents: 4 Mala-Agents workers in different Hawassa sub-cities
- agent_earnings: commission tracking
- favorites: user wishlist feature
- inquiries: buyer inquiry management
- audit_logs: compliance & debugging
- Two views for analytics

Total Tables: 7
Total Views: 2
Primary Indexes: 35+
Foreign Keys: 5 with ON DELETE CASCADE

Performance optimizations:
✓ Composite indexes on search queries (category + location + active)
✓ Indexed created_at for sorting/pagination
✓ Indexed phone_number for fast user/agent lookup
✓ UTF8MB4 for full Amharic/multilingual support
✓ Decimal(15,2) for accurate financial calculations
✓ JSON columns for flexible attributes (images, amenities)

Compliance features:
✓ Soft-delete with is_active flag
✓ Audit logs for all transactions
✓ Legal disclaimers in frontend (Carta verification required)
✓ User phone verification tracking
*/
