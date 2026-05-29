import type { Mission, Task, PullRequest } from "@/types/productai";

export type RepositoryStateId =
  | "no_repository"
  | "repository_planned"
  | "repository_linked"
  | "repository_ready";

export interface RepositoryStatusSummary {
  noRepository: number;
  repositoryPlanned: number;
  repositoryLinked: number;
  repositoryReady: number;
  missionState: RepositoryStateId;
  missionStateLabel: string;
  linkedBranches: string[];
  linkedPullRequests: string[];
}

export function inferRepositoryState(input: {
  task: Task;
  mission: Mission;
  pullRequests: PullRequest[];
}): RepositoryStateId {
  const { task, mission, pullRequests } = input;
  const hasBranches = mission.relatedBranches.length > 0;
  const missionPrs = pullRequests.filter((pr) => pr.relatedMissionId === mission.id);

  if (!hasBranches && missionPrs.length === 0) {
    return "no_repository";
  }

  if (task.status === "completed" && (hasBranches || missionPrs.length > 0)) {
    return "repository_ready";
  }

  if (hasBranches || missionPrs.length > 0) {
    if (task.status === "active" || task.status === "in_review") {
      return "repository_linked";
    }
    return "repository_planned";
  }

  return "repository_planned";
}

function repositoryStateLabel(state: RepositoryStateId): string {
  const labels: Record<RepositoryStateId, string> = {
    no_repository: "No Repository",
    repository_planned: "Repository Planned",
    repository_linked: "Repository Linked",
    repository_ready: "Repository Ready",
  };
  return labels[state];
}

export function buildRepositoryStatusSummary(input: {
  mission: Mission;
  tasks: Task[];
  pullRequests: PullRequest[];
}): RepositoryStatusSummary {
  const missionPrs = input.pullRequests.filter((pr) => pr.relatedMissionId === input.mission.id);
  const states = input.tasks.map((task) =>
    inferRepositoryState({ task, mission: input.mission, pullRequests: input.pullRequests })
  );

  let missionState: RepositoryStateId = "no_repository";
  if (input.mission.relatedBranches.length > 0 || missionPrs.length > 0) {
    if (states.some((s) => s === "repository_ready")) missionState = "repository_ready";
    else if (states.some((s) => s === "repository_linked")) missionState = "repository_linked";
    else missionState = "repository_planned";
  }

  return {
    noRepository: states.filter((s) => s === "no_repository").length,
    repositoryPlanned: states.filter((s) => s === "repository_planned").length,
    repositoryLinked: states.filter((s) => s === "repository_linked").length,
    repositoryReady: states.filter((s) => s === "repository_ready").length,
    missionState,
    missionStateLabel: repositoryStateLabel(missionState),
    linkedBranches: input.mission.relatedBranches,
    linkedPullRequests: missionPrs.map((pr) => `#${pr.number} ${pr.title}`),
  };
}
