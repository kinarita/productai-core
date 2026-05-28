import type { GovernanceMemoryItem } from "@/lib/orchestration/governance-history/governanceHistoryTypes";
import type { ProcessingSession } from "@/lib/orchestration/processing/processingTypes";
import type { ReplayDiagnostics } from "@/lib/replay-query/replayDiagnostics";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";
import { buildReplayHref } from "@/lib/replay-query/replayQueryNavigation";
import type { RuntimeAlert } from "@/lib/store/runtimeStore";

export interface DecisionAttentionItem {
  id: string;
  missionId: string;
  taskId?: string;
  severity: "informational" | "advisory" | "elevated_review" | "executive_focus";
  continuityCategory: string;
  replayConfidence: ReplayDiagnostics["replayConfidence"];
  replayVisibilityScore: number;
  governanceReason: string;
  recommendedReviewAction: string;
  drilldownHref: string;
  generatedAt: string;
  whyThisNeedsAttention: string;
  continuityExplanation: string;
  governanceImpact: string;
}

function buildItem(input: Omit<DecisionAttentionItem, "id" | "generatedAt">): DecisionAttentionItem {
  return {
    ...input,
    id: `attention-${input.missionId}-${input.severity}-${Math.random().toString(36).slice(2, 7)}`,
    generatedAt: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
}

export function buildDecisionAttentionQueue(input: {
  replayDiagnostics: ReplayDiagnostics;
  memoryItems: GovernanceMemoryItem[];
  processingSessions: ProcessingSession[];
  runtimeAlerts: RuntimeAlert[];
  replayQuery: ReplayQueryState;
}): DecisionAttentionItem[] {
  const items: DecisionAttentionItem[] = [];
  const reviewRequired = input.processingSessions.filter((session) => session.reviewRequired);

  if (reviewRequired.length > 0) {
    const missionId = reviewRequired[0].missionId;
    items.push(
      buildItem({
        missionId,
        taskId: reviewRequired[0].queueItemId,
        severity: "executive_focus",
        continuityCategory: "continuity_review",
        replayConfidence: input.replayDiagnostics.replayConfidence,
        replayVisibilityScore: input.replayDiagnostics.replayVisibilityScore,
        governanceReason: "Review-required processing continuity remains unresolved.",
        recommendedReviewAction:
          "Executive review is recommended due to elevated continuity review concentration.",
        drilldownHref: buildReplayHref("/runtime-cost", {
          ...input.replayQuery,
          mission: missionId,
          review: "processing_review_required",
        }),
        whyThisNeedsAttention:
          "Review-required processing sessions are concentrated in the current governance window.",
        continuityExplanation: input.replayDiagnostics.continuityExplanation,
        governanceImpact:
          "Pending review concentration may delay mission-level governance continuity interpretation.",
      })
    );
  }

  if (input.replayDiagnostics.replayVisibilityScore < 65) {
    items.push(
      buildItem({
        missionId: input.replayQuery.mission === "all" ? "organization" : input.replayQuery.mission,
        severity: "advisory",
        continuityCategory: "continuity_governance",
        replayConfidence: input.replayDiagnostics.replayConfidence,
        replayVisibilityScore: input.replayDiagnostics.replayVisibilityScore,
        governanceReason: "Replay visibility score indicates reduced interpretability.",
        recommendedReviewAction:
          "Review replay scope and continuity filters before final executive judgment.",
        drilldownHref: buildReplayHref("/runtime-cost", input.replayQuery),
        whyThisNeedsAttention:
          "Replay visibility and confidence suggest this view should be interpreted as advisory context.",
        continuityExplanation: input.replayDiagnostics.continuityExplanation,
        governanceImpact:
          "Reduced replay visibility may narrow confidence in governance continuity interpretation.",
      })
    );
  }

  if (input.runtimeAlerts.length > 0) {
    items.push(
      buildItem({
        missionId: input.replayQuery.mission === "all" ? "organization" : input.replayQuery.mission,
        severity: "elevated_review",
        continuityCategory: "continuity_runtime",
        replayConfidence: input.replayDiagnostics.replayConfidence,
        replayVisibilityScore: input.replayDiagnostics.replayVisibilityScore,
        governanceReason: "Runtime governance advisories remain active.",
        recommendedReviewAction:
          "Confirm runtime advisory context before finalizing continuity-sensitive executive decisions.",
        drilldownHref: buildReplayHref("/runtime-cost", {
          ...input.replayQuery,
          governance: "runtime",
        }),
        whyThisNeedsAttention:
          "Runtime advisories can influence continuity interpretation in executive governance review.",
        continuityExplanation: input.replayDiagnostics.continuityExplanation,
        governanceImpact:
          "Runtime advisories may shift replay confidence and governance prioritization sequencing.",
      })
    );
  }

  const recurringMemory = input.memoryItems.find(
    (item) =>
      item.memoryType === "repeated_review_pattern" ||
      item.memoryType === "runtime_instability_pattern"
  );
  if (recurringMemory) {
    items.push(
      buildItem({
        missionId: recurringMemory.relatedMissionIds[0] ?? "organization",
        severity: "informational",
        continuityCategory: "continuity_replay",
        replayConfidence: input.replayDiagnostics.replayConfidence,
        replayVisibilityScore: input.replayDiagnostics.replayVisibilityScore,
        governanceReason: recurringMemory.title,
        recommendedReviewAction:
          "Use governance memory context to calibrate review sequencing across replay scopes.",
        drilldownHref: buildReplayHref("/runtime-cost", {
          ...input.replayQuery,
          scope: "continuity",
        }),
        whyThisNeedsAttention:
          "Historical governance memory indicates recurring review concentration patterns.",
        continuityExplanation: input.replayDiagnostics.continuityExplanation,
        governanceImpact:
          "Memory-informed continuity context supports consistent executive review prioritization.",
      })
    );
  }

  return items.slice(0, 6);
}

export function buildDecisionAttentionSummary(items: DecisionAttentionItem[]): string {
  if (items.length === 0) {
    return "Current executive focus remains stable with no concentrated decision attention items.";
  }
  return `Current executive focus includes ${items.length} replay-informed decision attention item(s) across continuity and governance review context.`;
}
