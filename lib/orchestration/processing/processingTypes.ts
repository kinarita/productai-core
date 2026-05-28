import type { ExecutionTarget } from "@/lib/orchestration/execution/executionTypes";

export type ProcessingStatus =
  | "processing_prepared"
  | "processing_active"
  | "processing_paused"
  | "processing_revoked"
  | "processing_denied"
  | "processing_review_required";

export interface ProcessingSession {
  id: string;
  executionSessionId: string;
  queueItemId: string;
  missionId: string;
  processingIntent: string;
  processingTarget: ExecutionTarget;
  processingStatus: ProcessingStatus;
  runtimeReservation: {
    reserved: boolean;
    reservationId: string;
    note: string;
  };
  governanceContinuity: string;
  advisoryState: string;
  createdAt: string;
}

export type ProcessingAuditAction =
  | "processing_prepared"
  | "processing_governance_activated"
  | "processing_paused"
  | "processing_revoked"
  | "processing_advisory_updated";

export interface ProcessingAuditEntry {
  id: string;
  queueItemId: string;
  action: ProcessingAuditAction;
  actor: string;
  role: string;
  message: string;
  timestamp: string;
}
