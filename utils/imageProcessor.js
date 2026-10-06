/**
 * utils/imageProcessor.js
 * Malazone.com — Shared image processing pipeline.
 *
 * Single source of truth for the upload pipeline so every route
 * (listings, agents, admin) renders identically:
 *
 *   sharp → resize (1200px, inside) → optional watermark → WebP (80)
 *
 * Watermarking is applied at upload time and is DESTRUCTIVE — only the
 * watermarked WebP is written to disk, so there is no unwatermarked
 * original sitting on the public /uploads mount for scrapers to grab.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// WebP renders SVG via librsvg using the host's fontconfig. A stack covering
// Latin + Ethiopic (Ge'ez) keeps Amharic seller names legible where a font is
// installed (Noto Sans Ethiopic on most Linux servers; Segoe UI on Windows).
const FONT_STACK =
  "'Segoe UI', 'Noto Sans Ethiopic', 'Noto Sans', 'DejaVu Sans', sans-serif";

function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncate(text, max = 26) {
  const s = String(text || "").trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

/**
 * Build an SVG overlay for the given canvas size:
 *  - faint repeating diagonal text band (anti-crop)
 *  - translucent brand + seller chip (bottom-right, legible)
 */
function buildWatermarkSvg({ name, brand, width, height, opacity }) {
  const safeName = escapeXml(truncate(name));
  const safeBrand = escapeXml(brand || "MALAZONE");
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const pad = 14;
  const chipW = Math.min(w * 0.55, 460);
  const chipH = 62;
  const chipX = w - chipW - pad;
  const chipY = h - chipH - pad;
  const line = `${safeName} • ${safeBrand}`;
  const fsName = Math.max(20, Math.round(chipW * 0.09));
  const fsBrand = Math.max(15, Math.round(chipW * 0.055));

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
    `<defs>`,
    `<pattern id="tile" width="320" height="320" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">`,
    `<text x="14" y="170" font-family="${FONT_STACK}" font-size="18" font-weight="700" fill="#FFFFFF" fill-opacity="${opacity}">${line}</text>`,
    `</pattern>`,
    `</defs>`,
    `<rect width="${w}" height="${h}" fill="url(#tile)"/>`,
    `<rect x="${chipX}" y="${chipY}" width="${chipW}" height="${chipH}" rx="12" fill="#0B132B" fill-opacity="0.58" stroke="#00A86B" stroke-opacity="0.45"/>`,
    `<text x="${chipX + 16}" y="${chipY + 29}" font-family="${FONT_STACK}" font-size="${fsBrand}" font-weight="700" fill="#00A86B">${safeBrand}</text>`,
    `<text x="${chipX + 16}" y="${chipY + 51}" font-family="${FONT_STACK}" font-size="${fsName}" font-weight="600" fill="#FFFFFF">${safeName}</text>`,
    `</svg>`,
  ].join("");
}

/**
 * processImage(buffer, opts?)
 * Optimizes and persists an uploaded photo. With `opts.watermark` set the
 * seller/agent/brand identity is composited into the image before the
 * original buffer is discarded.
 *
 * @param {Buffer} buffer      raw upload bytes
 * @param {{ watermark?: { name?: string, brand?: string, opacity?: number } }} opts
 * @returns {Promise<string>}  public URL path (e.g. /uploads/mala_<uuid>.webp)
 */
async function processImage(buffer, opts = {}) {
  const filename = `mala_${uuidv4()}.webp`;
  const outputPath = path.join(UPLOAD_DIR, filename);

  let pipeline;
  try {
    pipeline = sharp(buffer).resize({
      width: 1200,
      withoutEnlargement: true,
      fit: "inside",
    });
  } catch (err) {
    throw new Error(`Unsupported image format: ${err.message}`);
  }

  if (opts && opts.watermark) {
    let meta;
    try {
      meta = await sharp(buffer).metadata();
    } catch (err) {
      throw new Error(`Failed to read image metadata: ${err.message}`);
    }
    let width = meta.width;
    let height = meta.height;
    if (!width || !height) {
      width = 1000;
      height = 750;
    } else if (width > 1200) {
      height = Math.round((height * 1200) / width);
      width = 1200;
    }
    const svg = buildWatermarkSvg({
      name: opts.watermark.name,
      brand: opts.watermark.brand,
      width,
      height,
      opacity: opts.watermark.opacity ?? 0.1,
    });
    pipeline = pipeline.composite([{ input: Buffer.from(svg), top: 0, left: 0 }]);
  }

  await pipeline.webp({ quality: 80, effort: 6 }).toFile(outputPath);
  return `/uploads/${filename}`;
}

module.exports = { processImage, buildWatermarkSvg, UPLOAD_DIR };