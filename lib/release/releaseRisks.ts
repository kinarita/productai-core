import type { Mission, Task, PullRequest, ReleaseItem } from "@/types/productai";
import { buildReviewStatusSummary } from "@/lib/delivery/reviewStatus";
import { buildRepositoryStatusSummary } from "@/lib/delivery/repositoryStatus";

export type ReleaseRiskCategory =
  | "missing_qa"
  | "missing_documentation"
  | "pending_reviews"
  | "blocked_tasks"
  | "repository_issues"
  | "multiple_review_pending";

export interface ReleaseRiskObservation {
  id: string;
  missionId: string;
  missionName: string;
  category: ReleaseRiskCategory;
  label: string;
  detail: string;
}

export function detectReleaseRisks(input: {
  missions: Mission[];
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
  missionId?: string | null;
}): ReleaseRiskObservation[] {
  const missions = input.missionId
    ? input.missions.filter((m) => m.id === input.missionId)
    : input.missions.filter((m) => m.status !== "completed");

  const risks: ReleaseRiskObservation[] = [];

  for (const mission of missions) {
    const missionTasks = input.tasks.filter((t) => t.missionId === mission.id);
    const missionPrs = input.pullRequests.filter((pr) => pr.relatedMissionId === mission.id);
    const review = buildReviewStatusSummary(missionTasks);
    const repository = buildRepositoryStatusSummary({
      mission,
      tasks: missionTasks,
      pullRequests: input.pullRequests,
    });

    const qaTasks = missionTasks.filter((t) => t.assignedTo === "QA");
    if (qaTasks.length === 0 || qaTasks.some((t) => t.status !== "completed")) {
      risks.push({
        id: `rr-qa-${mission.id}`,
        missionId: mission.id,
        missionName: mission.name,
        category: "missing_qa",
        label: "Release risk observed",
        detail: "Missing QA or incomplete QA tasks may affect release confidence.",
      });
    }

    if (!mission.architectureSummary?.trim()) {
      risks.push({
        id: `rr-doc-${mission.id}`,
        missionId: mission.id,
        missionName: mission.name,
        category: "missing_documentation",
        label: "Review suggested",
        detail: "Additional documentation review may improve release confidence.",
      });
    }

    if (review.inReview > 0 || review.pendingReview > 0) {
      risks.push({
        id: `rr-pending-${mission.id}`,
        missionId: mission.id,
        missionName: mission.name,
        category: "pending_reviews",
        label: "Review suggested",
        detail: `${review.inReview + review.pendingReview} review item(s) pending for ${mission.name}.`,
      });
    }

    const blocked = missionTasks.filter((t) => t.status === "blocked");
    if (blocked.length > 0) {
      risks.push({
        id: `rr-blocked-${mission.id}`,
        missionId: mission.id,
        missionName: mission.name,
        category: "blocked_tasks",
        label: "Release risk observed",
        detail: `${blocked.length} blocked task(s) on ${mission.name}.`,
      });
    }

    if (repository.missionState === "no_repository" && mission.relatedBranches.length === 0) {
      risks.push({
        id: `rr-repo-${mission.id}`,
        missionId: mission.id,
        missionName: mission.name,
        category: "repository_issues",
        label: "Review suggested",
        detail: "Repository context is not yet linked for this mission.",
      });
    }

    const openPrReviews = missionPrs.filter((pr) => pr.status === "open" && pr.reviews > 0);
    if (openPrReviews.length >= 2) {
      risks.push({
        id: `rr-multi-review-${mission.id}`,
        missionId: mission.id,
        missionName: mission.name,
        category: "multiple_review_pending",
        label: "Review suggested",
        detail: "Several pull requests remain in review and may benefit from additional coordination.",
      });
    }
  }

  return risks.slice(0, 12);
}
