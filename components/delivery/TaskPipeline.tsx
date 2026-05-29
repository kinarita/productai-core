"use client";

import Link from "next/link";
import type { TaskPipelineRow } from "@/lib/delivery/deliveryPipeline";
import { useDeliveryWorkspaceStore } from "@/lib/store/deliveryWorkspaceStore";
import { cn } from "@/lib/utils";

export function TaskPipeline({
  rows,
  compact = false,
}: {
  rows: TaskPipelineRow[];
  compact?: boolean;
}) {
  const selectedTaskId = useDeliveryWorkspaceStore((s) => s.selectedTaskId);
  const setSelectedTask = useDeliveryWorkspaceStore((s) => s.setSelectedTask);

  if (rows.length === 0) {
    return <p className="text-xs text-muted">No tasks in the delivery pipeline.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-xs">
        <thead>
          <tr className="border-b border-border text-muted">
            <th className="pb-2 pr-3 font-medium">Task Title</th>
            <th className="pb-2 pr-3 font-medium">Mission</th>
            <th className="pb-2 pr-3 font-medium">Assigned Role</th>
            <th className="pb-2 pr-3 font-medium">Status</th>
            <th className="pb-2 pr-3 font-medium">Review State</th>
            <th className="pb-2 pr-3 font-medium">Repository</th>
            <th className="pb-2 pr-3 font-medium">Stage</th>
            <th className="pb-2 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, compact ? 6 : undefined).map((row) => (
            <tr
              key={row.taskId}
              className={cn(
                "border-b border-border/60 cursor-pointer hover:bg-muted/5",
                selectedTaskId === row.taskId && "bg-accent/5"
              )}
              onClick={() => setSelectedTask(row.taskId)}
            >
              <td className="py-2 pr-3">
                <Link href={`/tasks/${row.taskId}`} className="text-accent hover:underline">
                  {row.taskTitle}
                </Link>
              </td>
              <td className="py-2 pr-3">
                <Link href={`/missions/${row.missionId}`} className="text-muted hover:text-accent">
                  {row.missionName}
                </Link>
              </td>
              <td className="py-2 pr-3 capitalize text-muted">{row.assignedRole}</td>
              <td className="py-2 pr-3 capitalize text-muted">{row.status}</td>
              <td className="py-2 pr-3 text-muted">{row.reviewState}</td>
              <td className="py-2 pr-3 capitalize text-muted">{row.repositoryState}</td>
              <td className="py-2 pr-3 text-muted">{row.deliveryStageLabel}</td>
              <td className="py-2 text-muted">{row.updatedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
