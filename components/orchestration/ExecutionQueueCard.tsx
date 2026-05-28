"use client";

import { GovernanceNote } from "@/components/orchestration/GovernanceNote";
import { AuthorizationRequestCard } from "@/components/orchestration/AuthorizationRequestCard";
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
import { Bookmark, BookmarkX, Layers, ShieldCheck, UserCheck, UserX, Undo2 } from "lucide-react";

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
      </div>
      <AuthorizationRequestCard
        item={item}
        request={authorizationRequest}
        signature={authorizationSignature}
        auditEntries={authorizationAudit}
      />
    </article>
  );
}