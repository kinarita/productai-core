import type { OrganizationFeedItem } from "@/types/productai";
import type { GovernanceMemoryItem, GovernanceTimelineEvent } from "@/lib/orchestration/governance-history/governanceHistoryTypes";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";
import { getReplayValidationMetrics } from "@/lib/replay-query/replayValidationMetrics";

export interface ReplayDiagnostics {
  generatedAt: string;
  replayVisibilityScore: number;
  replayConfidence: "high" | "moderate" | "limited";
  continuityStability: "stable" | "elevated_review" | "advisory_dense";
  visibleEventCount: number;
  compressedEventCount?: number;
  metadataCompletenessRatio: number;
  advisoryDensity: number;
  reviewDensity: number;
  continuityExplanation: string;
  visibilityExplanation: string;
  confidenceExplanation: string;
  diagnosticsWarnings: string[];
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function calculateCompleteness(feedItems: OrganizationFeedItem[]): number {
  if (feedItems.length === 0) return 1;
  let complete = 0;
  for (const item of feedItems) {
    const isComplete =
      Boolean(item.replayCategory) &&
      Boolean(item.continuityCategory) &&
      Boolean(item.replaySeverity) &&
      Boolean(item.replaySource);
    if (isComplete) complete += 1;
  }
  return complete / feedItems.length;
}

export function buildReplayDiagnostics(input: {
  events: GovernanceTimelineEvent[];
  allEventCount: number;
  feedItems: OrganizationFeedItem[];
  replayQuery: ReplayQueryState;
  memoryItems: GovernanceMemoryItem[];
}): ReplayDiagnostics {
  const visibleEventCount = input.events.length;
  const compressedEventCount =
    input.allEventCount > visibleEventCount ? input.allEventCount - visibleEventCount : undefined;
  const reviewEvents = input.events.filter((event) => event.eventType === "review_requested").length;
  const advisoryEvents = input.events.filter((event) => event.eventType === "runtime_advisory").length;
  const reviewDensity = visibleEventCount === 0 ? 0 : reviewEvents / visibleEventCount;
  const advisoryDensity = visibleEventCount === 0 ? 0 : advisoryEvents / visibleEventCount;
  const metadataCompletenessRatio = calculateCompleteness(input.feedItems);
  const replayConcentrationPenalty = compressedEventCount ? Math.min(20, compressedEventCount / 2) : 0;
  const visibilityRawScore =
    metadataCompletenessRatio * 55 +
    (1 - Math.min(0.6, reviewDensity + advisoryDensity)) * 30 +
    (input.replayQuery.continuity === "all" ? 10 : 15) -
    replayConcentrationPenalty;
  const replayVisibilityScore = clampScore(visibilityRawScore);

  const continuityStability: ReplayDiagnostics["continuityStability"] =
    advisoryDensity >= 0.35
      ? "advisory_dense"
      : reviewDensity >= 0.3
        ? "elevated_review"
        : "stable";
  const replayConfidence: ReplayDiagnostics["replayConfidence"] =
    replayVisibilityScore >= 80 && metadataCompletenessRatio >= 0.9
      ? "high"
      : replayVisibilityScore >= 55
        ? "moderate"
        : "limited";
  const continuityExplanation =
    continuityStability === "stable"
      ? "Replay continuity appears stable across recent governance windows."
      : continuityStability === "elevated_review"
        ? "Replay continuity interpretation may reflect elevated review concentration in the selected window."
        : "Continuity interpretation may be influenced by elevated advisory density in the selected replay scope.";
  const visibilityExplanation = `This replay view emphasizes ${input.replayQuery.scope.replaceAll(
    "_",
    " "
  )} continuity within the ${input.replayQuery.replayWindow} operational window.`;
  const confidenceExplanation =
    replayConfidence === "high"
      ? "Replay confidence is high because metadata coverage and continuity consistency remain strong."
      : replayConfidence === "moderate"
        ? "Replay confidence is moderate because continuity interpretation includes concentrated review or advisory context."
        : "Replay confidence is limited because metadata coverage or replay concentration reduces interpretability.";

  const warnings: string[] = [];
  if (metadataCompletenessRatio < 0.95) warnings.push("Metadata completeness is reduced in this replay view.");
  if (compressedEventCount && compressedEventCount > 0)
    warnings.push("Replay view has been condensed for executive readability.");
  if (advisoryDensity >= 0.35) warnings.push("Advisory density is elevated in the selected replay window.");
  if (reviewDensity >= 0.3) warnings.push("Review concentration is elevated in the selected replay scope.");
  if (input.memoryItems.some((item) => item.memoryType === "repeated_review_pattern")) {
    warnings.push("Historical governance memory indicates recurring review concentration in this scope.");
  }
  const metrics = getReplayValidationMetrics();
  if (metrics.aliasNormalizationCount > 0) {
    warnings.push("Legacy replay aliases were normalized to canonical taxonomy.");
  }

  return {
    generatedAt: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    replayVisibilityScore,
    replayConfidence,
    continuityStability,
    visibleEventCount,
    compressedEventCount,
    metadataCompletenessRatio,
    advisoryDensity,
    reviewDensity,
    continuityExplanation,
    visibilityExplanation,
    confidenceExplanation,
    diagnosticsWarnings: warnings,
  };
}
