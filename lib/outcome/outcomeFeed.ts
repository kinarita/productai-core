import type { OrganizationFeedItem } from "@/types/productai";
import type { OutcomeFeedEventType } from "@/types/productai";

export const outcomeFeedEventTypes: OutcomeFeedEventType[] = [
  "outcome_observation_started",
  "outcome_signal_recorded",
  "outcome_review_recorded",
  "outcome_followup_added",
  "outcome_snapshot",
];

const eventLabels: Record<OutcomeFeedEventType, string> = {
  outcome_observation_started: "Outcome observation started",
  outcome_signal_recorded: "Outcome signal recorded",
  outcome_review_recorded: "Outcome review recorded",
  outcome_followup_added: "Outcome follow-up added",
  outcome_snapshot: "Outcome snapshot",
};

export function outcomeFeedTypeLabel(type: OutcomeFeedEventType): string {
  return eventLabels[type] ?? type.replaceAll("_", " ");
}

export function createOutcomeFeedItem(input: {
  type: OutcomeFeedEventType;
  missionId: string;
  missionName: string;
  message: string;
}): OrganizationFeedItem {
  const now = new Date().toISOString();
  return {
    id: `feed-outcome-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
    replayTags: ["code-release-workspace", input.type.replaceAll("_", "-")],
  };
}
