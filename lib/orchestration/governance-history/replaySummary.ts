import type { GovernanceContinuityExplanation } from "@/lib/orchestration/processing/processingTypes";
import { buildProcessingAnalytics } from "@/lib/orchestration/processing/processingAnalytics";
import type {
  ExecutiveGovernanceSnapshot,
  ExecutiveReplaySummary,
  GovernanceMemoryItem,
  GovernanceTimelineEvent,
} from "@/lib/orchestration/governance-history/governanceHistoryTypes";
import type { ProcessingSession } from "@/lib/orchestration/processing/processingTypes";

export function buildExecutiveReplaySummary(input: {
  events: GovernanceTimelineEvent[];
  snapshots: ExecutiveGovernanceSnapshot[];
  processingSessions: ProcessingSession[];
  memoryItems: GovernanceMemoryItem[];
  continuityExplanation: GovernanceContinuityExplanation;
}): ExecutiveReplaySummary {
  const analytics = buildProcessingAnalytics(input.processingSessions);
  const replayWindow = `${Math.min(input.events.length, 20)} recent governance events`;
  const reviewEvents = input.events.filter((event) => event.eventType === "review_requested").length;
  const runtimeEvents = input.events.filter((event) => event.eventType === "runtime_advisory").length;
  const topMemory = input.memoryItems[0];

  return {
    generatedAt: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    replayWindow,
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
