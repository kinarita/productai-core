import type { ReplayInterpretationRecord } from "@/lib/orchestration/governance-history/replayInterpretationHistory";

export interface LongitudinalReviewPoint {
  id: string;
  at: string;
  label: string;
  visibilityScore: number;
  replayConfidence: string;
  continuityStability: string;
  interpretationSummary: string;
  changeNote?: string;
}

export interface LongitudinalGovernanceReview {
  points: LongitudinalReviewPoint[];
  visibilityTrend: string;
  continuityDriftNote: string;
  reviewDensityNote: string;
  interpretationEvolutionNote: string;
  readingNote: string;
}

export function buildLongitudinalGovernanceReview(
  interpretations: ReplayInterpretationRecord[]
): LongitudinalGovernanceReview {
  const sorted = [...interpretations].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const points: LongitudinalReviewPoint[] = sorted.map((record, index) => {
    const prev = sorted[index - 1];
    let changeNote: string | undefined;
    if (prev) {
      const visDelta = record.visibilityScore - prev.visibilityScore;
      if (visDelta !== 0 || prev.continuityStability !== record.continuityStability) {
        changeNote = `Visibility ${visDelta >= 0 ? "+" : ""}${visDelta} · continuity ${prev.continuityStability.replaceAll("_", " ")} → ${record.continuityStability.replaceAll("_", " ")}`;
      }
    }
    return {
      id: record.id,
      at: record.createdAt,
      label: `${record.scope} · ${record.window}`,
      visibilityScore: record.visibilityScore,
      replayConfidence: record.replayConfidence,
      continuityStability: record.continuityStability,
      interpretationSummary: record.summary,
      changeNote,
    };
  });

  const visibilityTrend =
    points.length >= 2
      ? `Visibility moved from ${points[0].visibilityScore} to ${points[points.length - 1].visibilityScore} across ${points.length} recorded interpretation(s).`
      : "Record multiple interpretations to observe visibility trends over time.";

  const driftCount = points.filter((p) => p.changeNote?.includes("continuity")).length;
  const continuityDriftNote =
    driftCount > 0
      ? `${driftCount} continuity stability transition(s) observed. Interpret as reading support—not automated conclusions.`
      : "No continuity drift recorded between interpretation snapshots yet.";

  const elevated = sorted.filter((r) => r.continuityStability === "elevated_review").length;
  const reviewDensityNote =
    elevated > 0
      ? `Elevated review continuity appeared in ${elevated} interpretation(s). Human review sequencing remains advisory.`
      : "Review density appears stable in recorded interpretations.";

  const evolution =
    sorted.length >= 2
      ? `Interpretation evolved from "${sorted[0].summary.slice(0, 60)}…" toward "${sorted[sorted.length - 1].summary.slice(0, 60)}…".`
      : "Interpretation evolution will appear as you record governance readings over time.";

  return {
    points: points.reverse(),
    visibilityTrend,
    continuityDriftNote,
    reviewDensityNote,
    interpretationEvolutionNote: evolution,
    readingNote:
      "Longitudinal governance review helps maintain continuity across executive interpretation sessions.",
  };
}
