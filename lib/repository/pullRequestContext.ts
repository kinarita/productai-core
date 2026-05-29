import type { PullRequest } from "@/types/productai";

export type PullRequestContextId =
  | "not_started"
  | "draft"
  | "ready_for_review"
  | "review_in_progress"
  | "review_completed"
  | "merged"
  | "closed";

export interface PullRequestContextRow {
  pullRequestId: string;
  number: number;
  title: string;
  branch: string;
  missionId: string;
  missionName: string;
  author: string;
  contextId: PullRequestContextId;
  contextLabel: string;
  reviews: number;
}

const contextLabels: Record<PullRequestContextId, string> = {
  not_started: "Not Started",
  draft: "Draft",
  ready_for_review: "Ready For Review",
  review_in_progress: "Review In Progress",
  review_completed: "Review Completed",
  merged: "Merged",
  closed: "Closed",
};

export function pullRequestContextLabel(id: PullRequestContextId): string {
  return contextLabels[id] ?? id;
}

export function inferPullRequestContext(pr: PullRequest): PullRequestContextId {
  if (pr.status === "draft") return "draft";
  if (pr.status === "merged") return "merged";
  if (pr.status === "open") {
    if (pr.reviews === 0) return "ready_for_review";
    if (pr.reviews >= 2) return "review_completed";
    return "review_in_progress";
  }
  return "closed";
}

export function buildPullRequestContextRows(
  pullRequests: PullRequest[],
  missionId?: string | null
): PullRequestContextRow[] {
  const filtered = missionId
    ? pullRequests.filter((pr) => pr.relatedMissionId === missionId)
    : pullRequests;

  return filtered.map((pr) => {
    const contextId = inferPullRequestContext(pr);
    return {
      pullRequestId: pr.id,
      number: pr.number,
      title: pr.title,
      branch: pr.branch,
      missionId: pr.relatedMissionId ?? "",
      missionName: pr.missionName ?? "—",
      author: pr.author,
      contextId,
      contextLabel: pullRequestContextLabel(contextId),
      reviews: pr.reviews,
    };
  });
}
