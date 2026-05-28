import type { JudgmentRecommendation } from "@/lib/orchestration/orchestrationTypes";
import { getExecutionPolicy } from "@/lib/orchestration/policy/executionPolicy";

export interface JudgmentGovernanceOverlay {
  governanceNote: string;
  executionImpact: string;
  approvalBoundary: string;
}

export function enrichJudgmentRecommendation(
  recommendation: JudgmentRecommendation
): JudgmentRecommendation & JudgmentGovernanceOverlay {
  const highRisk = recommendation.executionRisk === "high" || recommendation.executionRisk === "medium";
  return {
    ...recommendation,
    governanceNote: highRisk
      ? "Execution planning may proceed after CEO approval."
      : "Advisory recommendation only; no autonomous execution is triggered.",
    executionImpact: highRisk
      ? "Linked tasks and dependencies may shift sequencing once approved."
      : "Limited execution impact expected under current mission load.",
    approvalBoundary: getExecutionPolicy().boundaryMessage,
  };
}