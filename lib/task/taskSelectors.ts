import type { Task, TaskStatus } from "@/types/productai";

export function countTasksByStatus(tasks: Task[], missionId: string) {
  const missionTasks = tasks.filter((t) => t.missionId === missionId);
  return {
    active: missionTasks.filter((t) => t.status === "active").length,
    in_review: missionTasks.filter((t) => t.status === "in_review").length,
    blocked: missionTasks.filter((t) => t.status === "blocked").length,
    completed: missionTasks.filter((t) => t.status === "completed").length,
    total: missionTasks.length,
  };
}

export function getRecentlyUpdatedTask(tasks: Task[], missionId: string): Task | undefined {
  const missionTasks = tasks.filter((t) => t.missionId === missionId);
  if (!missionTasks.length) return undefined;
  return [...missionTasks].sort((a, b) => {
    const aScore = a.updatedAt === "Just now" ? 1 : 0;
    const bScore = b.updatedAt === "Just now" ? 1 : 0;
    return bScore - aScore;
  })[0];
}

const importantStatuses: TaskStatus[] = ["blocked", "in_review"];

export function getImportantTasks(tasks: Task[], limit = 6): Task[] {
  const seen = new Set<string>();
  const result: Task[] = [];

  const push = (t: Task) => {
    if (seen.has(t.id)) return;
    seen.add(t.id);
    result.push(t);
  };

  tasks.filter((t) => t.status === "blocked").forEach(push);
  tasks.filter((t) => t.status === "in_review").forEach(push);

  [...tasks]
    .filter((t) => t.updatedAt)
    .sort((a, b) => {
      const aScore = a.updatedAt === "Just now" ? 2 : 1;
      const bScore = b.updatedAt === "Just now" ? 2 : 1;
      return bScore - aScore;
    })
    .forEach(push);

  return result.slice(0, limit);
}

export function isImportantTask(task: Task) {
  return importantStatuses.includes(task.status) || task.updatedAt === "Just now";
}

export function getRecentlyCreatedTasks(tasks: Task[], limit = 5): Task[] {
  return [...tasks]
    .filter((t) => t.createdFrom === "judgment")
    .sort((a, b) => {
      const score = (t: Task) => (t.createdAt === "Just now" || t.updatedAt === "Just now" ? 2 : 1);
      return score(b) - score(a);
    })
    .slice(0, limit);
}

export function countJudgmentSpawnedTasks(tasks: Task[], missionId: string): number {
  return tasks.filter((t) => t.missionId === missionId && t.createdFrom === "judgment").length;
}

export function getLinkedTasksForDecision(tasks: Task[], decisionId: string, relatedTaskIds?: string[]) {
  const ids = new Set(relatedTaskIds ?? []);
  return tasks.filter((t) => ids.has(t.id) || t.relatedDecisionId === decisionId);
}
