import type { OrganizationFeedItem } from "@/types/productai";
import type { DeliveryFeedEventType } from "@/types/productai";

export const deliveryFeedEventTypes: DeliveryFeedEventType[] = [
  "task_created",
  "task_review_started",
  "task_review_completed",
  "repository_ready",
  "release_readiness_updated",
  "delivery_snapshot",
];

const eventLabels: Record<DeliveryFeedEventType, string> = {
  task_created: "Task created",
  task_review_started: "Task review started",
  task_review_completed: "Task review completed",
  repository_ready: "Repository ready",
  release_readiness_updated: "Release readiness updated",
  delivery_snapshot: "Delivery snapshot",
};

export function deliveryFeedTypeLabel(type: DeliveryFeedEventType): string {
  return eventLabels[type] ?? type.replaceAll("_", " ");
}

export function createDeliveryFeedItem(input: {
  type: DeliveryFeedEventType;
  missionId: string;
  missionName: string;
  message: string;
  taskId?: string;
}): OrganizationFeedItem {
  const now = new Date().toISOString();
  return {
    id: `feed-delivery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: input.type,
    author: "COO",
    authorName: "Nova",
    missionId: input.missionId,
    missionName: input.missionName,
    taskId: input.taskId,
    message: input.message,
    timestamp: now.slice(11, 16),
    createdAt: now,
    status: "active",
    governanceCategory: "governance_summary",
    replayTags: ["delivery-workspace", input.type.replaceAll("_", "-")],
  };
}
