import type {
  ExecutionStartAuditAction,
  ExecutionStartAuditEntry,
} from "@/lib/orchestration/execution-start/executionStartTypes";

function makeId() {
  return `start-audit-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function nowLabel() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function executionStartAuditMessage(action: ExecutionStartAuditAction, detail?: string): string {
  switch (action) {
    case "execution_start_requested":
      return `Execution session start requested${detail ? ` for ${detail}` : ""}.`;
    case "execution_boundary_confirmed":
      return `Execution boundary confirmation completed under governance review${detail ? ` for ${detail}` : ""}.`;
    case "execution_session_started":
      return `Execution session has entered an active governance state. No execution has been initiated${detail ? ` for ${detail}` : ""}.`;
    case "execution_session_revoked":
      return `Execution session was revoked under governance review${detail ? ` for ${detail}` : ""}.`;
    case "execution_start_denied":
      return `Execution session start was denied${detail ? ` for ${detail}` : ""}.`;
    case "operator_signature_recorded":
      return `Execution operator signature recorded${detail ? ` for ${detail}` : ""}.`;
    default:
      return "Execution start audit event recorded.";
  }
}

export function createExecutionStartAuditEntry(input: {
  queueItemId: string;
  action: ExecutionStartAuditAction;
  actor: string;
  role: string;
  detail?: string;
}): ExecutionStartAuditEntry {
  return {
    id: makeId(),
    queueItemId: input.queueItemId,
    action: input.action,
    actor: input.actor,
    role: input.role,
    message: executionStartAuditMessage(input.action, input.detail),
    timestamp: nowLabel(),
  };
}
