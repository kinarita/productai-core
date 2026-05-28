"use client";

import { create } from "zustand";
import { createExecuteAuditEntry } from "@/lib/orchestration/execute/executeAudit";
import { canCreateExecuteStub, canMarkExecuteReady, canRevokeExecuteReady } from "@/lib/orchestration/execute/executePolicy";
import { createExecuteStub, createFinalApprovalSignature } from "@/lib/orchestration/execute/executeStub";
import type { ExecuteAuditEntry, ExecuteStub } from "@/lib/orchestration/execute/executeTypes";
import { useExecutionAuthorizationStore } from "@/lib/store/executionAuthorizationStore";
import { useExecutionQueueStore } from "@/lib/store/executionQueueStore";
import { useTaskStore } from "@/lib/store/taskStore";

interface ExecuteState {
  stubs: ExecuteStub[];
  auditTrail: ExecuteAuditEntry[];
  requestExecuteReview: (queueItemId: string) => boolean;
  markExecuteReady: (queueItemId: string, note?: string) => boolean;
  denyExecuteReady: (queueItemId: string, note?: string) => boolean;
  revokeExecuteReady: (queueItemId: string, note?: string) => boolean;
  getStubForQueueItem: (queueItemId: string) => ExecuteStub | undefined;
  getAuditForQueueItem: (queueItemId: string) => ExecuteAuditEntry[];
  getSummary: () => { reviewPending: number; ready: number; revoked: number; denied: number };
}

export const useExecuteStore = create<ExecuteState>((set, get) => ({
  stubs: [],
  auditTrail: [],

  requestExecuteReview: (queueItemId) => {
    const q = useExecutionQueueStore.getState().items.find((i) => i.id === queueItemId);
    if (!q) return false;
    const task = useTaskStore.getState().tasks.find((t) => t.id === q.taskId);
    const signature = useExecutionAuthorizationStore.getState().signatures[queueItemId];
    const gate = canCreateExecuteStub({
      queueStatus: q.queueStatus,
      readinessScore: q.readinessScore,
      runtimeLock: useExecutionQueueStore.getState().runtimeLock,
      authorizationSignature: signature,
      task,
    });
    if (!gate.allowed) return false;

    const stub = createExecuteStub({
      item: q,
      missionId: q.missionId,
      executionIntent: task?.title ?? q.taskId,
    });

    useExecutionQueueStore.setState((state) => ({
      items: state.items.map((i) =>
        i.id === queueItemId ? { ...i, queueStatus: "execute_review_pending" } : i
      ),
    }));

    set((state) => ({
      stubs: [stub, ...state.stubs.filter((s) => s.queueItemId !== queueItemId)].slice(0, 48),
      auditTrail: [
        createExecuteAuditEntry({
          queueItemId,
          action: "execute_review_requested",
          actor: "Nova",
          role: "COO",
          detail: stub.executionIntent,
        }),
        ...state.auditTrail,
      ].slice(0, 96),
    }));
    return true;
  },

  markExecuteReady: (queueItemId, note) => {
    const q = useExecutionQueueStore.getState().items.find((i) => i.id === queueItemId);
    if (!q) return false;
    const task = useTaskStore.getState().tasks.find((t) => t.id === q.taskId);
    const authSig = useExecutionAuthorizationStore.getState().signatures[queueItemId];
    const audit = useExecutionAuthorizationStore.getState().getAuditForQueueItem(queueItemId);
    const providerDegraded = false;
    const gate = canMarkExecuteReady({
      queueStatus: q.queueStatus,
      readinessScore: q.readinessScore,
      runtimeLock: useExecutionQueueStore.getState().runtimeLock,
      authorizationSignature: authSig,
      task,
      providerDegraded,
      hasAuditContinuity: audit.length > 0,
    });
    if (!gate.allowed) return false;

    const finalSig = createFinalApprovalSignature(note);

    useExecutionQueueStore.setState((state) => ({
      items: state.items.map((i) =>
        i.id === queueItemId
          ? {
              ...i,
              queueStatus: "execute_ready",
              preparationSummary:
                "Execution readiness has been validated under governance review. No execution has been initiated.",
            }
          : i
      ),
    }));

    set((state) => ({
      stubs: state.stubs.map((s) =>
        s.queueItemId === queueItemId
          ? {
              ...s,
              executeStatus: "execute_ready",
              executionBoundaryAccepted: true,
              finalApprovalSignature: finalSig,
            }
          : s
      ),
      auditTrail: [
        createExecuteAuditEntry({
          queueItemId,
          action: "execute_readiness_validated",
          actor: finalSig.actor,
          role: finalSig.role,
          detail: task?.title,
        }),
        createExecuteAuditEntry({
          queueItemId,
          action: "final_governance_validation_completed",
          actor: "Nova",
          role: "COO",
          detail: task?.title,
        }),
        ...state.auditTrail,
      ].slice(0, 96),
    }));
    return true;
  },

  denyExecuteReady: (queueItemId, note) => {
    const q = useExecutionQueueStore.getState().items.find((i) => i.id === queueItemId);
    if (!q) return false;

    useExecutionQueueStore.setState((state) => ({
      items: state.items.map((i) => (i.id === queueItemId ? { ...i, queueStatus: "execute_denied" } : i)),
    }));
    set((state) => ({
      stubs: state.stubs.map((s) =>
        s.queueItemId === queueItemId ? { ...s, executeStatus: "execute_denied" } : s
      ),
      auditTrail: [
        createExecuteAuditEntry({
          queueItemId,
          action: "execute_readiness_denied",
          actor: "Alex Chen",
          role: "CEO",
          detail: note,
        }),
        ...state.auditTrail,
      ].slice(0, 96),
    }));
    return true;
  },

  revokeExecuteReady: (queueItemId, note) => {
    const q = useExecutionQueueStore.getState().items.find((i) => i.id === queueItemId);
    if (!q) return false;
    const gate = canRevokeExecuteReady({
      queueStatus: q.queueStatus,
      readinessScore: q.readinessScore,
      runtimeLock: useExecutionQueueStore.getState().runtimeLock,
    });
    if (!gate.allowed) return false;

    useExecutionQueueStore.setState((state) => ({
      items: state.items.map((i) => (i.id === queueItemId ? { ...i, queueStatus: "execute_revoked" } : i)),
    }));
    set((state) => ({
      stubs: state.stubs.map((s) =>
        s.queueItemId === queueItemId ? { ...s, executeStatus: "execute_revoked" } : s
      ),
      auditTrail: [
        createExecuteAuditEntry({
          queueItemId,
          action: "execute_readiness_revoked",
          actor: "Alex Chen",
          role: "CEO",
          detail: note,
        }),
        ...state.auditTrail,
      ].slice(0, 96),
    }));
    return true;
  },

  getStubForQueueItem: (queueItemId) => get().stubs.find((s) => s.queueItemId === queueItemId),
  getAuditForQueueItem: (queueItemId) => get().auditTrail.filter((a) => a.queueItemId === queueItemId),
  getSummary: () => {
    const stubs = get().stubs;
    return {
      reviewPending: stubs.filter((s) => s.executeStatus === "execute_review_pending").length,
      ready: stubs.filter((s) => s.executeStatus === "execute_ready").length,
      revoked: stubs.filter((s) => s.executeStatus === "execute_revoked").length,
      denied: stubs.filter((s) => s.executeStatus === "execute_denied").length,
    };
  },
}));
