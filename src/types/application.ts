import type { ApplicationStatus, WorkMode } from "./common";

/** Item checklist persiapan di dalam satu lamaran. */
export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

/** Satu baris riwayat perubahan status / catatan manual. */
export interface ActivityLog {
  id: string;
  timestamp: string;
  message: string;
}

/** Objek utama lamaran, disimpan via useLocalStorage. */
export interface Application {
  id: string;
  company: string;
  role: string;
  workMode: WorkMode;
  status: ApplicationStatus;
  requiredSkills: string[];
  /** Wajib terisi saat status pindah ke APPLIED. */
  cvVersion?: string;
  /** Format YYYY-MM-DD, wajib saat APPLIED. */
  appliedDate?: string;
  /** Format YYYY-MM-DDTHH:mm, wajib saat INTERVIEW. */
  interviewDateTime?: string;
  /** Nominal rupiah, wajib > 0 saat OFFER. */
  salaryOffer?: number;
  /** ISO timestamp, dasar hitung Rawan Ghosting (> 14 hari). */
  lastUpdatedAt: string;
  checklist: ChecklistItem[];
  activityLogs: ActivityLog[];
}
