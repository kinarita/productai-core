"use client";

import { useMemo } from "react";
import type { Mission, OrganizationFeedItem, Task } from "@/types/productai";
import type { HandoffRoleId } from "@/lib/handoff/handoffWorkflow";
import type { ReviewStateId } from "@/lib/review/reviewStatus";
import type { ReviewTargetTypeId } from "@/lib/review/artifactReview";
import {
  buildCrossReviewWorkspaceData,
  buildCeoCrossReviewSummary,
  buildMissionCrossReviewContext,
} from "@/lib/cross-review/crossRoleReviewAnalysis";

export function useCrossReviewWorkspace(input: {
  missions: Mission[];
  tasks: Task[];
  feedItems: OrganizationFeedItem[];
  missionId?: string | null;
  artifactId?: string | null;
  reviewId?: string | null;
  roleFilter?: HandoffRoleId | null;
  stateFilter?: ReviewStateId | null;
  artifactTypeFilter?: ReviewTargetTypeId | null;
}) {
  const {
    missions,
    tasks,
    feedItems,
    missionId,
    artifactId,
    reviewId,
    roleFilter,
    stateFilter,
    artifactTypeFilter,
  } = input;

  const workspace = useMemo(
    () =>
      buildCrossReviewWorkspaceData({
        missions,
        tasks,
        feedItems,
        missionId,
        artifactId,
        reviewId,
        roleFilter,
        stateFilter,
        artifactTypeFilter,
      }),
    [
      missions,
      tasks,
      feedItems,
      missionId,
      artifactId,
      reviewId,
      roleFilter,
      stateFilter,
      artifactTypeFilter,
    ]
  );

  const ceoSummary = useMemo(
    () => buildCeoCrossReviewSummary({ missions: input.missions, tasks: input.tasks }),
    [input.missions, input.tasks]
  );

  const missionContext = useMemo(() => {
    if (!input.missionId) return null;
    const mission = input.missions.find((m) => m.id === input.missionId);
    if (!mission) return null;
    return buildMissionCrossReviewContext({ mission, tasks: input.tasks });
  }, [input.missionId, input.missions, input.tasks]);

  return {
    ...workspace,
    ceoSummary,
    missionContext,
  };
}
