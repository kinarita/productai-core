import { createAuditId } from "@/lib/agents/audit/agentAuditTypes";
import {
  buildProblemSolutionFitReport,
  mvpScopeToInsightStrings,
} from "@/lib/psf/buildProblemSolutionFitReport";
import { psfAuditFromReport } from "@/lib/psf/psfTypes";
import type { ProblemSolutionFitReport } from "@/lib/psf/psfTypes";
import type { CustomerProblemFitReport } from "@/lib/cpf/cpfTypes";
import type { OpportunityBrief } from "@/lib/opportunity/opportunityTypes";
import type { PlannerClarificationAssessment } from "@/lib/agents/planner/plannerClarification";
import { computePmfReadinessFromSignals, inferCurrentPmfStage } from "@/lib/pmf/pmfJourney";
import type { PmfReadiness } from "@/lib/pmf/pmfJourney";
import type { PlannerProviderInput } from "@/lib/agents/planner/plannerTypes";
import { PLANNER_PROMPT_VERSION } from "@/lib/agents/planner/plannerTypes";

export function runPlannerPsfAnalysis(input: {
  providerInput: PlannerProviderInput;
  cpfReport?: CustomerProblemFitReport;
  opportunityBrief?: OpportunityBrief;
  assessment?: PlannerClarificationAssessment;
}): {
  psfReport: ProblemSolutionFitReport;
  pmfReadiness: PmfReadiness;
  currentPmfStage: ReturnType<typeof inferCurrentPmfStage>;
  validationAssumptions: string[];
  validationRisks: string[];
  mvpScope: string[];
  audit: ReturnType<typeof buildPsfAudit>;
} {
  const psfReport = buildProblemSolutionFitReport({
    projectName: input.providerInput.projectName,
    creation: {
      idea: input.providerInput.idea,
      targetUsers: input.providerInput.targetUsers,
      successGoal: input.providerInput.successGoal,
      discoveryMode: input.providerInput.discoveryMode ?? "quick",
      clarifications: input.providerInput.clarifications,
    },
    cpfReport: input.cpfReport,
    opportunityBrief: input.opportunityBrief,
    assessment: input.assessment,
  });

  const pmfReadiness = computePmfReadinessFromSignals({
    completenessScore: input.assessment?.completenessScore ?? psfReport.psfScore,
    missingAreas: input.assessment?.missingAreas ?? [],
    strengths: input.assessment?.strengths ?? [],
    gaps: input.assessment?.gaps ?? [],
    hasBrief: false,
    hasOpportunityBrief: !!input.opportunityBrief,
    hasCpfReport: !!input.cpfReport,
    hasPsfReport: true,
    discoveryMode: input.providerInput.discoveryMode ?? "quick",
  });

  pmfReadiness.psf = Math.max(pmfReadiness.psf, psfReport.psfScore);
  if (input.cpfReport) {
    pmfReadiness.cpf = Math.max(pmfReadiness.cpf, input.cpfReport.cpfScore);
  }

  const currentPmfStage = inferCurrentPmfStage(pmfReadiness);
  const mvpScope = mvpScopeToInsightStrings(psfReport.mvpFeatures);

  return {
    psfReport,
    pmfReadiness,
    currentPmfStage,
    validationAssumptions: psfReport.validationAssumptions,
    validationRisks: psfReport.validationRisks,
    mvpScope,
    audit: buildPsfAudit(input.providerInput, psfReport),
  };
}

function buildPsfAudit(
  input: PlannerProviderInput,
  report: ProblemSolutionFitReport
) {
  const fields = psfAuditFromReport(report);
  const missionId = input.missionId ?? "unknown-mission";

  return {
    id: createAuditId(),
    missionId,
    agentId: "product_planner" as const,
    timestamp: new Date().toISOString(),
    providerId: "productai-psf-heuristic-v1",
    model: "productai-psf-heuristic-v1",
    promptVersion: `${PLANNER_PROMPT_VERSION}-psf`,
    input: {
      idea: input.idea,
      targetUsers: input.targetUsers,
      successGoal: input.successGoal,
      clarifications: input.clarifications,
      discoveryMode: input.discoveryMode,
    },
    analysis: `Problem-Solution Fit for "${input.projectName}" — PSF ${fields.psfScore}% (${report.confidenceLevel} confidence).`,
    decisions: [
      `PSF recommendation: ${report.recommendation}`,
      `MVP must-haves: ${report.mvpFeatures.mustHave.join(", ")}`,
    ],
    reasoning: [
      `WHY: ${report.solutionHypothesis}`,
      `WHY: Expected outcome — ${report.expectedOutcome}`,
      `WHY: Top risk — ${report.validationRisks[0] ?? "validate before build"}`,
    ],
    status: "success" as const,
    clarificationRound: input.clarificationRound,
    discoveryMode: input.discoveryMode,
    pmfStage: "psf",
    pmfScore: fields.psfScore,
    ...fields,
    evidenceLevel: report.confidenceLevel,
    strengths: report.mvpFeatures.mustHave,
    gaps: report.validationRisks.slice(0, 2),
    nextActions: report.validationPlan.slice(0, 2),
  };
}
