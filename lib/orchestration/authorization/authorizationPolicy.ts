import type { ExecutionQueueItem, RuntimeLockState } from "@/lib/orchestration/queue/executionQueueTypes";
import type { Task } from "@/types/productai";

interface AuthorizationGateInput {
  item: ExecutionQueueItem;
  task?: Task;
  runtimeLock: RuntimeLockState;
}

export function canRequestExecutionAuthorization(input: AuthorizationGateInput): {
  allowed: boolean;
  reason: string;
} {
  if (input.item.queueStatus !== "awaiting_execution_authorization") {
    return { allowed: false, reason: "Queue item must be awaiting execution authorization." };
  }
  if (!input.task?.provenance?.createdFromExecutionTicketId) {
    return { allowed: false, reason: "Missing provenance continuity from execution ticket." };
  }
  return { allowed: true, reason: "Authorization request can proceed under governance review." };
}

export function canAuthorizeExecution(input: AuthorizationGateInput): {
  allowed: boolean;
  reason: string;
} {
  if (input.runtimeLock.active) {
    return { allowed: false, reason: "Runtime lock advisory is active; delay authorization." };
  }
  if (input.item.readinessScore < 70) {
    return { allowed: false, reason: "Readiness score is below authorization threshold." };
  }
  if (!input.task?.provenance?.governanceApprovedBy) {
    return { allowed: false, reason: "Governance approval continuity is missing." };
  }
  if (input.task.status === "blocked") {
    return { allowed: false, reason: "Task has unresolved blockers." };
  }
  if (input.item.blockingConditions.length > 0) {
    return { allowed: false, reason: "Blocking conditions remain unresolved." };
  }
  return { allowed: true, reason: "Human execution authorization may be recorded." };
}

export function canRevokeAuthorization(input: AuthorizationGateInput): {
  allowed: boolean;
  reason: string;
} {
  const revocable =
    input.item.queueStatus === "execution_authorized" || input.item.queueStatus === "authorized";
  if (!revocable) {
    return { allowed: false, reason: "Only authorized queue items can be revoked." };
  }
  return { allowed: true, reason: "Authorization may be revoked under governance review." };
}
