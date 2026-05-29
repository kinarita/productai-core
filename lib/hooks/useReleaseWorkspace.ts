"use client";

import { useMemo } from "react";
import type { Mission, Task, PullRequest, ReleaseItem } from "@/types/productai";
import type { ReleaseReadinessLevelId } from "@/lib/release/releaseWorkspace";
import { buildReleaseMissionBoard } from "@/lib/release/releaseSummary";
import { buildReleaseOverviewSummary } from "@/lib/release/releaseSummary";
import { detectReleaseRisks } from "@/lib/release/releaseRisks";

export function useReleaseWorkspace(input: {
  missions: Mission[];
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
  missionId?: string | null;
  levelFilter?: ReleaseReadinessLevelId | null;
}) {
  const { missions, tasks, pullRequests, releases, missionId, levelFilter } = input;

  const board = useMemo(
    () => buildReleaseMissionBoard({ missions, tasks, pullRequests, releases, missionId, levelFilter }),
    [levelFilter, missionId, missions, pullRequests, releases, tasks]
  );

  const overview = useMemo(
    () => buildReleaseOverviewSummary({ missions, tasks, pullRequests, releases }),
    [missions, pullRequests, releases, tasks]
  );

  const risks = useMemo(
    () => detectReleaseRisks({ missions, tasks, pullRequests, releases, missionId }),
    [missionId, missions, pullRequests, releases, tasks]
  );

  return { board, overview, risks };
}
