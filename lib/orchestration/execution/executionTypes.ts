import type { ExecutionPlan, ProposalRiskLevel } from "@/lib/orchestration/policy/policyTypes";

export type ExecutionTicketStatus =
  | "draft"
  | "awaiting_handoff"
  | "handoff_approved"
  | "queued"
  | "executing"
  | "completed"
  | "cancelled";

export type ExecutionTarget =
  | "MCP"
  | "GitHub"
  | "ClaudeCode"
  | "InternalAgent"
  | "RuntimeOperation";

export type ApprovalType = "proposal" | "execution_plan" | "execution_handoff";

export interface ApprovalSignature {
  actor: string;
  role: "CEO" | "COO" | "Architect";
  approvedAt: string;
  approvalType: ApprovalType;
  governanceNote: string;
}

export type MaterializationLifecycleStatus =
  | "execution_planned"
  | "materialization_requested"
  | "materialized"
  | "execution_ready";

export interface ExecutionTicket {
  id: string;
  proposalId: string;
  executionPlanId?: string;
  missionId: string;
  createdBy: string;
  approvedBy?: string;
  executionTarget: ExecutionTarget;
  executionIntent: string;
  riskLevel: ProposalRiskLevel;
  status: ExecutionTicketStatus;
  createdAt: string;
  executionPlan?: ExecutionPlan;
  approvalSignature?: ApprovalSignature;
  materializationStatus?: MaterializationLifecycleStatus;
  materializedTaskIds?: string[];
}

export type ExecutionAuditAction =
  | "ticket_created"
  | "handoff_submitted"
  | "approval_granted"
  | "approval_rejected"
  | "governance_revision_requested"
  | "handoff_cancelled";

export interface ExecutionAuditEntry {
  id: string;
  ticketId: string;
  action: ExecutionAuditAction;
  actor: string;
  role: string;
  message: string;
  timestamp: string;
}