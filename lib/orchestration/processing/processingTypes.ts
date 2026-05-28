import type { ExecutionTarget } from "@/lib/orchestration/execution/executionTypes";

export type ProcessingStatus =
  | "processing_prepared"
  | "processing_active"
  | "processing_paused"
  | "processing_revoked"
  | "processing_denied"
  | "processing_review_required";

export type ProcessingReasonCategory =
  | "runtime_stability"
  | "governance_review"
  | "dependency_blocker"
  | "authorization_continuity"
  | "elevated_risk"
  | "sync_instability"
  | "provider_instability"
  | "execution_boundary_review"
  | "manual_governance_pause"
  | "advisory_review";

export type GovernanceSeverity = "low" | "medium" | "high";

export interface ProcessingGovernanceReason {
  id: string;
  category: ProcessingReasonCategory;
  severity: GovernanceSeverity;
  title: string;
  description: string;
  recommendation: string;
  advisoryOnly: boolean;
  createdAt: string;
}

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
  activeReasons: ProcessingGovernanceReason[];
  latestReviewReason?: ProcessingGovernanceReason;
  reviewRequired: boolean;
  createdAt: string;
}

export type ProcessingAuditAction =
  | "processing_prepared"
  | "processing_governance_activated"
  | "processing_review_requested"
  | "processing_review_resolved"
  | "processing_review_denied"
  | "processing_review_revoked"
  | "processing_governance_reason_added"
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
