import { createAuditId } from "@/lib/agents/audit/agentAuditTypes";
import type { AgentAuditRecord } from "@/lib/agents/audit/agentAuditTypes";
import type { PlannerGenerationResult } from "@/lib/agents/planner/plannerTypes";
import type { ProjectCreationInput } from "@/lib/project-creation/projectCreationTypes";
import type { MeetingMinutes } from "@/lib/discussion/decisionGovernanceTypes";
import type { ArchitectHandoffPreview } from "@/lib/discussion/strategyRoomTypes";
import type { DecisionItem } from "@/lib/discussion/decisionGovernanceTypes";

export type DecisionGovernanceAuditEventType =
  | "decision_created"
  | "decision_approved"
  | "decision_rejected"
  | "decision_on_hold"
  | "decision_needs_discussion"
  | "decision_auto_applied_to_brief"
  | "brief_change_candidate_created"
  | "brief_change_committed"
  | "meeting_minutes_generated"
  | "meeting_minutes_opened"
  | "architect_handoff_created"
  | "architect_handoff_blocked_pending_decisions";

export function buildDecisionGovernanceAuditRecord(input: {
  missionId: string;
  eventType: DecisionGovernanceAuditEventType;
  summary: string;
  reasoning: string[];
  runInput?: ProjectCreationInput;
  decisionItems?: DecisionItem[];
  meetingMinutes?: MeetingMinutes;
  architectHandoffPreview?: ArchitectHandoffPreview;
}): AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult> {
  const payload = {
    decisionItems: input.decisionItems,
    meetingMinutes: input.meetingMinutes,
    architectHandoffPreview: input.architectHandoffPreview,
  };

  return {
    id: createAuditId(),
    missionId: input.missionId,
    agentId: "product_planner",
    timestamp: new Date().toISOString(),
    providerId: `decision-governance-${input.eventType}`,
    model: "productai-decision-governance-v1",
    promptVersion: `decision-gov-${input.eventType}-v1`,
    input: input.runInput ?? { idea: "", targetUsers: "", successGoal: "", discoveryMode: "quick" },
    analysis: input.summary,
    decisions: [input.eventType, JSON.stringify(payload).slice(0, 600)],
    reasoning: input.reasoning,
    status: "success",
  };
}
