import {
  getBlockedDependencies,
  getBlockingTasks,
  getDependencyWarnings,
  getDependsOnTasks,
} from "@/lib/task/taskDependencies";
import type { OrganizationFeedItem, Task } from "@/types/productai";

export interface MissionExecutionCounts {
  decisionCount: number;
  tasksCreated: number;
  activeExecution: number;
  reviewCount: number;
  completedCount: number;
  blockedCount: number;
  dependencyRefs: number;
}

export interface WaitingChain {
  blockedTask: Task;
  blockedBy: Task;
}

export function getMissionExecutionCounts(
  missionTasks: Task[],
  decisionCount: number
): MissionExecutionCounts {
  const tasksCreated = missionTasks.length;
  const activeExecution = missionTasks.filter((t) => t.status === "active").length;
  const reviewCount = missionTasks.filter((t) => t.status === "in_review").length;
  const completedCount = missionTasks.filter((t) => t.status === "completed").length;
  const blockedCount = missionTasks.filter((t) => t.status === "blocked").length;
  const dependencyRefs = missionTasks.reduce((acc, t) => acc + t.dependencies.length, 0);
  return {
    decisionCount,
    tasksCreated,
    activeExecution,
    reviewCount,
    completedCount,
    blockedCount,
    dependencyRefs,
  };
}

export function getMissionWaitingChains(missionTasks: Task[], allTasks: Task[]): WaitingChain[] {
  const chains: WaitingChain[] = [];
  for (const task of missionTasks) {
    const blockedDeps = getBlockedDependencies(task, allTasks);
    for (const dep of blockedDeps) {
      chains.push({ blockedTask: task, blockedBy: dep });
    }
  }
  return chains;
}

export function getMissionDependencyInsights(missionTasks: Task[], allTasks: Task[]) {
  const warnings = getDependencyWarnings(missionTasks);
  const waitingChains = getMissionWaitingChains(missionTasks, allTasks);
  const runtimeImpacted = missionTasks.filter((t) =>
    (t.events ?? []).some(
      (e) =>
        e.source === "runtime" ||
        /runtime|latency|provider|claude/i.test(e.message)
    )
  ).length;
  const architectureWaiting = missionTasks.filter((t) =>
    getDependsOnTasks(t, allTasks).some((d) => d.assignedTo === "Architect")
  ).length;
  const downstreamLinked = missionTasks.reduce(
    (acc, t) => acc + getBlockingTasks(t, allTasks).length,
    0
  );

  return {
    warningsCount: warnings.length,
    waitingChains,
    runtimeImpacted,
    architectureWaiting,
    downstreamLinked,
  };
}

export function getMissionExecutionFeed(
  feed: OrganizationFeedItem[],
  missionId: string,
  missionTaskIds: string[]
) {
  const taskSet = new Set(missionTaskIds);
  return feed
    .filter((item) => item.missionId === missionId || (item.taskId ? taskSet.has(item.taskId) : false))
    .slice(0, 6);
}
