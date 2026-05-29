"use client";

import { useMemo } from "react";
import type { Mission, Task } from "@/types/productai";
import type { DirectorReviewScheduleState } from "@/lib/director/directorWorkspace";
import { buildDirectorWorkspaceData } from "@/lib/director/directorAnalysis";

export function useDirectorWorkspace(input: {
  missions: Mission[];
  tasks: Task[];
  briefId?: string | null;
  missionId?: string | null;
  reviewStateFilter?: DirectorReviewScheduleState | null;
}) {
  const { missions, tasks, briefId, missionId, reviewStateFilter } = input;

  return useMemo(
    () =>
      buildDirectorWorkspaceData({
        missions,
        tasks,
        briefId,
        missionId,
        reviewStateFilter,
      }),
    [briefId, missionId, missions, reviewStateFilter, tasks]
  );
}
