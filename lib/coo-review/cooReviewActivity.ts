import type { CooReviewRecommendation } from "@/lib/coo-review/cooReviewTypes";
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

export function cooReviewStartedActivity(missionId: string): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "🧭",
    workerName: "COO Review",
    message: "COO review started",
    timestamp: nowLabel(),
  };
}

export function cooReviewCompletedActivity(missionId: string): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "🧭",
    workerName: "COO Review",
    message: "COO review completed",
    timestamp: nowLabel(),
  };
}

export function cooRecommendationActivity(
  missionId: string,
  recommendation: CooReviewRecommendation
): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "🧭",
    workerName: "COO Review",
    message: `COO recommends ${recommendation}`,
    timestamp: nowLabel(),
  };
}

export function ceoApprovalRequestedActivity(missionId: string): ProjectActivityItem {
  return {
    id: activityId(),
    missionId,
    workerEmoji: "👤",
    workerName: "CEO Decision",
    message: "CEO approval requested",
    timestamp: nowLabel(),
  };
}

export function organizationFeedMessageForCooReviewComplete(
  missionName: string,
  recommendation: CooReviewRecommendation
): { message: string; requiresCeoApproval: boolean } {
  return {
    message: `COO review complete for "${missionName}" — recommendation: ${recommendation}. CEO approval required before architecture.`,
    requiresCeoApproval: true,
  };
}
