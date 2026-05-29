import type { OrganizationFeedItem } from "@/types/productai";
import type { MissionTeamFeedEventType } from "@/types/productai";

export const missionTeamFeedEventTypes: MissionTeamFeedEventType[] = [
  "planning_started",
  "planning_completed",
  "direction_started",
  "direction_completed",
  "architecture_started",
  "architecture_completed",
  "design_started",
  "design_completed",
  "development_started",
  "development_completed",
  "qa_started",
  "qa_completed",
];

const eventLabels: Record<MissionTeamFeedEventType, string> = {
  planning_started: "Planning started",
  planning_completed: "Planning completed",
  direction_started: "Direction started",
  direction_completed: "Direction completed",
  architecture_started: "Architecture started",
  architecture_completed: "Architecture completed",
  design_started: "Design started",
  design_completed: "Design completed",
  development_started: "Development started",
  development_completed: "Development completed",
  qa_started: "QA started",
  qa_completed: "QA completed",
};

export function missionTeamFeedTypeLabel(type: MissionTeamFeedEventType): string {
  return eventLabels[type] ?? type.replaceAll("_", " ");
}

export function createMissionTeamFeedItem(input: {
  type: MissionTeamFeedEventType;
  missionId: string;
  missionName: string;
  message: string;
  authorName?: string;
}): OrganizationFeedItem {
  const now = new Date().toISOString();
  return {
    id: `feed-mission-team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: input.type,
    author: "COO",
    authorName: input.authorName ?? "Nova",
    missionId: input.missionId,
    missionName: input.missionName,
    message: input.message,
    timestamp: now.slice(11, 16),
    createdAt: now,
    status: "active",
    governanceCategory: "governance_summary",
    replayTags: ["mission-team", input.type.replace(/_(started|completed)$/, "")],
  };
}

export function isMissionTeamFeedType(type: string): type is MissionTeamFeedEventType {
  return missionTeamFeedEventTypes.includes(type as MissionTeamFeedEventType);
}
