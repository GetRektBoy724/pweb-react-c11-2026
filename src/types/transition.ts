import type { Application } from "./application";
import type { WorkMode } from "./common";

/** Data tambahan yang dibutuhkan saat pindah status (syarat pindah status). */
export interface TransitionPayload {
  /** Wajib saat ke APPLIED. */
  cvVersion?: string;
  /** Wajib saat ke APPLIED, format YYYY-MM-DD. */
  appliedDate?: string;
  /** Wajib saat ke INTERVIEW, format YYYY-MM-DDTHH:mm. */
  interviewDateTime?: string;
  /** Wajib > 0 saat ke OFFER. */
  salaryOffer?: number;
  /** Wajib saat ke OFFER. */
  workMode?: WorkMode;
}

export type TransitionValidation =
  | { ok: true }
  | { ok: false; field?: keyof TransitionPayload; message: string };

export type TransitionApplyResult =
  | { ok: true; application: Application }
  | { ok: false; field?: keyof TransitionPayload; message: string };