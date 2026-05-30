import { hashPromptPair, hashPromptPairAsync } from "@/lib/agents/audit/promptHash";
import { buildPlannerSystemPrompt, buildPlannerUserPrompt } from "@/lib/agents/planner/plannerPrompt";
import type { PlannerProviderInput } from "@/lib/agents/planner/plannerTypes";

export function plannerPromptHashSync(input: PlannerProviderInput): string {
  return hashPromptPair(buildPlannerSystemPrompt(), buildPlannerUserPrompt(input));
}

export async function plannerPromptHashAsync(input: PlannerProviderInput): Promise<string> {
  return hashPromptPairAsync(buildPlannerSystemPrompt(), buildPlannerUserPrompt(input));
}
