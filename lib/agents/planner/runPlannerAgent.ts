import { createAuditId } from "@/lib/agents/audit/agentAuditTypes";
import { hashPromptPair } from "@/lib/agents/audit/promptHash";
import { getPlannerProvider } from "@/lib/agents/planner/getPlannerProvider";
import { buildPlannerSystemPrompt, buildPlannerUserPrompt } from "@/lib/agents/planner/plannerPrompt";
import type { PlannerProviderInput } from "@/lib/agents/planner/plannerTypes";
import { PLANNER_PROMPT_VERSION } from "@/lib/agents/planner/plannerTypes";

export async function runPlannerAgent(input: PlannerProviderInput) {
  const provider = getPlannerProvider();
  const systemPrompt = buildPlannerSystemPrompt();
  const userPrompt = buildPlannerUserPrompt(input);
  const promptHash = hashPromptPair(systemPrompt, userPrompt);
  const missionId = input.missionId ?? "unknown-mission";

  try {
    const output = await provider.generateProductBrief(input);

    return {
      output,
      audit: {
        id: createAuditId(),
        missionId,
        agentId: "product_planner" as const,
        timestamp: new Date().toISOString(),
        model: provider.model,
        providerId: provider.id,
        promptVersion: PLANNER_PROMPT_VERSION,
        promptHash,
        input: {
          idea: input.idea,
          targetUsers: input.targetUsers,
          successGoal: input.successGoal,
        },
        analysis: output.analysis,
        decisions: output.decisions,
        reasoning: output.reasoning,
        output,
        status: "success" as const,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Planner generation failed";
    return {
      output: undefined,
      audit: {
        id: createAuditId(),
        missionId,
        agentId: "product_planner" as const,
        timestamp: new Date().toISOString(),
        model: provider.model,
        providerId: provider.id,
        promptVersion: PLANNER_PROMPT_VERSION,
        promptHash,
        input: {
          idea: input.idea,
          targetUsers: input.targetUsers,
          successGoal: input.successGoal,
        },
        reasoning: [],
        status: "failed" as const,
        errorMessage: message,
      },
      error: message,
    };
  }
}
