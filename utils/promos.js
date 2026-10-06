/**
 * utils/promos.js
 * Malazone.com — Listing promotion (boost/featured) helpers.
 * Server-side package config, payment instructions, order references,
 * and the premium-expiry janitor. Amounts always come from the `packages`
 * table — the client never supplies a price.
 */

"use strict";

const db = require("../database/db");

const PROMO_METHODS = new Set(["telebirr", "cbe"]);
const ACTIVE_ORDER_STATUSES = ["pending", "submitted", "verified"];

/**
 * Manual payment instructions. Account numbers are injected via env so the
 * real pockets never live in the repo:
 *   PAYMENT_TELEBIRR_NUMBER / PAYMENT_TELEBIRR_NAME
 *   PAYMENT_CBE_NUMBER / PAYMENT_CBE_NAME
 */
function getPaymentConfig() {
  return {
    telebirr: {
      label: "Telebirr",
      account_name: process.env.PAYMENT_TELEBIRR_NAME || "Malazone Technologies PLC",
      account_number: process.env.PAYMENT_TELEBIRR_NUMBER || "0911000000",
      note_en:
        process.env.PAYMENT_NOTE_EN ||
        "Send via Telebirr. Write your payment reference in the note field, then upload the confirmation screenshot below.",
      note_am:
        process.env.PAYMENT_NOTE_AM ||
        "በቴሌብር ይላኩ። በማስታወሻው የክፍያ መለያዎን (Reference) ይጻፉ እና ማስረጃ ስክሪንሾት ይስቀሉ።",
    },
    cbe: {
      label: "CBE Birr",
      bank: process.env.PAYMENT_CBE_BANK || "Commercial Bank of Ethiopia",
      account_name: process.env.PAYMENT_CBE_NAME || "Malazone Technologies PLC",
      account_number: process.env.PAYMENT_CBE_NUMBER || "1000000000000",
      note_en:
        process.env.PAYMENT_CBE_NOTE_EN ||
        "Transfer via CBE Birr. Use the payment reference as the transfer memo, then upload the confirmation screenshot below.",
      note_am:
        process.env.PAYMENT_CBE_NOTE_AM ||
        "በCBE በር ያስተላልፉ። የክፍያ መለያዎን በማስገቢያ ማስታወሻ ይጠቀሙ እና ማስረጃ ስክሪንሾት ይስቀሉ።",
    },
  };
}

async function getPackages() {
  const [rows] = await db.execute(
    `SELECT id, slug, name_en, name_am, price_etb, duration_days, features, is_active
     FROM packages WHERE is_active = 1 ORDER BY price_etb ASC, sort_order ASC`
  );
  return rows.map((r) => ({
    ...r,
    features: typeof r.features === "string" ? JSON.parse(r.features) : r.features,
  }));
}

function generatePromoReference(userId) {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `MZ-${Number(userId) || 0}-${random}`;
}

/**
 * Lazy janitor, safe to run before any catalog query:
 *  - clears is_premium on listings whose paid window lapsed and no verified
 *    promo still covers them
 *  - expires stale unpaid orders (> 3 days) so the seller can re-order
 */
async function expireExpiredPremiums() {
  await db.execute(`
    UPDATE listings l
    SET l.is_premium = 0
    WHERE l.is_premium = 1
      AND l.premium_until IS NOT NULL
      AND l.premium_until <= NOW()
      AND NOT EXISTS (
        SELECT 1 FROM listing_promos p
        WHERE p.listing_id = l.id AND p.status = 'verified' AND p.expires_at > NOW()
      )
  `);
  await db.execute(`
    UPDATE listing_promos SET status = 'expired'
    WHERE status = 'pending' AND created_at < NOW() - INTERVAL 3 DAY
  `);
}

module.exports = {
  PROMO_METHODS,
  ACTIVE_ORDER_STATUSES,
  getPaymentConfig,
  getPackages,
  generatePromoReference,
  expireExpiredPremiums,
};