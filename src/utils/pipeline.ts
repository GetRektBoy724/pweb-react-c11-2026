import type { Application, ApplicationStatus } from "../types";
import { isGhostingRisk } from "./ghosting";

export type SortMode = "newest" | "interview" | "offer";

export interface PipelineFilters {
  query: string;
  status: ApplicationStatus | "ALL";
  onlyGhosting: boolean;
  sort: SortMode;
}

export const DEFAULT_FILTERS: PipelineFilters = {
  query: "",
  status: "ALL",
  onlyGhosting: false,
  sort: "newest",
};

/** Rank interview: yang akan datang (terdekat dulu), lalu lewat, lalu tanpa jadwal. */
function interviewRank(app: Application, nowMs: number): [number, number] {
  if (!app.interviewDateTime) return [2, 0];
  const t = Date.parse(app.interviewDateTime);
  if (Number.isNaN(t)) return [2, 0];
  return t >= nowMs ? [0, t] : [1, -t];
}

/** Filter gabungan + sorting. Pure function, hasilnya array baru. */
export function filterAndSortApplications(
  applications: Application[],
  filters: PipelineFilters,
  now: Date = new Date(),
): Application[] {
  const q = filters.query.trim().toLowerCase();
  const nowMs = now.getTime();

  const filtered = applications.filter((app) => {
    const matchesQuery =
      q === "" ||
      app.company.toLowerCase().includes(q) ||
      app.role.toLowerCase().includes(q);
    const matchesStatus = filters.status === "ALL" || app.status === filters.status;
    const matchesGhost = !filters.onlyGhosting || isGhostingRisk(app, now);
    return matchesQuery && matchesStatus && matchesGhost;
  });

  return [...filtered].sort((a, b) => {
    switch (filters.sort) {
      case "interview": {
        const [ra, ta] = interviewRank(a, nowMs);
        const [rb, tb] = interviewRank(b, nowMs);
        return ra !== rb ? ra - rb : ta - tb;
      }
      case "offer":
        return (b.salaryOffer ?? -1) - (a.salaryOffer ?? -1);
      default:
        return Date.parse(b.lastUpdatedAt) - Date.parse(a.lastUpdatedAt);
    }
  });
}