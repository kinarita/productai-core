import type { Mission, Task, ReleaseItem } from "@/types/productai";
import { buildReviewStatusSummary } from "@/lib/delivery/reviewStatus";

export interface ReleaseReadinessView {
  releaseBlockers: string[];
  qaStatus: string;
  documentationStatus: string;
  reviewStatus: string;
  readinessSummary: string;
  readinessScore: number;
}

export function buildReleaseReadinessView(input: {
  mission: Mission;
  tasks: Task[];
  releases: ReleaseItem[];
}): ReleaseReadinessView {
  const release = input.releases.find((r) => r.relatedMissionId === input.mission.id);
  const review = buildReviewStatusSummary(input.tasks);
  const blockers = [...input.mission.blockers];

  if (input.tasks.some((t) => t.status === "blocked")) {
    blockers.push("Blocked tasks remain open");
  }
  if (review.inReview > 0) {
    blockers.push(`${review.inReview} task(s) still in review`);
  }

  const qaTasks = input.tasks.filter((t) => t.assignedTo === "QA");
  const qaIncomplete = qaTasks.some((t) => t.status !== "completed");
  const qaStatus = qaIncomplete
    ? "QA review in progress or pending"
    : qaTasks.length > 0
      ? "QA review completed"
      : "No QA tasks assigned";

  const hasArchDoc = Boolean(input.mission.architectureSummary?.trim());
  const documentationStatus = hasArchDoc
    ? "Architecture documentation available"
    : "Documentation may benefit from additional review";

  const reviewStatus =
    review.inReview > 0
      ? `${review.inReview} in review, ${review.pendingReview} pending`
      : review.reviewCompleted > 0
        ? `${review.reviewCompleted} review completed`
        : "Review not yet started";

  const baseScore = input.mission.releaseReadiness?.score ?? input.mission.progress;
  const penalty = blockers.length * 8 + review.inReview * 5;
  const readinessScore = Math.max(0, Math.min(100, baseScore - penalty));

  let readinessSummary = input.mission.releaseReadiness?.label ?? "Coordination reading suggested";
  if (release?.state === "candidate") readinessSummary = "Release candidate — readiness review suggested";
  if (release?.state === "staging") readinessSummary = "Staging release — final review reading suggested";
  if (release?.state === "production") readinessSummary = "Released to production";

  return {
    releaseBlockers: blockers.slice(0, 5),
    qaStatus,
    documentationStatus,
    reviewStatus,
    readinessSummary,
    readinessScore,
  };
}
