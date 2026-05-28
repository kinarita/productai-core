"use client";

import { create } from "zustand";
import { createExecutionStartAuditEntry } from "@/lib/orchestration/execution-start/executionStartAudit";
import { canRequestExecutionStart, canRevokeExecutionSession, canStartExecutionSession } from "@/lib/orchestration/execution-start/executionStartPolicy";
import { createExecutionOperatorSignature, createExecutionSessionStub } from "@/lib/orchestration/execution-start/executionSession";
import type {
  ExecutionSession,
  ExecutionStartAuditEntry,
} from "@/lib/orchestration/execution-start/executionStartTypes";
import { useExecutionAuthorizationStore } from "@/lib/store/executionAuthorizationStore";
import { useExecutionQueueStore } from "@/lib/store/executionQueueStore";
import { useExecuteStore } from "@/lib/store/executeStore";
import { useTaskStore } from "@/lib/store/taskStore";

interface ExecutionSessionState {
  sessions: ExecutionSession[];
  auditTrail: ExecutionStartAuditEntry[];
  requestExecutionStart: (queueItemId: string, runtimeAdvisory?: string) => boolean;
  confirmExecutionBoundary: (queueItemId: string, note?: string) => boolean;
  startExecutionSession: (queueItemId: string) => boolean;
  denyExecutionStart: (queueItemId: string, note?: string) => boolean;
  revokeExecutionSession: (queueItemId: string, note?: string) => boolean;
  getSessionForQueueItem: (queueItemId: string) => ExecutionSession | undefined;
  getAuditForQueueItem: (queueItemId: string) => ExecutionStartAuditEntry[];
  getSummary: () => { requested: number; active: number; denied: number; revoked: number };
}

