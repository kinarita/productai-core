import type { ReplayDiagnostics } from "@/lib/replay-query/replayDiagnostics";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";
import { replayWindowDescriptions } from "@/lib/replay-query/replayLabels";

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
