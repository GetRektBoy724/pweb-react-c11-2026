import type { Application } from "../types";

const DAY_MS = 24 * 60 * 60 * 1000;
export const GHOSTING_THRESHOLD_DAYS = 14;

/**
 * Rawan Ghosting (derived state): APPLIED/SCREENING yang lastUpdatedAt-nya
 * lebih dari 14 hari lalu. Jangan disimpan ke state, hitung saat render.
 */
export function isGhostingRisk(app: Application, now: Date = new Date()): boolean {
  if (app.status !== "APPLIED" && app.status !== "SCREENING") return false;
  const updated = Date.parse(app.lastUpdatedAt);
  if (Number.isNaN(updated)) return false;
  return now.getTime() - updated > GHOSTING_THRESHOLD_DAYS * DAY_MS;
}

/** Simulasi +15 Hari: mundurkan lastUpdatedAt, kembalikan objek baru. */
export function simulateDaysBack(app: Application, days = 15): Application {
  const updated = Date.parse(app.lastUpdatedAt);
  const base = Number.isNaN(updated) ? Date.now() : updated;
  return { ...app, lastUpdatedAt: new Date(base - days * DAY_MS).toISOString() };
}