import type { OrganizationFeedItem } from "@/types/productai";
import type { ProductBriefFeedEventType } from "@/types/productai";

export const productBriefFeedEventTypes: ProductBriefFeedEventType[] = [
  "product_brief_created",
  "product_brief_reviewed",
  "product_brief_changes_requested",
  "product_brief_approved",
  "director_handoff_ready",
  "product_brief_snapshot",
];

const eventLabels: Record<ProductBriefFeedEventType, string> = {
  product_brief_created: "Product Brief created",
  product_brief_reviewed: "Product Brief reviewed",
  product_brief_changes_requested: "Product Brief changes requested",
  product_brief_approved: "Product Brief approved",
  director_handoff_ready: "Director handoff ready",
  product_brief_snapshot: "Product Brief snapshot",
};

export function productBriefFeedTypeLabel(type: ProductBriefFeedEventType): string {
  return eventLabels[type] ?? type.replaceAll("_", " ");
}

export function createProductBriefFeedItem(input: {
  type: ProductBriefFeedEventType;
  missionId: string;
  missionName: string;
  message: string;
}): OrganizationFeedItem {
  const now = new Date().toISOString();
  return {
    id: `feed-pbrief-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
    replayTags: ["product-brief", input.type.replaceAll("_", "-")],
  };
}
