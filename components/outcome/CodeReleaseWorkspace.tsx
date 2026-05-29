"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import type {
  Mission,
  Task,
  MemoryItem,
  OrganizationFeedItem,
  ReleaseItem,
  PullRequest,
} from "@/types/productai";
import { Card } from "@/components/Card";
import { OutcomeMissionBoard } from "@/components/outcome/OutcomeMissionBoard";
import { OutcomeSignalsPanel } from "@/components/outcome/OutcomeSignalsPanel";
import { ReleaseOutcomePanel } from "@/components/outcome/ReleaseOutcomePanel";
import { OutcomeTimeline } from "@/components/outcome/OutcomeTimeline";
import { OutcomeOverviewCard } from "@/components/outcome/OutcomeSummaryCard";
import { useOutcomeWorkspace } from "@/lib/hooks/useOutcomeWorkspace";
import {
  buildMissionOutcomeContext,
  buildReleaseOutcomeContext,
} from "@/lib/outcome/releaseOutcomeContext";
import { outcomeWorkspaceAdvisoryNote, outcomeStatusLevels } from "@/lib/outcome/outcomeWorkspace";
import { useOutcomeWorkspaceStore } from "@/lib/store/outcomeWorkspaceStore";
import type { OutcomeStatusId } from "@/lib/outcome/outcomeWorkspace";
import { cn } from "@/lib/utils";

export function MissionOutcomeContextPanel({
  mission,
  tasks,
  memories,
  feedItems,
  releases,
  pullRequests,
}: {
  mission: Mission;
  tasks: Task[];
  memories: MemoryItem[];
  feedItems: OrganizationFeedItem[];
  releases: ReleaseItem[];
  pullRequests: PullRequest[];
}) {
  const context = buildMissionOutcomeContext({
    mission,
    tasks,
    memories,
    feedItems,
    releases,
    pullRequests,
  });

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">{context.advisoryNote}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Release Status</p>
          <p className="text-sm">{context.row.releaseState}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Outcome Status</p>
          <p className="text-sm">{context.row.outcomeStatusLabel}</p>
        </div>
      </div>
      <OutcomeSignalsPanel signals={context.signals} compact />
      {context.followUpNotes.length > 0 ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Follow-up Notes</p>
          <ul className="mt-1 space-y-0.5 text-xs text-muted">
            {context.followUpNotes.map((n) => (
              <li key={n}>· {n}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function CodeReleaseWorkspace({
  missions,
  tasks,
  memories,
  feedItems,
  releases,
  pullRequests,
  initialMissionId,
}: {
  missions: Mission[];
  tasks: Task[];
  memories: MemoryItem[];
  feedItems: OrganizationFeedItem[];
  releases: ReleaseItem[];
  pullRequests: PullRequest[];
  initialMissionId?: string | null;
}) {
  const selectedMissionId = useOutcomeWorkspaceStore((s) => s.selectedMissionId);
  const setSelectedMission = useOutcomeWorkspaceStore((s) => s.setSelectedMission);
  const selectedOutcomeState = useOutcomeWorkspaceStore((s) => s.selectedOutcomeState);
  const setSelectedOutcomeState = useOutcomeWorkspaceStore((s) => s.setSelectedOutcomeState);
  const selectedView = useOutcomeWorkspaceStore((s) => s.selectedView);
  const setSelectedView = useOutcomeWorkspaceStore((s) => s.setSelectedView);

  const filterMissionId = selectedMissionId ?? initialMissionId ?? null;

  const { board, overview, signals, timeline } = useOutcomeWorkspace({
    missions,
    tasks,
    memories,
    feedItems,
    releases,
    pullRequests,
    missionId: filterMissionId,
    statusFilter: selectedOutcomeState,
  });

  const selectedMission = filterMissionId
    ? missions.find((m) => m.id === filterMissionId)
    : null;

  const releaseOutcome = useMemo(() => {
    if (!selectedMission) return null;
    return buildReleaseOutcomeContext({
      mission: selectedMission,
      tasks,
      memories,
      feedItems,
      releases,
      pullRequests,
    });
  }, [feedItems, memories, pullRequests, releases, selectedMission, tasks]);

  const missionOptions = useMemo(
    () => missions.filter((m) => releases.some((r) => r.relatedMissionId === m.id) || m.progress >= 70),
    [missions, releases]
  );

  useEffect(() => {
    if (initialMissionId) setSelectedMission(initialMissionId);
  }, [initialMissionId, setSelectedMission]);

  const views = [
    { id: "board" as const, label: "Board" },
    { id: "signals" as const, label: "Signals" },
    { id: "timeline" as const, label: "Timeline" },
    { id: "release_outcome" as const, label: "Release Outcome" },
    { id: "summary" as const, label: "Summary" },
    { id: "context" as const, label: "Context" },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">{outcomeWorkspaceAdvisoryNote}</p>

      <div className="rounded-lg border border-border bg-muted/5 px-4 py-3 text-xs text-muted">
        Mission → Task → Repository → Review → Release → <span className="font-medium text-foreground">Outcome</span>
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
        {missionOptions.map((m) => (
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

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">Outcome status:</span>
        <button
          type="button"
          onClick={() => setSelectedOutcomeState(null)}
          className={cn(
            "rounded-full border border-border px-3 py-1 text-xs",
            !selectedOutcomeState && "border-accent bg-accent/10 text-accent"
          )}
        >
          All
        </button>
        {outcomeStatusLevels.map((level) => (
          <button
            key={level.id}
            type="button"
            onClick={() =>
              setSelectedOutcomeState(
                selectedOutcomeState === level.id ? null : (level.id as OutcomeStatusId)
              )
            }
            className={cn(
              "rounded-full border border-border px-3 py-1 text-xs transition",
              selectedOutcomeState === level.id
                ? "border-accent bg-accent/10 text-accent"
                : "text-muted hover:border-accent/40"
            )}
          >
            {level.title}
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
              selectedView === v.id
                ? "border-accent bg-accent/10 text-accent"
                : "text-muted hover:border-accent/40"
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      <Card
        title="Outcome Mission Board"
        description="Post-release outcome visibility per mission"
      >
        <OutcomeMissionBoard rows={board} />
      </Card>

      <Card title="Outcome Signals" description="User feedback, QA, review, reflection—visualization only">
        <OutcomeSignalsPanel signals={signals} />
      </Card>

      <Card title="Outcome Timeline" description="Release → Feedback → Review → Follow-up → Reflection">
        <OutcomeTimeline events={timeline} />
      </Card>

      <Card title="Release Outcome Context" description="Release, review, outcome, and reflection for selected mission">
        {releaseOutcome ? (
          <ReleaseOutcomePanel context={releaseOutcome} />
        ) : (
          <p className="text-xs text-muted">Select a mission filter to view release outcome context.</p>
        )}
      </Card>

      <Card title="Outcome Summary" description="Released missions, observed and validated outcomes">
        <OutcomeOverviewCard overview={overview} />
      </Card>

      <Card title="Workspace Links" description="Delivery, repository, and release readiness continuity">
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/delivery-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Mission Delivery Workspace
          </Link>
          <Link href="/repository-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Repository Coordination Workspace
          </Link>
          <Link href="/release-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Release Readiness Workspace
          </Link>
          <Link href="/code-release" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Code & Release (legacy view)
          </Link>
        </div>
      </Card>
    </div>
  );
}
