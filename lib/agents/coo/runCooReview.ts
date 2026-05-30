import { createAuditId } from "@/lib/agents/audit/agentAuditTypes";
import type { PlannerClarificationAssessment } from "@/lib/agents/planner/plannerClarification";
import type { ProductBriefSections } from "@/lib/agents/planner/plannerTypes";
import type { CustomerProblemFitReport } from "@/lib/cpf/cpfTypes";
import type { OpportunityBrief } from "@/lib/opportunity/opportunityTypes";
import type { ProblemSolutionFitReport } from "@/lib/psf/psfTypes";
import { buildCooReviewReport } from "@/lib/coo-review/buildCooReviewReport";
import type { CooReviewReport } from "@/lib/coo-review/cooReviewTypes";
import { COO_REVIEW_PROMPT_VERSION } from "@/lib/coo-review/cooReviewTypes";
import type { PlannerProviderInput } from "@/lib/agents/planner/plannerTypes";

export function runCooReview(input: {
  providerInput: PlannerProviderInput;
  opportunityBrief?: OpportunityBrief;
  cpfReport?: CustomerProblemFitReport;
  psfReport?: ProblemSolutionFitReport;
  brief?: ProductBriefSections;
  assessment?: PlannerClarificationAssessment;
  auditSummary?: string;
  discoveryInsights?: {
    strengths?: string[];
    gaps?: string[];
    nextActions?: string[];
    painPoints?: string[];
    validationRisks?: string[];
    validationAssumptions?: string[];
    mvpScope?: string[];
  };
}): {
  cooReviewReport: CooReviewReport;
  audit: ReturnType<typeof buildCooReviewAudit>;
} {
  const cooReviewReport = buildCooReviewReport({
    projectName: input.providerInput.projectName,
    opportunityBrief: input.opportunityBrief,
    cpfReport: input.cpfReport,
    psfReport: input.psfReport,
    brief: input.brief,
    assessment: input.assessment,
    auditSummary: input.auditSummary,
    discoveryInsights: input.discoveryInsights,
  });

  return {
    cooReviewReport,
    audit: buildCooReviewAudit(input.providerInput, cooReviewReport, input.auditSummary),
  };
}

function buildCooReviewAudit(
  input: PlannerProviderInput,
  report: CooReviewReport,
  auditSummary?: string
) {
  const missionId = input.missionId ?? "unknown-mission";

  return {
    id: createAuditId(),
    missionId,
    agentId: "coo_reviewer" as const,
    timestamp: report.reviewedAt,
    providerId: "productai-coo-review-heuristic-v1",
    model: "productai-coo-review-heuristic-v1",
    promptVersion: COO_REVIEW_PROMPT_VERSION,
    input: {
      idea: input.idea,
      targetUsers: input.targetUsers,
      successGoal: input.successGoal,
      discoveryMode: input.discoveryMode,
    },
    analysis:
      auditSummary ??
      `COO Review for "${input.projectName}" — recommendation ${report.recommendation} (${report.overallScore}/100).`,
    decisions: [`COO recommendation: ${report.recommendation}`],
    reasoning: [
      `WHY: Opportunity ${report.scores.marketOpportunity}, CPF ${report.scores.problemSeverity}, PSF ${report.scores.solutionConfidence}.`,
      `WHY: Risk level ${report.scores.riskLevel}/100 — ${report.riskAssessment.slice(0, 160)}`,
      `WHY: ${report.executiveSummary.slice(0, 200)}`,
    ],
    status: "success" as const,
    clarificationRound: input.clarificationRound,
    discoveryMode: input.discoveryMode,
    cooReviewRecommendation: report.recommendation,
    cooReviewOverallScore: report.overallScore,
    strengths: report.strengths,
    gaps: report.concerns,
    nextActions: report.requiredActions,
    output: report,
  };
}
