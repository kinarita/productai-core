import type { ExecutionQueueItem } from "@/lib/orchestration/queue/executionQueueTypes";
import type { ExecutionTicket } from "@/lib/orchestration/execution/executionTypes";
import type { Task } from "@/types/productai";
import { computeReadinessScore } from "@/lib/orchestration/queue/readinessScore";

export interface WorkerPreparationResult {
  ready: boolean;
  summary: string;
  readinessScore: number;
  blockingConditions: string[];
}

export function prepareWorker(input: {
  task: Task;
  ticket?: ExecutionTicket;
  queueItem: ExecutionQueueItem;
  syncWarningCount: number;
  runtimeAlertCount: number;
  providerDegraded: boolean;
}): WorkerPreparationResult {
  const blockingConditions: string[] = [];
  const scoreInput = computeReadinessScore({
    task: input.task,
    ticket: input.ticket,
    syncWarningCount: input.syncWarningCount,
    runtimeAlertCount: input.runtimeAlertCount,
    providerDegraded: input.providerDegraded,
  });

  if (!input.ticket?.approvalSignature) {
    blockingConditions.push("Missing executive approval signature on handoff.");
  }
  if (!input.task.provenance?.governanceApprovedBy) {
    blockingConditions.push("Governance provenance incomplete.");
  }
  if (input.syncWarningCount >= 2) {
    blockingConditions.push("Sync hydration warnings elevated.");
  }
  if (input.runtimeAlertCount >= 1) {
    blockingConditions.push("Runtime alerts require executive review.");
  }
  if (input.providerDegraded) {
    blockingConditions.push("Provider health degraded.");
  }
  if (input.task.status === "blocked") {
    blockingConditions.push("Task dependency blocker unresolved.");
  }

  const ready = blockingConditions.length === 0 && scoreInput.score >= 60;

  return {
    ready,
    summary: ready
      ? "Execution preparation has completed under governance review. Awaiting human execution authorization."
      : "Worker preparation validation completed with blocking conditions — no execution initiated.",
    readinessScore: scoreInput.score,
    blockingConditions,
  };
}