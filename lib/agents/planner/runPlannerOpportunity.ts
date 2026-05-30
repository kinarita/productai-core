import { createAuditId } from "@/lib/agents/audit/agentAuditTypes";
import { buildOpportunityBriefFromInput } from "@/lib/opportunity/buildOpportunityBrief";
import { opportunityAuditFromBrief } from "@/lib/opportunity/opportunityTypes";
import type { PlannerClarificationAssessment } from "@/lib/agents/planner/plannerClarification";
import { computePmfReadinessFromSignals, inferCurrentPmfStage } from "@/lib/pmf/pmfJourney";
import type { OpportunityBrief } from "@/lib/opportunity/opportunityTypes";
import type { PlannerProviderInput } from "@/lib/agents/planner/plannerTypes";
import { PLANNER_PROMPT_VERSION } from "@/lib/agents/planner/plannerTypes";

export function runPlannerOpportunityDiscovery(input: {
  providerInput: PlannerProviderInput;
  assessment?: PlannerClarificationAssessment;
}): {
  opportunityBrief: OpportunityBrief;
  pmfReadiness: ReturnType<typeof computePmfReadinessFromSignals>;
  currentPmfStage: ReturnType<typeof inferCurrentPmfStage>;
  audit: ReturnType<typeof buildOpportunityAudit>;
} {
  const opportunityBrief = buildOpportunityBriefFromInput({
    projectName: input.providerInput.projectName,
    creation: {
      idea: input.providerInput.idea,
      targetUsers: input.providerInput.targetUsers,
      successGoal: input.providerInput.successGoal,
      discoveryMode: input.providerInput.discoveryMode ?? "quick",
      clarifications: input.providerInput.clarifications,
    },
    assessment: input.assessment,
  });

  const pmfReadiness = computePmfReadinessFromSignals({
    completenessScore: input.assessment?.completenessScore ?? opportunityBrief.plannerConfidence,
    missingAreas: input.assessment?.missingAreas ?? [],
    strengths: input.assessment?.strengths ?? [],
    gaps: input.assessment?.gaps ?? [],
    hasBrief: false,
    hasOpportunityBrief: true,
    discoveryMode: input.providerInput.discoveryMode ?? "quick",
  });

  pmfReadiness.opportunityDiscovery = Math.max(
    pmfReadiness.opportunityDiscovery,
    opportunityBrief.plannerConfidence
  );

  const currentPmfStage = inferCurrentPmfStage(pmfReadiness);
  const audit = buildOpportunityAudit(
    input.providerInput,
    opportunityBrief,
    input.assessment?.completenessScore
  );

  return { opportunityBrief, pmfReadiness, currentPmfStage, audit };
}

function buildOpportunityAudit(
  input: PlannerProviderInput,
  brief: OpportunityBrief,
  completeness?: number
) {
  const fields = opportunityAuditFromBrief(brief);
  const missionId = input.missionId ?? "unknown-mission";

  return {
    id: createAuditId(),
    missionId,
    agentId: "product_planner" as const,
    timestamp: new Date().toISOString(),
    providerId: "productai-opportunity-heuristic-v1",
    model: "productai-opportunity-heuristic-v1",
    promptVersion: `${PLANNER_PROMPT_VERSION}-opportunity`,
    input: {
      idea: input.idea,
      targetUsers: input.targetUsers,
      successGoal: input.successGoal,
      clarifications: input.clarifications,
      discoveryMode: input.discoveryMode,
    },
    analysis: `Opportunity Discovery completed for "${input.projectName}" (${brief.evidenceLevel} evidence).`,
    decisions: [
      `Recommended action: ${brief.recommendedAction}`,
      "Opportunity hypothesis documented before Product Brief generation",
    ],
    reasoning: [
      `WHY: ${brief.opportunityHypothesis}`,
      `WHY: Pain signals — ${brief.customerPain[0] ?? "validate with users"}`,
      `WHY: Alternatives considered — ${brief.currentAlternatives.slice(0, 2).join(", ")}`,
    ],
    status: "success" as const,
    clarificationRound: input.clarificationRound,
    discoveryMode: input.discoveryMode,
    pmfStage: inferCurrentPmfStage(
      computePmfReadinessFromSignals({
        completenessScore: completeness ?? brief.plannerConfidence,
        missingAreas: [],
        strengths: brief.customerPain,
        gaps: [],
        hasBrief: false,
        hasOpportunityBrief: true,
        discoveryMode: input.discoveryMode ?? "quick",
      })
    ),
    pmfScore: brief.plannerConfidence,
    assessment: `Opportunity score ${fields.opportunityScore}% — ${brief.recommendedAction}`,
    strengths: brief.customerPain.slice(0, 2),
    gaps: brief.whyExistingSolutionsFail.slice(0, 2),
    nextActions: [
      brief.recommendedAction === "proceed"
        ? "Proceed to Product Brief with stated assumptions"
        : "Run 3–5 user interviews to raise evidence level before build",
    ],
    ...fields,
  };
}
