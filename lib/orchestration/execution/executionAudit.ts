import type { ExecutionAuditAction, ExecutionAuditEntry } from "@/lib/orchestration/execution/executionTypes";

function makeAuditId() {
  return `audit-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function formatTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function auditMessage(action: ExecutionAuditAction, intent?: string): string {
  switch (action) {
    case "ticket_created":
      return `Execution ticket created for: ${intent ?? "operational handoff"}.`;
    case "handoff_submitted":
      return "Execution handoff submitted for executive approval.";
    case "approval_granted":
      return "CEO granted execution handoff authorization (boundary only; no execution started).";
    case "approval_rejected":
      return "CEO rejected execution handoff — ticket cancelled.";
    case "governance_revision_requested":
      return "Governance revision requested on execution handoff.";
    case "handoff_cancelled":
      return "Execution handoff cancelled.";
    default:
      return "Handoff audit event recorded.";
  }
}

export function createAuditEntry(input: {
  ticketId: string;
  action: ExecutionAuditAction;
  actor: string;
  role: string;
  intent?: string;
}): ExecutionAuditEntry {
  return {
    id: makeAuditId(),
    ticketId: input.ticketId,
    action: input.action,
    actor: input.actor,
    role: input.role,
    message: auditMessage(input.action, input.intent),
    timestamp: formatTime(),
  };
}

export function handoffFeedMessage(
  action: "handoff_prepared" | "handoff_approved" | "handoff_rejected" | "runtime_execution_risk",
  detail?: string
): string {
  switch (action) {
    case "handoff_prepared":
      return `COO prepared execution handoff${detail ? `: ${detail}` : ""}. Executive approval is pending.`;
    case "handoff_approved":
      return `CEO approved execution boundary${detail ? ` for ${detail}` : ""}. No autonomous execution was initiated.`;
    case "handoff_rejected":
      return `CEO rejected execution handoff${detail ? ` for ${detail}` : ""}.`;
    case "runtime_execution_risk":
      return "Runtime Observer flagged elevated execution risk — handoff review recommended before any boundary authorization.";
    default:
      return "Execution governance event recorded.";
  }
}