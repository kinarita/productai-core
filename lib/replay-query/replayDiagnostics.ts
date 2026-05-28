import type { OrganizationFeedItem } from "@/types/productai";
import type { GovernanceMemoryItem, GovernanceTimelineEvent } from "@/lib/orchestration/governance-history/governanceHistoryTypes";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";
import { getReplayValidationMetrics } from "@/lib/replay-query/replayValidationMetrics";
import { replayDiagnosticsConfig } from "@/lib/replay-query/replayDiagnosticsConfig";
import { replayDiagnosticsWarnings } from "@/lib/replay-query/replayDiagnosticsLabels";
import {
  buildReplayConfidenceExplanation,
  buildReplayContinuityExplanation,
  buildReplayVisibilityExplanation,
} from "@/lib/replay-query/replayDiagnosticsHelpers";

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
  const replayConcentrationPenalty = compressedEventCount
    ? Math.min(
        replayDiagnosticsConfig.compressionPenaltyCap,
        compressedEventCount / replayDiagnosticsConfig.compressionPenaltyDivisor
      )
    : 0;
  const visibilityRawScore =
    metadataCompletenessRatio * replayDiagnosticsConfig.metadataCompletenessWeight +
    (1 - Math.min(replayDiagnosticsConfig.densityCap, reviewDensity + advisoryDensity)) *
      replayDiagnosticsConfig.densityStabilityWeight +
    (input.replayQuery.continuity === "all" ? 10 : replayDiagnosticsConfig.continuityScopeWeight) -
    replayConcentrationPenalty;
  const replayVisibilityScore = clampScore(visibilityRawScore);

  const continuityStability: ReplayDiagnostics["continuityStability"] =
    advisoryDensity >= replayDiagnosticsConfig.advisoryDensityThreshold
      ? "advisory_dense"
      : reviewDensity >= replayDiagnosticsConfig.reviewDensityThreshold
        ? "elevated_review"
        : "stable";
  const replayConfidence: ReplayDiagnostics["replayConfidence"] =
    replayVisibilityScore >= replayDiagnosticsConfig.confidenceThresholds.highScore &&
    metadataCompletenessRatio >= replayDiagnosticsConfig.confidenceThresholds.highCompleteness
      ? "high"
      : replayVisibilityScore >= replayDiagnosticsConfig.confidenceThresholds.moderateScore
        ? "moderate"
        : "limited";
  const continuityExplanation = buildReplayContinuityExplanation(continuityStability);
  const visibilityExplanation = buildReplayVisibilityExplanation(input.replayQuery);
  const confidenceExplanation = buildReplayConfidenceExplanation(replayConfidence);

  const warnings: string[] = [];
  if (metadataCompletenessRatio < replayDiagnosticsConfig.completenessWarningThreshold) {
    warnings.push(replayDiagnosticsWarnings.metadataCompletenessReduced);
  }
  if (compressedEventCount && compressedEventCount > 0)
    warnings.push(replayDiagnosticsWarnings.replayCondensed);
  if (advisoryDensity >= replayDiagnosticsConfig.advisoryDensityThreshold) {
    warnings.push(replayDiagnosticsWarnings.advisoryDensityElevated);
  }
  if (reviewDensity >= replayDiagnosticsConfig.reviewDensityThreshold) {
    warnings.push(replayDiagnosticsWarnings.continuityReviewConcentration);
  }
  if (input.memoryItems.some((item) => item.memoryType === "repeated_review_pattern")) {
    warnings.push(replayDiagnosticsWarnings.historicalReviewConcentration);
  }
  const metrics = getReplayValidationMetrics();
  if (metrics.aliasNormalizationCount > 0) {
    warnings.push(replayDiagnosticsWarnings.legacyAliasNormalized);
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
