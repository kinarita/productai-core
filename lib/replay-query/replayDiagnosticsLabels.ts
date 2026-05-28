import type { ReplayDiagnostics } from "@/lib/replay-query/replayDiagnostics";

export const replayDiagnosticsWarnings = {
  metadataCompletenessReduced: "Metadata completeness is reduced in this replay view.",
  replayCondensed: "Replay view has been condensed for executive readability.",
  advisoryDensityElevated: "Advisory density is elevated in the selected replay window.",
  continuityReviewConcentration:
    "Review concentration is elevated in the selected replay scope.",
  historicalReviewConcentration:
    "Historical governance memory indicates recurring review concentration in this scope.",
  legacyAliasNormalized: "Legacy replay aliases were normalized to canonical taxonomy.",
} as const;

export const replayDiagnosticsDefinitions = {
  replayVisibilityScore:
    "Replay Visibility Score reflects metadata continuity and replay readability within the selected governance scope.",
  replayConfidence:
    "Replay Confidence summarizes how reliably this replay view supports governance interpretation.",
  metadataCompleteness:
    "Metadata Completeness indicates how consistently replay items include continuity and source metadata.",
  replayDensity:
    "Replay Density reflects review and advisory concentration within the visible governance window.",
  continuityStability:
    "Continuity Stability indicates whether replay interpretation is stable, review-elevated, or advisory-dense.",
} as const;

export function getReplayDensityWording(timelineDensity: string): string {
  if (timelineDensity === "compact") {
    return "condensed replay view for executive readability";
  }
  if (timelineDensity === "expanded") {
    return "expanded replay context for continuity visibility";
  }
  return "balanced replay context for continuity readability";
}

export function getContinuityWording(
  stability: ReplayDiagnostics["continuityStability"]
): string {
  if (stability === "stable") {
    return "Replay continuity appears stable across recent governance windows.";
  }
  if (stability === "elevated_review") {
    return "Replay interpretation is influenced by concentrated governance review activity within this continuity scope.";
  }
  return "Continuity interpretation may be influenced by elevated advisory density in the selected replay scope.";
}

export function getConfidenceWording(
  confidence: ReplayDiagnostics["replayConfidence"]
): string {
  if (confidence === "high") {
    return "Replay confidence remains high across this governance view.";
  }
  if (confidence === "moderate") {
    return "Replay confidence remains moderate and supports executive governance interpretation.";
  }
  return "Replay confidence is limited and should be interpreted as advisory context.";
}
