export type AgentId =
  | "product_planner"
  | "architect"
  | "designer"
  | "developer"
  | "qa_reviewer";

export type AgentRunStatus =
  | "idle"
  | "assessing"
  | "awaiting_clarification"
  | "working"
  | "completed"
  | "failed";

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
  /** Phase 16+ — clarification / discovery metadata */
  clarificationRound?: number;
  assessment?: string;
  missingAreas?: string[];
  /** Phase 17 — PMF journey */
  discoveryMode?: "quick" | "guided";
  pmfStage?: string;
  pmfScore?: number;
  strengths?: string[];
  gaps?: string[];
  nextActions?: string[];
  /** Phase 18 — Opportunity Discovery */
  opportunityScore?: number;
  customerPainConfidence?: number;
  evidenceLevel?: "low" | "medium" | "high";
  recommendedAction?: "proceed" | "needs_validation" | "hold";
  /** Phase 19 — Customer Problem Fit */
  cpfScore?: number;
  burningNeedScore?: number;
  topPain?: string;
  personaSummary?: string;
  recommendation?: "proceed" | "validate_more" | "hold";
  /** Phase 20 — Problem Solution Fit */
  psfScore?: number;
  solutionHypothesis?: string;
  validationRisks?: string[];
  validationAssumptions?: string[];
  mvpFeatures?: string[];
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
