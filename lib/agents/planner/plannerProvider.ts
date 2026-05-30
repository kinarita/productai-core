import type { PlannerGenerationResult, PlannerProviderInput } from "@/lib/agents/planner/plannerTypes";

export interface PlannerProvider {
  readonly id: string;
  readonly model: string;
  generateProductBrief(input: PlannerProviderInput): Promise<PlannerGenerationResult>;
}
