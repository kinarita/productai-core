import type { OrganizationFeedItem } from "@/types/productai";
import type { RepositoryFeedEventType } from "@/types/productai";

export const repositoryFeedEventTypes: RepositoryFeedEventType[] = [
  "repository_created",
  "branch_created",
  "pull_request_opened",
  "review_requested",
  "review_completed",
  "release_candidate_created",
  "repository_snapshot",
];

const eventLabels: Record<RepositoryFeedEventType, string> = {
  repository_created: "Repository created",
  branch_created: "Branch created",
  pull_request_opened: "Pull request opened",
  review_requested: "Review requested",
  review_completed: "Review completed",
  release_candidate_created: "Release candidate created",
  repository_snapshot: "Repository snapshot",
};

export function repositoryFeedTypeLabel(type: RepositoryFeedEventType): string {
  return eventLabels[type] ?? type.replaceAll("_", " ");
}

export function createRepositoryFeedItem(input: {
  type: RepositoryFeedEventType;
  missionId: string;
  missionName: string;
  message: string;
  taskId?: string;
}): OrganizationFeedItem {
  const now = new Date().toISOString();
  return {
    id: `feed-repo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
    replayTags: ["repository-workspace", input.type.replaceAll("_", "-")],
  };
}
