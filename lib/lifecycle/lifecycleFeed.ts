import type { OrganizationFeedItem } from "@/types/productai";
import type { LifecycleFeedEventType } from "@/types/productai";

export const lifecycleFeedEventTypes: LifecycleFeedEventType[] = [
  "lifecycle_stage_changed",
  "lifecycle_snapshot",
  "lifecycle_context_updated",
];

const eventLabels: Record<LifecycleFeedEventType, string> = {
  lifecycle_stage_changed: "Lifecycle stage changed",
  lifecycle_snapshot: "Lifecycle snapshot",
  lifecycle_context_updated: "Lifecycle context updated",
};

export function lifecycleFeedTypeLabel(type: LifecycleFeedEventType): string {
  return eventLabels[type] ?? type.replaceAll("_", " ");
}

export function createLifecycleFeedItem(input: {
  type: LifecycleFeedEventType;
  missionId: string;
  missionName: string;
  message: string;
}): OrganizationFeedItem {
  const now = new Date().toISOString();
  return {
    id: `feed-lifecycle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: input.type,
    author: "COO",
    authorName: "Nova",
    missionId: input.missionId,
    missionName: input.missionName,
    message: input.message,
    timestamp: now.slice(11, 16),
    createdAt: now,
    status: "active",
    governanceCategory: "governance_summary",
    replayTags: ["product-lifecycle", input.type.replaceAll("_", "-")],
  };
}
