"use client";

import { useMemo } from "react";
import type { Mission, Task, Branch, PullRequest, ReleaseItem, Commit } from "@/types/productai";
import {
  buildRepositoryBoard,
  buildBranchOverview,
  buildRepositoryOverviewSummary,
  detectRepositoryBottlenecks,
  buildPullRequestContextRows,
  buildReviewCoordinationSummary,
  buildReleaseCoordinationView,
} from "@/lib/repository/repositoryCoordination";

export function useRepositoryWorkspace(input: {
  missions: Mission[];
  tasks: Task[];
  branches: Branch[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
  commits: Commit[];
  repositoryId?: string | null;
}) {
  const { missions, tasks, branches, pullRequests, releases, commits, repositoryId } = input;
  const missionId = repositoryId;

  const board = useMemo(
    () => buildRepositoryBoard({ missions, tasks, branches, pullRequests, releases }),
    [branches, missions, pullRequests, releases, tasks]
  );

  const branchOverview = useMemo(
    () => buildBranchOverview({ branches, tasks, commits, missionId }),
    [branches, commits, missionId, tasks]
  );

  const pullRequestRows = useMemo(
    () => buildPullRequestContextRows(pullRequests, missionId),
    [missionId, pullRequests]
  );

  const review = useMemo(
    () => buildReviewCoordinationSummary({ tasks, pullRequests, missionId }),
    [missionId, pullRequests, tasks]
  );

  const release = useMemo(
    () => buildReleaseCoordinationView({ missions, tasks, releases, missionId }),
    [missionId, missions, releases, tasks]
  );

  const overview = useMemo(
    () => buildRepositoryOverviewSummary({ missions, tasks, branches, pullRequests, releases }),
    [branches, missions, pullRequests, releases, tasks]
  );

  const bottlenecks = useMemo(
    () => detectRepositoryBottlenecks({ branches, pullRequests, releases, commits }),
    [branches, commits, pullRequests, releases]
  );

  return {
    board,
    branchOverview,
    pullRequestRows,
    review,
    release,
    overview,
    bottlenecks,
  };
}
