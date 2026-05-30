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

export function plannerReceivedValidationRequestActivity(
  missionId: string
): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "🧠",
    workerName: "Product Planner",
    message: "Planner received CEO validation request",
    timestamp: nowLabel(),
  };
}

export function plannerUpdatedValidationAnalysisActivity(
  missionId: string
): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "🧠",
    workerName: "Product Planner",
    message: "Planner updated validation analysis",
    timestamp: nowLabel(),
  };
}

export function plannerRegeneratedRecommendationInputsActivity(
  missionId: string
): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "🧠",
    workerName: "Product Planner",
    message: "Planner regenerated recommendation inputs",
    timestamp: nowLabel(),
  };
}

export function cooReviewRerunActivity(missionId: string): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "🧭",
    workerName: "COO Review",
    message: "COO review rerun after Planner re-validation",
    timestamp: nowLabel(),
  };
}
