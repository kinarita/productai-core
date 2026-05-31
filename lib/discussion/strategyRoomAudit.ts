import { createAuditId } from "@/lib/agents/audit/agentAuditTypes";
import type { AgentAuditRecord } from "@/lib/agents/audit/agentAuditTypes";
import type { PlannerGenerationResult } from "@/lib/agents/planner/plannerTypes";
import type { ProjectCreationInput } from "@/lib/project-creation/projectCreationTypes";
import type { DiscussionMode } from "@/lib/discussion/strategyRoomTypes";
import type {
  ArchitectHandoffPreview,
  ExecutiveDecisionRecord,
  StrategySignal,
  StrategySummary,
} from "@/lib/discussion/strategyRoomTypes";

export type StrategyRoomAuditEventType =
  | "executive_discussion_started"
  | "discussion_mode_set"
  | "discussion_turn"
  | "strategy_signal_detected"
  | "executive_decision_recorded"
  | "strategy_summary_generated"
  | "architect_handoff_preview";

export function buildStrategyRoomAuditRecord(input: {
  missionId: string;
  eventType: StrategyRoomAuditEventType;
  summary: string;
  reasoning: string[];
  runInput?: ProjectCreationInput;
  discussionMode?: DiscussionMode;
  executiveDecisions?: ExecutiveDecisionRecord[];
  strategySignals?: StrategySignal[];
  strategySummary?: StrategySummary;
  architectHandoffPreview?: ArchitectHandoffPreview;
}): AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult> {
  const payload = {
    discussionMode: input.discussionMode,
    executiveDecisions: input.executiveDecisions,
    strategySignals: input.strategySignals,
    strategySummary: input.strategySummary,
    architectHandoffPreview: input.architectHandoffPreview,
  };

  return {
    id: createAuditId(),
    missionId: input.missionId,
    agentId: "product_planner",
    timestamp: new Date().toISOString(),
    providerId: `executive-strategy-room-${input.eventType}`,
    model: "productai-executive-strategy-v1",
    promptVersion: `strategy-room-${input.eventType}-v1`,
    input: input.runInput ?? { idea: "", targetUsers: "", successGoal: "", discoveryMode: "quick" },
    analysis: input.summary,
    decisions: [input.eventType, JSON.stringify(payload).slice(0, 500)],
    reasoning: input.reasoning,
    status: "success",
  };
}
