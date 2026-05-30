import type { CooReviewReport, CooReviewRecommendation, ExecutiveDecisionStatus } from "@/lib/coo-review/cooReviewTypes";

/** Legacy Phase 21 shape stored in localStorage. */
interface LegacyCeoReviewReport {
  overallScore: number;
  decision?: CooReviewRecommendation;
  recommendation?: CooReviewRecommendation;
  scores: CooReviewReport["scores"];
  executiveSummary: string;
  marketOpportunityAssessment: string;
  customerProblemAssessment: string;
  solutionAssessment: string;
  riskAssessment: string;
  strengths: string[];
  concerns: string[];
  requiredActions: string[];
  approvedForArchitecture?: boolean;
  reviewedAt: string;
}

export function migrateLegacyReviewReport(raw: unknown): CooReviewReport | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as LegacyCeoReviewReport;
  const recommendation = r.recommendation ?? r.decision;
  if (!recommendation || typeof r.overallScore !== "number") return undefined;

  return {
    overallScore: r.overallScore,
    recommendation,
    scores: r.scores,
    executiveSummary: r.executiveSummary,
    marketOpportunityAssessment: r.marketOpportunityAssessment,
    customerProblemAssessment: r.customerProblemAssessment,
    solutionAssessment: r.solutionAssessment,
    riskAssessment: r.riskAssessment,
    strengths: r.strengths ?? [],
    concerns: r.concerns ?? [],
    requiredActions: r.requiredActions ?? [],
    reviewedAt: r.reviewedAt,
  };
}

/** Never auto-approve from legacy PROCEED — human CEO must approve. */
export function defaultExecutiveDecisionForReport(
  report: CooReviewReport | undefined,
  existing?: ExecutiveDecisionStatus
): ExecutiveDecisionStatus | undefined {
  if (existing && existing !== "awaiting_ceo_approval") return existing;
  if (!report) return undefined;
  return "awaiting_ceo_approval";
}
