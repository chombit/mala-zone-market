/**
 * Migration 002: Repair Listings Table Auto-Increment
 * Malazone.com — Fix ER_AUTOINC_READ_FAILED error
 * © 2026 Malazone Technologies PLC
 *
 * This migration repairs the listings table to fix the auto-increment error
 * that occurs when inserting new listings.
 */

-- Step 1: Check the table for any corruption
CHECK TABLE listings;

-- Step 2: Repair the table to fix any corruption issues
REPAIR TABLE listings;

-- Step 3: Optimize the table to reclaim space and rebuild indexes
OPTIMIZE TABLE listings;

-- Step 4: Reset the auto-increment counter to a safe value
-- This ensures the counter is properly synchronized with the actual data
SET @max_id = (SELECT COALESCE(MAX(id), 0) FROM listings);
SET @sql = CONCAT('ALTER TABLE listings AUTO_INCREMENT = ', @max_id + 1);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 5: Verify the repair was successful
CHECK TABLE listings;
