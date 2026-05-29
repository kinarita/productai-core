import type { Mission, Task, PullRequest, ReleaseItem } from "@/types/productai";
import { buildReviewStatusSummary } from "@/lib/delivery/reviewStatus";
import { buildRepositoryStatusSummary } from "@/lib/delivery/repositoryStatus";

export type ChecklistItemStatus = "complete" | "partial" | "missing";

export type ReleaseChecklistItemId =
  | "architecture_review"
  | "design_review"
  | "development_complete"
  | "qa_complete"
  | "documentation_complete"
  | "repository_ready"
  | "review_complete";

export interface ReleaseChecklistItem {
  id: ReleaseChecklistItemId;
  label: string;
  status: ChecklistItemStatus;
  detail: string;
}

const checklistLabels: Record<ReleaseChecklistItemId, string> = {
  architecture_review: "Architecture Review",
  design_review: "Design Review",
  development_complete: "Development Complete",
  qa_complete: "QA Complete",
  documentation_complete: "Documentation Complete",
  repository_ready: "Repository Ready",
  review_complete: "Review Complete",
};

export function buildReleaseChecklist(input: {
  mission: Mission;
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
}): ReleaseChecklistItem[] {
  const missionTasks = input.tasks.filter((t) => t.missionId === input.mission.id);
  const review = buildReviewStatusSummary(missionTasks);
  const repository = buildRepositoryStatusSummary({
    mission: input.mission,
    tasks: missionTasks,
    pullRequests: input.pullRequests,
  });

  const archComplete = Boolean(input.mission.architectureSummary?.trim());
  const archStatus: ChecklistItemStatus = archComplete
    ? "complete"
    : input.mission.lifecycle === "Architecture" || input.mission.progress > 30
      ? "partial"
      : "missing";

  const designStatus: ChecklistItemStatus =
    input.mission.lifecycle === "UI/UX" || input.mission.lifecycle === "Review"
      ? "partial"
      : input.mission.progress > 50
        ? "complete"
        : "missing";

  const devTasks = missionTasks.filter((t) => t.assignedTo === "Engineer");
  const devComplete =
    devTasks.length === 0
      ? missionTasks.every((t) => t.status === "completed" || t.progress >= 90)
      : devTasks.every((t) => t.status === "completed");
  const devPartial = devTasks.some((t) => t.status === "completed" || t.progress > 50);
  const developmentStatus: ChecklistItemStatus = devComplete
    ? "complete"
    : devPartial
      ? "partial"
      : "missing";

  const qaTasks = missionTasks.filter((t) => t.assignedTo === "QA");
  const qaStatus: ChecklistItemStatus =
    qaTasks.length === 0
      ? "missing"
      : qaTasks.every((t) => t.status === "completed")
        ? "complete"
        : qaTasks.some((t) => t.status === "completed" || t.status === "in_review")
          ? "partial"
          : "missing";

  const docStatus: ChecklistItemStatus = archComplete
    ? "complete"
    : input.mission.requirementsSummary?.trim()
      ? "partial"
      : "missing";

  const repoStatus: ChecklistItemStatus =
    repository.missionState === "repository_ready"
      ? "complete"
      : repository.missionState === "repository_linked" || repository.missionState === "repository_planned"
        ? "partial"
        : "missing";

  const reviewStatus: ChecklistItemStatus =
    review.inReview === 0 && review.reviewBlocked === 0 && review.reviewCompleted > 0
      ? "complete"
      : review.inReview > 0 || review.pendingReview > 0
        ? "partial"
        : "missing";

  return (
    [
      { id: "architecture_review" as const, status: archStatus, detail: archComplete ? "Architecture summary available" : "Additional architecture review may help" },
      { id: "design_review" as const, status: designStatus, detail: `Lifecycle: ${input.mission.lifecycle}` },
      { id: "development_complete" as const, status: developmentStatus, detail: `${missionTasks.filter((t) => t.status === "completed").length}/${missionTasks.length} tasks completed` },
      { id: "qa_complete" as const, status: qaStatus, detail: qaTasks.length > 0 ? `${qaTasks.filter((t) => t.status === "completed").length}/${qaTasks.length} QA tasks done` : "No QA tasks assigned" },
      { id: "documentation_complete" as const, status: docStatus, detail: archComplete ? "Documentation available" : "Additional documentation review may improve release confidence." },
      { id: "repository_ready" as const, status: repoStatus, detail: repository.missionStateLabel },
      { id: "review_complete" as const, status: reviewStatus, detail: `${review.inReview} in review · ${review.reviewCompleted} completed` },
    ] as Omit<ReleaseChecklistItem, "label">[]
  ).map((item) => ({
    ...item,
    label: checklistLabels[item.id],
  }));
}
