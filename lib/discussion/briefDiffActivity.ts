import type { ProjectActivityItem } from "@/lib/project-creation/projectCreationTypes";

function activityId(): string {
  return `act-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
}

function nowLabel(): string {
  return new Date().toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function briefVersionCreatedActivity(
  missionId: string,
  version: number,
  title?: string
): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "🧠",
    workerName: "Product Planner",
    message: title
      ? `Brief v${version} created — ${title}`
      : `Brief version created — v${version}`,
    timestamp: nowLabel(),
  };
}

export function briefDiffGeneratedActivity(
  missionId: string,
  from: number,
  to: number
): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "🧠",
    workerName: "Product Planner",
    message: `Brief diff generated — v${from} → v${to}`,
    timestamp: nowLabel(),
  };
}

export function plannerAppliedChangeActivity(
  missionId: string,
  title: string,
  version: number
): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "🧠",
    workerName: "Product Planner",
    message: `Planner applied change: "${title}" — Brief v${version} created`,
    timestamp: nowLabel(),
  };
}
