import type { ExecuteAuditAction, ExecuteAuditEntry } from "@/lib/orchestration/execute/executeTypes";

function makeId() {
  return `exec-audit-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
}

function nowLabel() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function executeAuditMessage(action: ExecuteAuditAction, detail?: string): string {
  switch (action) {
    case "execute_review_requested":
      return `Execute review requested${detail ? ` for ${detail}` : ""}.`;
    case "execute_readiness_validated":
      return `Execution readiness has been validated under governance review${detail ? ` for ${detail}` : ""}.`;
    case "execute_readiness_revoked":
      return `Execute readiness was revoked pending stabilization${detail ? ` for ${detail}` : ""}.`;
    case "execute_readiness_denied":
      return `Execute readiness was denied under governance review${detail ? ` for ${detail}` : ""}.`;
    case "final_governance_validation_completed":
      return `Final governance validation completed for execution readiness${detail ? ` for ${detail}` : ""}.`;
    default:
      return "Execute governance event recorded.";
  }
}

export function createExecuteAuditEntry(input: {
  queueItemId: string;
  action: ExecuteAuditAction;
  actor: string;
  role: string;
  detail?: string;
}): ExecuteAuditEntry {
  return {
    id: makeId(),
    queueItemId: input.queueItemId,
    action: input.action,
    actor: input.actor,
    role: input.role,
    message: executeAuditMessage(input.action, input.detail),
    timestamp: nowLabel(),
  };
}
