import type { Application, ApplicationStatus, WorkMode } from "../types";

export interface ApplicationBackup {
  version: 1;
  exportedAt: string;
  applications: Application[];
  kaptenSkills: string[];
}

const APPLICATION_STATUSES: readonly string[] = [
  "WISHLIST",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "GHOSTED",
];

const WORK_MODES: readonly string[] = ["Remote", "Hybrid", "Onsite"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return typeof value === "string" && APPLICATION_STATUSES.includes(value);
}

function isWorkMode(value: unknown): value is WorkMode {
  return typeof value === "string" && WORK_MODES.includes(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isChecklist(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.every(
      (item: unknown) =>
        isRecord(item) &&
        typeof item.id === "string" &&
        typeof item.text === "string" &&
        typeof item.done === "boolean",
    )
  );
}

function isActivityLogs(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.every(
      (log: unknown) =>
        isRecord(log) &&
        typeof log.id === "string" &&
        typeof log.timestamp === "string" &&
        typeof log.message === "string",
    )
  );
}

function isApplication(value: unknown): value is Application {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.company !== "string" ||
    typeof value.role !== "string" ||
    !isWorkMode(value.workMode) ||
    !isApplicationStatus(value.status) ||
    !isStringArray(value.requiredSkills) ||
    typeof value.lastUpdatedAt !== "string" ||
    !isChecklist(value.checklist) ||
    !isActivityLogs(value.activityLogs)
  ) {
    return false;
  }

  const optionalStringFields = ["cvVersion", "appliedDate", "interviewDateTime"];
  if (
    optionalStringFields.some(
      (field) => value[field] !== undefined && typeof value[field] !== "string",
    )
  ) {
    return false;
  }

  return (
    value.salaryOffer === undefined ||
    (typeof value.salaryOffer === "number" && Number.isFinite(value.salaryOffer))
  );
}

/** Periksa struktur backup impor sebelum state aplikasi diganti. */
export function isApplicationBackup(value: unknown): value is ApplicationBackup {
  return (
    isRecord(value) &&
    value.version === 1 &&
    typeof value.exportedAt === "string" &&
    Array.isArray(value.applications) &&
    value.applications.every(isApplication) &&
    isStringArray(value.kaptenSkills)
  );
}
