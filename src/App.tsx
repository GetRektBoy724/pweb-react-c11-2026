import { useCallback, useEffect, useMemo, useState } from "react";
import type { Application, JobListing, JobsFetchState } from "../types";
import { useLocalStorage, useDebounce } from "../hooks";
import { fetchFallbackJobs, fetchRemoteJobs } from "../services/jobService";
import { calcSkillMatch, isDuplicateApplication } from "../utils";
import { SkillProfile } from "../components/SkillProfile";
import { JobSearchBar } from "../components/JobSearchBar";
import { JobList } from "../components/JobList";

const DEFAULT_SKILLS = ["React", "TypeScript", "CSS"];

export default function App() {
  // Persistensi utama wajib via useLocalStorage.
  const [applications, setApplications] = useLocalStorage<Application[]>(
    "pweb-c11-applications",
    [],
  );
  const [kaptenSkills, setKaptenSkills] = useLocalStorage<string[]>(
    "pweb-c11-kapten-skills",
    DEFAULT_SKILLS,
  );

  // Sumber data: "remote" (Remotive API) atau "fallback" (lokal).
  const [source, setSource] = useState<"remote" | "fallback">("remote");
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [fetchState, setFetchState] = useState<JobsFetchState>({
    kind: "loading",
  });

  // Search + filter (keyword didebounce 400ms sebelum dipakai).
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const debouncedKeyword = useDebounce(keyword, 400);

  useEffect(() => {
    const controller = new AbortController();
    setFetchState({ kind: "loading" });

    const fetcher =
      source === "remote" ? fetchRemoteJobs : fetchFallbackJobs;
    fetcher(controller.signal)
      .then((result) => {
        setJobs(result);
        setFetchState({ kind: "success", jobs: result });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setFetchState({
          kind: "error",
          message: err instanceof Error ? err.message : "Gagal memuat lowongan.",
        });
      });

    // Cleanup: batalkan fetch saat unmount / ganti sumber.
    return () => controller.abort();
  }, [source]);

  // Tombol Coba Lagi: paksa ulang fetch ke sumber aktif.
  const retry = useCallback(() => {
    setSource((s) => s);
    setFetchState({ kind: "loading" });
    // Re-trigger effect dengan toggle identitas sumber.
    setSource((s) => (s === "remote" ? "remote" : "fallback"));
  }, []);

  // Simpan lowongan ke daftar lamaran sebagai WISHLIST.
  const saveToWishlist = useCallback(
    (job: JobListing) => {
      if (isDuplicateApplication(applications, job.company_name, job.title)) {
        return;
      }
      const newApplication: Application = {
        id: crypto.randomUUID(),
        company: job.company_name,
        role: job.title,
        workMode: job.candidate_required_location.toLowerCase().includes("remote")
          ? "Remote"
          : "Hybrid",
        status: "WISHLIST",
        requiredSkills: job.tags,
        lastUpdatedAt: new Date().toISOString(),
        checklist: [],
        activityLogs: [
          {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            message: `Lamaran dibuat dari eksplorasi lowongan (${job.company_name} - ${job.title}).`,
          },
        ],
      };
      setApplications((prev) => [...prev, newApplication]);
    },
    [applications, setApplications],
  );

  // Derived state: hasil filter + sort by Match Score.
  const visibleJobs = useMemo(() => {
    if (fetchState.kind !== "success") return [];
    const kw = debouncedKeyword.trim().toLowerCase();
    return fetchState.jobs
      .filter((job) => {
        const matchesKeyword =
          kw === "" ||
          job.title.toLowerCase().includes(kw) ||
          job.company_name.toLowerCase().includes(kw);
        const matchesCategory = category === "" || job.category === category;
        return matchesKeyword && matchesCategory;
      })
      .sort(
        (a, b) =>
          calcSkillMatch(kaptenSkills, b.tags).score -
          calcSkillMatch(kaptenSkills, a.tags).score,
      );
  }, [fetchState, debouncedKeyword, category, kaptenSkills]);

  // Derived: kunci company+role yang sudah dilamar (untuk disable tombol).
  const appliedKeys = useMemo(
    () =>
      new Set(
        applications.map((a) =>
          `${a.company}::${a.role}`.toLowerCase(),
        ),
      ),
    [applications],
  );

  const categories = useMemo(() => {
    if (fetchState.kind !== "success") return [];
    return [...new Set(fetchState.jobs.map((j) => j.category))];
  }, [fetchState]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Aku Mw Magang</h1>
        <p>Kelola pencarian magang Kapten dari eksplorasi sampai offer.</p>
      </header>

      <SkillProfile
        skills={kaptenSkills}
        onAdd={(skill) => setKaptenSkills((prev) => [...prev, skill])}
        onRemove={(skill) =>
          setKaptenSkills((prev) => prev.filter((s) => s !== skill))
        }
      />

      <section className="exploration">
        <h2>Eksplorasi Lowongan</h2>
        <div className="source-toggle">
          <label>
            <input
              type="radio"
              name="source"
              checked={source === "remote"}
              onChange={() => setSource("remote")}
            />
            Remotive API
          </label>
          <label>
            <input
              type="radio"
              name="source"
              checked={source === "fallback"}
              onChange={() => setSource("fallback")}
            />
            Fallback Lokal
          </label>
        </div>

        {fetchState.kind === "loading" && <p className="loading">Memuat lowongan…</p>}
        {fetchState.kind === "error" && (
          <div className="error-state">
            <p>Gagal memuat: {fetchState.message}</p>
            <div className="error-actions">
              <button type="button" onClick={retry}>
                Coba Lagi
              </button>
              <button
                type="button"
                onClick={() => setSource(source === "remote" ? "fallback" : "remote")}
              >
                Ganti ke {source === "remote" ? "Fallback Lokal" : "Remotive API"}
              </button>
            </div>
          </div>
        )}
        {fetchState.kind === "success" && (
          <>
            <JobSearchBar
              keyword={keyword}
              onKeywordChange={setKeyword}
              categories={categories}
              category={category}
              onCategoryChange={setCategory}
            />
            <p className="count">{visibleJobs.length} lowongan</p>
            <JobList
              jobs={visibleJobs}
              kaptenSkills={kaptenSkills}
              appliedKeys={appliedKeys}
              calcMatch={(required) => calcSkillMatch(kaptenSkills, required)}
              onSave={saveToWishlist}
            />
          </>
        )}
      </section>
    </div>
  );
}
