"use client";

import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { MissionLink } from "@/components/MissionLink";
import { MissionFilterBanner } from "@/components/MissionFilterBanner";
import { useMissionFilterFromUrl } from "@/lib/hooks/useMissionFilterFromUrl";
import { agents } from "@/data/mockData";
import Link from "next/link";
import { useTaskStore } from "@/lib/store/taskStore";
import type { Agent, Task, TaskEvent, TaskStatus } from "@/types/productai";

const columns = [
  { key: "active" as const, label: "Active" },
  { key: "in_review" as const, label: "In Review" },
  { key: "blocked" as const, label: "Blocked" },
  { key: "completed" as const, label: "Completed" },
];

function findAgentByRole(role: Task["assignedTo"]): Agent | undefined {
  return agents.find((a) => a.role === role);
}

function actionButtonClass(variant: "primary" | "secondary" | "danger") {
  if (variant === "primary") {
    return "rounded-md bg-accent px-2 py-1 text-xs font-medium text-white hover:opacity-90";
  }
  if (variant === "danger") {
    return "rounded-md border border-danger/30 bg-danger/5 px-2 py-1 text-xs font-medium text-danger hover:bg-danger/10";
  }
  return "rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground hover:bg-surface";
}

function latestEvent(task: Task): TaskEvent | undefined {
  const events = task.events ?? [];
  return events.length ? events[events.length - 1] : undefined;
}

interface TasksViewProps {
  missionFilter?: string;
}

export function TasksView({ missionFilter }: TasksViewProps) {
  useMissionFilterFromUrl(missionFilter);

  const tasks = useTaskStore((s) => s.tasks);
  const updateTaskStatus = useTaskStore((s) => s.updateTaskStatus);
  const addTaskEvent = useTaskStore((s) => s.addTaskEvent);

  const filteredTasks = missionFilter ? tasks.filter((t) => t.missionId === missionFilter) : tasks;

  const handleStatus = (task: Task, status: TaskStatus) => {
    const actor = findAgentByRole(task.assignedTo);
    updateTaskStatus(task.id, status, actor);
  };

  const handleNudge = (task: Task) => {
    addTaskEvent(task.id, {
      type: "note",
      actor: task.assignedTo,
      agentId: task.assignedAgentId,
      message: `Execution note: unblocked dependencies check requested for "${task.title}".`,
      source: "tasks",
    });
  };

  return (
    <AppShell
      title="Tasks & Execution"
      description="Operational implementation tracking across missions"
    >
      {missionFilter && (
        <MissionFilterBanner missionId={missionFilter} basePath="/tasks" />
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
                    <p className="mt-1">
                    </p>
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

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {task.status === "active" ? (
                        <>
                          <button
                            type="button"
                            className={actionButtonClass("secondary")}
                            onClick={() => handleStatus(task, "in_review")}
                          >
                            Move to Review
                          </button>
                          <button
                            type="button"
                            className={actionButtonClass("danger")}
                            onClick={() => handleStatus(task, "blocked")}
                          >
                            Block
                          </button>
                          <button
                            type="button"
                            className={actionButtonClass("primary")}
                            onClick={() => handleStatus(task, "completed")}
                          >
                            Complete
                          </button>
                        </>
                      ) : task.status === "in_review" ? (
                        <>
                          <button
                            type="button"
                            className={actionButtonClass("secondary")}
                            onClick={() => handleStatus(task, "active")}
                          >
                            Back to Active
                          </button>
                          <button
                            type="button"
                            className={actionButtonClass("danger")}
                            onClick={() => handleStatus(task, "blocked")}
                          >
                            Block
                          </button>
                          <button
                            type="button"
                            className={actionButtonClass("primary")}
                            onClick={() => handleStatus(task, "completed")}
                          >
                            Complete
                          </button>
                        </>
                      ) : task.status === "blocked" ? (
                        <>
                          <button
                            type="button"
                            className={actionButtonClass("secondary")}
                            onClick={() => handleStatus(task, "active")}
                          >
                            Start
                          </button>
                          <button
                            type="button"
                            className={actionButtonClass("secondary")}
                            onClick={() => handleNudge(task)}
                          >
                            Add Note
                          </button>
                          <button
                            type="button"
                            className={actionButtonClass("primary")}
                            onClick={() => handleStatus(task, "completed")}
                          >
                            Complete
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className={actionButtonClass("secondary")}
                          onClick={() => handleStatus(task, "active")}
                        >
                          Reopen
                        </button>
                      )}
                    </div>

                    {task.events?.length ? (
                      <p className="mt-3 text-xs text-muted">
                        Latest: {latestEvent(task)?.message}
                      </p>
                    ) : null}
                  </li>
                ))}
                {columnTasks.length === 0 && (
                  <p className="text-sm text-muted">No tasks</p>
                )}
              </ul>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
