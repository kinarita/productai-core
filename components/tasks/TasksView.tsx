"use client";

import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { MissionLink } from "@/components/MissionLink";
import { MissionFilterBanner } from "@/components/MissionFilterBanner";
import { TaskStatusActions } from "@/components/tasks/TaskStatusActions";
import { useMissionFilterFromUrl } from "@/lib/hooks/useMissionFilterFromUrl";
import Link from "next/link";
import { useTaskStore } from "@/lib/store/taskStore";
import type { Task, TaskEvent } from "@/types/productai";

const allowedStatus = ["todo", "active", "in_review", "blocked", "completed"] as const;
type TaskQueryStatus = (typeof allowedStatus)[number];

const columns = [
  { key: "active" as const, label: "Active" },
  { key: "in_review" as const, label: "In Review" },
  { key: "blocked" as const, label: "Blocked" },
  { key: "completed" as const, label: "Completed" },
];

function latestEvent(task: Task): TaskEvent | undefined {
  const events = task.events ?? [];
  return events.length ? events[events.length - 1] : undefined;
}

interface TasksViewProps {
  missionFilter?: string;
  statusFilter?: string;
}

function normalizeStatus(status?: string): Task["status"] | undefined {
  if (!status) return undefined;
  const lowered = status.toLowerCase() as TaskQueryStatus;
  if (!allowedStatus.includes(lowered)) return undefined;
  if (lowered === "todo") return "active";
  return lowered;
}

export function TasksView({ missionFilter, statusFilter }: TasksViewProps) {
  useMissionFilterFromUrl(missionFilter);

  const tasks = useTaskStore((s) => s.tasks);
  const normalizedStatus = normalizeStatus(statusFilter);

  const filteredTasks = tasks.filter((t) => {
    if (missionFilter && t.missionId !== missionFilter) return false;
    if (normalizedStatus && t.status !== normalizedStatus) return false;
    return true;
  });

  const filterChipClass =
    "rounded-md border border-border bg-surface px-2 py-1 text-muted";

  return (
    <AppShell
      title="Tasks & Execution"
      description="Operational implementation tracking across missions"
    >
      {missionFilter && (
        <MissionFilterBanner missionId={missionFilter} basePath="/tasks" />
      )}
      {(missionFilter || normalizedStatus) && (
        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          {missionFilter ? (
            <span className={filterChipClass}>
              mission: {missionFilter}
            </span>
          ) : null}
          {normalizedStatus ? (
            <span className={filterChipClass}>
              status: {normalizedStatus}
            </span>
          ) : null}
          <Link
            href="/tasks"
            className="rounded-md border border-border bg-background px-2 py-1 text-accent hover:bg-surface"
          >
            Clear filters
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        {columns.map((col) => {
          const columnTasks = filteredTasks.filter((t) => t.status === col.key);
          return (
            <Card key={col.key} title={col.label} className="min-h-[320px]">
              <ul className="space-y-3">
                {columnTasks.map((task) => (
                  <li
                    key={task.id}
                    className="group rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-surface/70"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/tasks/${task.id}`}
                          className="block truncate text-sm font-medium text-foreground hover:text-accent"
                        >
                          {task.title}
                        </Link>
                        <p className="mt-1">
                          <MissionLink
                            missionId={task.missionId}
                            missionName={task.missionName}
                            variant="subtle"
                          />
                        </p>
                      </div>
                      <Link
                        href={`/tasks/${task.id}`}
                        className="mt-0.5 text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        Open Detail →
                      </Link>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant="accent">{task.assignedTo}</Badge>
                      <span className="text-xs text-muted">
                        {task.updatedAt ? `Updated ${task.updatedAt}` : `ETA ${task.eta}`}
                      </span>
                    </div>
                    {task.dependencies.length > 0 && (
                      <p className="mt-2 text-xs text-muted">
                        Depends: {task.dependencies.join(", ")}
                      </p>
                    )}
                    {task.status !== "completed" && task.status !== "blocked" && (
                      <div className="mt-3 h-1 overflow-hidden rounded-full bg-border">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    )}

                    <TaskStatusActions task={task} />

                    {task.events?.length ? (
                      <p className="mt-3 text-xs text-muted">
                        Latest: {latestEvent(task)?.message}
                      </p>
                    ) : null}
                  </li>
                ))}
                {columnTasks.length === 0 && (
                  <p className="text-sm text-muted">
                    No tasks match this column with the current filters.
                  </p>
                )}
              </ul>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
