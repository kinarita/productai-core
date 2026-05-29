import type { Mission, Task } from "@/types/productai";
import type { PullRequest, ReleaseItem } from "@/types/productai";
import type { DeliveryPipelineStageId } from "@/lib/delivery/deliveryWorkspace";
import { deliveryStageLabel } from "@/lib/delivery/deliveryWorkspace";
import { inferReviewState } from "@/lib/delivery/reviewStatus";
import { inferRepositoryState } from "@/lib/delivery/repositoryStatus";

export interface TaskPipelineRow {
  taskId: string;
  taskTitle: string;
  missionId: string;
  missionName: string;
  assignedRole: string;
  status: string;
  reviewState: string;
  repositoryState: string;
  deliveryStage: DeliveryPipelineStageId;
  deliveryStageLabel: string;
  updatedAt: string;
  progress: number;
}

export function inferDeliveryStage(input: {
  task: Task;
  mission: Mission;
  releases: ReleaseItem[];
}): DeliveryPipelineStageId {
  const { task, mission, releases } = input;
  const missionRelease = releases.find((r) => r.relatedMissionId === mission.id);
  const hasProductionRelease = releases.some(
    (r) => r.relatedMissionId === mission.id && r.state === "production"
  );

  if (task.status === "completed") {
    if (hasProductionRelease) return "released";
    if (missionRelease && (missionRelease.state === "candidate" || missionRelease.state === "staging")) {
      return "release_ready";
    }
    if (mission.relatedBranches.length > 0 || mission.relatedPullRequests.length > 0) {
      return "repository_ready";
    }
    return "repository_ready";
  }

  if (task.status === "in_review") return "review";

  if (task.status === "blocked" || task.progress < 15) return "task_planning";

  if (task.status === "active" && task.progress <= 10) return "ready";

  return "in_progress";
}

export function buildTaskPipeline(input: {
  tasks: Task[];
  missions: Mission[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
  missionId?: string | null;
}): TaskPipelineRow[] {
  const missionMap = new Map(input.missions.map((m) => [m.id, m]));
  const filtered = input.missionId
    ? input.tasks.filter((t) => t.missionId === input.missionId)
    : input.tasks;

  return filtered
    .filter((t) => t.status !== "completed" || input.missionId)
    .map((task) => {
      const mission = missionMap.get(task.missionId);
      const deliveryStage = mission
        ? inferDeliveryStage({ task, mission, releases: input.releases })
        : ("in_progress" as DeliveryPipelineStageId);
      const review = inferReviewState(task);
      const repository = mission
        ? inferRepositoryState({ task, mission, pullRequests: input.pullRequests })
        : "no_repository";

      return {
        taskId: task.id,
        taskTitle: task.title,
        missionId: task.missionId,
        missionName: task.missionName,
        assignedRole: task.assignedTo.replaceAll("_", " "),
        status: task.status.replaceAll("_", " "),
        reviewState: review.label,
        repositoryState: repository.replaceAll("_", " "),
        deliveryStage,
        deliveryStageLabel: deliveryStageLabel(deliveryStage),
        updatedAt: task.updatedAt ?? task.eta,
        progress: task.progress,
      };
    })
    .sort((a, b) => {
      const stageOrder: DeliveryPipelineStageId[] = [
        "review",
        "in_progress",
        "ready",
        "task_planning",
        "repository_ready",
        "release_ready",
        "released",
      ];
      return stageOrder.indexOf(a.deliveryStage) - stageOrder.indexOf(b.deliveryStage);
    });
}

export function buildDeliveryStageCounts(rows: TaskPipelineRow[]) {
  const counts = new Map<DeliveryPipelineStageId, number>();
  for (const row of rows) {
    counts.set(row.deliveryStage, (counts.get(row.deliveryStage) ?? 0) + 1);
  }
  return counts;
}
