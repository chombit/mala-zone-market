/**
 * dbLabel.ts — Sprint 9b
 * Three-way picker for DB-driven labels (label_en / label_am / label_sid).
 *
 * Sidaamu Afoo falls back to Amharic when a row predates label_sid, so a
 * partially migrated table never renders empty strings. Any row shape with
 * optional snake_case label columns works — locations rows, sub_zones JSON
 * entries, category_attributes defs, etc.
 *
 * © 2026 Malazone Technologies PLC
 */

import type { Language } from "../i18n";

export interface DbLabeled {
  label_en?: string | null;
  label_am?: string | null;
  label_sid?: string | null;
}

export function pickDbLabel<T extends DbLabeled>(
  row: T | null | undefined,
  language: Language
): string {
  if (!row) return "";
  if (language === "sidamu") return row.label_sid || row.label_am || row.label_en || "";
  if (language === "amharic") return row.label_am || row.label_en || "";
  return row.label_en || row.label_am || "";
}
