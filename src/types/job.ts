/**
 * Skema JobListing — bentuk data yang dibaca dari Remotive API
 * maupun fallback lokal public/magang-fallback.json (format sama).
 */
export interface JobListing {
  id: number;
  title: string;
  company_name: string;
  category: string;
  candidate_required_location: string;
  salary: string;
  /** Dipakai sebagai requiredSkills saat disimpan ke daftar lamaran. */
  tags: string[];
}
