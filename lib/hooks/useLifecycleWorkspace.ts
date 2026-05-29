"use client";

import { useMemo } from "react";
import type {
  Mission,
  Task,
  PullRequest,
  ReleaseItem,
  MemoryItem,
  OrganizationFeedItem,
} from "@/types/productai";
import type { ProductLifecycleStageId } from "@/lib/lifecycle/productLifecycle";
import {
  buildLifecycleStageBoard,
  buildMissionLifecycleView,
  buildLifecycleJourney,
} from "@/lib/lifecycle/lifecycleAnalysis";
import { buildLifecycleTimeline } from "@/lib/lifecycle/lifecycleTimeline";
import { buildLifecycleOverviewSummary } from "@/lib/lifecycle/lifecycleSummary";
import { buildOutcomeSignals } from "@/lib/outcome/outcomeSignals";

export function useLifecycleWorkspace(input: {
  missions: Mission[];
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
  memories: MemoryItem[];
  feedItems: OrganizationFeedItem[];
  missionId?: string | null;
  stageFilter?: ProductLifecycleStageId | null;
}) {
  const { missions, tasks, pullRequests, releases, memories, feedItems, missionId, stageFilter } =
    input;

  const board = useMemo(
    () => buildLifecycleStageBoard({ missions, tasks, pullRequests, releases, memories, feedItems }),
    [feedItems, memories, missions, pullRequests, releases, tasks]
  );

  const overview = useMemo(
    () => buildLifecycleOverviewSummary({ missions, tasks, pullRequests, releases, memories, feedItems }),
    [feedItems, memories, missions, pullRequests, releases, tasks]
  );

  const missionViews = useMemo(() => {
    const filtered = missionId ? missions.filter((m) => m.id === missionId) : missions;
    return filtered
      .map((mission) =>
        buildMissionLifecycleView({ mission, tasks, pullRequests, releases, memories, feedItems })
      )
      .filter((v) => !stageFilter || v.currentStage === stageFilter);
  }, [feedItems, memories, missionId, missions, pullRequests, releases, stageFilter, tasks]);

  const selectedMission = missionId ? missions.find((m) => m.id === missionId) : null;

  const timeline = useMemo(() => {
    if (!selectedMission) {
      const first = missions[0];
      if (!first) return [];
      return buildLifecycleTimeline({
        mission: first,
        tasks,
        pullRequests,
        releases,
        memories,
        feedItems,
      });
    }
    return buildLifecycleTimeline({
      mission: selectedMission,
      tasks,
      pullRequests,
      releases,
      memories,
      feedItems,
    });
  }, [feedItems, memories, missions, pullRequests, releases, selectedMission, tasks]);

  const journey = useMemo(() => {
    if (!selectedMission) return [];
    const signals = buildOutcomeSignals({
      mission: selectedMission,
      tasks,
      memories,
      feedItems,
      releases,
    });
    return buildLifecycleJourney({
      mission: selectedMission,
      releases,
      signalCount: signals.length,
    });
  }, [feedItems, memories, releases, selectedMission, tasks]);

  return { board, overview, missionViews, timeline, journey };
}
