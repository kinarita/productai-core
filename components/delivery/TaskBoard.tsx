"use client";

import Link from "next/link";
import type { TaskPipelineRow } from "@/lib/delivery/deliveryPipeline";
import { useDeliveryWorkspaceStore } from "@/lib/store/deliveryWorkspaceStore";
import { ProgressBar } from "@/components/ProgressBar";
import { Badge } from "@/components/Badge";
import { cn } from "@/lib/utils";

export function TaskBoard({
  rows,
  compact = false,
}: {
  rows: TaskPipelineRow[];
  compact?: boolean;
}) {
  const selectedTaskId = useDeliveryWorkspaceStore((s) => s.selectedTaskId);
  const setSelectedTask = useDeliveryWorkspaceStore((s) => s.setSelectedTask);

  const active = rows.filter((r) => r.status !== "completed");
  const display = compact ? active.slice(0, 6) : active;

  if (display.length === 0) {
    return <p className="text-xs text-muted">No active delivery tasks on the board.</p>;
  }

  return (
    <div className={cn("grid gap-3", compact ? "grid-cols-1" : "md:grid-cols-2 xl:grid-cols-3")}>
      {display.map((row) => (
        <button
          key={row.taskId}
          type="button"
          onClick={() => setSelectedTask(row.taskId)}
          className={cn(
            "rounded-lg border border-border bg-background px-3 py-3 text-left transition hover:border-accent/40",
            selectedTaskId === row.taskId && "border-accent/60 bg-accent/5"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/tasks/${row.taskId}`}
              className="text-sm font-medium text-accent hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {row.taskTitle}
            </Link>
            <Badge variant="default">{row.deliveryStageLabel}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted">
            {row.missionName} · {row.assignedRole}
          </p>
          <div className="mt-2">
            <ProgressBar value={row.progress} />
          </div>
          <p className="mt-2 text-[11px] text-muted">
            {row.reviewState} · {row.repositoryState}
          </p>
        </button>
      ))}
    </div>
  );
}
