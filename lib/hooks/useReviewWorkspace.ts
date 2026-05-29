"use client";

import { useMemo } from "react";
import type { Mission, Task } from "@/types/productai";
import type { ReviewStateId } from "@/lib/review/reviewStatus";
import {
  buildReviewWorkspaceData,
  buildCeoReviewSummary,
  buildCooReviewCoordination,
  buildMissionReviewContext,
  getLifecycleReviewSummaryForMission,
} from "@/lib/review/reviewAnalysis";

export function useReviewWorkspace(input: {
  missions: Mission[];
  tasks: Task[];
  missionId?: string | null;
  reviewStateFilter?: ReviewStateId | null;
  artifactId?: string | null;
}) {
  const { missions, tasks, missionId, reviewStateFilter, artifactId } = input;

  const workspace = useMemo(
    () =>
      buildReviewWorkspaceData({
        missions,
        tasks,
        missionId,
        reviewStateFilter,
        artifactId,
      }),
    [artifactId, missionId, missions, reviewStateFilter, tasks]
  );

  const ceoSummary = useMemo(
    () => buildCeoReviewSummary({ missions, tasks }),
    [missions, tasks]
  );

  const cooCoordination = useMemo(
    () => buildCooReviewCoordination({ missions, tasks }),
    [missions, tasks]
  );

  const missionContext = useMemo(() => {
    if (!missionId) return null;
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return null;
    return buildMissionReviewContext({ mission, tasks });
  }, [missionId, missions, tasks]);

  const lifecycleReview = useMemo(() => {
    if (!missionId) return null;
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return null;
    return getLifecycleReviewSummaryForMission({ mission, tasks });
  }, [missionId, missions, tasks]);

  return {
    ...workspace,
    ceoSummary,
    cooCoordination,
    missionContext,
    lifecycleReview,
  };
}
