import type { Application } from "../types";

/**
 * Anti-duplikat lamaran: pasangan company + role yang sama tidak boleh
 * dilamar dua kali, huruf besar/kecil tidak berpengaruh.
 */
export function isDuplicateApplication(
  applications: Application[],
  company: string,
  role: string,
): boolean {
  const targetCompany = company.trim().toLowerCase();
  const targetRole = role.trim().toLowerCase();
  return applications.some(
    (a) =>
      a.company.trim().toLowerCase() === targetCompany &&
      a.role.trim().toLowerCase() === targetRole,
  );
}
