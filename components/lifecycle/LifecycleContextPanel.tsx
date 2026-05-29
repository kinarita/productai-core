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
import { buildMissionHandoffContext } from "@/lib/handoff/handoffAnalysis";
import { getLifecycleReviewSummaryForMission } from "@/lib/review/reviewAnalysis";
import { getIdeaLifecycleConnection, buildProductIdeas } from "@/lib/idea/ideaAnalysis";
import { buildLifecycleBriefTransition, buildProductBriefRecords } from "@/lib/brief/productBriefAnalysis";
import { buildLifecycleLineageContext } from "@/lib/lineage/artifactLineageAnalysis";
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

  const handoffContext = useMemo(
    () => buildMissionHandoffContext({ mission, tasks }),
    [mission, tasks]
  );

  const reviewSummary = useMemo(
    () => getLifecycleReviewSummaryForMission({ mission, tasks }),
    [mission, tasks]
  );

  const ideaLifecycle = useMemo(
    () => getIdeaLifecycleConnection(buildProductIdeas([mission])),
    [mission]
  );

  const briefLifecycle = useMemo(
    () => buildLifecycleBriefTransition(buildProductBriefRecords([mission])),
    [mission]
  );

  const lineageContext = useMemo(
    () => buildLifecycleLineageContext({ mission, tasks }),
    [mission, tasks]
  );

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
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Current Team Role</p>
          <p className="text-sm">{handoffContext.currentRoleLabel}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Current Artifact</p>
          <p className="text-sm">{handoffContext.currentArtifact}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Artifact Review State</p>
          <p className="text-sm">{reviewSummary.currentArtifactReviewState}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Pending Reviews</p>
          <p className="text-sm">{reviewSummary.pendingReviewCount}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Idea Stage (this mission)</p>
          <p className="text-sm">{ideaLifecycle.ideaStageCount > 0 ? "In Idea exploration" : "In Planning"}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Current Lineage Position</p>
          <p className="text-sm">{lineageContext.currentLineagePosition}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Previous Stage Artifact</p>
          <p className="text-sm">{lineageContext.previousStageArtifact ?? "—"}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Next Stage Artifact</p>
          <p className="text-sm">{lineageContext.nextStageArtifact ?? "—"}</p>
        </div>
      </div>
      <p className="text-xs text-muted">{view.progressNote}</p>
      <LifecycleJourneyPanel journey={journey} compact />
      <div className="mt-3 rounded-lg border border-border/60 px-3 py-2 text-xs text-muted">
        <p className="font-medium text-foreground">Idea → Planning (Product Brief)</p>
        <p className="mt-1">{briefLifecycle.transitionNote}</p>
      </div>
      <LifecycleTimeline steps={context.timeline} compact />
      <Link
        href={`/product-brief?mission=${mission.id}`}
        className="mr-4 inline-block text-xs text-accent hover:underline"
      >
        Open Product Brief
      </Link>
      <Link
        href={`/idea-workspace?idea=idea-${mission.id}`}
        className="mr-4 inline-block text-xs text-accent hover:underline"
      >
        Open Idea Workspace
      </Link>
      <Link
        href={`/artifact-review?mission=${mission.id}`}
        className="mr-4 inline-block text-xs text-accent hover:underline"
      >
        Open Artifact Reviews
      </Link>
      <Link
        href={`/product-lifecycle?mission=${mission.id}`}
        className="mr-4 inline-block text-xs text-accent hover:underline"
      >
        Open Product Lifecycle Workspace
      </Link>
      <Link
        href={lineageContext.lineageHref}
        className="inline-block text-xs text-accent hover:underline"
      >
        Open Artifact Lineage
      </Link>
    </div>
  );
}
