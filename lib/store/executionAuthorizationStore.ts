"use client";

import { create } from "zustand";
import {
  createAuthorizationAuditEntry,
} from "@/lib/orchestration/authorization/authorizationAudit";
import {
  canAuthorizeExecution,
  canRequestExecutionAuthorization,
  canRevokeAuthorization,
} from "@/lib/orchestration/authorization/authorizationPolicy";
import {
  buildExecutionAuthorizationRequest,
  createExecutionAuthorizationSignature,
} from "@/lib/orchestration/authorization/executionAuthorization";
import type {
  ExecutionAuthorizationRequest,
  ExecutionAuthorizationSignature,
  AuthorizationAuditEntry,
} from "@/lib/orchestration/authorization/authorizationTypes";
import { useExecutionQueueStore } from "@/lib/store/executionQueueStore";
import { useTaskStore } from "@/lib/store/taskStore";

interface ExecutionAuthorizationState {
  requests: ExecutionAuthorizationRequest[];
  signatures: Record<string, ExecutionAuthorizationSignature | undefined>;
  auditTrail: AuthorizationAuditEntry[];
  requestAuthorization: (queueItemId: string) => boolean;
  authorizeExecution: (queueItemId: string, note?: string) => boolean;
  denyAuthorization: (queueItemId: string, note?: string) => boolean;
  revokeAuthorization: (queueItemId: string, note?: string) => boolean;
  getRequestForQueueItem: (queueItemId: string) => ExecutionAuthorizationRequest | undefined;
  getAuditForQueueItem: (queueItemId: string) => AuthorizationAuditEntry[];
  getSummary: () => { pending: number; authorized: number; denied: number; revoked: number };
}

export const useExecutionAuthorizationStore = create<ExecutionAuthorizationState>((set, get) => ({
  requests: [],
  signatures: {},
  auditTrail: [],

  requestAuthorization: (queueItemId) => {
    const queueState = useExecutionQueueStore.getState();
    const item = queueState.items.find((q) => q.id === queueItemId);
    if (!item) return false;
    const task = useTaskStore.getState().tasks.find((t) => t.id === item.taskId);
    const gate = canRequestExecutionAuthorization({ item, task, runtimeLock: queueState.runtimeLock });
    if (!gate.allowed) return false;

    const request = buildExecutionAuthorizationRequest({
      item,
      missionId: item.missionId,
      authorizationIntent: task?.title ?? item.taskId,
      runtimeRisk:
        queueState.runtimeLock.active || item.runtimeLockStatus !== "unlocked"
          ? "Runtime advisory lock is active."
          : "No active runtime lock.",
    });

    useExecutionQueueStore.setState((state) => ({
      items: state.items.map((q) =>
        q.id === queueItemId ? { ...q, queueStatus: "authorization_requested" } : q
      ),
    }));

    set((state) => ({
      requests: [request, ...state.requests.filter((r) => r.queueItemId !== queueItemId)].slice(0, 48),
      auditTrail: [
        createAuthorizationAuditEntry({
          queueItemId,
          action: "authorization_requested",
          actor: "Nova",
          role: "COO",
          detail: request.authorizationIntent,
        }),
        ...state.auditTrail,
      ].slice(0, 96),
    }));
    return true;
  },

  authorizeExecution: (queueItemId, note) => {
    const queueState = useExecutionQueueStore.getState();
    const item = queueState.items.find((q) => q.id === queueItemId);
    if (!item) return false;
    const task = useTaskStore.getState().tasks.find((t) => t.id === item.taskId);
    const gate = canAuthorizeExecution({ item, task, runtimeLock: queueState.runtimeLock });
    if (!gate.allowed) return false;

    const signature = createExecutionAuthorizationSignature(note);

    useExecutionQueueStore.setState((state) => ({
      items: state.items.map((q) =>
        q.id === queueItemId
          ? { ...q, queueStatus: "execution_authorized", preparationSummary: signature.authorizationNote }
          : q
      ),
    }));

    set((state) => ({
      signatures: { ...state.signatures, [queueItemId]: signature },
      requests: state.requests.map((r) =>
        r.queueItemId === queueItemId ? { ...r, status: "execution_authorized" } : r
      ),
      auditTrail: [
        createAuthorizationAuditEntry({
          queueItemId,
          action: "authorization_granted",
          actor: signature.actor,
          role: signature.role,
          detail: task?.title,
        }),
        createAuthorizationAuditEntry({
          queueItemId,
          action: "governance_review_completed",
          actor: "Nova",
          role: "COO",
          detail: task?.title,
        }),
        ...state.auditTrail,
      ].slice(0, 96),
    }));
    return true;
  },

  denyAuthorization: (queueItemId, note) => {
    const item = useExecutionQueueStore.getState().items.find((q) => q.id === queueItemId);
    if (!item) return false;

    useExecutionQueueStore.setState((state) => ({
      items: state.items.map((q) => (q.id === queueItemId ? { ...q, queueStatus: "denied" } : q)),
    }));

    set((state) => ({
      requests: state.requests.map((r) =>
        r.queueItemId === queueItemId ? { ...r, status: "denied" } : r
      ),
      auditTrail: [
        createAuthorizationAuditEntry({
          queueItemId,
          action: "authorization_denied",
          actor: "Alex Chen",
          role: "CEO",
          detail: note,
        }),
        ...state.auditTrail,
      ].slice(0, 96),
    }));
    return true;
  },

  revokeAuthorization: (queueItemId, note) => {
    const queueState = useExecutionQueueStore.getState();
    const item = queueState.items.find((q) => q.id === queueItemId);
    const task = item ? useTaskStore.getState().tasks.find((t) => t.id === item.taskId) : undefined;
    if (!item) return false;
    const gate = canRevokeAuthorization({ item, task, runtimeLock: queueState.runtimeLock });
    if (!gate.allowed) return false;

    useExecutionQueueStore.setState((state) => ({
      items: state.items.map((q) => (q.id === queueItemId ? { ...q, queueStatus: "revoked" } : q)),
    }));

    set((state) => ({
      requests: state.requests.map((r) =>
        r.queueItemId === queueItemId ? { ...r, status: "revoked" } : r
      ),
      auditTrail: [
        createAuthorizationAuditEntry({
          queueItemId,
          action: "authorization_revoked",
          actor: "Alex Chen",
          role: "CEO",
          detail: note ?? task?.title,
        }),
        ...state.auditTrail,
      ].slice(0, 96),
    }));
    return true;
  },

  getRequestForQueueItem: (queueItemId) => get().requests.find((r) => r.queueItemId === queueItemId),
  getAuditForQueueItem: (queueItemId) => get().auditTrail.filter((a) => a.queueItemId === queueItemId),
  getSummary: () => {
    const requests = get().requests;
    return {
      pending: requests.filter((r) => r.status === "authorization_requested").length,
      authorized: requests.filter(
        (r) => r.status === "authorized" || r.status === "execution_authorized"
      ).length,
      denied: requests.filter((r) => r.status === "denied").length,
      revoked: requests.filter((r) => r.status === "revoked").length,
    };
  },
}));
