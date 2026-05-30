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

export function ceoApprovedArchitectureActivity(missionId: string): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "👤",
    workerName: "CEO Decision",
    message: "CEO approved architecture phase",
    timestamp: nowLabel(),
  };
}

export function ceoRequestedValidationActivity(missionId: string): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "👤",
    workerName: "CEO Decision",
    message: "CEO requested more validation",
    timestamp: nowLabel(),
  };
}

export function ceoPlacedOnHoldActivity(missionId: string): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "👤",
    workerName: "CEO Decision",
    message: "CEO placed project on hold",
    timestamp: nowLabel(),
  };
}

export function ceoApprovalCompletedTimelineActivity(missionId: string): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "👤",
    workerName: "CEO Decision",
    message: "CEO Approval completed",
    timestamp: nowLabel(),
  };
}
