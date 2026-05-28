"use client";

import { create } from "zustand";
import { canPrepareWorker, canQueueExecution } from "@/lib/orchestration/queue/executionGate";
import { createQueueItemFromTask } from "@/lib/orchestration/queue/executionQueueManager";
import type {
  ExecutionQueueItem,
  QueueGovernanceSummary,
  ReservationActor,
  RuntimeLockState,
} from "@/lib/orchestration/queue/executionQueueTypes";
import { releaseQueueReservation, reserveQueueItem } from "@/lib/orchestration/queue/executionReservation";
import { prepareWorker } from "@/lib/orchestration/queue/workerPreparation";
import { useExecutionStore } from "@/lib/store/executionStore";
import { useTaskStore } from "@/lib/store/taskStore";
import type { Task } from "@/types/productai";

interface ExecutionQueueState {
  items: ExecutionQueueItem[];
  runtimeLock: RuntimeLockState;
  enqueueTask: (taskId: string, syncWarningCount?: number, runtimeAlertCount?: number) => ExecutionQueueItem | null;
  reserveSlot: (itemId: string, reservedBy: ReservationActor) => boolean;
  releaseReservation: (itemId: string) => boolean;
  prepareWorkerForItem: (itemId: string, providerDegraded?: boolean) => boolean;
  completePreparationReview: (itemId: string) => boolean;
  enqueueMaterializedTasks: (
    taskIds: string[],
    ticketId?: string,
    syncWarningCount?: number,
    runtimeAlertCount?: number
  ) => void;
  refreshRuntimeLock: (syncWarningCount: number, runtimeAlertCount: number) => void;
  getItemForTask: (taskId: string) => ExecutionQueueItem | undefined;
  getItemsForMission: (missionId: string) => ExecutionQueueItem[];
  getGovernanceSummary: () => QueueGovernanceSummary;
  clearQueue: () => void;
}

function resolveTicket(ticketId?: string) {
  if (!ticketId) return undefined;
  return useExecutionStore.getState().getTicket(ticketId);
}

export const useExecutionQueueStore = create<ExecutionQueueState>((set, get) => ({
  items: [],
  runtimeLock: {
    active: false,
    reason: "Runtime conditions stable.",
    advisoryOnly: true,
  },

  enqueueTask: (taskId, syncWarningCount = 0, runtimeAlertCount = 0) => {
    const task = useTaskStore.getState().tasks.find((t) => t.id === taskId);
    if (!task) return null;

    const existing = get().items.find((i) => i.taskId === taskId);
    if (existing) return existing;

    const ticket = resolveTicket(task.provenance?.createdFromExecutionTicketId);
    const gate = canQueueExecution({
      task,
      ticket,
      runtimeLock: get().runtimeLock,
      syncWarningCount,
      runtimeAlertCount,
    });
    if (!gate.allowed) return null;

    const item = createQueueItemFromTask({
      task,
      ticket,
      runtimeLockStatus: get().runtimeLock.active ? "locked" : "unlocked",
    });

    set((state) => ({
      items: [item, ...state.items].slice(0, 48),
    }));

    return item;
  },

  reserveSlot: (itemId, reservedBy) => {
    const state = get();
    if (state.runtimeLock.active) return false;

    const item = state.items.find((i) => i.id === itemId);
    if (!item || item.queueStatus !== "queued") return false;

    const updated = reserveQueueItem(item, reservedBy);
    set((s) => ({
      items: s.items.map((i) => (i.id === itemId ? updated : i)),
    }));
    return true;
  },

  releaseReservation: (itemId) => {
    const item = get().items.find((i) => i.id === itemId);
    if (!item || item.queueStatus !== "reserved") return false;

    const updated = releaseQueueReservation(item);
    set((s) => ({
      items: s.items.map((i) => (i.id === itemId ? updated : i)),
    }));
    return true;
  },

  prepareWorkerForItem: (itemId, providerDegraded = false) => {
    const state = get();
    const item = state.items.find((i) => i.id === itemId);
    if (!item) return false;

    const task = useTaskStore.getState().tasks.find((t) => t.id === item.taskId);
    if (!task) return false;

    const ticket = resolveTicket(item.ticketId);
    const gate = canPrepareWorker({
      task,
      ticket,
      queueItem: item,
      runtimeLock: state.runtimeLock,
      providerDegraded,
    });
    if (!gate.allowed) return false;

    const prep = prepareWorker({
      task,
      ticket,
      queueItem: item,
      syncWarningCount: 0,
      runtimeAlertCount: 0,
      providerDegraded,
    });

    const nextStatus = prep.ready ? "worker_prepared" : item.queueStatus;
    set((s) => ({
      items: s.items.map((i) =>
        i.id === itemId
          ? {
              ...i,
              queueStatus: nextStatus,
              readinessScore: prep.readinessScore,
              preparationSummary: prep.summary,
              blockingConditions: prep.blockingConditions,
            }
          : i
      ),
    }));

    return prep.ready;
  },

  completePreparationReview: (itemId) => {
    const item = get().items.find((i) => i.id === itemId);
    if (!item || item.queueStatus !== "worker_prepared") return false;
    if (get().runtimeLock.active) return false;

    set((s) => ({
      items: s.items.map((i) =>
        i.id === itemId
          ? {
              ...i,
              queueStatus: "awaiting_execution_authorization",
              preparationSummary:
                "Execution preparation has completed under governance review. Awaiting human execution authorization.",
            }
          : i
      ),
    }));
    return true;
  },

  enqueueMaterializedTasks: (taskIds, _ticketId, syncWarningCount = 0, runtimeAlertCount = 0) => {
    taskIds.forEach((taskId) => {
      get().enqueueTask(taskId, syncWarningCount, runtimeAlertCount);
    });
  },

  refreshRuntimeLock: (syncWarningCount, runtimeAlertCount) => {
    const active = syncWarningCount >= 2 || runtimeAlertCount >= 2;
    set((state) => ({
      runtimeLock: {
        active,
        reason: active
          ? "Runtime instability advisory — queue progression paused. No automated recovery."
          : "Runtime conditions stable.",
        pausedBy: active ? "Runtime Observer" : undefined,
        advisoryOnly: true,
      },
      items: state.items.map((item) => {
        if (item.queueStatus === "awaiting_execution_authorization") return item;
        return {
          ...item,
          runtimeLockStatus: active ? "advisory_locked" : "unlocked",
        };
      }),
    }));
  },

  getItemForTask: (taskId) => get().items.find((i) => i.taskId === taskId),

  getItemsForMission: (missionId) => get().items.filter((i) => i.missionId === missionId),

  getGovernanceSummary: () => {
    const items = get().items;
    return {
      queued: items.filter((i) => i.queueStatus === "queued").length,
      reserved: items.filter((i) => i.queueStatus === "reserved").length,
      workerPrepared: items.filter((i) => i.queueStatus === "worker_prepared").length,
      awaitingAuthorization: items.filter(
        (i) => i.queueStatus === "awaiting_execution_authorization"
      ).length,
      runtimeLocked: items.filter((i) => i.runtimeLockStatus !== "unlocked").length,
      blockedPreparation: items.filter((i) => i.blockingConditions.length > 0).length,
    };
  },

  clearQueue: () =>
    set({
      items: [],
      runtimeLock: { active: false, reason: "Runtime conditions stable.", advisoryOnly: true },
    }),
}));