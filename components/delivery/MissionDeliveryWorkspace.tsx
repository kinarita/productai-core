"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import type { Mission, Task, PullRequest, ReleaseItem } from "@/types/productai";
import { Card } from "@/components/Card";
import { TaskPipeline } from "@/components/delivery/TaskPipeline";
import { TaskBoard } from "@/components/delivery/TaskBoard";
import { TaskOwnershipPanel } from "@/components/delivery/TaskOwnershipPanel";
import { ReviewStatusPanel } from "@/components/delivery/ReviewStatusPanel";
import { RepositoryStatusPanel } from "@/components/delivery/RepositoryStatusPanel";
import { ReleaseReadinessPanel } from "@/components/delivery/ReleaseReadinessPanel";
import { DeliverySummaryCard } from "@/components/delivery/DeliverySummaryCard";
import { useDeliveryWorkspace } from "@/lib/hooks/useDeliveryWorkspace";
import { buildMissionDeliveryContext } from "@/lib/delivery/taskDeliveryAnalysis";
import { deliveryWorkspaceAdvisoryNote } from "@/lib/delivery/deliveryWorkspace";
import { useDeliveryWorkspaceStore } from "@/lib/store/deliveryWorkspaceStore";
import { Badge } from "@/components/Badge";
import { cn } from "@/lib/utils";

export function MissionDeliveryContextPanel({
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
  const context = buildMissionDeliveryContext({ mission, tasks, pullRequests, releases });

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">{context.advisoryNote}</p>
      <div className="flex flex-wrap gap-2">
        {context.taskDistribution.map((d) => (
          <span key={d.label} className="rounded-lg border border-border px-2 py-1 text-xs text-muted">
            {d.label}: {d.count}
          </span>
        ))}
      </div>
      <ReviewStatusPanel summary={context.review} compact />
      <RepositoryStatusPanel summary={context.repository} compact />
      <ReleaseReadinessPanel view={context.release} compact />
    </div>
  );
}

export function MissionDeliveryWorkspace({
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
  const selectedMissionId = useDeliveryWorkspaceStore((s) => s.selectedMissionId);
  const setSelectedMission = useDeliveryWorkspaceStore((s) => s.setSelectedMission);
  const selectedView = useDeliveryWorkspaceStore((s) => s.selectedView);
  const setSelectedView = useDeliveryWorkspaceStore((s) => s.setSelectedView);

  const filterMissionId = selectedMissionId ?? initialMissionId ?? null;

  const {
    pipeline,
    ownership,
    review,
    bottlenecks,
    missionSummaries,
    repositoryByMission,
    releaseByMission,
  } = useDeliveryWorkspace({
    missions,
    tasks,
    pullRequests,
    releases,
    missionId: filterMissionId,
  });

  const selectedMission = filterMissionId
    ? missions.find((m) => m.id === filterMissionId)
    : null;
  const repositorySummary = selectedMission
    ? repositoryByMission.get(selectedMission.id)
    : undefined;
  const releaseView = selectedMission ? releaseByMission.get(selectedMission.id) : undefined;

  const views = [
    { id: "pipeline" as const, label: "Pipeline" },
    { id: "board" as const, label: "Board" },
    { id: "ownership" as const, label: "Ownership" },
    { id: "review" as const, label: "Review" },
    { id: "repository" as const, label: "Repository" },
    { id: "release" as const, label: "Release" },
    { id: "summary" as const, label: "Summary" },
    { id: "context" as const, label: "Context" },
  ];

  const missionFilterOptions = useMemo(
    () => missions.filter((m) => m.status !== "completed"),
    [missions]
  );

  useEffect(() => {
    if (initialMissionId) {
      setSelectedMission(initialMissionId);
    }
  }, [initialMissionId, setSelectedMission]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">{deliveryWorkspaceAdvisoryNote}</p>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">Mission filter:</span>
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
        {missionFilterOptions.map((m) => (
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
              selectedView === v.id
                ? "border-accent bg-accent/10 text-accent"
                : "text-muted hover:border-accent/40"
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      {bottlenecks.length > 0 ? (
        <div className="rounded-lg border border-border bg-background px-3 py-2">
          <p className="text-xs font-medium uppercase text-muted">Delivery Bottlenecks</p>
          <ul className="mt-2 space-y-1">
            {bottlenecks.slice(0, 4).map((b) => (
              <li key={b.id} className="text-xs text-muted">
                <Badge variant="warning" className="mr-2">
                  {b.label}
                </Badge>
                {b.detail}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Card title="Task Pipeline" description="Tasks across delivery stages—visibility only">
        <TaskPipeline rows={pipeline} />
      </Card>

      <Card title="Task Board" description="Active delivery tasks with review and repository state">
        <TaskBoard rows={pipeline} />
      </Card>

      <Card title="Task Ownership" description="Mission Team roles and task distribution">
        <TaskOwnershipPanel buckets={ownership} />
      </Card>

      <Card title="Review Status" description="Pending, in review, completed, and blocked review counts">
        <ReviewStatusPanel summary={review} />
      </Card>

      <Card
        title="Repository Status"
        description="Planned, linked, and ready repository states—no GitHub connection"
      >
        {repositorySummary ? (
          <RepositoryStatusPanel summary={repositorySummary} />
        ) : (
          <p className="text-xs text-muted">
            Select a mission filter to view mission-level repository status, or read aggregated task counts above.
          </p>
        )}
      </Card>

      <Card title="Release Readiness" description="Blockers, QA, documentation, and review for release coordination">
        {releaseView ? (
          <ReleaseReadinessPanel view={releaseView} />
        ) : (
          <p className="text-xs text-muted">Select a mission filter for mission-specific release readiness.</p>
        )}
      </Card>

      <Card title="Delivery Summary" description="Per-mission task counts, review, and release readiness">
        <DeliverySummaryCard summaries={missionSummaries} bottlenecks={bottlenecks} />
      </Card>

      <Card
        title="Governance Context"
        description="Knowledge graph, atlas, traceability, and replay—context references only"
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/ceo-home" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            CEO Home — executive governance
          </Link>
          <Link href="/coo-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            AI COO Workspace
          </Link>
          <Link href="/repository-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Repository Context — branches, PRs, review coordination
          </Link>
          <Link href="/organization-feed" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Organization Feed — delivery events
          </Link>
          <Link href="/runtime-cost" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Runtime — traceability context
          </Link>
        </div>
      </Card>
    </div>
  );
}
