import type { JobListing, SkillMatch } from "../types";
import { matchScoreVariant } from "../utils/skillMatch";

interface JobCardProps {
  job: JobListing;
  match: SkillMatch;
  alreadyApplied: boolean;
  onSave: (job: JobListing) => void;
}

/** Kartu satu lowongan: Match Score badge, skill cocok/missing, tombol Simpan. */
export function JobCard({ job, match, alreadyApplied, onSave }: JobCardProps) {
  const variant = matchScoreVariant(match.score);

  return (
    <article className="job-card">
      <header>
        <h3>{job.title}</h3>
        <span className={`match-badge ${variant}`}>{match.score}%</span>
      </header>
      <p className="company">
        {job.company_name} · {job.candidate_required_location}
      </p>
      <p className="salary">{job.salary}</p>
      <div className="skills">
        {match.matched.length > 0 && (
          <p className="matched">
            ✔ {match.matched.join(", ")}
          </p>
        )}
        {match.missing.length > 0 && (
          <p className="missing">✘ Missing: {match.missing.join(", ")}</p>
        )}
      </div>
      <button
        type="button"
        disabled={alreadyApplied}
        onClick={() => onSave(job)}
      >
        {alreadyApplied ? "Sudah Dilamar" : "Simpan ke Wishlist"}
      </button>
    </article>
  );
}