export const useExecutionSessionStore = create<ExecutionSessionState>((set, get) => ({
  sessions: [],
  auditTrail: [],

  requestExecutionStart: (queueItemId, runtimeAdvisory) => {
    const item = useExecutionQueueStore.getState().items.find((i) => i.id === queueItemId);
    if (!item) return false;
    const authSig = useExecutionAuthorizationStore.getState().signatures[queueItemId];
    const gate = canRequestExecutionStart({
      queueStatus: item.queueStatus,
      readinessScore: item.readinessScore,
      runtimeLock: useExecutionQueueStore.getState().runtimeLock,
      authorizationSignature: authSig,
    });
    if (!gate.allowed) return false;
    const task = useTaskStore.getState().tasks.find((t) => t.id === item.taskId);
    const session = createExecutionSessionStub({
      item,
      executionIntent: task?.title ?? item.taskId,
      runtimeAdvisory,
    });

    useExecutionQueueStore.setState((state) => ({
      items: state.items.map((i) =>
        i.id === queueItemId ? { ...i, queueStatus: "execution_start_requested" } : i
      ),
    }));

    set((state) => ({
      sessions: [session, ...state.sessions.filter((s) => s.queueItemId !== queueItemId)].slice(0, 48),
      auditTrail: [
        createExecutionStartAuditEntry({
          queueItemId,
          action: "execution_start_requested",
          actor: "Nova",
          role: "COO",
          detail: session.executionIntent,
        }),
        ...state.auditTrail,
      ].slice(0, 96),
    }));
    return true;
  },

  confirmExecutionBoundary: (queueItemId, note) => {
    const session = get().sessions.find((s) => s.queueItemId === queueItemId);
    if (!session) return false;
    const signature = createExecutionOperatorSignature(note);

    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.queueItemId === queueItemId
          ? {
              ...s,
              executionSessionStatus: "execution_started",
              operatorSignature: signature,
              startedBy: signature.actor,
              runtimeReservation: { ...s.runtimeReservation, reserved: true },
            }
          : s
      ),
      auditTrail: [
        createExecutionStartAuditEntry({
          queueItemId,
          action: "execution_boundary_confirmed",
          actor: signature.actor,
          role: signature.role,
          detail: session.executionIntent,
        }),
        createExecutionStartAuditEntry({
          queueItemId,
          action: "operator_signature_recorded",
          actor: signature.actor,
          role: signature.role,
          detail: session.executionIntent,
        }),
        ...state.auditTrail,
      ].slice(0, 96),
    }));
    return true;
  },

  startExecutionSession: (queueItemId) => {
    const item = useExecutionQueueStore.getState().items.find((i) => i.id === queueItemId);
    const session = get().sessions.find((s) => s.queueItemId === queueItemId);
    if (!item || !session) return false;
    const task = useTaskStore.getState().tasks.find((t) => t.id === item.taskId);
    const authSig = useExecutionAuthorizationStore.getState().signatures[queueItemId];
    const executeStub = useExecuteStore.getState().getStubForQueueItem(queueItemId);
    const gate = canStartExecutionSession({
      queueStatus: item.queueStatus,
      readinessScore: item.readinessScore,
      runtimeLock: useExecutionQueueStore.getState().runtimeLock,
      authorizationSignature: authSig,
      task,
      executeReadyValidated: executeStub?.executeStatus === "execute_ready",
    });
    if (!gate.allowed) return false;

    useExecutionQueueStore.setState((state) => ({
      items: state.items.map((i) =>
        i.id === queueItemId
          ? {
              ...i,
              queueStatus: "execution_session_active",
              preparationSummary:
                "Execution session has entered an active governance state. No execution has been initiated.",
            }
          : i
      ),
    }));

    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.queueItemId === queueItemId
          ? {
              ...s,
              executionSessionStatus: "execution_session_active",
              runtimeReservation: { ...s.runtimeReservation, reserved: true },
            }
          : s
      ),
      auditTrail: [
        createExecutionStartAuditEntry({
          queueItemId,
          action: "execution_session_started",
          actor: session.operatorSignature?.actor ?? "Alex Chen",
          role: session.operatorSignature?.role ?? "CEO",
          detail: session.executionIntent,
        }),
        ...state.auditTrail,
      ].slice(0, 96),
    }));
    return true;
  },

  denyExecutionStart: (queueItemId, note) => {
    const session = get().sessions.find((s) => s.queueItemId === queueItemId);
    if (!session) return false;
    useExecutionQueueStore.setState((state) => ({
      items: state.items.map((i) =>
        i.id === queueItemId ? { ...i, queueStatus: "execution_start_denied" } : i
      ),
    }));
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.queueItemId === queueItemId ? { ...s, executionSessionStatus: "execution_start_denied" } : s
      ),
      auditTrail: [
        createExecutionStartAuditEntry({
          queueItemId,
          action: "execution_start_denied",
          actor: "Alex Chen",
          role: "CEO",
          detail: note ?? session.executionIntent,
        }),
        ...state.auditTrail,
      ].slice(0, 96),
    }));
    return true;
  },

  revokeExecutionSession: (queueItemId, note) => {
    const item = useExecutionQueueStore.getState().items.find((i) => i.id === queueItemId);
    const session = get().sessions.find((s) => s.queueItemId === queueItemId);
    if (!item || !session) return false;
    const gate = canRevokeExecutionSession({
      queueStatus: item.queueStatus,
      readinessScore: item.readinessScore,
      runtimeLock: useExecutionQueueStore.getState().runtimeLock,
    });
    if (!gate.allowed) return false;

    useExecutionQueueStore.setState((state) => ({
      items: state.items.map((i) =>
        i.id === queueItemId ? { ...i, queueStatus: "execution_start_revoked" } : i
      ),
    }));
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.queueItemId === queueItemId
          ? {
              ...s,
              executionSessionStatus: "execution_start_revoked",
              runtimeReservation: { ...s.runtimeReservation, reserved: false },
            }
          : s
      ),
      auditTrail: [
        createExecutionStartAuditEntry({
          queueItemId,
          action: "execution_session_revoked",
          actor: "Alex Chen",
          role: "CEO",
          detail: note ?? session.executionIntent,
        }),
        ...state.auditTrail,
      ].slice(0, 96),
    }));
    return true;
  },

  getSessionForQueueItem: (queueItemId) => get().sessions.find((s) => s.queueItemId === queueItemId),
  getAuditForQueueItem: (queueItemId) => get().auditTrail.filter((a) => a.queueItemId === queueItemId),
  getSummary: () => {
    const sessions = get().sessions;
    return {
      requested: sessions.filter((s) => s.executionSessionStatus === "execution_start_requested").length,
      active: sessions.filter((s) => s.executionSessionStatus === "execution_session_active").length,
      denied: sessions.filter((s) => s.executionSessionStatus === "execution_start_denied").length,
      revoked: sessions.filter((s) => s.executionSessionStatus === "execution_start_revoked").length,
    };
  },
}));
