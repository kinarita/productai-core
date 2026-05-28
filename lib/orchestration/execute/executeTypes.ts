import type { ExecutionTarget } from "@/lib/orchestration/execution/executionTypes";

export type ExecuteStatus =
  | "execute_review_pending"
  | "execute_ready"
  | "execute_revoked"
  | "execute_denied";

export interface ExecuteStub {
  id: string;
  queueItemId: string;
  missionId: string;
  executionIntent: string;
  executionTarget: ExecutionTarget;
  executeStatus: ExecuteStatus;
  governanceValidation: string;
  executionBoundaryAccepted: boolean;
  finalApprovalSignature?: ExecuteFinalApprovalSignature;
  createdAt: string;
}

export interface ExecuteFinalApprovalSignature {
  actor: string;
  role: "CEO" | "Human Operator";
  approvedAt: string;
  approvalType: "execute_ready_validation";
  approvalNote: string;
}

export type ExecuteAuditAction =
  | "execute_review_requested"
  | "execute_readiness_validated"
  | "execute_readiness_revoked"
  | "execute_readiness_denied"
  | "final_governance_validation_completed";

export interface ExecuteAuditEntry {
  id: string;
  queueItemId: string;
  action: ExecuteAuditAction;
  actor: string;
  role: string;
  message: string;
  timestamp: string;
}
