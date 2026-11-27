import type { CSSProperties } from "react";
import type { JobListing, SkillMatch } from "../types";

interface JobCardProps {
  job: JobListing;
  match: SkillMatch;
  alreadyApplied: boolean;
  onSave: (job: JobListing) => void;
}

/** Kartu lowongan dengan match score ring dan skill tags. */
export function JobCard({ job, match, alreadyApplied, onSave }: JobCardProps) {
  const variant = match.score >= 50 ? "high" : match.score >= 20 ? "mid" : "low";

  return (
    <article className="job-card">
      <header>
        <h3>{job.title}</h3>
        <span
          className={`job-match-ring ${variant}`}
          style={{ "--match-score": `${match.score}%` } as CSSProperties}
          role="img"
          aria-label={`Kecocokan skill ${match.score}%`}
        >
          <span>{match.score}%</span>
        </span>
      </header>
      <p className="company">
        {job.company_name} · {job.candidate_required_location}
      </p>
      <p className="salary">{job.salary}</p>
      <div className="skills" aria-label="Skill lowongan">
        {match.matched.map((skill) => (
          <span className="skill-tag matched" key={`matched-${skill}`}>✓ {skill}</span>
        ))}
        {match.missing.slice(0, 4).map((skill) => (
          <span className="skill-tag missing" key={`missing-${skill}`}>{skill}</span>
        ))}
        {match.missing.length > 4 && (
          <span className="skill-tag more">+{match.missing.length - 4} lagi</span>
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
