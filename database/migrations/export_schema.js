/**
 * export_schema.js
 * Regenerates database/schema.sql from the LIVE database.
 *
 * Why: the hand-maintained schema.sql had drifted badly from reality
 * (missing CMS tables, outdated audit_logs/g2b_audits definitions,
 * BIGINT vs INT mismatches). This script makes the live DB the single
 * source of truth.
 *
 * Usage:  node database/migrations/export_schema.js
 */
const fs = require('fs');
const path = require('path');
const db = require('../db');

async function exportSchema() {
  try {
    const [tables] = await db.execute('SHOW TABLES');
    const names = tables.map((row) => Object.values(row)[0]).sort();

    const sections = [];
    sections.push('-- Malazone.com - Database Schema');
    sections.push(`-- AUTO-GENERATED from live MySQL database on ${new Date().toISOString()}`);
    sections.push('-- Regenerate with:  node database/migrations/export_schema.js');
    sections.push('-- (c) 2026 Malazone Technologies PLC');
    sections.push('');
    sections.push('SET FOREIGN_KEY_CHECKS = 0;');
    sections.push('');

    for (const name of names) {
      const [rows] = await db.execute(`SHOW CREATE TABLE \`${name}\``);
      const ddl = rows[0]['Create Table'];
      if (!ddl) throw new Error(`Unexpected SHOW CREATE TABLE output for ${name}`);
      sections.push('-- ---------------------------------------------------------');
      sections.push(`-- Table: ${name}`);
      sections.push('-- ---------------------------------------------------------');
      sections.push(`${ddl};`);
      sections.push('');
    }

    sections.push('SET FOREIGN_KEY_CHECKS = 1;');
    sections.push('');

    const outPath = path.join(__dirname, '..', 'schema.sql');
    fs.writeFileSync(outPath, sections.join('\n'), 'utf8');
    console.log(`OK schema.sql regenerated (${names.length} tables): ${outPath}`);
    process.exit(0);
  } catch (error) {
    console.error('Export failed:', error.message);
    process.exit(1);
  }
}

exportSchema();
