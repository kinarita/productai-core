import type { OrganizationFeedItem } from "@/types/productai";
import type { ReleaseFeedEventType } from "@/types/productai";

export const releaseFeedEventTypes: ReleaseFeedEventType[] = [
  "release_checklist_updated",
  "release_risk_observed",
  "release_ready",
  "release_snapshot",
];

const eventLabels: Record<ReleaseFeedEventType, string> = {
  release_checklist_updated: "Release checklist updated",
  release_risk_observed: "Release risk observed",
  release_ready: "Release ready",
  release_snapshot: "Release snapshot",
};

export function releaseFeedTypeLabel(type: ReleaseFeedEventType): string {
  return eventLabels[type] ?? type.replaceAll("_", " ");
}

export function createReleaseFeedItem(input: {
  type: ReleaseFeedEventType;
  missionId: string;
  missionName: string;
  message: string;
}): OrganizationFeedItem {
  const now = new Date().toISOString();
  return {
    id: `feed-release-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
    replayTags: ["release-workspace", input.type.replaceAll("_", "-")],
  };
}
