import { useState } from "react";
import type { Application, ApplicationStatus } from "../types";
import { calcSkillMatch, matchScoreVariant } from "../utils/skillMatch";
import { isGhostingRisk } from "../utils/ghosting";
import { findInterviewConflicts } from "../utils/interviewConflict";
import { checklistProgress } from "../utils/checklist";
import { ALL_STATUSES, STATUS_LABELS } from "../utils/stateMachine";
import {
  DEFAULT_FILTERS,
  filterAndSortApplications,
} from "../utils/pipeline";
import type { PipelineFilters, SortMode } from "../utils/pipeline";

interface WarRoomProps {
  applications: Application[];
  kaptenSkills: string[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSimulate: (id: string) => void;
}

function formatDateTime(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

/** Fitur 3: War Room (filter gabungan, badge ghosting, banner bentrok). */
export function WarRoom({
  applications,
  kaptenSkills,
  selectedId,
  onSelect,
  onSimulate,
}: WarRoomProps) {
  const [filters, setFilters] = useState<PipelineFilters>(DEFAULT_FILTERS);

  // Derived state: semuanya dihitung saat render, tidak ada useState tambahan.
  // Bentrok dihitung dari SELURUH data, bukan hasil filter.
  const conflicts = findInterviewConflicts(applications);
  const visible = filterAndSortApplications(applications, filters);

  return (
    <section className="war-room">
      <header className="wr-page-head">
        <div>
          <span className="eyebrow">WORKSPACE / PIPELINE</span>
          <h1>Pipeline Lamaran</h1>
          <p>Pantau progres seleksi dan langkah berikutnya untuk setiap lamaran.</p>
        </div>
        <span className="wr-total-count">{applications.length} lamaran</span>
      </header>

      {conflicts.length > 0 && (
        <div className="conflict-banner" role="alert">
          <strong>Jadwal interview bentrok:</strong>
          <ul>
            {conflicts.map((c) => (
              <li key={`${c.a.id}-${c.b.id}`}>
                {c.a.company} ({formatDateTime(c.a.interviewDateTime ?? "")}) dan{" "}
                {c.b.company} ({formatDateTime(c.b.interviewDateTime ?? "")}) berselisih{" "}
                {Math.round(c.diffMinutes)} menit, kurang dari 60 menit.
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="wr-filters">
        <input
          type="search"
          placeholder="Cari perusahaan atau posisi…"
          aria-label="Cari perusahaan atau posisi"
          value={filters.query}
          onChange={(e) => setFilters({ ...filters, query: e.target.value })}
        />
        <select
          aria-label="Filter berdasarkan status"
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value as ApplicationStatus | "ALL" })
          }
        >
          <option value="ALL">Semua status</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          aria-label="Urutkan lamaran"
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value as SortMode })}
        >
          <option value="newest">Terbaru</option>
          <option value="interview">Jadwal interview terdekat</option>
          <option value="offer">Offer tertinggi</option>
        </select>
        <label className="wr-toggle">
          <input
            type="checkbox"
            aria-label="Hanya tampilkan lamaran rawan ghosting"
            checked={filters.onlyGhosting}
            onChange={(e) => setFilters({ ...filters, onlyGhosting: e.target.checked })}
          />
          Hanya rawan ghosting
        </label>
      </div>

      {applications.length === 0 && (
        <p className="empty">Belum ada lamaran. Simpan lowongan ke wishlist atau catat lamaran manual.</p>
      )}
      {applications.length > 0 && visible.length === 0 && (
        <p className="empty">Tidak ada lamaran yang cocok dengan filter.</p>
      )}

      <ul className="wr-list">
        {visible.map((app) => {
          const match = calcSkillMatch(kaptenSkills, app.requiredSkills);
          const progress = checklistProgress(app.checklist);
          const ghost = isGhostingRisk(app);
          const canSimulate = app.status === "APPLIED" || app.status === "SCREENING";
          return (
            <li
              key={app.id}
              className={`wr-card${app.id === selectedId ? " selected" : ""}`}
            >
              <div className="wr-card-head">
                <div>
                  <h3>{app.role}</h3>
                  <p>
                    {app.company} · {app.workMode}
                  </p>
                </div>
                <span className={`status-badge status-${app.status.toLowerCase()}`}>
                  {STATUS_LABELS[app.status]}
                </span>
              </div>

              <div className="wr-meta">
                <span>CV: {app.cvVersion ?? "-"}</span>
                <span className="wr-checklist-progress">
                  <span>Checklist: {progress.done}/{progress.total}</span>
                  <span className="progress-bar" role="progressbar" aria-label={`Checklist ${app.company}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent}>
                    <span style={{ width: `${progress.percent}%` }} />
                  </span>
                </span>
                <span className={`match-badge ${matchScoreVariant(match.score)}`}>
                  Match {match.score}%
                </span>
                {ghost && <span className="ghost-badge">Rawan Ghosting</span>}
              </div>

              {app.interviewDateTime && app.status === "INTERVIEW" && (
                <p className="wr-interview">Interview: {formatDateTime(app.interviewDateTime)}</p>
              )}
              {app.salaryOffer !== undefined && app.status === "OFFER" && (
                <p className="wr-interview">Offer: Rp {app.salaryOffer.toLocaleString("id-ID")}</p>
              )}

              <div className="wr-actions">
                <button type="button" onClick={() => onSelect(app.id)}>
                  Buka detail
                </button>
                {canSimulate && (
                  <button type="button" onClick={() => onSimulate(app.id)}>
                    Simulasi +15 Hari
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
