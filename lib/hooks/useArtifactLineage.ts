"use client";

import { useMemo } from "react";
import type { Mission, OrganizationFeedItem, Task } from "@/types/productai";
import { buildArtifactLineageWorkspaceData } from "@/lib/lineage/artifactLineageAnalysis";

export function useArtifactLineage(input: {
  missions: Mission[];
  tasks: Task[];
  feedItems: OrganizationFeedItem[];
  missionId?: string | null;
  artifactId?: string | null;
}) {
  const { missions, tasks, feedItems, missionId, artifactId } = input;

  return useMemo(
    () =>
      buildArtifactLineageWorkspaceData({
        missions,
        tasks,
        feedItems,
        missionId,
        artifactId,
      }),
    [missions, tasks, feedItems, missionId, artifactId]
  );
}
