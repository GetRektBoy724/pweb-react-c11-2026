import { useState } from "react";
import type { Application } from "../types";
import { compareOffers } from "../utils/offerComparison";
import "../styles/offer-comparator.css";

interface OfferComparatorProps {
  applications: Application[];
  kaptenSkills: string[];
}

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatScore(score: number): string {
  return `${score.toFixed(1)}%`;
}

function offerLabel(offer: Application): string {
  return `${offer.company} — ${offer.role}`;
}

/** Panel untuk memilih dan membandingkan dua lamaran berstatus OFFER. */
export function OfferComparator({
  applications,
  kaptenSkills,
}: OfferComparatorProps) {
  const offers = applications.filter(
    (application) => application.status === "OFFER",
  );
  const [offerAId, setOfferAId] = useState(offers[0]?.id ?? "");
  const [offerBId, setOfferBId] = useState(offers[1]?.id ?? "");

  const selectedAId = offers.some((offer) => offer.id === offerAId)
    ? offerAId
    : (offers[0]?.id ?? "");
  const selectedBId = offers.some(
    (offer) => offer.id === offerBId && offer.id !== selectedAId,
  )
    ? offerBId
    : (offers.find((offer) => offer.id !== selectedAId)?.id ?? "");
  const offerA = offers.find((offer) => offer.id === selectedAId);
  const offerB = offers.find((offer) => offer.id === selectedBId);
  const comparison =
    offerA && offerB && offerA.id !== offerB.id
      ? compareOffers(offerA, offerB, kaptenSkills)
      : null;

  return (
    <section className="offer-comparator" aria-labelledby="offer-comparator-title">
      <header className="offer-comparator-header">
        <div>
          <h2 id="offer-comparator-title">Offer Comparator</h2>
          <p>Bandingkan dua tawaran berdasarkan gaji, mode kerja, dan skill match.</p>
        </div>
      </header>

      {offers.length < 2 ? (
        <p className="offer-comparator-empty">
          Perlu minimal 2 lamaran berstatus Offer untuk mulai membandingkan.
        </p>
      ) : (
        <>
          <div className="offer-comparator-selectors">
            <label>
              Offer A
              <select value={selectedAId} onChange={(event) => setOfferAId(event.target.value)}>
                {offers.map((offer) => (
                  <option key={offer.id} value={offer.id}>
                    {offerLabel(offer)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Offer B
              <select value={selectedBId} onChange={(event) => setOfferBId(event.target.value)}>
                {offers.map((offer) => (
                  <option key={offer.id} value={offer.id}>
                    {offerLabel(offer)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {!comparison ? (
            <p className="offer-comparator-empty" role="status">
              Pilih dua offer yang berbeda untuk melihat perbandingan.
            </p>
          ) : (
            <>
              <div className="offer-comparison-grid">
                {[comparison.offerA, comparison.offerB].map((score, index) => {
                  const offer = index === 0 ? offerA : offerB;
                  if (!offer) return null;
                  const recommended = score.applicationId === comparison.recommendedOfferId;

                  return (
                    <article className="offer-comparison-card" key={score.applicationId}>
                      <div className="offer-comparison-card-title">
                        <div>
                          <span className="offer-comparison-label">Offer {index === 0 ? "A" : "B"}</span>
                          <h3>{offer.company}</h3>
                          <p>{offer.role}</p>
                        </div>
                        {recommended && (
                          <span className="offer-recommendation">Rekomendasi Terbaik</span>
                        )}
                      </div>
                      <dl className="offer-score-breakdown">
                        <div>
                          <dt>Gaji</dt>
                          <dd>{formatRupiah(score.salary)}</dd>
                        </div>
                        <div>
                          <dt>Normalisasi gaji</dt>
                          <dd>{formatScore(score.normalizedSalaryScore)}</dd>
                        </div>
                        <div>
                          <dt>Mode kerja</dt>
                          <dd>{offer.workMode} · {score.workModeScore}%</dd>
                        </div>
                        <div>
                          <dt>Skill match</dt>
                          <dd>{score.skillMatchScore}%</dd>
                        </div>
                        <div className="offer-total-score">
                          <dt>Total skor</dt>
                          <dd>{formatScore(score.totalScore)}</dd>
                        </div>
                      </dl>
                    </article>
                  );
                })}
              </div>
              {comparison.recommendedOfferId === null && (
                <p className="offer-comparator-tie" role="status">
                  Skor kedua offer seri.
                </p>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
