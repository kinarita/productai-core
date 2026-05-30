import { createAuditId } from "@/lib/agents/audit/agentAuditTypes";
import type { AgentAuditRecord } from "@/lib/agents/audit/agentAuditTypes";
import type { PlannerGenerationResult } from "@/lib/agents/planner/plannerTypes";
import type { ProjectCreationInput } from "@/lib/project-creation/projectCreationTypes";

export type DiscussionAuditEventType =
  | "discussion_message"
  | "discussion_response"
  | "change_proposed"
  | "change_applied"
  | "brief_version_created";

export function buildDiscussionAuditRecord(input: {
  missionId: string;
  eventType: DiscussionAuditEventType;
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
    providerId: `discovery-discussion-${input.eventType}`,
    model: "productai-discovery-discussion-v1",
    promptVersion: `discovery-${input.eventType}-v1`,
    input: input.runInput ?? { idea: "", targetUsers: "", successGoal: "", discoveryMode: "quick" },
    analysis: input.summary,
    decisions: input.decisions ?? [input.eventType],
    reasoning: input.reasoning,
    status: "success",
  };
}
