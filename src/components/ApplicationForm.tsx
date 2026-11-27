import { useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Application, ApplicationStatus, WorkMode } from "../types";
import { isDuplicateApplication } from "../utils/duplicate";
import { createActivityLog } from "../utils/activityLog";

type FieldName = "company" | "role" | "cvVersion" | "appliedDate";
type FieldErrors = Partial<Record<FieldName, string>>;
type InitialStatus = Extract<ApplicationStatus, "WISHLIST" | "APPLIED">;

/** Urutan field = urutan fokus saat ada beberapa error. */
const FIELD_ORDER: FieldName[] = ["company", "role", "cvVersion", "appliedDate"];

interface ApplicationFormProps {
  applications: Application[];
  onAdd: (application: Application) => void;
}

/** Fitur 2: form tambah lamaran manual (terkontrol penuh + auto-focus error). */
export function ApplicationForm({ applications, onAdd }: ApplicationFormProps) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [workMode, setWorkMode] = useState<WorkMode>("Remote");
  const [status, setStatus] = useState<InitialStatus>("WISHLIST");
  const [skillsText, setSkillsText] = useState("");
  const [cvVersion, setCvVersion] = useState("");
  const [appliedDate, setAppliedDate] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const inputRefs = useRef<Record<FieldName, HTMLInputElement | null>>({
    company: null,
    role: null,
    cvVersion: null,
    appliedDate: null,
  });

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (company.trim() === "") next.company = "Perusahaan wajib diisi.";
    if (role.trim() === "") next.role = "Posisi wajib diisi.";
    if (
      !next.company &&
      !next.role &&
      isDuplicateApplication(applications, company, role)
    ) {
      next.company = "Lamaran dengan perusahaan dan posisi ini sudah ada.";
    }
    if (status === "APPLIED") {
      if (cvVersion.trim() === "") next.cvVersion = "Versi CV wajib diisi.";
      if (appliedDate === "") next.appliedDate = "Tanggal lamar wajib diisi.";
    }
    return next;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    const firstError = FIELD_ORDER.find((f) => nextErrors[f]);
    if (firstError) {
      inputRefs.current[firstError]?.focus();
      return;
    }

    const now = new Date();
    const requiredSkills = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter((s, i, arr) => s !== "" && arr.findIndex((x) => x.toLowerCase() === s.toLowerCase()) === i);

    const isApplied = status === "APPLIED";
    const logs = [createActivityLog(`Lamaran dibuat manual (${company.trim()} - ${role.trim()}).`, now)];
    if (isApplied) {
      logs.push(createActivityLog(`Lamaran dikirim (CV: ${cvVersion.trim()}, tanggal ${appliedDate}).`, now));
    }

    onAdd({
      id: crypto.randomUUID(),
      company: company.trim(),
      role: role.trim(),
      workMode,
      status,
      requiredSkills,
      cvVersion: isApplied ? cvVersion.trim() : undefined,
      appliedDate: isApplied ? appliedDate : undefined,
      lastUpdatedAt: now.toISOString(),
      checklist: [],
      activityLogs: logs,
    });

    setCompany("");
    setRole("");
    setSkillsText("");
    setCvVersion("");
    setAppliedDate("");
    setStatus("WISHLIST");
    setErrors({});
  };

  return (
    <form className="ap-form" onSubmit={handleSubmit} noValidate>
      <h2>Catat Lamaran</h2>

      <label>
        Perusahaan
        <input
          ref={(el) => {
            inputRefs.current.company = el;
          }}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          aria-invalid={errors.company ? true : undefined}
        />
        {errors.company && <span className="field-error">{errors.company}</span>}
      </label>

      <label>
        Posisi / Role
        <input
          ref={(el) => {
            inputRefs.current.role = el;
          }}
          value={role}
          onChange={(e) => setRole(e.target.value)}
          aria-invalid={errors.role ? true : undefined}
        />
        {errors.role && <span className="field-error">{errors.role}</span>}
      </label>

      <div className="ap-form-pair">
        <label>
          Mode kerja
          <select value={workMode} onChange={(e) => setWorkMode(e.target.value as WorkMode)}>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">Onsite</option>
          </select>
        </label>

        <label>
          Status awal
          <select value={status} onChange={(e) => setStatus(e.target.value as InitialStatus)}>
            <option value="WISHLIST">Wishlist</option>
            <option value="APPLIED">Applied</option>
          </select>
        </label>
      </div>

      {status === "APPLIED" && (
        <>
          <label>
            Versi CV
            <input
              ref={(el) => {
                inputRefs.current.cvVersion = el;
              }}
              value={cvVersion}
              placeholder="Kapten-CV-v2.pdf"
              onChange={(e) => setCvVersion(e.target.value)}
              aria-invalid={errors.cvVersion ? true : undefined}
            />
            {errors.cvVersion && <span className="field-error">{errors.cvVersion}</span>}
          </label>
          <label>
            Tanggal lamar
            <input
              ref={(el) => {
                inputRefs.current.appliedDate = el;
              }}
              type="date"
              value={appliedDate}
              onChange={(e) => setAppliedDate(e.target.value)}
              aria-invalid={errors.appliedDate ? true : undefined}
            />
            {errors.appliedDate && <span className="field-error">{errors.appliedDate}</span>}
          </label>
        </>
      )}

      <label>
        Required skills (pisahkan dengan koma)
        <input
          value={skillsText}
          placeholder="React, TypeScript, Docker"
          onChange={(e) => setSkillsText(e.target.value)}
        />
      </label>

      <button type="submit">Simpan lamaran</button>
    </form>
  );
}
