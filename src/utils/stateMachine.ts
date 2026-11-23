import type {
  Application,
  ApplicationStatus,
  TransitionApplyResult,
  TransitionPayload,
  TransitionValidation,
} from "../types";
import { appendActivityLog } from "./activityLog";

/**
 * Tabel transisi status (Diagram State Machine).
 * OFFER dan REJECTED final. GHOSTED hanya boleh kembali ke SCREENING.
 */
export const STATUS_TRANSITIONS: Record<
  ApplicationStatus,
  readonly ApplicationStatus[]
> = {
  WISHLIST: ["APPLIED"],
  APPLIED: ["SCREENING", "REJECTED", "GHOSTED"],
  SCREENING: ["INTERVIEW", "REJECTED", "GHOSTED"],
  INTERVIEW: ["OFFER", "REJECTED", "GHOSTED"],
  GHOSTED: ["SCREENING"],
  OFFER: [],
  REJECTED: [],
};

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  WISHLIST: "Wishlist",
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  GHOSTED: "Ghosted",
};

/** Urutan tahap utama untuk tampilan stepper. */
export const STATUS_FLOW: readonly ApplicationStatus[] = [
  "WISHLIST",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
];

export const ALL_STATUSES = Object.keys(
  STATUS_TRANSITIONS,
) as ApplicationStatus[];

export function getAllowedTransitions(
  from: ApplicationStatus,
): readonly ApplicationStatus[] {
  return STATUS_TRANSITIONS[from];
}

export function canTransition(
  from: ApplicationStatus,
  to: ApplicationStatus,
): boolean {
  return STATUS_TRANSITIONS[from].includes(to);
}

export function isFinalStatus(status: ApplicationStatus): boolean {
  return STATUS_TRANSITIONS[status].length === 0;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/** Cek transisi + syarat data tujuan. Tidak mengubah apa pun. */
export function validateTransition(
  app: Application,
  to: ApplicationStatus,
  payload: TransitionPayload,
): TransitionValidation {
  if (!canTransition(app.status, to)) {
    return {
      ok: false,
      message: `Transisi ${STATUS_LABELS[app.status]} ke ${STATUS_LABELS[to]} tidak diperbolehkan.`,
    };
  }

  switch (to) {
    case "APPLIED": {
      if (!payload.cvVersion?.trim()) {
        return { ok: false, field: "cvVersion", message: "Versi CV wajib diisi." };
      }
      if (!payload.appliedDate || !DATE_RE.test(payload.appliedDate)) {
        return { ok: false, field: "appliedDate", message: "Tanggal lamar wajib diisi." };
      }
      return { ok: true };
    }
    case "INTERVIEW": {
      const dt = payload.interviewDateTime;
      if (!dt || !DATETIME_RE.test(dt) || Number.isNaN(Date.parse(dt))) {
        return {
          ok: false,
          field: "interviewDateTime",
          message: "Jadwal interview wajib diisi.",
        };
      }
      return { ok: true };
    }
    case "OFFER": {
      const salary = payload.salaryOffer;
      if (salary === undefined || Number.isNaN(salary) || salary <= 0) {
        return {
          ok: false,
          field: "salaryOffer",
          message: "Nominal offer harus lebih dari 0.",
        };
      }
      if (!payload.workMode) {
        return { ok: false, field: "workMode", message: "Mode kerja wajib dipilih." };
      }
      return { ok: true };
    }
    default:
      return { ok: true };
  }
}

/**
 * Terapkan transisi: validasi, lalu kembalikan Application BARU
 * (status, field tujuan, lastUpdatedAt, dan activity log otomatis).
 */
export function applyTransition(
  app: Application,
  to: ApplicationStatus,
  payload: TransitionPayload,
  now: Date = new Date(),
): TransitionApplyResult {
  const check = validateTransition(app, to, payload);
  if (!check.ok) return check;

  const next: Application = {
    ...app,
    status: to,
    lastUpdatedAt: now.toISOString(),
  };
  let message = `Pindah ke ${STATUS_LABELS[to]}`;

  if (to === "APPLIED") {
    next.cvVersion = payload.cvVersion?.trim();
    next.appliedDate = payload.appliedDate;
    message += ` (CV: ${next.cvVersion}, tanggal ${next.appliedDate})`;
  } else if (to === "INTERVIEW") {
    next.interviewDateTime = payload.interviewDateTime;
    message += ` (jadwal ${next.interviewDateTime?.replace("T", " ")})`;
  } else if (to === "OFFER") {
    next.salaryOffer = payload.salaryOffer;
    next.workMode = payload.workMode ?? app.workMode;
    message += ` (Rp ${(next.salaryOffer ?? 0).toLocaleString("id-ID")}, ${next.workMode})`;
  }

  next.activityLogs = appendActivityLog(app.activityLogs, `${message}.`, now);
  return { ok: true, application: next };
}