import type { Task, PullRequest } from "@/types/productai";
import { inferPullRequestContext } from "@/lib/repository/pullRequestContext";

export interface ReviewCoordinationSummary {
  pendingReviews: number;
  activeReviews: number;
  completedReviews: number;
  blockedReviews: number;
  reviewNotes: number;
}

export function buildReviewCoordinationSummary(input: {
  tasks: Task[];
  pullRequests: PullRequest[];
  missionId?: string | null;
}): ReviewCoordinationSummary {
  const tasks = input.missionId
    ? input.tasks.filter((t) => t.missionId === input.missionId)
    : input.tasks;
  const prs = input.missionId
    ? input.pullRequests.filter((pr) => pr.relatedMissionId === input.missionId)
    : input.pullRequests;

  let pendingReviews = 0;
  let activeReviews = 0;
  let completedReviews = 0;
  let blockedReviews = 0;

  for (const pr of prs) {
    const ctx = inferPullRequestContext(pr);
    if (ctx === "ready_for_review") pendingReviews += 1;
    if (ctx === "review_in_progress") activeReviews += 1;
    if (ctx === "review_completed" || ctx === "merged") completedReviews += 1;
    if (ctx === "draft") pendingReviews += 1;
  }

  blockedReviews = tasks.filter((t) => t.status === "blocked").length;

  const reviewNotes = tasks.reduce((sum, t) => {
    return (
      sum +
      (t.events ?? []).filter(
        (e) => e.type === "note" || e.type === "revision_requested" || e.type === "moved_to_review"
      ).length
    );
  }, 0);

  return {
    pendingReviews,
    activeReviews,
    completedReviews,
    blockedReviews,
    reviewNotes,
  };
}
