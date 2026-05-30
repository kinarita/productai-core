export type AgentId =
  | "product_planner"
  | "architect"
  | "designer"
  | "developer"
  | "qa_reviewer";

export type AgentRunStatus = "idle" | "working" | "completed" | "failed";

export type AgentAuditStatus = "success" | "failed";

export interface AgentAuditRecord<TInput = unknown, TOutput = unknown> {
  id: string;
  missionId: string;
  agentId: AgentId;
  timestamp: string;
  providerId: string;
  model: string;
  promptVersion: string;
  promptHash?: string;
  input: TInput;
  analysis?: string;
  decisions?: string[];
  reasoning: string[];
  output?: TOutput;
  status: AgentAuditStatus;
  errorMessage?: string;
}

export interface AgentRun<TInput = unknown, TOutput = unknown> {
  missionId: string;
  agentId: AgentId;
  status: AgentRunStatus;
  input: TInput;
  reasoning: string[];
  audit?: AgentAuditRecord<TInput, TOutput>;
  errorMessage?: string;
}

export function agentRunKey(missionId: string, agentId: AgentId): string {
  return `${missionId}:${agentId}`;
}

export function createAuditId(): string {
  return `audit-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}
