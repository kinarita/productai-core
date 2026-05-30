import { createAuditId } from "@/lib/agents/audit/agentAuditTypes";
import {
  buildCustomerProblemFitReport,
  burningNeedsFromReport,
  painPointsToInsightStrings,
} from "@/lib/cpf/buildCustomerProblemFitReport";
import { cpfAuditFromReport } from "@/lib/cpf/cpfTypes";
import type { CustomerProblemFitReport } from "@/lib/cpf/cpfTypes";
import type { PlannerClarificationAssessment } from "@/lib/agents/planner/plannerClarification";
import type { OpportunityBrief } from "@/lib/opportunity/opportunityTypes";
import { computePmfReadinessFromSignals, inferCurrentPmfStage } from "@/lib/pmf/pmfJourney";
import type { PmfReadiness } from "@/lib/pmf/pmfJourney";
import type { PlannerProviderInput } from "@/lib/agents/planner/plannerTypes";
import { PLANNER_PROMPT_VERSION } from "@/lib/agents/planner/plannerTypes";

export function runPlannerCpfAnalysis(input: {
  providerInput: PlannerProviderInput;
  opportunityBrief?: OpportunityBrief;
  assessment?: PlannerClarificationAssessment;
}): {
  cpfReport: CustomerProblemFitReport;
  pmfReadiness: PmfReadiness;
  currentPmfStage: ReturnType<typeof inferCurrentPmfStage>;
  painPoints: string[];
  burningNeeds: string[];
  audit: ReturnType<typeof buildCpfAudit>;
} {
  const cpfReport = buildCustomerProblemFitReport({
    projectName: input.providerInput.projectName,
    creation: {
      idea: input.providerInput.idea,
      targetUsers: input.providerInput.targetUsers,
      successGoal: input.providerInput.successGoal,
      discoveryMode: input.providerInput.discoveryMode ?? "quick",
      clarifications: input.providerInput.clarifications,
    },
    opportunityBrief: input.opportunityBrief,
    assessment: input.assessment,
  });

  const pmfReadiness = computePmfReadinessFromSignals({
    completenessScore: input.assessment?.completenessScore ?? cpfReport.cpfScore,
    missingAreas: input.assessment?.missingAreas ?? [],
    strengths: input.assessment?.strengths ?? [],
    gaps: input.assessment?.gaps ?? [],
    hasBrief: false,
    hasOpportunityBrief: !!input.opportunityBrief,
    discoveryMode: input.providerInput.discoveryMode ?? "quick",
  });

  pmfReadiness.cpf = Math.max(pmfReadiness.cpf, cpfReport.cpfScore);
  pmfReadiness.opportunityDiscovery = Math.max(
    pmfReadiness.opportunityDiscovery,
    input.opportunityBrief?.plannerConfidence ?? pmfReadiness.opportunityDiscovery
  );

  const currentPmfStage = inferCurrentPmfStage(pmfReadiness);
  const painPoints = painPointsToInsightStrings(cpfReport.painPoints);
  const burningNeeds = burningNeedsFromReport(cpfReport);

  return {
    cpfReport,
    pmfReadiness,
    currentPmfStage,
    painPoints,
    burningNeeds,
    audit: buildCpfAudit(input.providerInput, cpfReport),
  };
}

function buildCpfAudit(
  input: PlannerProviderInput,
  report: CustomerProblemFitReport
) {
  const fields = cpfAuditFromReport(report);
  const missionId = input.missionId ?? "unknown-mission";

  return {
    id: createAuditId(),
    missionId,
    agentId: "product_planner" as const,
    timestamp: new Date().toISOString(),
    providerId: "productai-cpf-heuristic-v1",
    model: "productai-cpf-heuristic-v1",
    promptVersion: `${PLANNER_PROMPT_VERSION}-cpf`,
    input: {
      idea: input.idea,
      targetUsers: input.targetUsers,
      successGoal: input.successGoal,
      clarifications: input.clarifications,
      discoveryMode: input.discoveryMode,
    },
    analysis: `Customer Problem Fit analysis for "${input.projectName}" — CPF ${fields.cpfScore}%, burning need ${fields.burningNeedScore}%.`,
    decisions: [
      `CPF recommendation: ${report.recommendation}`,
      `Top pain: ${fields.topPain}`,
    ],
    reasoning: [
      `WHY: Persona — ${fields.personaSummary}`,
      `WHY: Burning need reflects pain severity and frequency signals`,
      `WHY: ${report.customerJobs[0] ?? "Validate jobs with customer interviews"}`,
    ],
    status: "success" as const,
    clarificationRound: input.clarificationRound,
    discoveryMode: input.discoveryMode,
    pmfStage: "cpf",
    pmfScore: fields.cpfScore,
    ...fields,
    evidenceLevel: report.evidenceLevel,
    strengths: report.persona.slice(0, 2),
    gaps: report.alternativeWeaknesses.slice(0, 2),
    nextActions: [
      report.recommendation === "proceed"
        ? "Proceed toward Problem-Solution Fit after CEO review"
        : "Run 3–5 interviews on top pain before build",
    ],
  };
}
