import type { Task, TaskStatus } from "@/types/productai";

const TASK_ID_PATTERN = /^t-\d+$/;

export function isTaskDependencyRef(ref: string) {
  return TASK_ID_PATTERN.test(ref);
}

export function resolveDependency(
  ref: string,
  tasks: Task[]
): { kind: "task"; task: Task } | { kind: "label"; label: string } {
  if (isTaskDependencyRef(ref)) {
    const task = tasks.find((t) => t.id === ref);
    if (task) return { kind: "task", task };
  }
  return { kind: "label", label: ref };
}

export function getDependsOnTasks(task: Task, allTasks: Task[]): Task[] {
  return task.dependencies
    .filter(isTaskDependencyRef)
    .map((id) => allTasks.find((t) => t.id === id))
    .filter((t): t is Task => Boolean(t));
}

export function getBlockingTasks(task: Task, allTasks: Task[]): Task[] {
  return allTasks.filter(
    (t) => t.id !== task.id && t.dependencies.some((d) => d === task.id)
  );
}

export function getBlockedDependencies(task: Task, allTasks: Task[]): Task[] {
  return getDependsOnTasks(task, allTasks).filter((d) => d.status === "blocked");
}

export function isWaitingOnDependency(task: Task, allTasks: Task[]): boolean {
  return getBlockedDependencies(task, allTasks).length > 0;
}

export interface DependencyWarning {
  task: Task;
  blockedDependency: Task;
}

export function getDependencyWarnings(allTasks: Task[]): DependencyWarning[] {
  const warnings: DependencyWarning[] = [];
  for (const task of allTasks) {
    if (task.status === "completed") continue;
    for (const dep of getBlockedDependencies(task, allTasks)) {
      warnings.push({ task, blockedDependency: dep });
    }
  }
  return warnings;
}

export function dependencyStatusLabel(status: TaskStatus) {
  if (status === "blocked") return "blocked";
  if (status === "completed") return "complete";
  if (status === "in_review") return "in review";
  return "active";
}
