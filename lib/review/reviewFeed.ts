import type { OrganizationFeedItem } from "@/types/productai";
import type { ReviewFeedEventType } from "@/types/productai";

export const reviewFeedEventTypes: ReviewFeedEventType[] = [
  "artifact_comment_added",
  "artifact_changes_requested",
  "artifact_review_snapshot",
];

const eventLabels: Record<ReviewFeedEventType, string> = {
  artifact_comment_added: "Artifact comment added",
  artifact_changes_requested: "Artifact changes requested",
  artifact_review_snapshot: "Artifact review snapshot",
};

export function reviewFeedTypeLabel(type: ReviewFeedEventType): string {
  return eventLabels[type] ?? type.replaceAll("_", " ");
}

export function createReviewFeedItem(input: {
  type: ReviewFeedEventType;
  missionId: string;
  missionName: string;
  message: string;
}): OrganizationFeedItem {
  const now = new Date().toISOString();
  return {
    id: `feed-review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
    replayTags: ["artifact-review", input.type.replaceAll("_", "-")],
  };
}
