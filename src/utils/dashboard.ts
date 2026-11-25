import type { Application } from "../types";
import { isGhostingRisk } from "./ghosting";

/** Statistik dashboard yang dihitung langsung dari daftar lamaran. */
export interface ApplicationStatistics {
  totalApplications: number;
  responseRate: number;
  interviewRate: number;
  ghostingRiskCount: number;
  totalOffers: number;
}

/**
 * Hitung statistik dashboard sebagai derived data, tanpa menyimpan salinan
 * statistik ke state. Persentase memakai total lamaran sebagai penyebut.
 * Screening, Interview, Offer, dan Rejected dianggap sudah mendapat respons.
 */
export function calculateApplicationStatistics(
  applications: Application[],
  now: Date = new Date(),
): ApplicationStatistics {
  const totalApplications = applications.length;
  if (totalApplications === 0) {
    return {
      totalApplications: 0,
      responseRate: 0,
      interviewRate: 0,
      ghostingRiskCount: 0,
      totalOffers: 0,
    };
  }

  const respondedCount = applications.filter(
    (application) =>
      application.status === "SCREENING" ||
      application.status === "INTERVIEW" ||
      application.status === "OFFER" ||
      application.status === "REJECTED",
  ).length;
  const interviewCount = applications.filter(
    (application) =>
      application.status === "INTERVIEW" ||
      application.status === "OFFER" ||
      application.interviewDateTime !== undefined,
  ).length;
  const ghostingRiskCount = applications.filter((application) =>
    isGhostingRisk(application, now),
  ).length;
  const totalOffers = applications.filter(
    (application) => application.status === "OFFER",
  ).length;

  return {
    totalApplications,
    responseRate: Math.round((respondedCount / totalApplications) * 100),
    interviewRate: Math.round((interviewCount / totalApplications) * 100),
    ghostingRiskCount,
    totalOffers,
  };
}
