import type { ExecutionTicket } from "@/lib/orchestration/execution/executionTypes";
import type { ExecutionQueueItem, RuntimeLockState } from "@/lib/orchestration/queue/executionQueueTypes";
import type { Task } from "@/types/productai";

export interface GateResult {
  allowed: boolean;
  reason: string;
}

export interface GateContext {
  task: Task;
  ticket?: ExecutionTicket;
  queueItem?: ExecutionQueueItem;
  runtimeLock?: RuntimeLockState;
  syncWarningCount?: number;
  runtimeAlertCount?: number;
  providerDegraded?: boolean;
}

export function canQueueExecution(ctx: GateContext): GateResult {
  if (ctx.runtimeLock?.active) {
    return {
      allowed: false,
      reason: "Runtime lock is active — queue progression is paused.",
    };
  }

  if (ctx.task.provenance?.executionReadiness !== "execution_ready") {
    return {
      allowed: false,
      reason: "Task must be execution-ready before entering the controlled queue.",
    };
  }

  if (!ctx.task.provenance?.createdFromExecutionTicketId) {
    return {
      allowed: false,
      reason: "Missing governance provenance — materialized handoff required.",
    };
  }

  if (ctx.task.status === "blocked") {
    return {
      allowed: false,
      reason: "Unresolved task blocker prevents queue enrollment.",
    };
  }

  return {
    allowed: true,
    reason: "Task may enter the controlled execution queue.",
  };
}

export function canPrepareWorker(ctx: GateContext): GateResult {
  if (ctx.runtimeLock?.active) {
    return {
      allowed: false,
      reason: "Runtime lock prevents worker preparation.",
    };
  }

  if (!ctx.queueItem || ctx.queueItem.queueStatus !== "reserved") {
    return {
      allowed: false,
      reason: "Execution slot must be reserved before worker preparation.",
    };
  }

  if (!ctx.ticket?.approvalSignature) {
    return {
      allowed: false,
      reason: "Valid approval signature required for worker preparation.",
    };
  }

  if ((ctx.syncWarningCount ?? 0) >= 2 || ctx.providerDegraded) {
    return {
      allowed: false,
      reason: "Degraded runtime or sync conditions block worker preparation.",
    };
  }

  return {
    allowed: true,
    reason: "Worker preparation may proceed under governance review.",
  };
}

export function canAuthorizeExecution(ctx: GateContext): GateResult {
  if (!ctx.queueItem || ctx.queueItem.queueStatus !== "awaiting_execution_authorization") {
    return {
      allowed: false,
      reason: "Preparation must complete before execution authorization.",
    };
  }

  return {
    allowed: false,
    reason:
      "Only human authorization may authorize actual execution. Automated execution remains disabled in this phase.",
  };
}

export function validateExecutionBoundary(): string {
  return "AI agents may prepare and validate execution readiness. Only human authorization may authorize actual execution.";
}