import { createAuditId } from "@/lib/agents/audit/agentAuditTypes";
import type { AgentAuditRecord } from "@/lib/agents/audit/agentAuditTypes";
import type { PlannerClarificationAssessment } from "@/lib/agents/planner/plannerClarification";
import type {
  PlannerGenerationResult,
  PlannerProviderInput,
  ProductBriefSections,
} from "@/lib/agents/planner/plannerTypes";
import type { ProjectCreationInput } from "@/lib/project-creation/projectCreationTypes";
import { PLANNER_PROMPT_VERSION } from "@/lib/agents/planner/plannerTypes";
import { runPlannerCpfAnalysis } from "@/lib/agents/planner/runPlannerCpf";
import { runPlannerOpportunityDiscovery } from "@/lib/agents/planner/runPlannerOpportunity";
import { runPlannerPsfAnalysis } from "@/lib/agents/planner/runPlannerPsf";
import type { CustomerProblemFitReport } from "@/lib/cpf/cpfTypes";
import type { OpportunityBrief } from "@/lib/opportunity/opportunityTypes";
import type { ProblemSolutionFitReport } from "@/lib/psf/psfTypes";
import type { PmfReadiness, PmfStage } from "@/lib/pmf/pmfJourney";
import { computeAggregatePmfReadinessScore } from "@/lib/pmf/pmfStatus";

export function runPlannerRevalidation(input: {
  providerInput: PlannerProviderInput;
  assessment?: PlannerClarificationAssessment;
  opportunityBrief?: OpportunityBrief;
  cpfReport?: CustomerProblemFitReport;
  psfReport?: ProblemSolutionFitReport;
  brief: ProductBriefSections;
  validationReason: string;
}): {
  opportunityBrief: OpportunityBrief;
  cpfReport: CustomerProblemFitReport;
  psfReport: ProblemSolutionFitReport;
  brief: ProductBriefSections;
  assessment: PlannerClarificationAssessment;
  pmfReadiness: PmfReadiness;
  currentPmfStage: PmfStage;
  validationAssumptions: string[];
  validationRisks: string[];
  mvpScope: string[];
  audits: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult>[];
} {
  const ceoFocus = input.validationReason.trim();
  const augmentedClarifications = [
    input.providerInput.clarifications?.trim(),
    `CEO validation request: ${ceoFocus}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const providerInput: PlannerProviderInput = {
    ...input.providerInput,
    clarifications: augmentedClarifications,
  };

  const baseAssessment = input.assessment;

  const assessment: PlannerClarificationAssessment = baseAssessment
    ? {
        ...baseAssessment,
        gaps: [
          ceoFocus,
          ...baseAssessment.gaps.filter((g) => g !== ceoFocus),
        ].slice(0, 6),
        nextActions: [
          `Address CEO validation: ${ceoFocus}`,
          ...baseAssessment.nextActions,
        ].slice(0, 6),
        completenessScore: Math.min(100, baseAssessment.completenessScore + 4),
      }
    : {
        completenessScore: 70,
        needsClarification: false,
        missingAreas: [],
        questions: [],
        strengths: [],
        gaps: [ceoFocus],
        nextActions: [`Address CEO validation: ${ceoFocus}`],
        opportunities: [],
        threats: [],
        painPoints: [],
        burningNeeds: [],
        validationAssumptions: [],
        validationRisks: [],
        mvpScope: [],
        pmfReadiness: {
          ideaValidation: 70,
          opportunityDiscovery: 70,
          cpf: 70,
          psf: 70,
          mvp: 70,
          pmf: 0,
        },
      };

  const opportunity = runPlannerOpportunityDiscovery({
    providerInput,
    assessment,
  });

  const cpf = runPlannerCpfAnalysis({
    providerInput,
    opportunityBrief: opportunity.opportunityBrief,
    assessment,
  });

  const psf = runPlannerPsfAnalysis({
    providerInput,
    cpfReport: cpf.cpfReport,
    opportunityBrief: opportunity.opportunityBrief,
    assessment,
  });

  const brief = refineBriefForValidation(input.brief, ceoFocus, psf.psfReport);

  const revalidationAudit: AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult> = {
    id: createAuditId(),
    missionId: providerInput.missionId ?? "unknown-mission",
    agentId: "product_planner",
    timestamp: new Date().toISOString(),
    providerId: "productai-planner-revalidation-v1",
    model: "productai-planner-revalidation-v1",
    promptVersion: `${PLANNER_PROMPT_VERSION}-revalidation`,
    input: providerInput,
    analysis: `Planner re-validated discovery artifacts after CEO request: ${ceoFocus.slice(0, 120)}`,
    decisions: [
      "Updated Opportunity, CPF, and PSF from CEO validation focus",
      "Refined Product Brief sections tied to validation request",
    ],
    reasoning: [
      `WHY: CEO asked to validate — ${ceoFocus}`,
      `WHY: Opportunity confidence ${opportunity.opportunityBrief.plannerConfidence}%`,
      `WHY: PSF score ${psf.psfReport.psfScore}% after re-analysis`,
    ],
    status: "success",
    discoveryMode: providerInput.discoveryMode,
    pmfStage: psf.currentPmfStage,
    pmfScore: computeAggregatePmfReadinessScore(psf.pmfReadiness),
    psfScore: psf.psfReport.psfScore,
  };

  return {
    opportunityBrief: opportunity.opportunityBrief,
    cpfReport: cpf.cpfReport,
    psfReport: psf.psfReport,
    brief,
    assessment,
    pmfReadiness: psf.pmfReadiness,
    currentPmfStage: psf.currentPmfStage,
    validationAssumptions: psf.validationAssumptions,
    validationRisks: psf.validationRisks,
    mvpScope: psf.mvpScope,
    audits: [revalidationAudit, opportunity.audit, cpf.audit, psf.audit],
  };
}

function refineBriefForValidation(
  brief: ProductBriefSections,
  validationReason: string,
  psfReport: ProblemSolutionFitReport
): ProductBriefSections {
  const validationRisk = `CEO validation focus: ${validationReason}`;
  const risks = brief.risks.includes(validationRisk)
    ? brief.risks
    : [validationRisk, ...brief.risks].slice(0, 6);

  return {
    ...brief,
    projectSummary: `${brief.projectSummary}\n\nRe-validation note: ${validationReason}`,
    recommendedNextStep: `Resolve CEO validation request, then re-submit for COO review. ${brief.recommendedNextStep}`,
    risks,
    coreFeatures:
      psfReport.mvpFeatures.mustHave.length > 0
        ? [...psfReport.mvpFeatures.mustHave.slice(0, 4)]
        : brief.coreFeatures,
  };
}
