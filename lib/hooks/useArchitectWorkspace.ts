"use client";

import { useMemo } from "react";
import type { Mission, Task } from "@/types/productai";
import type { ArchitectureReviewStateId } from "@/lib/architect/architectWorkspace";
import { buildArchitectWorkspaceData } from "@/lib/architect/architectAnalysis";

export function useArchitectWorkspace(input: {
  missions: Mission[];
  tasks: Task[];
  missionId?: string | null;
  specificationId?: string | null;
  reviewStateFilter?: ArchitectureReviewStateId | null;
}) {
  const { missions, tasks, missionId, specificationId, reviewStateFilter } = input;

  return useMemo(
    () =>
      buildArchitectWorkspaceData({
        missions,
        tasks,
        missionId,
        specificationId,
        reviewStateFilter,
      }),
    [missionId, missions, reviewStateFilter, specificationId, tasks]
  );
}
