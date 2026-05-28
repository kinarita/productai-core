import type { ExecutionTarget } from "@/lib/orchestration/execution/executionTypes";

export type ExecutionSessionStatus =
  | "execution_start_requested"
  | "execution_started"
  | "execution_session_active"
  | "execution_start_denied"
  | "execution_start_revoked";

export interface ExecutionOperatorSignature {
  actor: string;
  role: "CEO" | "Human Operator";
  executionAuthorizationAccepted: boolean;
  governanceBoundaryAccepted: boolean;
  signedAt: string;
  operatorNote: string;
}

export interface ExecutionSession {
  id: string;
  queueItemId: string;
  missionId: string;
  executionTarget: ExecutionTarget;
  executionIntent: string;
  executionSessionStatus: ExecutionSessionStatus;
  startedBy?: string;
  operatorSignature?: ExecutionOperatorSignature;
  runtimeReservation: {
    reserved: boolean;
    reservationId: string;
    note: string;
  };
  governanceBoundaryConfirmation: string;
  createdAt: string;
}

export type ExecutionStartAuditAction =
  | "execution_start_requested"
  | "execution_boundary_confirmed"
  | "execution_session_started"
  | "execution_session_revoked"
  | "execution_start_denied"
  | "operator_signature_recorded";

export interface ExecutionStartAuditEntry {
  id: string;
  queueItemId: string;
  action: ExecutionStartAuditAction;
  actor: string;
  role: string;
  message: string;
  timestamp: string;
}
