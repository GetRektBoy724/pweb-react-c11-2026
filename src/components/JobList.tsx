import type { JobListing } from "../types";
import { JobCard } from "./JobCard";

interface JobListProps {
  jobs: JobListing[];
  kaptenSkills: string[];
  appliedKeys: Set<string>;
  calcMatch: (requiredSkills: string[]) => { score: number; matched: string[]; missing: string[] };
  onSave: (job: JobListing) => void;
}

/** Daftar lowongan: hanya menerima data hasil filter/sort dari parent. */
export function JobList({ jobs, kaptenSkills, appliedKeys, calcMatch, onSave }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <p className="empty-state">
        Tidak ada lowongan yang cocok dengan pencarian/filter.
      </p>
    );
  }

  return (
    <div className="job-grid">
      {jobs.map((job) => {
        const key = `${job.company_name}::${job.title}`.toLowerCase();
        return (
          <JobCard
            key={job.id}
            job={job}
            match={calcMatch(job.tags)}
            alreadyApplied={appliedKeys.has(key)}
            onSave={onSave}
          />
        );
      })}
      {/* kaptenSkills dipakai lewat calcMatch; listed untuk dependency yang eksplisit */}
      <span hidden>{kaptenSkills.length}</span>
    </div>
  );
}
