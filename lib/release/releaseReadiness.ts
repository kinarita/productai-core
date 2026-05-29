import type { Mission, Task, PullRequest, ReleaseItem } from "@/types/productai";
import { mapMissionToCooStage } from "@/lib/coo/cooMissionAnalysis";
import { getCooPipelineStage } from "@/lib/coo/cooWorkspace";
import { buildReviewStatusSummary } from "@/lib/delivery/reviewStatus";
import { buildRepositoryStatusSummary } from "@/lib/delivery/repositoryStatus";
import type { ReleaseReadinessLevelId } from "@/lib/release/releaseWorkspace";
import { releaseLevelLabel } from "@/lib/release/releaseWorkspace";
import { buildReleaseChecklist } from "@/lib/release/releaseChecklist";
import { detectReleaseRisks } from "@/lib/release/releaseRisks";

export interface MissionReleaseReadinessRow {
  missionId: string;
  missionName: string;
  currentStage: string;
  taskCompletion: string;
  reviewCompletion: string;
  repositoryStatus: string;
  qaStatus: string;
  documentationStatus: string;
  releaseReadiness: string;
  readinessLevel: ReleaseReadinessLevelId;
  readinessScore: number;
  updatedAt: string;
}

export function inferReadinessLevel(input: {
  mission: Mission;
  tasks: Task[];
  releases: ReleaseItem[];
  checklistCompleteCount: number;
  riskCount: number;
}): ReleaseReadinessLevelId {
  const production = input.releases.some(
    (r) => r.relatedMissionId === input.mission.id && r.state === "production"
  );
  if (production || input.mission.status === "completed") return "released";

  const candidate = input.releases.find(
    (r) =>
      r.relatedMissionId === input.mission.id &&
      (r.state === "candidate" || r.state === "staging")
  );

  if (candidate && input.checklistCompleteCount >= 5 && input.riskCount <= 1) {
    return "ready_for_release";
  }
  if (candidate || input.mission.progress >= 85) return "candidate";
  if (input.mission.progress >= 40 || input.checklistCompleteCount >= 3) return "preparing";
  return "not_ready";
}

export function buildMissionReleaseReadinessRow(input: {
  mission: Mission;
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
  riskCount?: number;
}): MissionReleaseReadinessRow {
  const missionTasks = input.tasks.filter((t) => t.missionId === input.mission.id);
  const review = buildReviewStatusSummary(missionTasks);
  const repository = buildRepositoryStatusSummary({
    mission: input.mission,
    tasks: missionTasks,
    pullRequests: input.pullRequests,
  });
  const checklist = buildReleaseChecklist({
    mission: input.mission,
    tasks: input.tasks,
    pullRequests: input.pullRequests,
    releases: input.releases,
  });
  const completeCount = checklist.filter((c) => c.status === "complete").length;

  const stage = mapMissionToCooStage(input.mission);
  const taskDone = missionTasks.filter((t) => t.status === "completed").length;
  const taskCompletion =
    missionTasks.length > 0
      ? `${taskDone}/${missionTasks.length} (${Math.round((taskDone / missionTasks.length) * 100)}%)`
      : "—";

  const reviewTotal = review.inReview + review.pendingReview + review.reviewCompleted;
  const reviewCompletion =
    reviewTotal > 0
      ? `${review.reviewCompleted}/${reviewTotal} completed`
      : "Not started";

  const qaTasks = missionTasks.filter((t) => t.assignedTo === "QA");
  const qaStatus =
    qaTasks.length === 0
      ? "No QA assigned"
      : qaTasks.every((t) => t.status === "completed")
        ? "QA complete"
        : "QA in progress";

  const documentationStatus = input.mission.architectureSummary?.trim()
    ? "Documentation available"
    : "Documentation partial";

  const readinessLevel = inferReadinessLevel({
    mission: input.mission,
    tasks: input.tasks,
    releases: input.releases,
    checklistCompleteCount: completeCount,
    riskCount: input.riskCount ?? 0,
  });

  const baseScore = input.mission.releaseReadiness?.score ?? input.mission.progress;
  const penalty = (input.riskCount ?? 0) * 6 + checklist.filter((c) => c.status === "missing").length * 5;
  const readinessScore = Math.max(0, Math.min(100, baseScore - penalty));

  let releaseReadinessText = releaseLevelLabel(readinessLevel);
  if (readinessLevel === "ready_for_release") {
    releaseReadinessText = "This mission appears ready for release review.";
  }

  return {
    missionId: input.mission.id,
    missionName: input.mission.name,
    currentStage: getCooPipelineStage(stage).title,
    taskCompletion,
    reviewCompletion,
    repositoryStatus: repository.missionStateLabel,
    qaStatus,
    documentationStatus,
    releaseReadiness: releaseReadinessText,
    readinessLevel,
    readinessScore,
    updatedAt: input.mission.updatedAt,
  };
}

export function buildMissionReleaseContext(input: {
  mission: Mission;
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
}) {
  const risks = detectReleaseRisks({
    missions: [input.mission],
    tasks: input.tasks,
    pullRequests: input.pullRequests,
    releases: input.releases,
    missionId: input.mission.id,
  });
  const row = buildMissionReleaseReadinessRow({ ...input, riskCount: risks.length });
  const checklist = buildReleaseChecklist(input);

  return {
    row,
    checklist,
    risks,
    advisoryNote:
      "Release readiness context supports executive review reading—not deploy or release execution.",
  };
}
