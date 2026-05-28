"use client";

import { create } from "zustand";
import { buildExecutionQueue } from "@/lib/orchestration/materialization/executionQueue";
import {
  canMaterializeExecutionPlan,
  requiresMaterializationReview,
} from "@/lib/orchestration/materialization/materializationPolicy";
import type {
  ExecutionReadinessSummary,
  MaterializationRecord,
} from "@/lib/orchestration/materialization/materializationTypes";
import { countReadiness } from "@/lib/orchestration/materialization/provenanceTracker";
import { materializeTasksFromPlan } from "@/lib/orchestration/materialization/taskMaterializer";
import { useExecutionStore } from "@/lib/store/executionStore";
import { useExecutionQueueStore } from "@/lib/store/executionQueueStore";
import { useTaskStore } from "@/lib/store/taskStore";

interface MaterializationState {
  records: MaterializationRecord[];
  requestMaterializationReview: (ticketId: string) => boolean;
  materializeTicket: (input: {
    ticketId: string;
    missionName: string;
    syncWarningCount?: number;
    runtimeAlertCount?: number;
  }) => MaterializationRecord | null;
  getRecordForTicket: (ticketId: string) => MaterializationRecord | undefined;
  getReadinessSummary: (
    missionId: string,
    syncWarningCount?: number
  ) => ExecutionReadinessSummary;
  getQueueForMission: (missionId: string) => ReturnType<typeof buildExecutionQueue>;
  clearMaterialization: () => void;
}

function makeRecordId() {
  return `mat-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export const useMaterializationStore = create<MaterializationState>((set, get) => ({
  records: [],

  requestMaterializationReview: (ticketId) => {
    const ticket = useExecutionStore.getState().getTicket(ticketId);
    if (!ticket || ticket.status !== "handoff_approved") return false;

    useExecutionStore.setState((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === ticketId
          ? { ...t, materializationStatus: "materialization_requested" as const }
          : t
      ),
    }));

    const record: MaterializationRecord = {
      id: makeRecordId(),
      ticketId,
      proposalId: ticket.proposalId,
      executionPlanId: ticket.executionPlan?.id,
      missionId: ticket.missionId,
      status: "materialization_requested",
      taskIds: [],
      createdAt: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      governanceReviewedAt: new Date().toISOString(),
    };

    set((state) => ({
      records: [record, ...state.records.filter((r) => r.ticketId !== ticketId)].slice(0, 24),
    }));

    return true;
  },

  materializeTicket: ({ ticketId, missionName, syncWarningCount = 0, runtimeAlertCount = 0 }) => {
    const ticket = useExecutionStore.getState().getTicket(ticketId);
    if (!ticket) return null;

    const existing = get().records.find(
      (r) => r.ticketId === ticketId && r.status === "execution_ready"
    );
    if (existing) return existing;

    const plan = ticket.executionPlan;
    const validation = canMaterializeExecutionPlan({
      ticket,
      plan,
      syncWarningCount,
      runtimeAlertCount,
      alreadyMaterialized: Boolean(ticket.materializedTaskIds?.length),
    });

    if (!validation.allowed) {
      const reviewedHighRisk =
        requiresMaterializationReview(ticket) &&
        ticket.materializationStatus === "materialization_requested" &&
        syncWarningCount < 3 &&
        runtimeAlertCount < 2;
      if (!reviewedHighRisk) return null;
    }

    if (!plan) return null;

    const runtimeUnstable = syncWarningCount > 0 || runtimeAlertCount > 0;
    const tasks = materializeTasksFromPlan({
      plan,
      ticket,
      proposalId: ticket.proposalId,
      missionName,
      runtimeUnstable,
    });

    const taskStore = useTaskStore.getState();
    tasks.forEach((task) => taskStore.addTaskWithSync(task));

    const taskIds = tasks.map((t) => t.id);

    useExecutionStore.setState((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              materializationStatus: "execution_ready" as const,
              materializedTaskIds: taskIds,
            }
          : t
      ),
    }));

    const record: MaterializationRecord = {
      id: makeRecordId(),
      ticketId,
      proposalId: ticket.proposalId,
      executionPlanId: plan.id,
      missionId: ticket.missionId,
      status: "execution_ready",
      taskIds,
      createdAt: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      governanceReviewedAt: new Date().toISOString(),
    };

    set((state) => ({
      records: [record, ...state.records.filter((r) => r.ticketId !== ticketId)].slice(0, 24),
    }));

    useExecutionQueueStore
      .getState()
      .enqueueMaterializedTasks(taskIds, ticketId, syncWarningCount, runtimeAlertCount);
    useExecutionQueueStore
      .getState()
      .refreshRuntimeLock(syncWarningCount, runtimeAlertCount);

    return record;
  },

  getRecordForTicket: (ticketId) => get().records.find((r) => r.ticketId === ticketId),

  getReadinessSummary: (missionId, syncWarningCount = 0) => {
    const tasks = useTaskStore.getState().tasks;
    const counts = countReadiness(tasks, missionId);
    const tickets = useExecutionStore.getState().getTicketsForMission(missionId);
    const pendingReview = tickets.filter(
      (t) =>
        t.status === "handoff_approved" &&
        (!t.materializationStatus || t.materializationStatus === "materialization_requested")
    ).length;

    return {
      missionId,
      governanceReviewed: counts.governanceReviewed,
      executionReady: counts.executionReady,
      blocked: counts.blocked,
      pendingReview,
      runtimeAdvisory:
        syncWarningCount > 0
          ? "Runtime Observer advisory: sync or hydration signals may affect readiness sequencing."
          : undefined,
    };
  },

  getQueueForMission: (missionId) => {
    const tickets = useExecutionStore.getState().getTicketsForMission(missionId);
    const records = get().records.filter((r) => r.missionId === missionId);
    return buildExecutionQueue(tickets, records);
  },

  clearMaterialization: () => set({ records: [] }),
}));