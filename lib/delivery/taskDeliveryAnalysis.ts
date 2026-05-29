import type { Mission, Task } from "@/types/productai";
import type { PullRequest, ReleaseItem } from "@/types/productai";
import { buildTaskPipeline } from "@/lib/delivery/deliveryPipeline";
import { buildReviewStatusSummary } from "@/lib/delivery/reviewStatus";
import { buildRepositoryStatusSummary } from "@/lib/delivery/repositoryStatus";
import { buildReleaseReadinessView } from "@/lib/delivery/releaseReadiness";

export interface DeliveryBottleneckObservation {
  id: string;
  missionId: string;
  missionName: string;
  taskId?: string;
  taskTitle?: string;
  category:
    | "review_stall"
    | "state_dwell"
    | "qa_wait"
    | "repository_ready_stall"
    | "release_ready_stall";
  label: string;
  detail: string;
}

export interface MissionDeliverySummary {
  missionId: string;
  missionName: string;
  taskCount: number;
  completedTasks: number;
  tasksInReview: number;
  potentialDeliveryRisks: string[];
  releaseReadinessLabel: string;
  releaseReadinessScore: number;
}

export interface DeliveryOverviewSummary {
  activeTasks: number;
  tasksInReview: number;
  releaseReadyMissions: number;
  potentialDeliveryRisks: number;
  advisoryNote: string;
}

function isStaleEta(eta: string): boolean {
  return eta === "—" || /day|week/.test(eta.toLowerCase());
}

export function detectDeliveryBottlenecks(input: {
  tasks: Task[];
  missions: Mission[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
}): DeliveryBottleneckObservation[] {
  const observations: DeliveryBottleneckObservation[] = [];
  const pipeline = buildTaskPipeline(input);

  const inReview = input.tasks.filter((t) => t.status === "in_review");
  if (inReview.length >= 2) {
    observations.push({
      id: "db-review-stall",
      missionId: inReview[0].missionId,
      missionName: inReview[0].missionName,
      category: "review_stall",
      label: "Review suggested",
      detail:
        "Several tasks remain in review and may benefit from additional coordination.",
    });
  }

  for (const task of input.tasks.filter((t) => t.status !== "completed")) {
    if (isStaleEta(task.eta) && task.status === "blocked") {
      observations.push({
        id: `db-dwell-${task.id}`,
        missionId: task.missionId,
        missionName: task.missionName,
        taskId: task.id,
        taskTitle: task.title,
        category: "state_dwell",
        label: "Potential delivery bottleneck",
        detail: `${task.title} has remained in ${task.status.replaceAll("_", " ")} (${task.eta}). Review suggested for continuity.`,
      });
    }
  }

  const qaTasks = input.tasks.filter(
    (t) => t.assignedTo === "QA" && t.status !== "completed"
  );
  if (qaTasks.length >= 2) {
    observations.push({
      id: "db-qa-wait",
      missionId: qaTasks[0].missionId,
      missionName: qaTasks[0].missionName,
      category: "qa_wait",
      label: "Review suggested",
      detail: "QA review tasks are concentrated. Coordination visibility may help delivery continuity.",
    });
  }

  const repoReadyRows = pipeline.filter((r) => r.deliveryStage === "repository_ready");
  if (repoReadyRows.length >= 2) {
    observations.push({
      id: "db-repo-stall",
      missionId: repoReadyRows[0].missionId,
      missionName: repoReadyRows[0].missionName,
      category: "repository_ready_stall",
      label: "Potential delivery bottleneck",
      detail: "Multiple tasks are repository-ready with release coordination still pending.",
    });
  }

  const releaseReadyMissions = input.missions.filter((m) => {
    const release = input.releases.find(
      (r) => r.relatedMissionId === m.id && (r.state === "candidate" || r.state === "staging")
    );
    return release && m.progress < 100;
  });
  for (const mission of releaseReadyMissions.slice(0, 2)) {
    observations.push({
      id: `db-release-${mission.id}`,
      missionId: mission.id,
      missionName: mission.name,
      category: "release_ready_stall",
      label: "Review suggested",
      detail: `${mission.name} has release candidate activity with open delivery items. Release readiness review suggested.`,
    });
  }

  return observations.slice(0, 10);
}

export function buildMissionDeliverySummary(input: {
  mission: Mission;
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
}): MissionDeliverySummary {
  const missionTasks = input.tasks.filter((t) => t.missionId === input.mission.id);
  const risks: string[] = [];

  if (missionTasks.some((t) => t.status === "blocked")) {
    risks.push("Blocked tasks may affect delivery continuity");
  }
  if (missionTasks.filter((t) => t.status === "in_review").length > 0) {
    risks.push("Tasks in review require coordination reading");
  }
  if (input.mission.blockers.length > 0) {
    risks.push(`Mission blockers: ${input.mission.blockers.slice(0, 2).join("; ")}`);
  }

  const releaseView = buildReleaseReadinessView({
    mission: input.mission,
    tasks: missionTasks,
    releases: input.releases,
  });

  return {
    missionId: input.mission.id,
    missionName: input.mission.name,
    taskCount: missionTasks.length,
    completedTasks: missionTasks.filter((t) => t.status === "completed").length,
    tasksInReview: missionTasks.filter((t) => t.status === "in_review").length,
    potentialDeliveryRisks: risks,
    releaseReadinessLabel: releaseView.readinessSummary,
    releaseReadinessScore: releaseView.readinessScore,
  };
}

export function buildDeliveryOverviewSummary(input: {
  tasks: Task[];
  missions: Mission[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
}): DeliveryOverviewSummary {
  const bottlenecks = detectDeliveryBottlenecks(input);
  const activeTasks = input.tasks.filter((t) => t.status === "active" || t.status === "in_review").length;
  const tasksInReview = input.tasks.filter((t) => t.status === "in_review").length;
  const releaseReadyMissions = input.missions.filter((m) => {
    const release = input.releases.find(
      (r) => r.relatedMissionId === m.id && (r.state === "candidate" || r.state === "staging")
    );
    return Boolean(release);
  }).length;

  return {
    activeTasks,
    tasksInReview,
    releaseReadyMissions,
    potentialDeliveryRisks: bottlenecks.length,
    advisoryNote:
      "The delivery workspace provides visibility into task progress and review continuity.",
  };
}

export function buildMissionDeliveryContext(input: {
  mission: Mission;
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
}) {
  const missionTasks = input.tasks.filter((t) => t.missionId === input.mission.id);
  const review = buildReviewStatusSummary(missionTasks);
  const repository = buildRepositoryStatusSummary({
    mission: input.mission,
    tasks: missionTasks,
    pullRequests: input.pullRequests,
  });
  const release = buildReleaseReadinessView({
    mission: input.mission,
    tasks: missionTasks,
    releases: input.releases,
  });
  const summary = buildMissionDeliverySummary(input);

  const taskDistribution = [
    { label: "Active", count: missionTasks.filter((t) => t.status === "active").length },
    { label: "In Review", count: missionTasks.filter((t) => t.status === "in_review").length },
    { label: "Blocked", count: missionTasks.filter((t) => t.status === "blocked").length },
    { label: "Completed", count: missionTasks.filter((t) => t.status === "completed").length },
  ];

  return {
    taskDistribution,
    review,
    repository,
    release,
    summary,
    advisoryNote:
      "Mission delivery context supports coordination visibility—not automatic task routing or prioritization.",
  };
}
