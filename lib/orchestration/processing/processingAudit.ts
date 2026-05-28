import type { ProcessingAuditAction, ProcessingAuditEntry } from "@/lib/orchestration/processing/processingTypes";

function makeId() {
  return `proc-audit-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function nowLabel() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function processingAuditMessage(action: ProcessingAuditAction, detail?: string): string {
  switch (action) {
    case "processing_prepared":
      return `Processing governance prepared${detail ? ` for ${detail}` : ""}.`;
    case "processing_governance_activated":
      return "Processing governance entered active continuity state. No operational execution has been initiated.";
    case "processing_review_requested":
      return `Processing governance review has been requested under operational continuity policy${detail ? ` for ${detail}` : ""}.`;
    case "processing_review_resolved":
      return `Governance review resolved under operational continuity policy${detail ? ` for ${detail}` : ""}.`;
    case "processing_review_denied":
      return `Processing governance was denied after review${detail ? ` for ${detail}` : ""}.`;
    case "processing_review_revoked":
      return `Processing governance was revoked after review${detail ? ` for ${detail}` : ""}.`;
    case "processing_governance_reason_added":
      return `Governance reason recorded for processing continuity${detail ? ` — ${detail}` : ""}.`;
    case "processing_paused":
      return `Processing governance paused${detail ? ` for ${detail}` : ""}.`;
    case "processing_revoked":
      return `Processing governance revoked under review${detail ? ` for ${detail}` : ""}.`;
    case "processing_advisory_updated":
      return `Processing advisory updated${detail ? ` — ${detail}` : ""}.`;
    default:
      return "Processing governance event recorded.";
  }
}

export function createProcessingAuditEntry(input: {
  queueItemId: string;
  action: ProcessingAuditAction;
  actor: string;
  role: string;
  detail?: string;
}): ProcessingAuditEntry {
  return {
    id: makeId(),
    queueItemId: input.queueItemId,
    action: input.action,
    actor: input.actor,
    role: input.role,
    message: processingAuditMessage(input.action, input.detail),
    timestamp: nowLabel(),
  };
}
