"use client";

import Link from "next/link";
import { StatusPill } from "@/components/StatusPill";
import {
  dependencyStatusLabel,
  getBlockingTasks,
  getBlockedDependencies,
  getDependsOnTasks,
  isWaitingOnDependency,
  resolveDependency,
} from "@/lib/task/taskDependencies";
import type { Task, TaskStatus } from "@/types/productai";

const taskStatusVariant: Record<TaskStatus, "info" | "warning" | "danger" | "success"> = {
  active: "info",
  in_review: "warning",
  blocked: "danger",
  completed: "success",
};

interface TaskDependenciesPanelProps {
  task: Task;
  allTasks: Task[];
}

export function TaskDependenciesPanel({ task, allTasks }: TaskDependenciesPanelProps) {
  const dependsOn = getDependsOnTasks(task, allTasks);
  const blocking = getBlockingTasks(task, allTasks);
  const blockedDeps = getBlockedDependencies(task, allTasks);
  const waiting = isWaitingOnDependency(task, allTasks);
  const labelDeps = task.dependencies.filter((d) => !dependsOn.some((t) => t.id === d));

  if (!task.dependencies.length) {
    return <p className="text-sm text-muted">No dependencies recorded.</p>;
  }

  return (
    <div className="space-y-4">
      {waiting ? (
        <div className="rounded-lg border border-warning/30 bg-amber-50/40 px-3 py-2 text-sm">
          <span className="font-medium text-warning">Waiting on dependency</span>
          <span className="text-muted"> — </span>
          {blockedDeps.map((d) => d.title).join(", ")} must be unblocked first.
        </div>
      ) : null}

      <div>
        <p className="text-xs font-medium uppercase text-muted">Depends on</p>
        <ul className="mt-2 space-y-2">
          {dependsOn.map((dep) => (
            <li key={dep.id} className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
              <Link href={`/tasks/${dep.id}`} className="text-sm font-medium text-foreground hover:text-accent">
                {dep.title}
              </Link>
              <StatusPill variant={taskStatusVariant[dep.status]}>{dependencyStatusLabel(dep.status)}</StatusPill>
            </li>
          ))}
          {labelDeps.map((ref) => {
            const resolved = resolveDependency(ref, allTasks);
            if (resolved.kind === "task") return null;
            return (
              <li
                key={ref}
                className="rounded-lg border border-dashed border-border bg-surface px-3 py-2 text-sm text-muted"
              >
                {resolved.label}
              </li>
            );
          })}
        </ul>
      </div>

      {blocking.length > 0 ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Blocking</p>
          <ul className="mt-2 space-y-2">
            {blocking.map((dep) => (
              <li key={dep.id} className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
                <Link href={`/tasks/${dep.id}`} className="text-sm font-medium text-foreground hover:text-accent">
                  {dep.title}
                </Link>
                <StatusPill variant={taskStatusVariant[dep.status]}>{dep.status}</StatusPill>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-xs text-muted">No downstream tasks blocked by this work.</p>
      )}
    </div>
  );
}
