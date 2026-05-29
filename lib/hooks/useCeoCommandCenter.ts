"use client";

import { useMemo } from "react";
import type {
  Mission,
  OrganizationFeedItem,
  ReleaseItem,
  Task,
  PullRequest,
  MemoryItem,
} from "@/types/productai";
import type { CeoAttentionFilterId } from "@/lib/ceo-command/ceoCommandCenterWorkspace";
import { buildCeoCommandCenterData } from "@/lib/ceo-command/ceoCommandCenterAnalysis";

export function useCeoCommandCenter(input: {
  missions: Mission[];
  tasks: Task[];
  feedItems: OrganizationFeedItem[];
  releases: ReleaseItem[];
  memories: MemoryItem[];
  pullRequests: PullRequest[];
  missionId?: string | null;
  attentionFilter?: CeoAttentionFilterId;
}) {
  const {
    missions,
    tasks,
    feedItems,
    releases,
    memories,
    pullRequests,
    missionId,
    attentionFilter,
  } = input;

  return useMemo(
    () =>
      buildCeoCommandCenterData({
        missions,
        tasks,
        feedItems,
        releases,
        memories,
        pullRequests,
        missionId,
        attentionFilter,
      }),
    [
      missions,
      tasks,
      feedItems,
      releases,
      memories,
      pullRequests,
      missionId,
      attentionFilter,
    ]
  );
}
