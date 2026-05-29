import type { Mission, Task, Branch, PullRequest, ReleaseItem } from "@/types/productai";
import {
  buildRepositoryBoard,
  buildBranchOverview,
  buildRepositoryOverviewSummary,
  detectRepositoryBottlenecks,
} from "@/lib/repository/repositoryAnalysis";
import { buildPullRequestContextRows } from "@/lib/repository/pullRequestContext";
import { buildReviewCoordinationSummary } from "@/lib/repository/reviewCoordination";
import { buildReleaseCoordinationView } from "@/lib/repository/releaseCoordination";

export function buildMissionRepositoryContext(input: {
  mission: Mission;
  tasks: Task[];
  branches: Branch[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
  commits: { branch: string; timestamp: string }[];
}) {
  const board = buildRepositoryBoard({
    missions: [input.mission],
    tasks: input.tasks,
    branches: input.branches,
    pullRequests: input.pullRequests,
    releases: input.releases,
  })[0];
  const branchRows = buildBranchOverview({
    branches: input.branches,
    tasks: input.tasks,
    commits: input.commits,
    missionId: input.mission.id,
  });
  const prRows = buildPullRequestContextRows(input.pullRequests, input.mission.id);
  const review = buildReviewCoordinationSummary({
    tasks: input.tasks,
    pullRequests: input.pullRequests,
    missionId: input.mission.id,
  });
  const release = buildReleaseCoordinationView({
    missions: [input.mission],
    tasks: input.tasks,
    releases: input.releases,
    missionId: input.mission.id,
  });

  return {
    board,
    branchRows,
    pullRequests: prRows,
    review,
    release,
    advisoryNote:
      "Mission repository context links tasks to branches and pull requests for coordination visibility only.",
  };
}

export {
  buildRepositoryBoard,
  buildBranchOverview,
  buildRepositoryOverviewSummary,
  detectRepositoryBottlenecks,
  buildPullRequestContextRows,
  buildReviewCoordinationSummary,
  buildReleaseCoordinationView,
};
