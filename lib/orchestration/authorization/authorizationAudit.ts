import type {
  AuthorizationAuditAction,
  AuthorizationAuditEntry,
} from "@/lib/orchestration/authorization/authorizationTypes";

function makeId() {
  return `auth-audit-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
}

function nowLabel() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function authorizationAuditMessage(action: AuthorizationAuditAction, detail?: string) {
  switch (action) {
    case "authorization_requested":
      return `Execution authorization requested${detail ? ` for ${detail}` : ""}.`;
    case "authorization_granted":
      return `Execution authorization has been recorded under governance review${detail ? ` for ${detail}` : ""}.`;
    case "authorization_denied":
      return `Execution authorization was denied${detail ? ` for ${detail}` : ""}.`;
    case "authorization_revoked":
      return `Execution authorization was revoked under governance review${detail ? ` for ${detail}` : ""}.`;
    case "governance_review_completed":
      return `Execution intent governance review completed${detail ? ` for ${detail}` : ""}.`;
    default:
      return "Authorization audit event recorded.";
  }
}

export function createAuthorizationAuditEntry(input: {
  queueItemId: string;
  action: AuthorizationAuditAction;
  actor: string;
  role: string;
  detail?: string;
}): AuthorizationAuditEntry {
  return {
    id: makeId(),
    queueItemId: input.queueItemId,
    action: input.action,
    actor: input.actor,
    role: input.role,
    message: authorizationAuditMessage(input.action, input.detail),
    timestamp: nowLabel(),
  };
}
