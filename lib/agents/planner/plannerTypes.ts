import type { AgentAuditRecord, AgentRun } from "@/lib/agents/audit/agentAuditTypes";
import type { ProjectCreationInput } from "@/lib/project-creation/projectCreationTypes";

export const PLANNER_PROMPT_VERSION = "planner-v1";

/** @deprecated Use AgentRunStatus — kept for Phase 14 UI compatibility */
export type PlannerRunStatus = "idle" | "working" | "completed" | "failed";

export interface ProductBriefSections {
  projectSummary: string;
  problemStatement: string;
  targetUsers: string;
  successMetrics: string;
  coreFeatures: string[];
  outOfScope: string[];
  risks: string[];
  recommendedNextStep: string;
}

export interface PlannerGenerationResult {
  analysis: string;
  decisions: string[];
  reasoning: string[];
  brief: ProductBriefSections;
}

export type PlannerAuditRecord = AgentAuditRecord<
  ProjectCreationInput,
  PlannerGenerationResult
>;

/** Planner-facing view of a generic AgentRun (Phase 15). */
export interface PlannerAgentRun {
  missionId: string;
  status: PlannerRunStatus;
  input: ProjectCreationInput;
  analysis?: string;
  decisions?: string[];
  reasoning: string[];
  brief?: ProductBriefSections;
  audit?: PlannerAuditRecord;
  errorMessage?: string;
}

export type PlannerAgentRunRecord = AgentRun<ProjectCreationInput, PlannerGenerationResult>;

export interface PlannerProviderInput extends ProjectCreationInput {
  projectName: string;
  missionId?: string;
}
