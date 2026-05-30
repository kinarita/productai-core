/** Phase 21.5 — COO Review (AI recommendation, not final decision). */

export type CooReviewRecommendation = "PROCEED" | "VALIDATE MORE" | "HOLD";

export type ExecutiveDecisionStatus =
  | "awaiting_ceo_approval"
  | "approved"
  | "hold"
  | "needs_validation";

export interface CooReviewScores {
  marketOpportunity: number;
  problemSeverity: number;
  solutionConfidence: number;
  mvpFeasibility: number;
  /** Higher = more dangerous */
  riskLevel: number;
  strategicFit: number;
}

export interface CooReviewReport {
  overallScore: number;
  recommendation: CooReviewRecommendation;
  scores: CooReviewScores;
  executiveSummary: string;
  marketOpportunityAssessment: string;
  customerProblemAssessment: string;
  solutionAssessment: string;
  riskAssessment: string;
  strengths: string[];
  concerns: string[];
  requiredActions: string[];
  reviewedAt: string;
}

export type ProjectPipelineStage =
  | "planning"
  | "coo_review"
  | "discovery_discussion"
  | "ceo_approval"
  | "validation_refinement"
  | "architecture"
  | "build"
  | "qa"
  | "release";

export const COO_REVIEW_PROMPT_VERSION = "coo-review-v1";

export function cooRecommendationLabel(recommendation: CooReviewRecommendation): string {
  return recommendation;
}

export function cooRecommendationBadgeVariant(
  recommendation: CooReviewRecommendation
): "success" | "warning" | "danger" {
  switch (recommendation) {
    case "PROCEED":
      return "success";
    case "VALIDATE MORE":
      return "warning";
    case "HOLD":
      return "danger";
  }
}

export function executiveDecisionLabel(status: ExecutiveDecisionStatus): string {
  switch (status) {
    case "awaiting_ceo_approval":
      return "Awaiting Approval";
    case "approved":
      return "Approved";
    case "needs_validation":
      return "Needs Validation";
    case "hold":
      return "On Hold";
  }
}

export function executiveDecisionBadgeVariant(
  status: ExecutiveDecisionStatus
): "success" | "warning" | "danger" | "info" {
  switch (status) {
    case "approved":
      return "success";
    case "needs_validation":
      return "warning";
    case "hold":
      return "danger";
    case "awaiting_ceo_approval":
      return "info";
  }
}
