"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import type { Mission, Task, Branch, PullRequest, ReleaseItem, Commit } from "@/types/productai";
import { Card } from "@/components/Card";
import { RepositoryBoard } from "@/components/repository/RepositoryBoard";
import { BranchOverview } from "@/components/repository/BranchOverview";
import { PullRequestPanel } from "@/components/repository/PullRequestPanel";
import { ReviewCoordinationPanel } from "@/components/repository/ReviewCoordinationPanel";
import { ReleaseCoordinationPanel } from "@/components/repository/ReleaseCoordinationPanel";
import { RepositorySummaryStats } from "@/components/repository/RepositorySummaryCard";
import { useRepositoryWorkspace } from "@/lib/hooks/useRepositoryWorkspace";
import { useReleaseWorkspace } from "@/lib/hooks/useReleaseWorkspace";
import { ReleaseOverviewCard } from "@/components/release/ReleaseSummaryCard";
import { buildMissionRepositoryContext } from "@/lib/repository/repositoryCoordination";
import { repositoryWorkspaceAdvisoryNote } from "@/lib/repository/repositoryWorkspace";
import { useRepositoryWorkspaceStore } from "@/lib/store/repositoryWorkspaceStore";
import { Badge } from "@/components/Badge";
import { cn } from "@/lib/utils";

export function MissionRepositoryContextPanel({
  mission,
  tasks,
  branches,
  pullRequests,
  releases,
  commits,
}: {
  mission: Mission;
  tasks: Task[];
  branches: Branch[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
  commits: Commit[];
}) {
  const context = buildMissionRepositoryContext({
    mission,
    tasks,
    branches,
    pullRequests,
    releases,
    commits,
  });

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">{context.advisoryNote}</p>
      {context.board ? (
        <div className="rounded-lg border border-border px-3 py-2 text-xs text-muted">
          <p className="font-medium text-foreground">{context.board.repositoryLabel}</p>
          <p className="mt-1">
            Branches: {context.board.branches.join(", ") || "—"} · PRs: {context.board.pullRequests.length}
          </p>
        </div>
      ) : null}
      <ReviewCoordinationPanel summary={context.review} compact />
      <ReleaseCoordinationPanel view={context.release} compact />
    </div>
  );
}

export function RepositoryWorkspace({
  missions,
  tasks,
  branches,
  pullRequests,
  releases,
  commits,
  initialMissionId,
}: {
  missions: Mission[];
  tasks: Task[];
  branches: Branch[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
  commits: Commit[];
  initialMissionId?: string | null;
}) {
  const selectedRepositoryId = useRepositoryWorkspaceStore((s) => s.selectedRepositoryId);
  const setSelectedRepository = useRepositoryWorkspaceStore((s) => s.setSelectedRepository);
  const selectedView = useRepositoryWorkspaceStore((s) => s.selectedView);
  const setSelectedView = useRepositoryWorkspaceStore((s) => s.setSelectedView);

  const filterRepositoryId = selectedRepositoryId ?? initialMissionId ?? null;

  const { overview: releaseOverview } = useReleaseWorkspace({
    missions,
    tasks,
    pullRequests,
    releases,
    missionId: filterRepositoryId,
  });

  const {
    board,
    branchOverview,
    pullRequestRows,
    review,
    release,
    overview,
    bottlenecks,
  } = useRepositoryWorkspace({
    missions,
    tasks,
    branches,
    pullRequests,
    releases,
    commits,
    repositoryId: filterRepositoryId,
  });

  const missionOptions = useMemo(
    () => missions.filter((m) => m.status !== "completed"),
    [missions]
  );

  useEffect(() => {
    if (initialMissionId) {
      setSelectedRepository(initialMissionId);
    }
  }, [initialMissionId, setSelectedRepository]);

  const views = [
    { id: "board" as const, label: "Board" },
    { id: "branches" as const, label: "Branches" },
    { id: "pull_requests" as const, label: "Pull Requests" },
    { id: "review" as const, label: "Review" },
    { id: "release" as const, label: "Release" },
    { id: "summary" as const, label: "Summary" },
    { id: "context" as const, label: "Context" },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">{repositoryWorkspaceAdvisoryNote}</p>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">Repository (mission) filter:</span>
        <button
          type="button"
          onClick={() => setSelectedRepository(null)}
          className={cn(
            "rounded-full border border-border px-3 py-1 text-xs",
            !filterRepositoryId && "border-accent bg-accent/10 text-accent"
          )}
        >
          All
        </button>
        {missionOptions.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSelectedRepository(m.id)}
            className={cn(
              "rounded-full border border-border px-3 py-1 text-xs transition",
              filterRepositoryId === m.id
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
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-xs font-medium uppercase text-muted">Repository Bottlenecks</p>
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

      <Card
        title="Repository Board"
        description="Mission repository context with tasks, branches, pull requests, review and release state"
      >
        <RepositoryBoard items={board} />
      </Card>

      <Card title="Branch Overview" description="Branches linked to tasks and missions">
        <BranchOverview rows={branchOverview} />
      </Card>

      <Card title="Pull Request Context" description="PR states for coordination—no merge or creation">
        <PullRequestPanel rows={pullRequestRows} />
      </Card>

      <Card title="Review Coordination" description="Pending, active, completed, and blocked reviews">
        <ReviewCoordinationPanel summary={review} />
      </Card>

      <Card
        title="Release Coordination"
        description="Candidates, blockers, QA, and documentation"
        action={
          <Link href="/release-workspace" className="text-xs text-accent hover:underline">
            Release Readiness Summary
          </Link>
        }
      >
        <ReleaseCoordinationPanel view={release} />
        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-2 text-xs font-medium uppercase text-muted">Release Readiness Summary</p>
          <ReleaseOverviewCard overview={releaseOverview} compact />
        </div>
      </Card>

      <Card title="Repository Summary" description="Organization-wide repository coordination metrics">
        <RepositorySummaryStats overview={overview} bottlenecks={bottlenecks} />
      </Card>

      <Card title="Cross-Workspace Context" description="Mission delivery and COO continuity links">
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/delivery-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Delivery Workspace — task and review context
          </Link>
          <Link href="/coo-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            AI COO Workspace — mission coordination
          </Link>
          <Link href="/organization-feed" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Organization Feed — repository events
          </Link>
          <Link href="/release-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Release Readiness Workspace
          </Link>
          <Link href="/code-release" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Code & Release — branch and PR reading
          </Link>
        </div>
      </Card>
    </div>
  );
}
