"use client";

import { useMemo } from "react";
import type {
  Mission,
  Task,
  MemoryItem,
  OrganizationFeedItem,
  ReleaseItem,
  PullRequest,
} from "@/types/productai";
import type { OutcomeStatusId } from "@/lib/outcome/outcomeWorkspace";
import { buildOutcomeMissionBoard } from "@/lib/outcome/outcomeAnalysis";
import { buildOutcomeOverviewSummary } from "@/lib/outcome/outcomeSummary";
import { buildOutcomeSignals } from "@/lib/outcome/outcomeSignals";
import { buildOutcomeTimeline } from "@/lib/outcome/releaseOutcomeContext";

export function useOutcomeWorkspace(input: {
  missions: Mission[];
  tasks: Task[];
  memories: MemoryItem[];
  feedItems: OrganizationFeedItem[];
  releases: ReleaseItem[];
  pullRequests: PullRequest[];
  missionId?: string | null;
  statusFilter?: OutcomeStatusId | null;
}) {
  const {
    missions,
    tasks,
    memories,
    feedItems,
    releases,
    pullRequests,
    missionId,
    statusFilter,
  } = input;

  const board = useMemo(
    () =>
      buildOutcomeMissionBoard({
        missions,
        tasks,
        memories,
        feedItems,
        releases,
        pullRequests,
        missionId,
        statusFilter,
      }),
    [feedItems, memories, missionId, missions, pullRequests, releases, statusFilter, tasks]
  );

  const overview = useMemo(
    () =>
      buildOutcomeOverviewSummary({
        missions,
        tasks,
        memories,
        feedItems,
        releases,
        pullRequests,
      }),
    [feedItems, memories, missions, pullRequests, releases, tasks]
  );

  const selectedMission = missionId ? missions.find((m) => m.id === missionId) : null;

  const signals = useMemo(() => {
    if (!selectedMission) {
      return missions.flatMap((mission) =>
        buildOutcomeSignals({ mission, tasks, memories, feedItems, releases }).slice(0, 2)
      );
    }
    return buildOutcomeSignals({
      mission: selectedMission,
      tasks,
      memories,
      feedItems,
      releases,
    });
  }, [feedItems, memories, missions, releases, selectedMission, tasks]);

  const timeline = useMemo(() => {
    if (!selectedMission) {
      const first = missions.find((m) =>
        releases.some((r) => r.relatedMissionId === m.id && r.state === "production")
      );
      if (!first) return [];
      return buildOutcomeTimeline({
        mission: first,
        tasks,
        memories,
        feedItems,
        releases,
      });
    }
    return buildOutcomeTimeline({
      mission: selectedMission,
      tasks,
      memories,
      feedItems,
      releases,
    });
  }, [feedItems, memories, missions, releases, selectedMission, tasks]);

  return { board, overview, signals, timeline };
}
