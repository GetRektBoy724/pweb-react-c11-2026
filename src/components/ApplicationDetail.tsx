import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type {
  Application,
  ApplicationStatus,
  TransitionPayload,
  WorkMode,
} from "../types";
import {
  STATUS_FLOW,
  STATUS_LABELS,
  applyTransition,
  getAllowedTransitions,
  isFinalStatus,
  validateTransition,
} from "../utils/stateMachine";
import {
  addChecklistItem,
  checklistProgress,
  removeChecklistItem,
  toggleChecklistItem,
} from "../utils/checklist";
import { appendActivityLog } from "../utils/activityLog";

interface ApplicationDetailProps {
  application: Application;
  /** Update by id memakai updater, agar tidak kena stale state. */
  onUpdate: (id: string, updater: (prev: Application) => Application) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  /** Slot untuk panel tambahan, misalnya Latihan Interview (Member 3). */
  children?: ReactNode;
}

interface TransitionForm {
  cvVersion: string;
  appliedDate: string;
  interviewDateTime: string;
  salary: string;
  workMode: WorkMode;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

/** Fitur 4: detail lamaran (state machine, checklist immutable, activity log). */
export function ApplicationDetail({
  application,
  onUpdate,
  onDelete,
  onClose,
  children,
}: ApplicationDetailProps) {
  const [target, setTarget] = useState<ApplicationStatus | null>(null);
  const [form, setForm] = useState<TransitionForm>({
    cvVersion: "",
    appliedDate: "",
    interviewDateTime: "",
    salary: "",
    workMode: application.workMode,
  });
  const [error, setError] = useState("");
  const [checkText, setCheckText] = useState("");
  const [note, setNote] = useState("");

  const allowed = getAllowedTransitions(application.status);
  const progress = checklistProgress(application.checklist);

  const chooseTarget = (status: ApplicationStatus) => {
    setTarget(status);
    setError("");
  };

  const buildPayload = (): TransitionPayload => ({
    cvVersion: form.cvVersion,
    appliedDate: form.appliedDate,
    interviewDateTime: form.interviewDateTime,
    salaryOffer: form.salary === "" ? undefined : Number(form.salary),
    workMode: form.workMode,
  });

  const confirmTransition = () => {
    if (!target) return;
    const payload = buildPayload();
    const check = validateTransition(application, target, payload);
    if (!check.ok) {
      setError(check.message);
      return;
    }
    onUpdate(application.id, (prev) => {
      const result = applyTransition(prev, target, payload);
      return result.ok ? result.application : prev;
    });
    setTarget(null);
    setError("");
  };

  const submitChecklist = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (checkText.trim() === "") return;
    const text = checkText;
    onUpdate(application.id, (prev) => ({
      ...prev,
      checklist: addChecklistItem(prev.checklist, text),
    }));
    setCheckText("");
  };

