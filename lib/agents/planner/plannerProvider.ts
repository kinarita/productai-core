import type {
  PlannerAssessResult,
  PlannerGenerationResult,
  PlannerProviderInput,
} from "@/lib/agents/planner/plannerTypes";

export interface PlannerProvider {
  readonly id: string;
  readonly model: string;
  assessRequirements(input: PlannerProviderInput): Promise<PlannerAssessResult>;
  generateProductBrief(input: PlannerProviderInput): Promise<PlannerGenerationResult>;
}
