/** Status lamaran mengikuti Diagram State Machine pada soal praktikum. */
export type ApplicationStatus =
  | "WISHLIST"
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "GHOSTED";

/** Mode kerja, dipakai juga oleh Offer Comparator. */
export type WorkMode = "Remote" | "Hybrid" | "Onsite";