  const submitNote = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = note.trim();
    if (text === "") return;
    onUpdate(application.id, (prev) => ({
      ...prev,
      activityLogs: appendActivityLog(prev.activityLogs, `Catatan: ${text}`),
    }));
    setNote("");
  };

  const logsNewestFirst = [...application.activityLogs].reverse();

  return (
    <aside className="ap-detail">
      <header className="ap-detail-head">
        <div>
          <h2>{application.role}</h2>
          <p>
            {application.company} · {application.workMode}
            {application.cvVersion ? ` · CV: ${application.cvVersion}` : ""}
          </p>
        </div>
        <div className="ap-detail-actions">
          <button type="button" onClick={() => onDelete(application.id)}>
            Hapus
          </button>
          <button type="button" onClick={onClose}>
            Tutup
          </button>
        </div>
      </header>

      <section>
        <h3>Tahap seleksi</h3>
        <ol className="stepper">
          {STATUS_FLOW.map((s) => (
            <li key={s} className={s === application.status ? "current" : ""}>
              {STATUS_LABELS[s]}
            </li>
          ))}
        </ol>
        {(application.status === "REJECTED" || application.status === "GHOSTED") && (
          <p className={`status-badge status-${application.status.toLowerCase()}`}>
            Status saat ini: {STATUS_LABELS[application.status]}
          </p>
        )}

        {isFinalStatus(application.status) ? (
          <p className="hint">Status {STATUS_LABELS[application.status]} sudah final dan tidak bisa diubah.</p>
        ) : (
          <div className="transition-box">
            <span>Pindahkan status ke:</span>
            <div className="transition-options">
              {allowed.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={s === target ? "active" : ""}
                  onClick={() => chooseTarget(s)}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>

            {target === "APPLIED" && (
              <div className="transition-fields">
                <label>
                  Versi CV
                  <input
                    value={form.cvVersion}
                    onChange={(e) => setForm({ ...form, cvVersion: e.target.value })}
                  />
                </label>
                <label>
                  Tanggal lamar
                  <input
                    type="date"
                    value={form.appliedDate}
                    onChange={(e) => setForm({ ...form, appliedDate: e.target.value })}
                  />
                </label>
              </div>
            )}
            {target === "INTERVIEW" && (
              <div className="transition-fields">
                <label>
                  Jadwal interview
                  <input
                    type="datetime-local"
                    value={form.interviewDateTime}
                    onChange={(e) => setForm({ ...form, interviewDateTime: e.target.value })}
                  />
                </label>
              </div>
            )}
            {target === "OFFER" && (
              <div className="transition-fields">
                <label>
                  Uang saku / gaji (Rp)
                  <input
                    type="number"
                    min={0}
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  />
                </label>
                <label>
                  Mode kerja
                  <select
                    value={form.workMode}
                    onChange={(e) => setForm({ ...form, workMode: e.target.value as WorkMode })}
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Onsite">Onsite</option>
                  </select>
                </label>
              </div>
            )}

            {target && (
              <button type="button" onClick={confirmTransition}>
                Konfirmasi pindah ke {STATUS_LABELS[target]}
              </button>
            )}
            {error && <p className="field-error">{error}</p>}
          </div>
        )}
      </section>

      <section>
        <h3>
          Daftar persiapan{" "}
          <span className="progress-text">
            {progress.done}/{progress.total} selesai
          </span>
        </h3>
        <div
          className="progress-bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress.percent}
        >
          <div style={{ width: `${progress.percent}%` }} />
        </div>

        {application.checklist.length === 0 && (
          <p className="empty">Belum ada tugas persiapan. Tambahkan satu di bawah.</p>
        )}
        <ul className="checklist">
          {application.checklist.map((item) => (
            <li key={item.id} className={item.done ? "done" : ""}>
              <label>
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() =>
                    onUpdate(application.id, (prev) => ({
                      ...prev,
                      checklist: toggleChecklistItem(prev.checklist, item.id),
                    }))
                  }
                />
                {item.text}
              </label>
              <button
                type="button"
                aria-label={`Hapus ${item.text}`}
                onClick={() =>
                  onUpdate(application.id, (prev) => ({
                    ...prev,
                    checklist: removeChecklistItem(prev.checklist, item.id),
                  }))
                }
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <form className="inline-form" onSubmit={submitChecklist}>
          <input
            value={checkText}
            placeholder="Tambah tugas persiapan baru…"
            onChange={(e) => setCheckText(e.target.value)}
          />
          <button type="submit">Tambah</button>
        </form>
      </section>

      {children}

      <section>
        <h3>Riwayat aktivitas</h3>
        <form className="inline-form" onSubmit={submitNote}>
          <input
            value={note}
            placeholder="Tulis catatan…"
            onChange={(e) => setNote(e.target.value)}
          />
          <button type="submit">Simpan catatan</button>
        </form>
        <ul className="activity-log">
          {logsNewestFirst.map((log) => (
            <li key={log.id}>
              <time dateTime={log.timestamp}>{formatTimestamp(log.timestamp)}</time>
              <span>{log.message}</span>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}