import type { Application } from "../types";

export const CONFLICT_THRESHOLD_MINUTES = 60;

export interface InterviewConflict {
  a: Application;
  b: Application;
  diffMinutes: number;
}

/**
 * Cari pasangan lamaran INTERVIEW yang berselisih < 60 menit.
 * Wajib dipanggil dengan SELURUH data (bukan hasil filter).
 */
export function findInterviewConflicts(
  applications: Application[],
): InterviewConflict[] {
  const items = applications
    .flatMap((app) => {
      if (app.status !== "INTERVIEW" || !app.interviewDateTime) return [];
      const time = Date.parse(app.interviewDateTime);
      return Number.isNaN(time) ? [] : [{ app, time }];
    })
    .sort((x, y) => x.time - y.time);

  const conflicts: InterviewConflict[] = [];
  for (let i = 0; i < items.length; i++) {
    const first = items[i];
    if (!first) continue;
    for (let j = i + 1; j < items.length; j++) {
      const second = items[j];
      if (!second) continue;
      const diffMinutes = (second.time - first.time) / 60000;
      if (diffMinutes >= CONFLICT_THRESHOLD_MINUTES) break;
      conflicts.push({ a: first.app, b: second.app, diffMinutes });
    }
  }
  return conflicts;
}