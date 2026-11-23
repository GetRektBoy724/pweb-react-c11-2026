import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  Application,
  JobListing,
  JobsFetchState,
} from "./types";
import { useLocalStorage, useDebounce } from "./hooks";
import { fetchFallbackJobs, fetchRemoteJobs } from "./services/jobService";
import { calcSkillMatch } from "./utils/skillMatch";
import { isDuplicateApplication } from "./utils/duplicate";
import { simulateDaysBack } from "./utils/ghosting";
import { SkillProfile } from "./components/SkillProfile";
import { JobSearchBar } from "./components/JobSearchBar";
import { JobList } from "./components/JobList";
import { ApplicationForm } from "./components/ApplicationForm";
import { WarRoom } from "./components/WarRoom";
import { ApplicationDetail } from "./components/ApplicationDetail";
import { DashboardStats } from "./components/DashboardStats";
import { OfferComparator } from "./components/OfferComparator";
import { calculateApplicationStatistics } from "./utils/dashboard";
import "./styles/warroom.css";

const DEFAULT_SKILLS = ["React", "TypeScript", "CSS"];

type View = "explore" | "pipeline" | "add" | "dashboard";

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

  // [Member 2] Navigasi tab + lamaran yang sedang dibuka di panel detail.
  const [view, setView] = useState<View>("explore");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Sumber data: "remote" (Remotive API) atau "fallback" (lokal).
  const [source, setSource] = useState<"remote" | "fallback">("remote");
  const [fetchState, setFetchState] = useState<JobsFetchState>({
    kind: "loading",
  });
  // [Fix] Nonce agar tombol Coba Lagi benar-benar memicu ulang effect.
  const [reloadKey, setReloadKey] = useState(0);

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
      .then((result: JobListing[]) => {
        if (controller.signal.aborted) return;
        setFetchState({ kind: "success", jobs: result });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setFetchState({
          kind: "error",
          message: err instanceof Error ? err.message : "Gagal memuat lowongan.",
        });
      });

    // Cleanup: batalkan fetch saat unmount / ganti sumber / retry.
    return () => controller.abort();
  }, [source, reloadKey]);

  // Tombol Coba Lagi: ulang fetch ke sumber aktif.
  const retry = useCallback(() => {
    setReloadKey((k) => k + 1);
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
      setApplications((prev: Application[]) => [...prev, newApplication]);
    },
    [applications, setApplications],
  );

  // [Member 2] Handler lamaran: semua update immutable.
  const addApplication = useCallback(
    (application: Application) => {
      setApplications((prev: Application[]) => [...prev, application]);
      setView("pipeline");
    },
    [setApplications],
  );

  const updateApplication = useCallback(
    (id: string, updater: (prev: Application) => Application) => {
      setApplications((prev: Application[]) =>
        prev.map((a) => (a.id === id ? updater(a) : a)),
      );
    },
    [setApplications],
  );

  const simulateGhosting = useCallback(
    (id: string) => updateApplication(id, (a) => simulateDaysBack(a, 15)),
    [updateApplication],
  );

  // TODO Member 3: ganti dengan hapus + Toast Undo 5 detik (useRef + clearTimeout).
  const deleteApplication = useCallback(
    (id: string) => {
      setApplications((prev: Application[]) => prev.filter((a) => a.id !== id));
      setSelectedId((current) => (current === id ? null : current));
    },
    [setApplications],
  );

  const selectedApplication = useMemo(
    () => applications.find((a) => a.id === selectedId) ?? null,
    [applications, selectedId],
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

  const dashboardStatistics = calculateApplicationStatistics(applications);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Aku Mw Magang</h1>
        <p>Kelola pencarian magang Kapten dari eksplorasi sampai offer.</p>
        <nav className="app-nav">
          <button
            type="button"
            aria-current={view === "explore" ? "page" : undefined}
            onClick={() => setView("explore")}
          >
            Eksplorasi Lowongan
          </button>
          <button
            type="button"
            aria-current={view === "pipeline" ? "page" : undefined}
            onClick={() => setView("pipeline")}
          >
            Pipeline Lamaran ({applications.length})
          </button>
          <button
            type="button"
            aria-current={view === "add" ? "page" : undefined}
            onClick={() => setView("add")}
          >
            + Catat Lamaran
          </button>
          <button
            type="button"
            aria-current={view === "dashboard" ? "page" : undefined}
            onClick={() => setView("dashboard")}
          >
            Dashboard
          </button>
        </nav>
      </header>

      {view === "explore" && (
        <>
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
        </>
      )}

      {view === "pipeline" && (
        <>
          <WarRoom
            applications={applications}
            kaptenSkills={kaptenSkills}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onSimulate={simulateGhosting}
          />
          {selectedApplication && (
            <ApplicationDetail
              key={selectedApplication.id}
              application={selectedApplication}
              onUpdate={updateApplication}
              onDelete={deleteApplication}
              onClose={() => setSelectedId(null)}
            >
              {/* TODO Member 3: <InterviewPrepTimer /> dipasang di sini */}
            </ApplicationDetail>
          )}
        </>
      )}

      {view === "add" && (
        <ApplicationForm applications={applications} onAdd={addApplication} />
      )}

      {view === "dashboard" && (
        <main className="dashboard-page">
          <section aria-labelledby="dashboard-title">
            <h2 id="dashboard-title">Dashboard Lamaran</h2>
            <DashboardStats statistics={dashboardStatistics} />
          </section>
          <OfferComparator
            applications={applications}
            kaptenSkills={kaptenSkills}
          />
        </main>
      )}
    </div>
  );
}
