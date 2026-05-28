"use client";

import { create } from "zustand";
import { createProcessingAuditEntry } from "@/lib/orchestration/processing/processingAudit";
import { processingSemanticsMessage } from "@/lib/orchestration/processing/processingBoundary";
import { canActivateProcessing, canPauseProcessing, canPrepareProcessing, canRevokeProcessing } from "@/lib/orchestration/processing/processingPolicy";
import { createProcessingSession } from "@/lib/orchestration/processing/processingSession";
import type { ProcessingAuditEntry, ProcessingSession } from "@/lib/orchestration/processing/processingTypes";
import { useExecutionQueueStore } from "@/lib/store/executionQueueStore";
import { useExecutionSessionStore } from "@/lib/store/executionSessionStore";
import { useTaskStore } from "@/lib/store/taskStore";

interface ProcessingState {
  sessions: ProcessingSession[];
  auditTrail: ProcessingAuditEntry[];
  prepareProcessing: (queueItemId: string, advisoryState?: string) => boolean;
  activateProcessing: (queueItemId: string) => boolean;
  pauseProcessing: (queueItemId: string, note?: string) => boolean;
  revokeProcessing: (queueItemId: string, note?: string) => boolean;
  getSessionForQueueItem: (queueItemId: string) => ProcessingSession | undefined;
  getAuditForQueueItem: (queueItemId: string) => ProcessingAuditEntry[];
  getSummary: () => { prepared: number; active: number; paused: number; revoked: number; reviewRequired: number };
}

export const useProcessingStore = create<ProcessingState>((set, get) => ({
  sessions: [],
  auditTrail: [],

  prepareProcessing: (queueItemId, advisoryState) => {
    const item = useExecutionQueueStore.getState().items.find((i) => i.id === queueItemId);
    const executionSession = useExecutionSessionStore.getState().getSessionForQueueItem(queueItemId);
    const task = item ? useTaskStore.getState().tasks.find((t) => t.id === item.taskId) : undefined;
    if (!item || !executionSession) return false;

    const gate = canPrepareProcessing({
      queueStatus: item.queueStatus,
      runtimeLock: useExecutionQueueStore.getState().runtimeLock,
      readinessScore: item.readinessScore,
      task,
      hasSessionContinuity: executionSession.executionSessionStatus === "execution_session_active",
    });
    if (!gate.allowed) return false;

    const session = createProcessingSession({
      executionSession,
      item,
      intent: task?.title ?? item.taskId,
      advisoryState: advisoryState ?? "No active processing advisory.",
    });

    useExecutionQueueStore.setState((state) => ({
      items: state.items.map((i) =>
        i.id === queueItemId ? { ...i, queueStatus: "processing_prepared" } : i
      ),
    }));

    set((state) => ({
      sessions: [session, ...state.sessions.filter((s) => s.queueItemId !== queueItemId)].slice(0, 48),
      auditTrail: [
        createProcessingAuditEntry({
          queueItemId,
          action: "processing_prepared",
          actor: "Nova",
          role: "COO",
          detail: session.processingIntent,
        }),
        ...state.auditTrail,
      ].slice(0, 96),
    }));
    return true;
  },

  activateProcessing: (queueItemId) => {
    const item = useExecutionQueueStore.getState().items.find((i) => i.id === queueItemId);
    const session = get().sessions.find((s) => s.queueItemId === queueItemId);
    const task = item ? useTaskStore.getState().tasks.find((t) => t.id === item.taskId) : undefined;
    if (!item || !session) return false;
    const providerDegraded = false;
    const gate = canActivateProcessing({
      queueStatus: item.queueStatus,
      runtimeLock: useExecutionQueueStore.getState().runtimeLock,
      readinessScore: item.readinessScore,
      task,
      providerDegraded,
      hasSessionContinuity: true,
    });
    if (!gate.allowed) return false;

    useExecutionQueueStore.setState((state) => ({
      items: state.items.map((i) =>
        i.id === queueItemId
          ? { ...i, queueStatus: "processing_active", preparationSummary: processingSemanticsMessage() }
          : i
      ),
    }));
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.queueItemId === queueItemId ? { ...s, processingStatus: "processing_active" } : s
      ),
      auditTrail: [
        createProcessingAuditEntry({
          queueItemId,
          action: "processing_governance_activated",
          actor: "Nova",
          role: "COO",
          detail: session.processingIntent,
        }),
        ...state.auditTrail,
      ].slice(0, 96),
    }));
    return true;
  },

  pauseProcessing: (queueItemId, note) => {
    const item = useExecutionQueueStore.getState().items.find((i) => i.id === queueItemId);
    if (!item) return false;
    const gate = canPauseProcessing({
      queueStatus: item.queueStatus,
      runtimeLock: useExecutionQueueStore.getState().runtimeLock,
      readinessScore: item.readinessScore,
    });
    if (!gate.allowed) return false;
    useExecutionQueueStore.setState((state) => ({
      items: state.items.map((i) => (i.id === queueItemId ? { ...i, queueStatus: "processing_paused" } : i)),
    }));
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.queueItemId === queueItemId ? { ...s, processingStatus: "processing_paused" } : s
      ),
      auditTrail: [
        createProcessingAuditEntry({
          queueItemId,
          action: "processing_paused",
          actor: "Runtime Observer",
          role: "Runtime Observer",
          detail: note,
        }),
        ...state.auditTrail,
      ].slice(0, 96),
    }));
    return true;
  },

  revokeProcessing: (queueItemId, note) => {
    const item = useExecutionQueueStore.getState().items.find((i) => i.id === queueItemId);
    if (!item) return false;
    const gate = canRevokeProcessing({
      queueStatus: item.queueStatus,
      runtimeLock: useExecutionQueueStore.getState().runtimeLock,
      readinessScore: item.readinessScore,
    });
    if (!gate.allowed) return false;
    useExecutionQueueStore.setState((state) => ({
      items: state.items.map((i) => (i.id === queueItemId ? { ...i, queueStatus: "processing_revoked" } : i)),
    }));
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.queueItemId === queueItemId ? { ...s, processingStatus: "processing_revoked" } : s
      ),
      auditTrail: [
        createProcessingAuditEntry({
          queueItemId,
          action: "processing_revoked",
          actor: "Alex Chen",
          role: "CEO",
          detail: note,
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
      prepared: sessions.filter((s) => s.processingStatus === "processing_prepared").length,
      active: sessions.filter((s) => s.processingStatus === "processing_active").length,
      paused: sessions.filter((s) => s.processingStatus === "processing_paused").length,
      revoked: sessions.filter((s) => s.processingStatus === "processing_revoked").length,
      reviewRequired: sessions.filter((s) => s.processingStatus === "processing_review_required").length,
    };
  },
}));
