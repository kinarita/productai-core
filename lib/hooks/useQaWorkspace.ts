"use client";

import { useMemo } from "react";
import type { Mission, PullRequest, ReleaseItem, Task } from "@/types/productai";
import type { QaReviewStateId } from "@/lib/qa/qaWorkspace";
import { buildQaWorkspaceData } from "@/lib/qa/qaAnalysis";

export function useQaWorkspace(input: {
  missions: Mission[];
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
  missionId?: string | null;
  testPlanId?: string | null;
  reviewStateFilter?: QaReviewStateId | null;
}) {
  const { missions, tasks, pullRequests, releases, missionId, testPlanId, reviewStateFilter } =
    input;

  return useMemo(
    () =>
      buildQaWorkspaceData({
        missions,
        tasks,
        pullRequests,
        releases,
        missionId,
        testPlanId,
        reviewStateFilter,
      }),
    [missions, tasks, pullRequests, releases, missionId, testPlanId, reviewStateFilter]
  );
}

