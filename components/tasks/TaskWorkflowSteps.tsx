"use client";

import { cn } from "@/lib/utils";
import type { Task } from "@/types/productai";

interface TaskWorkflowStepsProps {
  task: Task;
  hasDecision: boolean;
}

function stepState(
  index: number,
  task: Task,
  hasDecision: boolean
): "done" | "current" | "upcoming" {
  const { status, progress } = task;

  if (index === 0) {
    return hasDecision ? "done" : "upcoming";
  }
  if (index === 1) {
    return "done";
  }
  if (index === 2) {
    if (status === "active" && progress > 0) return "current";
    if (status !== "active") return "done";
    return "current";
  }
  if (index === 3) {
    if (status === "in_review") return "current";
    if (status === "completed") return "done";
    return "upcoming";
  }
  if (index === 4) {
    return status === "completed" ? "done" : "upcoming";
  }
  return "upcoming";
}

const steps = [
  "Judgment",
  "Task Created",
  "Implementation",
  "QA Review",
  "Mission Progress",
] as const;

export function TaskWorkflowSteps({ task, hasDecision }: TaskWorkflowStepsProps) {
  return (
    <ol className="space-y-0">
      {steps.map((label, index) => {
        const state = stepState(index, task, hasDecision);
        const isLast = index === steps.length - 1;
        return (
          <li key={label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium",
                  state === "done" && "border-success bg-green-50 text-success",
                  state === "current" && "border-accent bg-indigo-50 text-accent",
                  state === "upcoming" && "border-border bg-surface text-muted"
                )}
              >
                {index + 1}
              </span>
              {!isLast ? <span className="my-1 w-px flex-1 bg-border min-h-[20px]" /> : null}
            </div>
            <div className={cn("pb-5", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-medium",
                  state === "upcoming" ? "text-muted" : "text-foreground"
                )}
              >
                {label}
              </p>
              {state === "current" && index === 2 && task.status === "active" ? (
                <p className="mt-0.5 text-xs text-muted">{task.progress}% complete</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
