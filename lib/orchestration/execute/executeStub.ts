import { executeBoundaryMessage } from "@/lib/orchestration/execute/executeBoundary";
import type {
  ExecuteFinalApprovalSignature,
  ExecuteStub,
} from "@/lib/orchestration/execute/executeTypes";
import type { ExecutionQueueItem } from "@/lib/orchestration/queue/executionQueueTypes";

function makeId() {
  return `exec-stub-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
}

function nowLabel() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function createExecuteStub(input: {
  item: ExecutionQueueItem;
  missionId: string;
  executionIntent: string;
}): ExecuteStub {
  return {
    id: makeId(),
    queueItemId: input.item.id,
    missionId: input.missionId,
    executionIntent: input.executionIntent,
    executionTarget: input.item.executionTarget,
    executeStatus: "execute_review_pending",
    governanceValidation: executeBoundaryMessage(),
    executionBoundaryAccepted: false,
    createdAt: nowLabel(),
  };
}

export function createFinalApprovalSignature(note?: string): ExecuteFinalApprovalSignature {
  return {
    actor: "Alex Chen",
    role: "CEO",
    approvedAt: new Date().toISOString(),
    approvalType: "execute_ready_validation",
    approvalNote:
      note ??
      "Execution readiness approved under final governance validation. No execution started.",
  };
}
