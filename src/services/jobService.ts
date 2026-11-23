import type { JobListing } from "../types";

const REMOTIVE_URL =
  "https://remotive.com/api/remote-jobs?category=software-dev&limit=30";
const FALLBACK_URL = "/magang-fallback.json";

interface RemotiveJob {
  id: number;
  title: string;
  company_name: string;
  category: string;
  candidate_required_location: string;
  salary: string;
  tags: string[];
}

/** Normalisasi satu item Remotive ke shape JobListing yang kita pakai. */
function normalize(job: RemotiveJob): JobListing {
  return {
    id: job.id,
    title: job.title,
    company_name: job.company_name,
    category: job.category,
    candidate_required_location: job.candidate_required_location,
    salary: job.salary ?? "-",
    tags: job.tags ?? [],
  };
}

/**
 * Ambil lowongan dari Remotive API. Penerima AbortController wajib
 * agar fetch bisa dibatalkan saat unmount / re-render.
 * Melempar Error dengan pesan ramah saat gagal (offline, dsb.).
 */
export async function fetchRemoteJobs(
  signal: AbortSignal,
): Promise<JobListing[]> {
  const response = await fetch(REMOTIVE_URL, { signal });
  if (!response.ok) {
    throw new Error(`Remotive API merespons ${response.status}`);
  }
  const data: { jobs?: RemotiveJob[] } = await response.json();
  const jobs = data.jobs ?? [];
  return jobs.map(normalize);
}

/** Ambil dataset fallback lokal (15 lowongan, format sama dengan Remotive). */
export async function fetchFallbackJobs(
  signal: AbortSignal,
): Promise<JobListing[]> {
  const response = await fetch(FALLBACK_URL, { signal });
  if (!response.ok) {
    throw new Error(`Fallback lokal gagal dimuat (${response.status})`);
  }
  const jobs: RemotiveJob[] = await response.json();
  return jobs.map(normalize);
}
