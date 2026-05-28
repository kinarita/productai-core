import type { ExecutionTarget } from "@/lib/orchestration/execution/executionTypes";

export type QueueLifecycleStatus =
  | "execution_ready"
  | "queued"
  | "reserved"
  | "worker_prepared"
  | "awaiting_execution_authorization"
  | "authorization_requested"
  | "authorized"
  | "execution_authorized"
  | "denied"
  | "revoked"
  | "executing"
  | "completed";

export type RuntimeLockStatus = "unlocked" | "advisory_locked" | "locked";

export type ReservationActor = "COO" | "Runtime Observer" | "Human Operator";

export interface ExecutionQueueItem {
  id: string;
  taskId: string;
  missionId: string;
  executionTarget: ExecutionTarget;
  queueStatus: QueueLifecycleStatus;
  reservedBy?: ReservationActor;
  reservedAt?: string;
  governanceBoundary: string;
  runtimeLockStatus: RuntimeLockStatus;
  readinessScore: number;
  preparationSummary?: string;
  blockingConditions: string[];
  createdAt: string;
  ticketId?: string;
}

export interface RuntimeLockState {
  active: boolean;
  reason: string;
  pausedBy?: "Runtime Observer" | "COO";
  advisoryOnly: boolean;
}

export interface QueueGovernanceSummary {
  queued: number;
  reserved: number;
  workerPrepared: number;
  awaitingAuthorization: number;
  runtimeLocked: number;
  blockedPreparation: number;
}