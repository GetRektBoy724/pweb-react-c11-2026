import type { ActivityLog } from "../types";

/** Buat satu entri log baru (pure, tidak menyentuh state). */
export function createActivityLog(
  message: string,
  now: Date = new Date(),
): ActivityLog {
  return {
    id: crypto.randomUUID(),
    timestamp: now.toISOString(),
    message,
  };
}

/** Kembalikan array log baru dengan satu entri ditambahkan (immutable). */
export function appendActivityLog(
  logs: ActivityLog[],
  message: string,
  now: Date = new Date(),
): ActivityLog[] {
  return [...logs, createActivityLog(message, now)];
}