"use client";

import Link from "next/link";
import type {
  Mission,
  Task,
  PullRequest,
  ReleaseItem,
  MemoryItem,
  OrganizationFeedItem,
} from "@/types/productai";
import { buildMissionLifecycleContext } from "@/lib/lifecycle/lifecycleTimeline";
import { LifecycleTimeline } from "@/components/lifecycle/LifecycleTimeline";
import { LifecycleJourneyPanel } from "@/components/lifecycle/LifecycleJourneyPanel";
import { buildLifecycleJourney } from "@/lib/lifecycle/lifecycleAnalysis";
import { buildOutcomeSignals } from "@/lib/outcome/outcomeSignals";
import { useMemo } from "react";

export function MissionLifecycleContextPanel({
  mission,
  tasks,
  pullRequests,
  releases,
  memories,
  feedItems,
}: {
  mission: Mission;
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
  memories: MemoryItem[];
  feedItems: OrganizationFeedItem[];
}) {
  const context = buildMissionLifecycleContext({
    mission,
    tasks,
    pullRequests,
    releases,
    memories,
    feedItems,
  });

  const journey = useMemo(() => {
    const signals = buildOutcomeSignals({
      mission,
      tasks,
      memories,
      feedItems,
      releases,
    });
    return buildLifecycleJourney({
      mission,
      releases,
      signalCount: signals.length,
    });
  }, [feedItems, memories, mission, releases, tasks]);

  const { view } = context;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">{context.advisoryNote}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Current Stage</p>
          <p className="text-sm">{view.currentStageLabel}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Previous Stage</p>
          <p className="text-sm">{view.previousStageLabel ?? "—"}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Repository</p>
          <p className="text-sm">{view.relatedRepository}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Release</p>
          <p className="text-sm">{view.relatedRelease}</p>
        </div>
      </div>
      <p className="text-xs text-muted">{view.progressNote}</p>
      <LifecycleJourneyPanel journey={journey} compact />
      <LifecycleTimeline steps={context.timeline} compact />
      <Link
        href={`/product-lifecycle?mission=${mission.id}`}
        className="inline-block text-xs text-accent hover:underline"
      >
        Open Product Lifecycle Workspace
      </Link>
    </div>
  );
}
