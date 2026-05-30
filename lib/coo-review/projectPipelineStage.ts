import type { ExecutiveDecisionStatus, ProjectPipelineStage } from "@/lib/coo-review/cooReviewTypes";
import { getCooReviewReport, getExecutiveDecision } from "@/lib/coo-review/architectGate";
import type { Mission } from "@/types/productai";

export function inferProjectPipelineStage(mission: Mission): ProjectPipelineStage {
  const review = getCooReviewReport(mission);
  const decision = getExecutiveDecision(mission);

  if (mission.lifecycle === "Release" || mission.progress >= 85) return "release";
  if (mission.lifecycle === "Review" || mission.lifecycle === "Implementation") return "qa";
  if (mission.lifecycle === "UI/UX" || mission.lifecycle === "Architecture") {
    return mission.architectureSummary?.trim() ? "build" : "architecture";
  }

  if (decision === "approved") {
    return mission.architectureSummary?.trim() ? "build" : "architecture";
  }
  if (decision === "hold") return "planning";
  if (decision === "needs_validation") return "validation_refinement";
  if (review && (decision === "awaiting_ceo_approval" || !decision)) return "discovery_discussion";
  if (mission.requirementsSummary?.trim() && !review) return "coo_review";
  return "planning";
}

export function projectPipelineStageLabel(stage: ProjectPipelineStage): string {
  switch (stage) {
    case "planning":
      return "Planning";
    case "coo_review":
      return "COO Review";
    case "discovery_discussion":
      return "Discovery Discussion";
    case "ceo_approval":
      return "CEO Approval";
    case "validation_refinement":
      return "Needs Validation";
    case "architecture":
      return "Architecture";
    case "build":
      return "Build";
    case "qa":
      return "QA";
    case "release":
      return "Release";
  }
}

export function pipelineStageAfterCooReview(): ProjectPipelineStage {
  return "discovery_discussion";
}

export function pipelineStageAfterExecutiveDecision(
  decision: ExecutiveDecisionStatus
): ProjectPipelineStage {
  switch (decision) {
    case "approved":
      return "architecture";
    case "needs_validation":
      return "validation_refinement";
    case "hold":
      return "planning";
    case "awaiting_ceo_approval":
      return "discovery_discussion";
  }
}
