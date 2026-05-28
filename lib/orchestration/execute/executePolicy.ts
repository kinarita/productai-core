import type { ExecutionAuthorizationSignature } from "@/lib/orchestration/authorization/authorizationTypes";
import type { RuntimeLockState } from "@/lib/orchestration/queue/executionQueueTypes";
import type { Task } from "@/types/productai";

interface ExecuteGateInput {
  queueStatus: string;
  readinessScore: number;
  runtimeLock: RuntimeLockState;
  authorizationSignature?: ExecutionAuthorizationSignature;
  task?: Task;
  providerDegraded?: boolean;
  hasAuditContinuity?: boolean;
}

export function canCreateExecuteStub(input: ExecuteGateInput): { allowed: boolean; reason: string } {
  if (input.queueStatus !== "execution_authorized") {
    return { allowed: false, reason: "Execution must be authorized before execute review." };
  }
  if (!input.authorizationSignature) {
    return { allowed: false, reason: "Authorization signature continuity is required." };
  }
  if (!input.task?.provenance?.createdFromExecutionTicketId) {
    return { allowed: false, reason: "Provenance continuity is incomplete." };
  }
  return { allowed: true, reason: "Execute review can be requested." };
}

export function canMarkExecuteReady(input: ExecuteGateInput): { allowed: boolean; reason: string } {
  if (input.runtimeLock.active) {
    return { allowed: false, reason: "Runtime lock advisory is active." };
  }
  if (input.providerDegraded) {
    return { allowed: false, reason: "Provider degradation requires delay before execute_ready." };
  }
  if (input.readinessScore < 75) {
    return { allowed: false, reason: "Readiness score is below final governance threshold." };
  }
  if (!input.hasAuditContinuity) {
    return { allowed: false, reason: "Audit continuity is incomplete." };
  }
  if (input.task?.status === "blocked") {
    return { allowed: false, reason: "Unresolved blocker prevents execute_ready." };
  }
  return { allowed: true, reason: "Final governance validation may mark execute_ready." };
}

export function canRevokeExecuteReady(input: ExecuteGateInput): { allowed: boolean; reason: string } {
  if (input.queueStatus !== "execute_ready") {
    return { allowed: false, reason: "Only execute_ready state can be revoked." };
  }
  return { allowed: true, reason: "Execute readiness may be revoked before start." };
}
