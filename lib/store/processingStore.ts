"use client";

import { create } from "zustand";
import { createProcessingAuditEntry } from "@/lib/orchestration/processing/processingAudit";
import { processingSemanticsMessage } from "@/lib/orchestration/processing/processingBoundary";
import {
  canActivateProcessing,
  canPauseProcessing,
  canPrepareProcessing,
  canRevokeProcessing as canRevokeProcessingStatus,
} from "@/lib/orchestration/processing/processingPolicy";
import {
  canDenyProcessing,
  canResumeProcessing,
  canRevokeProcessing as canRevokeProcessingReview,
  requiresProcessingReview,
} from "@/lib/orchestration/processing/processingReviewPolicy";
import { buildProcessingGovernanceReason } from "@/lib/orchestration/processing/reasonTaxonomy";
import { createProcessingSession } from "@/lib/orchestration/processing/processingSession";
import type {
  ProcessingAuditEntry,
  ProcessingGovernanceReason,
  ProcessingReasonCategory,
  ProcessingSession,
} from "@/lib/orchestration/processing/processingTypes";
import { useExecutionQueueStore } from "@/lib/store/executionQueueStore";
import { useExecutionSessionStore } from "@/lib/store/executionSessionStore";
import { useRuntimeStore } from "@/lib/store/runtimeStore";
import { useSyncStore } from "@/lib/store/syncStore";
import { useTaskStore } from "@/lib/store/taskStore";

interface ProcessingState {
  sessions: ProcessingSession[];
  auditTrail: ProcessingAuditEntry[];
  prepareProcessing: (queueItemId: string, advisoryState?: string) => boolean;
  activateProcessing: (queueItemId: string) => boolean;
  requestProcessingReview: (
    queueItemId: string,
    category: ProcessingReasonCategory,
    overrides?: Partial<Pick<ProcessingGovernanceReason, "title" | "description" | "recommendation">>
  ) => boolean;
  resumeProcessing: (queueItemId: string, note?: string) => boolean;
  denyProcessing: (queueItemId: string, note?: string) => boolean;
  pauseProcessing: (queueItemId: string, note?: string) => boolean;
  revokeProcessing: (queueItemId: string, note?: string) => boolean;
  getSessionForQueueItem: (queueItemId: string) => ProcessingSession | undefined;
  getAuditForQueueItem: (queueItemId: string) => ProcessingAuditEntry[];
  getSummary: () => {
    prepared: number;
    active: number;
    paused: number;
    revoked: number;
    denied: number;
    reviewRequired: number;
    elevatedRisk: number;
  };
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
    const providerDegraded = useRuntimeStore
      .getState()
      .providerHealth.some((p) => p.health === "degraded" || p.health === "down");
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

