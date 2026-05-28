import type { ExecutionAuthorizationSignature } from "@/lib/orchestration/authorization/authorizationTypes";
import type { RuntimeLockState } from "@/lib/orchestration/queue/executionQueueTypes";
import type { Task } from "@/types/productai";

interface StartGateInput {
  queueStatus: string;
  runtimeLock: RuntimeLockState;
  readinessScore: number;
  task?: Task;
  authorizationSignature?: ExecutionAuthorizationSignature;
  executeReadyValidated?: boolean;
  providerDegraded?: boolean;
}

export function canRequestExecutionStart(input: StartGateInput): { allowed: boolean; reason: string } {
  if (input.queueStatus !== "execute_ready") {
    return { allowed: false, reason: "Queue item must be execute_ready before start request." };
  }
  if (!input.authorizationSignature) {
    return { allowed: false, reason: "Authorization signature continuity is missing." };
  }
  return { allowed: true, reason: "Execution start request can proceed under governance." };
}

export function canStartExecutionSession(input: StartGateInput): { allowed: boolean; reason: string } {
  if (input.runtimeLock.active) {
    return { allowed: false, reason: "Runtime lock advisory is active." };
  }
  if (input.providerDegraded) {
    return { allowed: false, reason: "Provider instability detected; delay execution session activation." };
  }
  if (input.readinessScore < 75) {
    return { allowed: false, reason: "Readiness score is insufficient for execution session activation." };
  }
  if (!input.executeReadyValidated) {
    return { allowed: false, reason: "Final execute-ready validation continuity is missing." };
  }
  if (input.task?.status === "blocked") {
    return { allowed: false, reason: "Task has unresolved blocker." };
  }
  return { allowed: true, reason: "Execution session may enter active governance state." };
}

export function canRevokeExecutionSession(input: StartGateInput): { allowed: boolean; reason: string } {
  if (input.queueStatus !== "execution_session_active") {
    return { allowed: false, reason: "Only active execution sessions can be revoked." };
  }
  return { allowed: true, reason: "Execution session can be revoked before any execution processing." };
}
