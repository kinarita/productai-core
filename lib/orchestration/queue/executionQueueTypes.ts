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
  | "execute_review_pending"
  | "execute_ready"
  | "execute_denied"
  | "execute_revoked"
  | "execution_start_requested"
  | "execution_started"
  | "execution_session_active"
  | "execution_start_denied"
  | "execution_start_revoked"
  | "processing_prepared"
  | "processing_active"
  | "processing_paused"
  | "processing_revoked"
  | "processing_denied"
  | "processing_review_required"
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