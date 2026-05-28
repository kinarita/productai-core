import type { RuntimeLockState } from "@/lib/orchestration/queue/executionQueueTypes";
import type { Task } from "@/types/productai";

interface ProcessingGateInput {
  queueStatus: string;
  runtimeLock: RuntimeLockState;
  readinessScore: number;
  task?: Task;
  providerDegraded?: boolean;
  hasSessionContinuity?: boolean;
}

export function canPrepareProcessing(input: ProcessingGateInput): { allowed: boolean; reason: string } {
  if (input.queueStatus !== "execution_session_active") {
    return { allowed: false, reason: "Execution session must be active before processing preparation." };
  }
  if (!input.hasSessionContinuity) {
    return { allowed: false, reason: "Execution session continuity is missing." };
  }
  return { allowed: true, reason: "Processing preparation can proceed under governance." };
}

export function canActivateProcessing(input: ProcessingGateInput): { allowed: boolean; reason: string } {
  if (input.runtimeLock.active) {
    return { allowed: false, reason: "Runtime lock advisory is active." };
  }
  if (input.providerDegraded) {
    return { allowed: false, reason: "Provider instability suggests delaying processing activation." };
  }
  if (input.readinessScore < 70) {
    return { allowed: false, reason: "Readiness score below processing activation threshold." };
  }
  if (input.task?.status === "blocked") {
    return { allowed: false, reason: "Task blocker unresolved." };
  }
  return { allowed: true, reason: "Processing governance can become active." };
}

export function canPauseProcessing(input: ProcessingGateInput): { allowed: boolean; reason: string } {
  if (input.queueStatus !== "processing_active") {
    return { allowed: false, reason: "Only active processing can be paused." };
  }
  return { allowed: true, reason: "Processing can be paused by governance decision." };
}

export function canRevokeProcessing(input: ProcessingGateInput): { allowed: boolean; reason: string } {
  const revocable =
    input.queueStatus === "processing_active" ||
    input.queueStatus === "processing_prepared" ||
    input.queueStatus === "processing_review_required";
  if (!revocable) {
    return { allowed: false, reason: "Processing must be prepared or active to revoke." };
  }
  return { allowed: true, reason: "Processing can be revoked under governance review." };
}