  requestProcessingReview: (queueItemId, category, overrides) => {
    const item = useExecutionQueueStore.getState().items.find((i) => i.id === queueItemId);
    const session = get().sessions.find((s) => s.queueItemId === queueItemId);
    if (!item || !session) return false;
    const reason = buildProcessingGovernanceReason(category, overrides);
    const hasSyncWarnings = useSyncStore.getState().syncWarnings.length > 0;
    const hasProviderDegraded = useRuntimeStore
      .getState()
      .providerHealth.some((p) => p.health === "degraded" || p.health === "down");
    const reviewGate = requiresProcessingReview({
      processingStatus: session.processingStatus,
      reason,
      runtimeLockActive: useExecutionQueueStore.getState().runtimeLock.active || hasSyncWarnings,
      unresolvedBlocker: item.blockingConditions.length > 0,
      continuityValid: !hasProviderDegraded,
    });
    if (!reviewGate.required) return false;

    useExecutionQueueStore.setState((state) => ({
      items: state.items.map((i) =>
        i.id === queueItemId ? { ...i, queueStatus: "processing_review_required" } : i
      ),
    }));
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.queueItemId === queueItemId
          ? {
              ...s,
              processingStatus: "processing_review_required",
              reviewRequired: true,
              latestReviewReason: reason,
              activeReasons: [reason, ...s.activeReasons].slice(0, 6),
              advisoryState: reason.description,
            }
          : s
      ),
      auditTrail: [
        createProcessingAuditEntry({
          queueItemId,
          action: "processing_governance_reason_added",
          actor: reason.advisoryOnly ? "Runtime Observer" : "Nova",
          role: reason.advisoryOnly ? "Runtime Observer" : "COO",
          detail: reason.title,
        }),
        createProcessingAuditEntry({
          queueItemId,
          action: "processing_review_requested",
          actor: reason.advisoryOnly ? "Runtime Observer" : "Nova",
          role: reason.advisoryOnly ? "Runtime Observer" : "COO",
          detail: reason.title,
        }),
        ...state.auditTrail,
      ].slice(0, 96),
    }));
    return true;
  },

  resumeProcessing: (queueItemId, note) => {
    const item = useExecutionQueueStore.getState().items.find((i) => i.id === queueItemId);
    const session = get().sessions.find((s) => s.queueItemId === queueItemId);
    if (!item || !session) return false;
    const hasProviderDegraded = useRuntimeStore
      .getState()
      .providerHealth.some((p) => p.health === "degraded" || p.health === "down");
    const gate = canResumeProcessing({
      processingStatus: session.processingStatus,
      runtimeLockActive: useExecutionQueueStore.getState().runtimeLock.active,
      continuityValid: !hasProviderDegraded,
    });
    if (!gate.allowed) return false;
    useExecutionQueueStore.setState((state) => ({
      items: state.items.map((i) => (i.id === queueItemId ? { ...i, queueStatus: "processing_active" } : i)),
    }));
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.queueItemId === queueItemId
          ? { ...s, processingStatus: "processing_active", reviewRequired: false }
          : s
      ),
      auditTrail: [
        createProcessingAuditEntry({
          queueItemId,
          action: "processing_review_resolved",
          actor: "Nova",
          role: "COO",
          detail: note,
        }),
        ...state.auditTrail,
      ].slice(0, 96),
    }));
    return true;
  },

  denyProcessing: (queueItemId, note) => {
    const session = get().sessions.find((s) => s.queueItemId === queueItemId);
    if (!session) return false;
    const gate = canDenyProcessing({ processingStatus: session.processingStatus });
    if (!gate.allowed) return false;
    useExecutionQueueStore.setState((state) => ({
      items: state.items.map((i) => (i.id === queueItemId ? { ...i, queueStatus: "processing_denied" } : i)),
    }));
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.queueItemId === queueItemId
          ? { ...s, processingStatus: "processing_denied", reviewRequired: false }
          : s
      ),
      auditTrail: [
        createProcessingAuditEntry({
          queueItemId,
          action: "processing_review_denied",
          actor: "Alex Chen",
          role: "CEO",
          detail: note,
        }),
        ...state.auditTrail,
      ].slice(0, 96),
    }));
    return true;
  },

  pauseProcessing: (queueItemId, note) => {
    const item = useExecutionQueueStore.getState().items.find((i) => i.id === queueItemId);
    const session = get().sessions.find((s) => s.queueItemId === queueItemId);
    if (!item || !session) return false;
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
        s.queueItemId === queueItemId
          ? {
              ...s,
              processingStatus: "processing_paused",
              reviewRequired: false,
              latestReviewReason:
                s.latestReviewReason ??
                buildProcessingGovernanceReason("manual_governance_pause", {
                  description: note ?? "Manual governance pause recorded.",
                }),
            }
          : s
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
    const session = get().sessions.find((s) => s.queueItemId === queueItemId);
    if (!item || !session) return false;
    const policyGate = canRevokeProcessingStatus({
      queueStatus: item.queueStatus,
      runtimeLock: useExecutionQueueStore.getState().runtimeLock,
      readinessScore: item.readinessScore,
    });
    if (!policyGate.allowed) return false;
    const gate = canRevokeProcessingReview({ processingStatus: session.processingStatus });
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
          action: "processing_review_revoked",
          actor: "Alex Chen",
          role: "CEO",
          detail: note,
        }),
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
      denied: sessions.filter((s) => s.processingStatus === "processing_denied").length,
      reviewRequired: sessions.filter((s) => s.processingStatus === "processing_review_required").length,
      elevatedRisk: sessions.filter((s) => s.activeReasons.some((r) => r.severity === "high")).length,
    };
  },
}));
