import type { SkillMatch } from "../types";

/**
 * Hitung kecocokan skill Kapten terhadap requiredSkills sebuah lowongan.
 * Perbandingan case-insensitive; hasil berupa persentase 0-100.
 * Rumus sesuai soal: Math.round((jumlahCocok / totalRequired) * 100).
 */
export function calcSkillMatch(
  kaptenSkills: string[],
  requiredSkills: string[],
): SkillMatch {
  if (requiredSkills.length === 0) {
    return { score: 0, matched: [], missing: [] };
  }

  const owned = new Set(kaptenSkills.map((s) => s.trim().toLowerCase()));

  const matched: string[] = [];
  const missing: string[] = [];
  for (const required of requiredSkills) {
    if (owned.has(required.trim().toLowerCase())) {
      matched.push(required);
    } else {
      missing.push(required);
    }
  }

  const score = Math.round((matched.length / requiredSkills.length) * 100);
  return { score, matched, missing };
}

/** Warna badge Match Score: hijau >= 70, kuning 40-69, merah < 40. */
export function matchScoreVariant(score: number): "high" | "mid" | "low" {
  if (score >= 70) return "high";
  if (score >= 40) return "mid";
  return "low";
}
