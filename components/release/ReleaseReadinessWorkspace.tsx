"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import type { Mission, Task, PullRequest, ReleaseItem } from "@/types/productai";
import { Card } from "@/components/Card";
import { ReleaseMissionBoard } from "@/components/release/ReleaseMissionBoard";
import { ReleaseChecklistPanel } from "@/components/release/ReleaseChecklistPanel";
import { ReleaseRiskPanel } from "@/components/release/ReleaseRiskPanel";
import { ReleaseOverviewCard } from "@/components/release/ReleaseSummaryCard";
import { useReleaseWorkspace } from "@/lib/hooks/useReleaseWorkspace";
import { buildMissionReleaseContext } from "@/lib/release/releaseReadiness";
import { buildReleaseChecklist } from "@/lib/release/releaseChecklist";
import { releaseWorkspaceAdvisoryNote, releaseReadinessLevels } from "@/lib/release/releaseWorkspace";
import { useReleaseWorkspaceStore } from "@/lib/store/releaseWorkspaceStore";
import type { ReleaseReadinessLevelId } from "@/lib/release/releaseWorkspace";
import { cn } from "@/lib/utils";

export function MissionReleaseContextPanel({
  mission,
  tasks,
  pullRequests,
  releases,
}: {
  mission: Mission;
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
}) {
  const context = buildMissionReleaseContext({ mission, tasks, pullRequests, releases });

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">{context.advisoryNote}</p>
      <div className="rounded-lg border border-border px-3 py-2">
        <p className="text-[10px] uppercase text-muted">Readiness Summary</p>
        <p className="text-sm font-medium">{context.row.releaseReadiness}</p>
        <p className="mt-1 text-xs text-muted">Score: {context.row.readinessScore}/100</p>
      </div>
      <ReleaseChecklistPanel items={context.checklist} compact />
      <ReleaseRiskPanel risks={context.risks} compact />
    </div>
  );
}

export function ReleaseReadinessWorkspace({
  missions,
  tasks,
  pullRequests,
  releases,
  initialMissionId,
}: {
  missions: Mission[];
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
  initialMissionId?: string | null;
}) {
  const selectedMissionId = useReleaseWorkspaceStore((s) => s.selectedMissionId);
  const setSelectedMission = useReleaseWorkspaceStore((s) => s.setSelectedMission);
  const selectedReleaseState = useReleaseWorkspaceStore((s) => s.selectedReleaseState);
  const setSelectedReleaseState = useReleaseWorkspaceStore((s) => s.setSelectedReleaseState);
  const selectedView = useReleaseWorkspaceStore((s) => s.selectedView);
  const setSelectedView = useReleaseWorkspaceStore((s) => s.setSelectedView);

  const filterMissionId = selectedMissionId ?? initialMissionId ?? null;

  const { board, overview, risks } = useReleaseWorkspace({
    missions,
    tasks,
    pullRequests,
    releases,
    missionId: filterMissionId,
    levelFilter: selectedReleaseState,
  });

  const selectedMission = filterMissionId
    ? missions.find((m) => m.id === filterMissionId)
    : null;

  const checklistForMission = useMemo(() => {
    if (!selectedMission) return [];
    return buildReleaseChecklist({
      mission: selectedMission,
      tasks,
      pullRequests,
      releases,
    });
  }, [pullRequests, releases, selectedMission, tasks]);

  const missionOptions = useMemo(
    () => missions.filter((m) => m.status !== "completed" || m.progress < 100),
    [missions]
  );

  useEffect(() => {
    if (initialMissionId) setSelectedMission(initialMissionId);
  }, [initialMissionId, setSelectedMission]);

  const views = [
    { id: "board" as const, label: "Board" },
    { id: "checklist" as const, label: "Checklist" },
    { id: "risks" as const, label: "Risks" },
    { id: "summary" as const, label: "Summary" },
    { id: "context" as const, label: "Context" },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">{releaseWorkspaceAdvisoryNote}</p>

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
        <span className="text-xs text-muted">Readiness level:</span>
        <button
          type="button"
          onClick={() => setSelectedReleaseState(null)}
          className={cn(
            "rounded-full border border-border px-3 py-1 text-xs",
            !selectedReleaseState && "border-accent bg-accent/10 text-accent"
          )}
        >
          All
        </button>
        {releaseReadinessLevels.map((level) => (
          <button
            key={level.id}
            type="button"
            onClick={() =>
              setSelectedReleaseState(
                selectedReleaseState === level.id ? null : (level.id as ReleaseReadinessLevelId)
              )
            }
            className={cn(
              "rounded-full border border-border px-3 py-1 text-xs transition",
              selectedReleaseState === level.id
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
        title="Release Mission Board"
        description="Mission → Task → Repository → Review → Release readiness at a glance"
      >
        <ReleaseMissionBoard rows={board} />
      </Card>

      <Card title="Release Checklist" description="Complete, partial, or missing—no automatic approval">
        {selectedMission ? (
          <ReleaseChecklistPanel items={checklistForMission} />
        ) : (
          <p className="text-xs text-muted">Select a mission filter to view its release checklist.</p>
        )}
      </Card>

      <Card title="Release Risks" description="Rule-based readiness risks—recommendation only">
        <ReleaseRiskPanel risks={risks} />
      </Card>

      <Card title="Release Summary" description="Ready, candidate, preparing, released, and risk counts">
        <ReleaseOverviewCard overview={overview} />
      </Card>

      <Card title="Cross-Workspace Context" description="Delivery, repository, and COO continuity">
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/delivery-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Mission Delivery Workspace
          </Link>
          <Link href="/repository-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Repository Coordination Workspace
          </Link>
          <Link href="/coo-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            AI COO Workspace
          </Link>
          <Link href="/code-release-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Code & Release Workspace — Release → Outcome
          </Link>
          <Link href="/organization-feed" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Organization Feed — release events
          </Link>
        </div>
      </Card>
    </div>
  );
}
