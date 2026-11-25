import type { JobListing, SkillMatch } from "../types";
import { matchScoreVariant } from "../utils/skillMatch";

interface JobCardProps {
  job: JobListing;
  match: SkillMatch;
  alreadyApplied: boolean;
  onSave: (job: JobListing) => void;
}

/** Ring progress mini untuk match score — signature element (DESIGN.md §5). */
function MatchRing({ score, variant }: { score: number; variant: string }) {
  const R = 14;
  const C = 2 * Math.PI * R;
  const dash = (score / 100) * C;
  const strokeClass =
    variant === "high" ? "--hi" : variant === "mid" ? "--md" : "--lo";
  return (
    <svg
      className="match-ring"
      viewBox="0 0 34 34"
      role="img"
      aria-label={`Match score ${score}%`}
    >
      <circle className="track" cx="17" cy="17" r={R} />
      <circle
        cx="17"
        cy="17"
        r={R}
        stroke={`var(${strokeClass})`}
        strokeDasharray={`${dash} ${C - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 17 17)"
      />
      <text x="17" y="17" textAnchor="middle" dominantBaseline="central">
        {score}%
      </text>
    </svg>
  );
}

/** Kartu satu lowongan: match ring, skill cocok/missing, tombol Simpan. */
export function JobCard({ job, match, alreadyApplied, onSave }: JobCardProps) {
  const variant = matchScoreVariant(match.score);

  return (
    <article className="job-card">
      <header>
        <div>
          <h3>{job.title}</h3>
          <p className="company">
            {job.company_name} · {job.candidate_required_location}
          </p>
        </div>
        <MatchRing score={match.score} variant={variant} />
      </header>
      <p className="salary">{job.salary}</p>
      <div className="skills">
        {match.matched.length > 0 && (
          <p className="matched">
            <b>{match.matched.join(", ")}</b>
          </p>
        )}
        {match.missing.length > 0 && (
          <p className="missing">
            Missing: <b>{match.missing.join(", ")}</b>
          </p>
        )}
      </div>
      <button
        type="button"
        className="job-save primary"
        disabled={alreadyApplied}
        onClick={() => onSave(job)}
      >
        {alreadyApplied ? "Sudah Dilamar" : "Simpan ke Wishlist"}
      </button>
    </article>
  );
}
