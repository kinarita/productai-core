import { inferExecutionTarget } from "@/lib/orchestration/execution/executionPolicy";
import { validateExecutionBoundary } from "@/lib/orchestration/queue/executionGate";
import type {
  ExecutionQueueItem,
  QueueLifecycleStatus,
  ReservationActor,
  RuntimeLockStatus,
} from "@/lib/orchestration/queue/executionQueueTypes";
import { computeReadinessScore } from "@/lib/orchestration/queue/readinessScore";
import type { ExecutionTicket } from "@/lib/orchestration/execution/executionTypes";
import type { Task } from "@/types/productai";

function makeQueueId() {
  return `eq-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function formatTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function createQueueItemFromTask(input: {
  task: Task;
  ticket?: ExecutionTicket;
  runtimeLockStatus?: RuntimeLockStatus;
}): ExecutionQueueItem {
  const { task, ticket } = input;
  const target =
    ticket?.executionTarget ??
    (task.provenance?.createdFromProposalId
      ? inferExecutionTarget("dependency_escalation")
      : "InternalAgent");

  const score = computeReadinessScore({
    task,
    ticket,
    syncWarningCount: 0,
    runtimeAlertCount: 0,
  });

  return {
    id: makeQueueId(),
    taskId: task.id,
    missionId: task.missionId,
    executionTarget: target,
    queueStatus: "queued",
    governanceBoundary: validateExecutionBoundary(),
    runtimeLockStatus: input.runtimeLockStatus ?? "unlocked",
    readinessScore: score.score,
    blockingConditions: [],
    createdAt: formatTime(),
    ticketId: ticket?.id ?? task.provenance?.createdFromExecutionTicketId,
  };
}

export function applyRuntimeLockToItems(
  items: ExecutionQueueItem[],
  locked: boolean
): ExecutionQueueItem[] {
  return items.map((item) => {
    if (item.queueStatus === "awaiting_execution_authorization") return item;
    return {
      ...item,
      runtimeLockStatus: locked ? "locked" : item.runtimeLockStatus === "locked" ? "unlocked" : item.runtimeLockStatus,
    };
  });
}

export function countByStatus(items: ExecutionQueueItem[], status: QueueLifecycleStatus) {
  return items.filter((i) => i.queueStatus === status).length;
}