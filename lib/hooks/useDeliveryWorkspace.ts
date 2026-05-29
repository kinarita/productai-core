"use client";

import { useMemo } from "react";
import type { Mission, Task, PullRequest, ReleaseItem } from "@/types/productai";
import { buildTaskPipeline } from "@/lib/delivery/deliveryPipeline";
import { buildTaskOwnershipBuckets } from "@/lib/delivery/taskOwnership";
import { buildReviewStatusSummary } from "@/lib/delivery/reviewStatus";
import {
  buildDeliveryOverviewSummary,
  buildMissionDeliverySummary,
  detectDeliveryBottlenecks,
} from "@/lib/delivery/taskDeliveryAnalysis";
import { buildRepositoryStatusSummary } from "@/lib/delivery/repositoryStatus";
import { buildReleaseReadinessView } from "@/lib/delivery/releaseReadiness";

export function useDeliveryWorkspace(input: {
  missions: Mission[];
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
  missionId?: string | null;
}) {
  const { missions, tasks, pullRequests, releases, missionId } = input;

  const pipeline = useMemo(
    () => buildTaskPipeline({ missions, tasks, pullRequests, releases, missionId }),
    [missionId, missions, pullRequests, releases, tasks]
  );

  const ownership = useMemo(() => buildTaskOwnershipBuckets(tasks), [tasks]);

  const review = useMemo(() => buildReviewStatusSummary(tasks), [tasks]);

  const bottlenecks = useMemo(
    () => detectDeliveryBottlenecks({ missions, tasks, pullRequests, releases }),
    [missions, pullRequests, releases, tasks]
  );

  const overview = useMemo(
    () => buildDeliveryOverviewSummary({ missions, tasks, pullRequests, releases }),
    [missions, pullRequests, releases, tasks]
  );

  const missionSummaries = useMemo(
    () =>
      missions
        .filter((m) => m.status !== "completed")
        .map((mission) =>
          buildMissionDeliverySummary({
            mission,
            tasks,
            pullRequests,
            releases,
          })
        ),
    [missions, pullRequests, releases, tasks]
  );

  const repositoryByMission = useMemo(() => {
    const map = new Map<string, ReturnType<typeof buildRepositoryStatusSummary>>();
    for (const mission of missions) {
      const missionTasks = tasks.filter((t) => t.missionId === mission.id);
      map.set(
        mission.id,
        buildRepositoryStatusSummary({
          mission,
          tasks: missionTasks,
          pullRequests,
        })
      );
    }
    return map;
  }, [missions, pullRequests, tasks]);

  const releaseByMission = useMemo(() => {
    const map = new Map<string, ReturnType<typeof buildReleaseReadinessView>>();
    for (const mission of missions) {
      const missionTasks = tasks.filter((t) => t.missionId === mission.id);
      map.set(
        mission.id,
        buildReleaseReadinessView({
          mission,
          tasks: missionTasks,
          releases,
        })
      );
    }
    return map;
  }, [missions, releases, tasks]);

  return {
    pipeline,
    ownership,
    review,
    bottlenecks,
    overview,
    missionSummaries,
    repositoryByMission,
    releaseByMission,
  };
}
