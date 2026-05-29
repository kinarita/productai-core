import type { OrganizationFeedItem } from "@/types/productai";
import type { CooFeedEventType } from "@/types/productai";

export const cooFeedEventTypes: CooFeedEventType[] = [
  "coo_review_generated",
  "coo_bottleneck_observed",
  "coo_coordination_note",
  "coo_workflow_snapshot",
];

const eventLabels: Record<CooFeedEventType, string> = {
  coo_review_generated: "COO review generated",
  coo_bottleneck_observed: "COO bottleneck observed",
  coo_coordination_note: "COO coordination note",
  coo_workflow_snapshot: "COO workflow snapshot",
};

export function cooFeedTypeLabel(type: CooFeedEventType): string {
  return eventLabels[type] ?? type.replaceAll("_", " ");
}

export function createCooFeedItem(input: {
  type: CooFeedEventType;
  missionId: string;
  missionName: string;
  message: string;
}): OrganizationFeedItem {
  const now = new Date().toISOString();
  return {
    id: `feed-coo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
    replayTags: ["coo-workspace", input.type.replace("coo_", "")],
  };
}
