import type { ReplayDiagnostics } from "@/lib/replay-query/replayDiagnostics";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";
import { replayWindowDescriptions } from "@/lib/replay-query/replayLabels";
import { getConfidenceWording, getContinuityWording } from "@/lib/replay-query/replayDiagnosticsLabels";

export function getContinuityStabilityLabel(value: ReplayDiagnostics["continuityStability"]): string {
  if (value === "stable") return "Stable continuity";
  if (value === "elevated_review") return "Elevated review continuity";
  return "Advisory-dense continuity";
}

export function buildReplayDiagnosticsSummary(
  diagnostics: ReplayDiagnostics,
  replayQuery: ReplayQueryState
): string {
  return `Visibility ${diagnostics.replayVisibilityScore} · Confidence ${diagnostics.replayConfidence} · ${replayWindowDescriptions[replayQuery.replayWindow]}`;
}

export function buildReplayVisibilityExplanation(replayQuery: ReplayQueryState): string {
  return `This replay view emphasizes ${replayQuery.scope.replaceAll(
    "_",
    " "
  )} continuity within the ${replayQuery.replayWindow} operational window.`;
}

export function buildReplayContinuityExplanation(
  stability: ReplayDiagnostics["continuityStability"]
): string {
  return getContinuityWording(stability);
}

export function buildReplayConfidenceExplanation(
  confidence: ReplayDiagnostics["replayConfidence"]
): string {
  return getConfidenceWording(confidence);
}
