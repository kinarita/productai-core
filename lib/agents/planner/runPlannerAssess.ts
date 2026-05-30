import { createAuditId } from "@/lib/agents/audit/agentAuditTypes";
import { hashPromptPair } from "@/lib/agents/audit/promptHash";
import { buildHeuristicClarificationAssessment } from "@/lib/agents/planner/plannerClarification";
import { getPlannerProvider } from "@/lib/agents/planner/getPlannerProvider";
import {
  buildPlannerAssessSystemPrompt,
  buildPlannerAssessUserPrompt,
} from "@/lib/agents/planner/plannerAssessPrompt";
import { inferCurrentPmfStage } from "@/lib/pmf/pmfJourney";
import type { PlannerProviderInput } from "@/lib/agents/planner/plannerTypes";
import { PLANNER_PROMPT_VERSION } from "@/lib/agents/planner/plannerTypes";

function heuristicAssessFallback(input: PlannerProviderInput, round: number, apiError?: string) {
  const fallback = buildHeuristicClarificationAssessment({
    input: {
      idea: input.idea,
      targetUsers: input.targetUsers,
      successGoal: input.successGoal,
      clarifications: input.clarifications,
      discoveryMode: input.discoveryMode ?? "quick",
    },
    clarificationRound: round,
    clarificationNotes: input.clarifications,
    questionsAskedSoFar: input.questionsAskedSoFar,
  });

  const reasoning = [
    "WHY: Rule-based assessment keeps discovery moving when the external model API is unavailable.",
    ...(apiError ? [`WHY: API note — ${apiError}`] : []),
  ];

  return {
    analysis:
      "Planner used built-in heuristics to evaluate completeness and PMF readiness. You can continue without waiting on the external API.",
    decisions: [
      "Apply assumption-first clarification rules locally",
      ...(apiError ? ["External planner API was retried then bypassed"] : []),
    ],
    reasoning,
    assessment: fallback,
  };
}

export async function runPlannerAssess(input: PlannerProviderInput) {
  const provider = getPlannerProvider();
  const round = input.clarificationRound ?? 0;
  const systemPrompt = buildPlannerAssessSystemPrompt();
  const userPrompt = buildPlannerAssessUserPrompt(input);
  const promptHash = hashPromptPair(systemPrompt, userPrompt);
  const missionId = input.missionId ?? "unknown-mission";

  let result: Awaited<ReturnType<typeof provider.assessRequirements>>;
  let usedProviderFallback = false;
  let apiErrorNote: string | undefined;

  try {
    result = await provider.assessRequirements(input);
  } catch (error) {
    apiErrorNote = error instanceof Error ? error.message : "Planner assessment failed";
    usedProviderFallback = true;
    const fallback = heuristicAssessFallback(input, round, apiErrorNote);
    result = {
      analysis: fallback.analysis,
      decisions: fallback.decisions,
      reasoning: fallback.reasoning,
      assessment: fallback.assessment,
    };
  }

  const pmfStage = inferCurrentPmfStage(result.assessment.pmfReadiness);

  return {
    ...result,
    audit: {
      id: createAuditId(),
      missionId,
      agentId: "product_planner" as const,
      timestamp: new Date().toISOString(),
      model: usedProviderFallback ? "productai-planner-heuristic-v1" : provider.model,
      providerId: usedProviderFallback ? "heuristic-fallback" : provider.id,
      promptVersion: `${PLANNER_PROMPT_VERSION}-assess`,
      promptHash,
      input: {
        idea: input.idea,
        targetUsers: input.targetUsers,
        successGoal: input.successGoal,
        clarifications: input.clarifications,
        discoveryMode: input.discoveryMode,
      },
      analysis: result.analysis,
      decisions: result.decisions,
      reasoning: result.reasoning,
      status: "success" as const,
      clarificationRound: round,
      discoveryMode: input.discoveryMode,
      pmfStage,
      pmfScore: result.assessment.pmfReadiness.ideaValidation,
      assessment: usedProviderFallback
        ? `Heuristic fallback — completeness ${result.assessment.completenessScore}%`
        : `Completeness ${result.assessment.completenessScore}% — ${result.assessment.needsClarification ? "clarification needed" : "sufficient"}`,
      missingAreas: result.assessment.missingAreas,
      strengths: result.assessment.strengths,
      gaps: result.assessment.gaps,
      nextActions: result.assessment.nextActions,
      opportunityScore: result.assessment.pmfReadiness.opportunityDiscovery,
      customerPainConfidence: result.assessment.pmfReadiness.cpf,
      evidenceLevel:
        result.assessment.completenessScore >= 72
          ? "high"
          : result.assessment.completenessScore >= 48
            ? "medium"
            : "low",
      recommendedAction:
        result.assessment.completenessScore >= 68
          ? "proceed"
          : result.assessment.completenessScore >= 42
            ? "needs_validation"
            : "hold",
    },
  };
}
