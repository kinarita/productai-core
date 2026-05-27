import { agents } from "@/data/mockData";
import type { Agent, Task } from "@/types/productai";

export function findAgentByRole(role: Task["assignedTo"]): Agent | undefined {
  return agents.find((a) => a.role === role);
}

export function agentName(role: Task["assignedTo"]) {
  return agents.find((a) => a.role === role)?.name ?? role;
}

import type { TaskEventSource } from "@/types/productai";

export function sourceBadgeClass(source: TaskEventSource) {
  const map: Record<TaskEventSource, string> = {
    tasks: "bg-indigo-50 text-accent border-indigo-200",
    mission: "bg-surface text-muted border-border",
    judgment: "bg-amber-50 text-warning border-amber-200",
    runtime: "bg-blue-50 text-info border-blue-200",
    system: "bg-surface text-muted border-border",
  };
  return `inline-flex rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${map[source]}`;
}

export function actionButtonClass(variant: "primary" | "secondary" | "danger") {
  if (variant === "primary") {
    return "rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-white hover:opacity-90";
  }
  if (variant === "danger") {
    return "rounded-md border border-danger/30 bg-danger/5 px-2.5 py-1 text-xs font-medium text-danger hover:bg-danger/10";
  }
  return "rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface";
}
