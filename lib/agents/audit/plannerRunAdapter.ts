import type { AgentRun } from "@/lib/agents/audit/agentAuditTypes";
import type {
  PlannerAgentRun,
  PlannerAuditRecord,
  PlannerGenerationResult,
  PlannerRunStatus,
  ProductBriefSections,
} from "@/lib/agents/planner/plannerTypes";
import type { ProjectCreationInput } from "@/lib/project-creation/projectCreationTypes";

export type PlannerAgentRunRecord = AgentRun<ProjectCreationInput, PlannerGenerationResult>;

export function toPlannerAgentRun(run: PlannerAgentRunRecord | undefined): PlannerAgentRun | undefined {
  if (!run) return undefined;

  const output = run.audit?.output;
  const brief = output?.brief as ProductBriefSections | undefined;

  return {
    missionId: run.missionId,
    status: run.status as PlannerRunStatus,
    input: run.input,
    reasoning: run.reasoning,
    analysis: run.audit?.analysis ?? output?.analysis,
    decisions: run.audit?.decisions ?? output?.decisions,
    brief,
    audit: run.audit as PlannerAuditRecord | undefined,
    errorMessage: run.errorMessage,
  };
}
