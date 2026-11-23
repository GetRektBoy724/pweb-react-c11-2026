import type { ApplicationStatistics } from "../utils/dashboard";
import "../styles/dashboard.css";

interface DashboardStatsProps {
  statistics: ApplicationStatistics;
}

function formatPercent(value: number): string {
  return `${value}%`;
}

/** Lima kartu ringkasan statistik lamaran Kapten. */
export function DashboardStats({ statistics }: DashboardStatsProps) {
  const cards = [
    { label: "Total Lamaran", value: statistics.totalApplications },
    { label: "Response Rate", value: formatPercent(statistics.responseRate) },
    { label: "Interview Rate", value: formatPercent(statistics.interviewRate) },
    { label: "Rawan Ghosting", value: statistics.ghostingRiskCount },
    { label: "Total Offer", value: statistics.totalOffers },
  ];

  return (
    <section className="dashboard-stats" aria-label="Statistik lamaran">
      {cards.map((card) => (
        <article className="dashboard-stat-card" key={card.label}>
          <h3>{card.label}</h3>
          <p>{card.value}</p>
        </article>
      ))}
    </section>
  );
}
