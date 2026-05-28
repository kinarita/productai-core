"use client";

import { GovernanceNote } from "@/components/orchestration/GovernanceNote";
import { AuthorizationRequestCard } from "@/components/orchestration/AuthorizationRequestCard";
import { ExecuteAuditTimeline } from "@/components/orchestration/ExecuteAuditTimeline";
import { ExecuteGovernanceCard } from "@/components/orchestration/ExecuteGovernanceCard";
import { ExecutionIntentConfirmation } from "@/components/orchestration/ExecutionIntentConfirmation";
import { ExecutionBoundaryReview } from "@/components/orchestration/ExecutionBoundaryReview";
import { ExecutionSessionCard } from "@/components/orchestration/ExecutionSessionCard";
import { ExecutionSessionTimeline } from "@/components/orchestration/ExecutionSessionTimeline";
import { ProcessingAuditTimeline } from "@/components/orchestration/ProcessingAuditTimeline";
import { ProcessingBoundaryReview } from "@/components/orchestration/ProcessingBoundaryReview";
import { ProcessingGovernanceCard } from "@/components/orchestration/ProcessingGovernanceCard";
import { QueueLifecycleView } from "@/components/orchestration/QueueLifecycleView";
import { ReadinessScoreBadge } from "@/components/orchestration/ReadinessScoreBadge";
import { RuntimeLockBadge } from "@/components/orchestration/RuntimeLockBadge";
import type {
  AuthorizationAuditEntry,
  ExecutionAuthorizationRequest,
  ExecutionAuthorizationSignature,
} from "@/lib/orchestration/authorization/authorizationTypes";
import type { ExecutionQueueItem } from "@/lib/orchestration/queue/executionQueueTypes";
import { validateExecutionBoundary } from "@/lib/orchestration/queue/executionGate";
import type { ExecuteAuditEntry, ExecuteStub } from "@/lib/orchestration/execute/executeTypes";
import type { ExecutionSession, ExecutionStartAuditEntry } from "@/lib/orchestration/execution-start/executionStartTypes";
import type { ProcessingAuditEntry, ProcessingSession } from "@/lib/orchestration/processing/processingTypes";
import { Bookmark, BookmarkX, Layers, ShieldCheck, UserCheck, UserX, Undo2, ClipboardCheck, Ban, PlayCircle } from "lucide-react";

interface ExecutionQueueCardProps {
  item: ExecutionQueueItem;
  taskTitle?: string;
  runtimeLockActive?: boolean;
  onReserve: () => void;
  onRelease: () => void;
  onPrepareWorker: () => void;
  onCompleteReview: () => void;
  onEnqueue?: () => void;
  showEnqueue?: boolean;
  authorizationRequest?: ExecutionAuthorizationRequest;
  authorizationSignature?: ExecutionAuthorizationSignature;
  authorizationAudit?: AuthorizationAuditEntry[];
  onRequestAuthorization?: () => void;
  onAuthorizeExecution?: () => void;
  onDenyAuthorization?: () => void;
  onRevokeAuthorization?: () => void;
  executeStub?: ExecuteStub;
  executeAudit?: ExecuteAuditEntry[];
  onRequestExecuteReview?: () => void;
  onMarkExecuteReady?: () => void;
  onDenyExecuteReady?: () => void;
  onRevokeExecuteReady?: () => void;
  executionSession?: ExecutionSession;
  executionSessionAudit?: ExecutionStartAuditEntry[];
  onRequestExecutionStart?: () => void;
  onConfirmExecutionBoundary?: () => void;
  onStartExecutionSession?: () => void;
  onDenyExecutionStart?: () => void;
  onRevokeExecutionSession?: () => void;
  processingSession?: ProcessingSession;
  processingAudit?: ProcessingAuditEntry[];
  onPrepareProcessing?: () => void;
  onActivateProcessing?: () => void;
  onRequestProcessingReview?: () => void;
  onResumeProcessing?: () => void;
  onDenyProcessing?: () => void;
  onPauseProcessing?: () => void;
  onRevokeProcessing?: () => void;
}

