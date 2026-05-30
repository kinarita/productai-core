import { createAuditId } from "@/lib/agents/audit/agentAuditTypes";
import { hashPromptPair } from "@/lib/agents/audit/promptHash";
import { getPlannerProvider } from "@/lib/agents/planner/getPlannerProvider";
import { buildPlannerSystemPrompt, buildPlannerUserPrompt } from "@/lib/agents/planner/plannerPrompt";
import { MockPlannerProvider } from "@/lib/agents/providers/mockPlannerProvider";
import type { PlannerProviderInput } from "@/lib/agents/planner/plannerTypes";
import { PLANNER_PROMPT_VERSION } from "@/lib/agents/planner/plannerTypes";

export async function runPlannerAgent(input: PlannerProviderInput) {
  const provider = getPlannerProvider();
  const systemPrompt = buildPlannerSystemPrompt();
  const userPrompt = buildPlannerUserPrompt(input);
  const promptHash = hashPromptPair(systemPrompt, userPrompt);
  const missionId = input.missionId ?? "unknown-mission";

  let output: Awaited<ReturnType<typeof provider.generateProductBrief>>;
  let usedProviderFallback = false;
  let providerId = provider.id;
  let model = provider.model;
  let apiErrorNote: string | undefined;

  try {
    output = await provider.generateProductBrief(input);
  } catch (error) {
    apiErrorNote = error instanceof Error ? error.message : "Planner generation failed";
    usedProviderFallback = true;
    providerId = "heuristic-fallback";
    model = "productai-planner-local-v1";
    const mock = new MockPlannerProvider();
    output = await mock.generateProductBrief(input);
    output = {
      ...output,
      analysis: `${output.analysis} (Local template brief — external API unavailable.)`,
      reasoning: [
        "WHY: Product Brief was generated locally so your project can continue.",
        ...(apiErrorNote ? [`WHY: API note — ${apiErrorNote}`] : []),
        ...output.reasoning,
      ],
    };
  }

  return {
    output,
    audit: {
      id: createAuditId(),
      missionId,
      agentId: "product_planner" as const,
      timestamp: new Date().toISOString(),
      model,
      providerId,
      promptVersion: PLANNER_PROMPT_VERSION,
      promptHash,
      input: {
        idea: input.idea,
        targetUsers: input.targetUsers,
        successGoal: input.successGoal,
        clarifications: input.clarifications,
        discoveryMode: input.discoveryMode,
      },
      analysis: output.analysis,
      decisions: output.decisions,
      reasoning: output.reasoning,
      output,
      status: "success" as const,
      clarificationRound: input.clarificationRound,
    },
  };
}
