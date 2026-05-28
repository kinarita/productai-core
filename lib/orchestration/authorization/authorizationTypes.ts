import type { ExecutionTarget } from "@/lib/orchestration/execution/executionTypes";

export type AuthorizationStatus =
  | "authorization_requested"
  | "authorized"
  | "execution_authorized"
  | "denied"
  | "revoked";

export interface ExecutionAuthorizationRequest {
  id: string;
  queueItemId: string;
  missionId: string;
  requestedBy: "COO" | "Runtime Observer" | "Human Operator";
  authorizationIntent: string;
  executionTarget: ExecutionTarget;
  governanceSummary: string;
  readinessScore: number;
  runtimeRisk: string;
  status: AuthorizationStatus;
  createdAt: string;
}

export interface ExecutionAuthorizationSignature {
  actor: string;
  role: "CEO" | "Human Operator";
  authorizationType: "execution_authorization";
  authorizedAt: string;
  authorizationNote: string;
  governanceBoundaryAccepted: boolean;
}

export type AuthorizationAuditAction =
  | "authorization_requested"
  | "authorization_granted"
  | "authorization_denied"
  | "authorization_revoked"
  | "governance_review_completed";

export interface AuthorizationAuditEntry {
  id: string;
  queueItemId: string;
  action: AuthorizationAuditAction;
  actor: string;
  role: string;
  message: string;
  timestamp: string;
}
