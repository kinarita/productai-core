import type { OrganizationFeedItem } from "@/types/productai";
import type { IdeaFeedEventType } from "@/types/productai";

export const ideaFeedEventTypes: IdeaFeedEventType[] = [
  "idea_captured",
  "idea_refined",
  "product_brief_drafted",
  "product_brief_review_requested",
  "product_brief_approved",
  "idea_snapshot",
];

const eventLabels: Record<IdeaFeedEventType, string> = {
  idea_captured: "Idea captured",
  idea_refined: "Idea refined",
  product_brief_drafted: "Product Brief drafted",
  product_brief_review_requested: "Product Brief review requested",
  product_brief_approved: "Product Brief approved",
  idea_snapshot: "Idea snapshot",
};

export function ideaFeedTypeLabel(type: IdeaFeedEventType): string {
  return eventLabels[type] ?? type.replaceAll("_", " ");
}

export function createIdeaFeedItem(input: {
  type: IdeaFeedEventType;
  missionId: string;
  missionName: string;
  message: string;
}): OrganizationFeedItem {
  const now = new Date().toISOString();
  return {
    id: `feed-idea-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
    replayTags: ["idea-workspace", input.type.replaceAll("_", "-")],
  };
}
