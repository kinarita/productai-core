"use client";

import Link from "next/link";
import { useEffect } from "react";
import type {
  Mission,
  Task,
  PullRequest,
  ReleaseItem,
  MemoryItem,
  OrganizationFeedItem,
} from "@/types/productai";
import { Card } from "@/components/Card";
import { LifecycleStageBoard } from "@/components/lifecycle/LifecycleStageBoard";
import { LifecycleTimeline } from "@/components/lifecycle/LifecycleTimeline";
import { LifecycleSummaryCard } from "@/components/lifecycle/LifecycleSummaryCard";
import { LifecycleMissionView } from "@/components/lifecycle/LifecycleMissionView";
import { LifecycleJourneyPanel } from "@/components/lifecycle/LifecycleJourneyPanel";
import { useLifecycleWorkspace } from "@/lib/hooks/useLifecycleWorkspace";
import { lifecycleWorkspaceAdvisoryNote } from "@/lib/lifecycle/productLifecycle";
import { useLifecycleWorkspaceStore } from "@/lib/store/lifecycleWorkspaceStore";
import { cn } from "@/lib/utils";

export function ProductLifecycleWorkspace({
  missions,
  tasks,
  pullRequests,
  releases,
  memories,
  feedItems,
  initialMissionId,
}: {
  missions: Mission[];
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
  memories: MemoryItem[];
  feedItems: OrganizationFeedItem[];
  initialMissionId?: string | null;
}) {
  const selectedMissionId = useLifecycleWorkspaceStore((s) => s.selectedMissionId);
  const setSelectedMission = useLifecycleWorkspaceStore((s) => s.setSelectedMission);
  const selectedStage = useLifecycleWorkspaceStore((s) => s.selectedStage);
  const setSelectedView = useLifecycleWorkspaceStore((s) => s.setSelectedView);
  const view = useLifecycleWorkspaceStore((s) => s.selectedView);

  const filterMissionId = selectedMissionId ?? initialMissionId ?? null;

  const { board, overview, missionViews, timeline, journey } = useLifecycleWorkspace({
    missions,
    tasks,
    pullRequests,
    releases,
    memories,
    feedItems,
    missionId: filterMissionId,
    stageFilter: selectedStage,
  });

  useEffect(() => {
    if (initialMissionId) setSelectedMission(initialMissionId);
  }, [initialMissionId, setSelectedMission]);

  const views = [
    { id: "timeline" as const, label: "Timeline" },
    { id: "board" as const, label: "Board" },
    { id: "mission" as const, label: "Mission" },
    { id: "journey" as const, label: "Journey" },
    { id: "summary" as const, label: "Summary" },
    { id: "context" as const, label: "Context" },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">{lifecycleWorkspaceAdvisoryNote}</p>

      <div className="rounded-lg border border-border bg-muted/5 px-4 py-3 text-xs text-muted">
        Idea → Planning → Direction → Architecture → Design → Development → QA → Release → Outcome
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">Mission:</span>
        <button
          type="button"
          onClick={() => setSelectedMission(null)}
          className={cn(
            "rounded-full border border-border px-3 py-1 text-xs",
            !filterMissionId && "border-accent bg-accent/10 text-accent"
          )}
        >
          All
        </button>
        {missions.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSelectedMission(m.id)}
            className={cn(
              "rounded-full border border-border px-3 py-1 text-xs transition",
              filterMissionId === m.id
                ? "border-accent bg-accent/10 text-accent"
                : "text-muted hover:border-accent/40"
            )}
          >
            {m.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {views.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setSelectedView(v.id)}
            className={cn(
              "rounded-full border border-border px-3 py-1 text-xs transition",
              view === v.id
                ? "border-accent bg-accent/10 text-accent"
                : "text-muted hover:border-accent/40"
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      {(view === "timeline" || view === "context") && (
        <Card
          title="Lifecycle Timeline"
          description="Mission progression through product lifecycle stages"
        >
          <LifecycleTimeline steps={timeline} />
        </Card>
      )}

      {(view === "board" || view === "context") && (
        <Card title="Lifecycle Stage Board" description="Missions grouped by inferred lifecycle stage">
          <LifecycleStageBoard board={board} />
        </Card>
      )}

      {(view === "mission" || view === "context") && (
        <Card title="Mission Lifecycle View" description="Current stage, related tasks, and workspace context">
          <LifecycleMissionView views={missionViews} />
        </Card>
      )}

      {(view === "journey" || view === "context") && (
        <Card
          title="Lifecycle Journey"
          description="Path this mission took to reach its current lifecycle position"
        >
          <LifecycleJourneyPanel journey={journey} />
        </Card>
      )}

      {(view === "summary" || view === "context") && (
        <Card title="Lifecycle Summary" description="Organization-wide lifecycle overview">
          <LifecycleSummaryCard summary={overview} />
        </Card>
      )}

      <Card title="Workspace Links" description="Continuity across Phase 8 workspaces">
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/coo-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            AI COO Workspace
          </Link>
          <Link href="/delivery-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Mission Delivery Workspace
          </Link>
          <Link href="/repository-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Repository Coordination Workspace
          </Link>
          <Link href="/release-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Release Readiness Workspace
          </Link>
          <Link href="/code-release-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Code & Release Workspace
          </Link>
          <Link href="/ceo-home" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            CEO Home
          </Link>
        </div>
      </Card>
    </div>
  );
}
