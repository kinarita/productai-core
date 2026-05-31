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

export function decisionProposedActivity(missionId: string, title: string): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "🧠",
    workerName: "Product Planner",
    message: `Decision proposed: ${title}`,
    timestamp: nowLabel(),
  };
}

export function decisionApprovedActivity(missionId: string, title: string): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "👤",
    workerName: "CEO Decision",
    message: `Decision approved: ${title}`,
    timestamp: nowLabel(),
  };
}

export function decisionRejectedActivity(missionId: string, title: string): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "👤",
    workerName: "CEO Decision",
    message: `Decision rejected: ${title}`,
    timestamp: nowLabel(),
  };
}

export function decisionSentToArchitectActivity(missionId: string): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "👤",
    workerName: "CEO Decision",
    message: "Decision package sent to architect handoff preview",
    timestamp: nowLabel(),
  };
}

export function meetingMinutesGeneratedActivity(missionId: string): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "🧠",
    workerName: "Product Planner",
    message: "Meeting minutes generated",
    timestamp: nowLabel(),
  };
}

export function briefChangeCandidateCreatedActivity(
  missionId: string,
  title: string
): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "👤",
    workerName: "CEO Decision",
    message: `Brief change candidate created: ${title}`,
    timestamp: nowLabel(),
  };
}
