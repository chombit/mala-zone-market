/**
 * Migration 001: Add Multi-City Support
 * Malazone.com — Multi-City Architecture
 * © 2026 Malazone Technologies PLC
 */

-- Add city scope to admin users
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS city_scope VARCHAR(50) DEFAULT NULL COMMENT 'NULL = super admin (all cities), specific value = city admin';

-- Add city to content tables for city-specific content management
ALTER TABLE promo_banners ADD COLUMN IF NOT EXISTS city_key VARCHAR(50) DEFAULT NULL COMMENT 'NULL = global content, specific value = city-specific';
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS city_key VARCHAR(50) DEFAULT NULL COMMENT 'NULL = global content, specific value = city-specific';
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS city_key VARCHAR(50) DEFAULT NULL COMMENT 'NULL = global content, specific value = city-specific';

-- Add city analytics table
CREATE TABLE IF NOT EXISTS city_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_key VARCHAR(50) NOT NULL,
  stat_date DATE NOT NULL,
  listings_count INT DEFAULT 0,
  users_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  revenue_etb DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_city_date (city_key, stat_date),
  INDEX idx_stats_city (city_key),
  INDEX idx_stats_date (stat_date)
) ENGINE=InnoDB;

-- Add city to users table for city-specific user management
ALTER TABLE users ADD COLUMN IF NOT EXISTS city_key VARCHAR(50) DEFAULT NULL COMMENT 'User\'s preferred city';

-- Add indexes after columns are added
ALTER TABLE admin_users ADD INDEX IF NOT EXISTS idx_admin_city (city_scope);
ALTER TABLE promo_banners ADD INDEX IF NOT EXISTS idx_banner_city (city_key);
ALTER TABLE hero_slides ADD INDEX IF NOT EXISTS idx_slide_city (city_key);
ALTER TABLE testimonials ADD INDEX IF NOT EXISTS idx_testimonial_city (city_key);
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_user_city (city_key);
