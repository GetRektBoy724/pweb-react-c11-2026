import type { Application } from "./application";
import type { JobListing } from "./job";

/** Hasil perbandingan skill Kapten vs requiredSkills sebuah lowongan. */
export interface SkillMatch {
  /** Persentase 0-100, Math.round((cocok / total) * 100). */
  score: number;
  /** Skill lowongan yang sudah dikuasai Kapten. */
  matched: string[];
  /** Skill lowongan yang belum dikuasai Kapten. */
  missing: string[];
}

/** Status fetch lowongan untuk rendering Loading / Error / Empty. */
export type JobsFetchState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "success"; jobs: JobListing[] };

export interface AppState {
  applications: Application[];
  kaptenSkills: string[];
}
