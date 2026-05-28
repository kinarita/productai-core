"use client";

import { GovernanceNote } from "@/components/orchestration/GovernanceNote";
import { QueueLifecycleView } from "@/components/orchestration/QueueLifecycleView";
import { ReadinessScoreBadge } from "@/components/orchestration/ReadinessScoreBadge";
import { RuntimeLockBadge } from "@/components/orchestration/RuntimeLockBadge";
import type { ExecutionQueueItem } from "@/lib/orchestration/queue/executionQueueTypes";
import { validateExecutionBoundary } from "@/lib/orchestration/queue/executionGate";
import { Bookmark, BookmarkX, Layers, ShieldCheck } from "lucide-react";

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
      </div>
    </article>
  );
}