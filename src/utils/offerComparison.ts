import type { Application } from "../types";
import { calcSkillMatch } from "./skillMatch";

export interface OfferScore {
  applicationId: string;
  salary: number;
  normalizedSalaryScore: number;
  workModeScore: number;
  skillMatchScore: number;
  totalScore: number;
}

export interface OfferComparison {
  offerA: OfferScore;
  offerB: OfferScore;
  recommendedOfferId: string | null;
}

/** Skor mode kerja sesuai ketentuan praktikum. */
export function getWorkModeScore(
  workMode: Application["workMode"],
): number {
  switch (workMode) {
    case "Remote":
      return 100;
    case "Hybrid":
      return 75;
    case "Onsite":
      return 50;
  }
}

/**
 * Bandingkan dua offer dengan gaji tertinggi sebagai nilai normalisasi 100.
 * Total skor = gaji 50% + mode kerja 25% + skill match 25%.
 */
export function compareOffers(
  offerA: Application,
  offerB: Application,
  kaptenSkills: string[],
): OfferComparison {
  const salaryA = offerA.salaryOffer ?? 0;
  const salaryB = offerB.salaryOffer ?? 0;
  const highestSalary = Math.max(salaryA, salaryB);

  const scoreOffer = (offer: Application, salary: number): OfferScore => {
    const normalizedSalaryScore =
      highestSalary > 0 ? (salary / highestSalary) * 100 : 0;
    const workModeScore = getWorkModeScore(offer.workMode);
    const skillMatchScore = calcSkillMatch(
      kaptenSkills,
      offer.requiredSkills,
    ).score;

    return {
      applicationId: offer.id,
      salary,
      normalizedSalaryScore,
      workModeScore,
      skillMatchScore,
      totalScore:
        normalizedSalaryScore * 0.5 +
        workModeScore * 0.25 +
        skillMatchScore * 0.25,
    };
  };

  const scoredA = scoreOffer(offerA, salaryA);
  const scoredB = scoreOffer(offerB, salaryB);

  return {
    offerA: scoredA,
    offerB: scoredB,
    recommendedOfferId:
      scoredA.totalScore === scoredB.totalScore
        ? null
        : scoredA.totalScore > scoredB.totalScore
          ? scoredA.applicationId
          : scoredB.applicationId,
  };
}
