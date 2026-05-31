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

export function executiveDiscussionStartedActivity(missionId: string): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "👤",
    workerName: "CEO Decision",
    message: "Executive discussion started",
    timestamp: nowLabel(),
  };
}

export function plannerChallengedAssumptionActivity(missionId: string): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "🧠",
    workerName: "Product Planner",
    message: "Planner challenged assumption",
    timestamp: nowLabel(),
  };
}

export function cooRaisedBusinessConcernActivity(missionId: string): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "🧭",
    workerName: "COO",
    message: "COO raised business concern",
    timestamp: nowLabel(),
  };
}

export function executiveDecisionRecordedActivity(
  missionId: string,
  statement: string
): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "👤",
    workerName: "CEO Decision",
    message: `Executive decision recorded: ${statement.slice(0, 72)}`,
    timestamp: nowLabel(),
  };
}

export function strategySummaryGeneratedActivity(missionId: string): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "🧠",
    workerName: "Product Planner",
    message: "Strategy summary generated",
    timestamp: nowLabel(),
  };
}
