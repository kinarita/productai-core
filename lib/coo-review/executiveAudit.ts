import { createAuditId } from "@/lib/agents/audit/agentAuditTypes";
import type { AgentAuditRecord } from "@/lib/agents/audit/agentAuditTypes";
import type { ProjectCreationInput } from "@/lib/project-creation/projectCreationTypes";
import type { PlannerGenerationResult } from "@/lib/agents/planner/plannerTypes";
import type { ExecutiveDecisionStatus } from "@/lib/coo-review/cooReviewTypes";

export type ExecutiveAuditEventType =
  | "human_ceo_decision"
  | "validation_requested"
  | "planner_revalidation_started"
  | "planner_revalidation_completed"
  | "coo_review_rerun";

export function buildExecutiveAuditRecord(input: {
  missionId: string;
  eventType: ExecutiveAuditEventType;
  summary: string;
  reasoning: string[];
  runInput?: ProjectCreationInput;
  decisions?: string[];
}): AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult> {
  return {
    id: createAuditId(),
    missionId: input.missionId,
    agentId: "product_planner",
    timestamp: new Date().toISOString(),
    providerId: `executive-${input.eventType}`,
    model: "productai-executive-workflow-v1",
    promptVersion: `executive-${input.eventType}-v1`,
    input: input.runInput ?? { idea: "", targetUsers: "", successGoal: "", discoveryMode: "quick" },
    analysis: input.summary,
    decisions: input.decisions ?? [input.eventType],
    reasoning: input.reasoning,
    status: "success",
  };
}

export function humanCeoDecisionAudit(
  missionId: string,
  decision: ExecutiveDecisionStatus,
  validationReason?: string
): AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult> {
  return buildExecutiveAuditRecord({
    missionId,
    eventType: "human_ceo_decision",
    summary: `Human CEO decision: ${decision}`,
    reasoning: [
      validationReason
        ? `WHY: CEO validation focus — ${validationReason}`
        : "WHY: Recorded from CEO Decision card (human authorization).",
    ],
    decisions: [`executiveDecision: ${decision}`],
  });
}

export function validationRequestedAudit(
  missionId: string,
  validationReason: string
): AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult> {
  return buildExecutiveAuditRecord({
    missionId,
    eventType: "validation_requested",
    summary: `CEO requested more validation before architecture.`,
    reasoning: [`WHY: ${validationReason}`],
    decisions: ["validation_requested"],
  });
}