export function ExecutionQueueCard({
  item,
  taskTitle,
  runtimeLockActive,
  onReserve,
  onRelease,
  onPrepareWorker,
  onCompleteReview,
  onEnqueue,
  showEnqueue,
  authorizationRequest,
  authorizationSignature,
  authorizationAudit = [],
  onRequestAuthorization,
  onAuthorizeExecution,
  onDenyAuthorization,
  onRevokeAuthorization,
  executeStub,
  executeAudit = [],
  onRequestExecuteReview,
  onMarkExecuteReady,
  onDenyExecuteReady,
  onRevokeExecuteReady,
  executionSession,
  executionSessionAudit = [],
  onRequestExecutionStart,
  onConfirmExecutionBoundary,
  onStartExecutionSession,
  onDenyExecutionStart,
  onRevokeExecutionSession,
  processingSession,
  processingAudit = [],
  onPrepareProcessing,
  onActivateProcessing,
  onRequestProcessingReview,
  onResumeProcessing,
  onDenyProcessing,
  onPauseProcessing,
  onRevokeProcessing,
}: ExecutionQueueCardProps) {
  return (
    <article className="rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Controlled execution queue · {item.executionTarget}
          </p>
          <h4 className="mt-1 text-sm font-semibold text-foreground">
            {taskTitle ?? item.taskId}
          </h4>
        </div>
        <div className="flex flex-col items-end gap-2">
          <ReadinessScoreBadge score={item.readinessScore} />
          <RuntimeLockBadge status={item.runtimeLockStatus} />
        </div>
      </div>

      <div className="mt-3">
        <QueueLifecycleView current={item.queueStatus} />
      </div>

      {item.reservedBy ? (
        <p className="mt-2 text-xs text-muted">
          Reserved by {item.reservedBy}
          {item.reservedAt ? ` · ${new Date(item.reservedAt).toLocaleString()}` : null}
        </p>
      ) : null}

      {item.preparationSummary ? (
        <p className="mt-2 text-sm text-muted">{item.preparationSummary}</p>
      ) : null}

      {item.blockingConditions.length > 0 ? (
        <ul className="mt-2 space-y-1 text-xs text-muted">
          {item.blockingConditions.map((c) => (
            <li key={c}>· {c}</li>
          ))}
        </ul>
      ) : null}

      <div className="mt-3">
        <GovernanceNote>{item.governanceBoundary || validateExecutionBoundary()}</GovernanceNote>
      </div>

      {runtimeLockActive ? (
        <p className="mt-2 text-xs text-muted">
          Runtime lock active — queue progression paused. Recommendation only; no automated recovery.
        </p>
      ) : null}
      {(item.queueStatus === "execution_authorized" ||
        item.queueStatus === "execute_review_pending" ||
        item.queueStatus === "execute_ready" ||
        item.queueStatus === "execution_start_requested" ||
        item.queueStatus === "execution_session_active") ? (
        <div className="mt-3">
          <ExecutionIntentConfirmation
            item={item}
            runtimeAdvisory={runtimeLockActive ? "Runtime advisory lock is active." : undefined}
          />
        </div>
      ) : null}
      {(item.queueStatus === "execution_start_requested" ||
        item.queueStatus === "execution_started" ||
        item.queueStatus === "execution_session_active") ? (
        <div className="mt-3">
          <ExecutionBoundaryReview
            item={item}
            runtimeAdvisory={runtimeLockActive ? "Runtime advisory lock is active." : undefined}
          />
        </div>
      ) : null}
      {(item.queueStatus === "execution_session_active" ||
        item.queueStatus === "processing_prepared" ||
        item.queueStatus === "processing_active" ||
        item.queueStatus === "processing_review_required") ? (
        <div className="mt-3">
          <ProcessingBoundaryReview
            item={item}
            runtimeAdvisory={runtimeLockActive ? "Runtime advisory lock is active." : undefined}
          />
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
        {showEnqueue && onEnqueue ? (
          <button
            type="button"
            onClick={onEnqueue}
            className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-indigo-50/50 px-3 py-1.5 text-xs font-medium text-accent hover:bg-indigo-50"
          >
            <Layers className="h-3.5 w-3.5" />
            Enqueue for Preparation
          </button>
        ) : null}
        {item.queueStatus === "queued" ? (
          <button
            type="button"
            onClick={onReserve}
            disabled={runtimeLockActive}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface disabled:opacity-60"
          >
            <Bookmark className="h-3.5 w-3.5" />
            Reserve Execution Slot
          </button>
        ) : null}
        {item.queueStatus === "reserved" ? (
          <>
            <button
              type="button"
              onClick={onPrepareWorker}
              disabled={runtimeLockActive}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface disabled:opacity-60"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Prepare Worker
            </button>
            <button
              type="button"
              onClick={onRelease}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface"
            >
              <BookmarkX className="h-3.5 w-3.5" />
              Release Reservation
            </button>
          </>
        ) : null}
        {item.queueStatus === "worker_prepared" ? (
          <button
            type="button"
            onClick={onCompleteReview}
            disabled={runtimeLockActive}
            className="inline-flex items-center gap-1.5 rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            Complete Preparation Review
          </button>
        ) : null}
        {item.queueStatus === "awaiting_execution_authorization" && onRequestAuthorization ? (
          <button
            type="button"
            onClick={onRequestAuthorization}
            disabled={runtimeLockActive}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface disabled:opacity-60"
          >
            <UserCheck className="h-3.5 w-3.5" />
            Request Execution Authorization
          </button>
        ) : null}
        {item.queueStatus === "authorization_requested" ? (
          <>
            {onAuthorizeExecution ? (
              <button
                type="button"
                onClick={onAuthorizeExecution}
                disabled={runtimeLockActive}
                className="inline-flex items-center gap-1.5 rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                <UserCheck className="h-3.5 w-3.5" />
                Authorize Execution
              </button>
            ) : null}
            {onDenyAuthorization ? (
              <button
                type="button"
                onClick={onDenyAuthorization}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface"
              >
                <UserX className="h-3.5 w-3.5" />
                Deny Authorization
              </button>
            ) : null}
          </>
        ) : null}
        {(item.queueStatus === "execution_authorized" || item.queueStatus === "authorized") &&
        onRevokeAuthorization ? (
          <button
            type="button"
            onClick={onRevokeAuthorization}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface"
          >
            <Undo2 className="h-3.5 w-3.5" />
            Revoke Authorization
          </button>
        ) : null}
        {item.queueStatus === "execution_authorized" && onRequestExecuteReview ? (
          <button
            type="button"
            onClick={onRequestExecuteReview}
            disabled={runtimeLockActive}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface disabled:opacity-60"
          >
            <ClipboardCheck className="h-3.5 w-3.5" />
            Request Execute Review
          </button>
        ) : null}
        {item.queueStatus === "execute_review_pending" ? (
          <>
            {onMarkExecuteReady ? (
              <button
                type="button"
                onClick={onMarkExecuteReady}
                disabled={runtimeLockActive}
                className="inline-flex items-center gap-1.5 rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                <UserCheck className="h-3.5 w-3.5" />
                Validate Execute Ready
              </button>
            ) : null}
            {onDenyExecuteReady ? (
              <button
                type="button"
                onClick={onDenyExecuteReady}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface"
              >
                <Ban className="h-3.5 w-3.5" />
                Deny Execute Readiness
              </button>
            ) : null}
          </>
        ) : null}
        {item.queueStatus === "execute_ready" && onRevokeExecuteReady ? (
          <button
            type="button"
            onClick={onRevokeExecuteReady}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface"
          >
            <Undo2 className="h-3.5 w-3.5" />
            Revoke Execute Readiness
          </button>
        ) : null}
        {item.queueStatus === "execute_ready" && onRequestExecutionStart ? (
          <button
            type="button"
            onClick={onRequestExecutionStart}
            disabled={runtimeLockActive}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface disabled:opacity-60"
          >
            <PlayCircle className="h-3.5 w-3.5" />
            Request Execution Start
          </button>
        ) : null}
        {item.queueStatus === "execution_start_requested" ? (
          <>
            {onConfirmExecutionBoundary ? (
              <button
                type="button"
                onClick={onConfirmExecutionBoundary}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface"
              >
                <ClipboardCheck className="h-3.5 w-3.5" />
                Confirm Execution Boundary
              </button>
            ) : null}
            {onStartExecutionSession ? (
              <button
                type="button"
                onClick={onStartExecutionSession}
                disabled={runtimeLockActive}
                className="inline-flex items-center gap-1.5 rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                <PlayCircle className="h-3.5 w-3.5" />
                Start Execution Session
              </button>
            ) : null}
            {onDenyExecutionStart ? (
              <button
                type="button"
                onClick={onDenyExecutionStart}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface"
              >
                <Ban className="h-3.5 w-3.5" />
                Deny Execution Start
              </button>
            ) : null}
          </>
        ) : null}
        {item.queueStatus === "execution_session_active" && onRevokeExecutionSession ? (
          <button
            type="button"
            onClick={onRevokeExecutionSession}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface"
          >
            <Undo2 className="h-3.5 w-3.5" />
            Revoke Execution Session
          </button>
        ) : null}
        {item.queueStatus === "execution_session_active" && onPrepareProcessing ? (
          <button
            type="button"
            onClick={onPrepareProcessing}
            disabled={runtimeLockActive}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface disabled:opacity-60"
          >
            <ClipboardCheck className="h-3.5 w-3.5" />
            Prepare Processing
          </button>
        ) : null}
        {item.queueStatus === "processing_prepared" && onActivateProcessing ? (
          <button
            type="button"
            onClick={onActivateProcessing}
            disabled={runtimeLockActive}
            className="inline-flex items-center gap-1.5 rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            <PlayCircle className="h-3.5 w-3.5" />
            Activate Processing Governance
          </button>
        ) : null}
        {item.queueStatus === "processing_active" && onPauseProcessing ? (
          <button
            type="button"
            onClick={onPauseProcessing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface"
          >
            <Undo2 className="h-3.5 w-3.5" />
            Pause Processing
          </button>
        ) : null}
        {item.queueStatus === "processing_active" && onRequestProcessingReview ? (
          <button
            type="button"
            onClick={onRequestProcessingReview}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface"
          >
            <ClipboardCheck className="h-3.5 w-3.5" />
            Request Processing Review
          </button>
        ) : null}
        {(item.queueStatus === "processing_review_required" || item.queueStatus === "processing_paused") &&
        onResumeProcessing ? (
          <button
            type="button"
            onClick={onResumeProcessing}
            disabled={runtimeLockActive}
            className="inline-flex items-center gap-1.5 rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            <PlayCircle className="h-3.5 w-3.5" />
            Resume Processing Governance
          </button>
        ) : null}
        {item.queueStatus === "processing_review_required" && onDenyProcessing ? (
          <button
            type="button"
            onClick={onDenyProcessing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface"
          >
            <Ban className="h-3.5 w-3.5" />
            Deny Processing Governance
          </button>
        ) : null}
        {(item.queueStatus === "processing_active" || item.queueStatus === "processing_prepared") &&
        onRevokeProcessing ? (
          <button
            type="button"
            onClick={onRevokeProcessing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface"
          >
            <Ban className="h-3.5 w-3.5" />
            Revoke Processing Governance
          </button>
        ) : null}
        {item.queueStatus === "processing_review_required" && onRevokeProcessing ? (
          <button
            type="button"
            onClick={onRevokeProcessing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface"
          >
            <Ban className="h-3.5 w-3.5" />
            Revoke Processing Governance
          </button>
        ) : null}
      </div>
      <AuthorizationRequestCard
        item={item}
        request={authorizationRequest}
        signature={authorizationSignature}
        auditEntries={authorizationAudit}
      />
      <div className="mt-3">
        <ExecuteGovernanceCard stub={executeStub} />
      </div>
      <div className="mt-3">
        <ExecuteAuditTimeline entries={executeAudit} />
      </div>
      <div className="mt-3">
        <ExecutionSessionCard session={executionSession} />
      </div>
      <div className="mt-3">
        <ExecutionSessionTimeline entries={executionSessionAudit} />
      </div>
      <div className="mt-3">
        <ProcessingGovernanceCard session={processingSession} />
      </div>
      <div className="mt-3">
        <ProcessingAuditTimeline entries={processingAudit} />
      </div>
    </article>
  );
}