import type { OrganizationFeedItem } from "@/types/productai";
import type { HandoffFeedEventType } from "@/types/productai";

export const handoffFeedEventTypes: HandoffFeedEventType[] = [
  "artifact_created",
  "artifact_review_requested",
  "artifact_approved",
  "artifact_returned",
  "artifact_handed_off",
  "workflow_snapshot",
];

const eventLabels: Record<HandoffFeedEventType, string> = {
  artifact_created: "Artifact created",
  artifact_review_requested: "Artifact review requested",
  artifact_approved: "Artifact approved",
  artifact_returned: "Artifact returned",
  artifact_handed_off: "Artifact handed off",
  workflow_snapshot: "Workflow snapshot",
};

export function handoffFeedTypeLabel(type: HandoffFeedEventType): string {
  return eventLabels[type] ?? type.replaceAll("_", " ");
}

export function createHandoffFeedItem(input: {
  type: HandoffFeedEventType;
  missionId: string;
  missionName: string;
  message: string;
}): OrganizationFeedItem {
  const now = new Date().toISOString();
  return {
    id: `feed-handoff-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
    replayTags: ["team-handoff", input.type.replaceAll("_", "-")],
  };
}
