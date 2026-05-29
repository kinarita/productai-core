"use client";

import { useMemo } from "react";
import type { Mission, Task } from "@/types/productai";
import type { DevelopmentReadinessStateId } from "@/lib/developer/developerWorkspace";
import { buildDeveloperWorkspaceData } from "@/lib/developer/developerAnalysis";

export function useDeveloperWorkspace(input: {
  missions: Mission[];
  tasks: Task[];
  missionId?: string | null;
  implementationPlanId?: string | null;
  reviewStateFilter?: DevelopmentReadinessStateId | null;
}) {
  const { missions, tasks, missionId, implementationPlanId, reviewStateFilter } = input;

  return useMemo(
    () =>
      buildDeveloperWorkspaceData({
        missions,
        tasks,
        missionId,
        implementationPlanId,
        reviewStateFilter,
      }),
    [implementationPlanId, missionId, missions, reviewStateFilter, tasks]
  );
}
