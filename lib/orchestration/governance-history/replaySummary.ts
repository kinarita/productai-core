import type { GovernanceContinuityExplanation } from "@/lib/orchestration/processing/processingTypes";
import { buildProcessingAnalytics } from "@/lib/orchestration/processing/processingAnalytics";
import type {
  ExecutiveGovernanceSnapshot,
  ExecutiveReplaySummary,
  GovernanceMemoryItem,
  GovernanceTimelineEvent,
} from "@/lib/orchestration/governance-history/governanceHistoryTypes";
import type { ProcessingSession } from "@/lib/orchestration/processing/processingTypes";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";
import { replayWindowDescriptions } from "@/lib/replay-query/replayLabels";

export function buildExecutiveReplaySummary(input: {
  events: GovernanceTimelineEvent[];
  snapshots: ExecutiveGovernanceSnapshot[];
  processingSessions: ProcessingSession[];
  memoryItems: GovernanceMemoryItem[];
  continuityExplanation: GovernanceContinuityExplanation;
  query: ReplayQueryState;
}): ExecutiveReplaySummary {
  const analytics = buildProcessingAnalytics(input.processingSessions);
  const replayWindow = `${Math.min(input.events.length, 20)} recent governance events`;
  const reviewEvents = input.events.filter((event) => event.eventType === "review_requested").length;
  const runtimeEvents = input.events.filter((event) => event.eventType === "runtime_advisory").length;
  const topMemory = input.memoryItems[0];

  return {
    generatedAt: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    replayWindow: input.query.replayWindow === "latest" ? replayWindow : input.query.replayWindow,
    activeScope: input.query.scope,
    continuityFocus: input.query.continuity,
    filteredSeverity: input.query.severity,
    visibleEventCount: input.events.length,
    timelineDensity: input.events.length > 24 ? "expanded" : "compact",
    activeReplayWindow: input.query.replayWindow,
    replayWindowDescription: replayWindowDescriptions[input.query.replayWindow],
    continuityContext: `Continuity view is centered on ${input.query.continuity.replaceAll("_", " ")} signals.`,
    governanceFocusSummary: `Replay focus emphasizes ${input.query.scope.replaceAll("_", " ")} governance context.`,
    governanceHealthSummary:
      analytics.summary.governanceHealthScore >= 70
        ? "Governance replay indicates stable continuity with manageable review pressure."
        : "Governance replay indicates concentrated review pressure requiring executive prioritization.",
    keyContinuityDrivers: [
      `Governance health score: ${analytics.summary.governanceHealthScore}`,
      `Review-required sessions: ${analytics.summary.reviewRequiredCount}`,
      `Runtime governance advisories: ${analytics.summary.runtimeInstabilityCount}`,
    ],
    reviewPressureSummary: `${reviewEvents} replay event(s) requested governance review in the current window.`,
    runtimeGovernanceSummary: `${runtimeEvents} replay event(s) reflected runtime governance advisory context.`,
    recommendedExecutiveFocus: [
      "Keep human review decisions prioritized before expanding governance scope.",
      "Use replay links to confirm mission-level continuity drivers.",
      topMemory
        ? `Reference governance memory: ${topMemory.title}.`
        : "Maintain continuity cadence with recommendation-first advisory interpretation.",
      input.continuityExplanation.recommendations[0] ??
        "Continue calm executive review of replay continuity shifts.",
    ],
  };
}
