"use client";

import type { TaskOwnershipBucket } from "@/lib/delivery/taskOwnership";
import { useDeliveryWorkspaceStore } from "@/lib/store/deliveryWorkspaceStore";
import type { MissionTeamRoleId } from "@/lib/mission-team/missionRoles";
import { cn } from "@/lib/utils";

export function TaskOwnershipPanel({
  buckets,
  compact = false,
}: {
  buckets: TaskOwnershipBucket[];
  compact?: boolean;
}) {
  const selectedRole = useDeliveryWorkspaceStore((s) => s.selectedRole);
  const setSelectedRole = useDeliveryWorkspaceStore((s) => s.setSelectedRole);

  const visible = buckets.filter((b) => b.assignedTasks > 0 || !compact);

  return (
    <div className={cn("grid gap-2", compact ? "grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3")}>
      {visible.slice(0, compact ? 4 : undefined).map((bucket) => (
        <button
          key={bucket.roleId}
          type="button"
          onClick={() =>
            setSelectedRole(selectedRole === bucket.roleId ? null : (bucket.roleId as MissionTeamRoleId))
          }
          className={cn(
            "rounded-lg border border-border px-3 py-2 text-left transition hover:border-accent/40",
            selectedRole === bucket.roleId && "border-accent/60 bg-accent/5"
          )}
        >
          <p className="text-xs font-medium text-foreground">{bucket.roleTitle}</p>
          <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-muted">
            <span>Assigned: {bucket.assignedTasks}</span>
            <span>Active: {bucket.activeTasks}</span>
            <span>Review: {bucket.reviewTasks}</span>
            <span>Blocked: {bucket.blockedTasks}</span>
          </div>
          {!compact && bucket.taskTitles.length > 0 ? (
            <ul className="mt-2 space-y-0.5 text-[10px] text-muted">
              {bucket.taskTitles.slice(0, 2).map((t) => (
                <li key={t}>· {t}</li>
              ))}
            </ul>
          ) : null}
        </button>
      ))}
    </div>
  );
}
