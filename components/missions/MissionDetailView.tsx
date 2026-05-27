"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { missions as seedMissions } from "@/data/mockData";
import { ArrowLeft, GitPullRequest } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { AgentAvatar } from "@/components/AgentAvatar";
import { LifecycleStepper } from "@/components/LifecycleStepper";
import { ProgressBar } from "@/components/ProgressBar";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusPill } from "@/components/StatusPill";
import { MissionDetailSkeleton } from "@/components/missions/MissionDetailSkeleton";
import { useStoreHydration } from "@/lib/hooks/useStoreHydration";
import {
  buildMissionRecentActivity,
  getBranchesForMissionId,
  getMemoriesForMissionId,
  getPullRequestsForMissionId,
  getReleaseForMissionId,
  getRuntimeSignalsForMission,
  getTasksForMissionId,
} from "@/lib/mission/missionDetailData";
import { useMissionStore } from "@/lib/store/missionStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { useRuntimeStore } from "@/lib/store/runtimeStore";
import { useTaskStore } from "@/lib/store/taskStore";
import {
  countJudgmentSpawnedTasks,
  countTasksByStatus,
  getLinkedTasksForDecision,
  getRecentlyUpdatedTask,
} from "@/lib/task/taskSelectors";
import { useUiStore } from "@/lib/store/uiStore";
import type { MissionHealth, MissionStatus, TaskStatus } from "@/types/productai";

const healthVariant: Record<MissionHealth, "success" | "warning" | "danger"> = {
  stable: "success",
  delayed: "warning",
  risky: "warning",
  blocked: "danger",
};

const statusVariant: Record<MissionStatus, "accent" | "success" | "warning" | "muted"> = {
  planning: "muted",
  active: "accent",
  on_hold: "warning",
  completed: "success",
};

const taskStatusVariant: Record<TaskStatus, "info" | "warning" | "danger" | "success"> = {
  active: "info",
  in_review: "warning",
  blocked: "danger",
  completed: "success",
};

const signalVariant = {
  info: "muted" as const,
  warning: "warning" as const,
  danger: "danger" as const,
};

interface MissionDetailViewProps {
  missionId: string;
}

export function MissionDetailView({ missionId }: MissionDetailViewProps) {
  const hydrated = useStoreHydration();
  const setActiveMission = useUiStore((s) => s.setActiveMission);
  const setSelectedMission = useMissionStore((s) => s.setSelectedMission);

  const storeMission = useMissionStore((s) =>
    s.missions.find((m) => m.id === missionId)
  );
  const mission = useMemo(
    () => storeMission ?? seedMissions.find((m) => m.id === missionId),
    [storeMission, missionId]
  );
  const tasks = useTaskStore((s) => s.tasks);
  const allDecisions = useOrganizationStore((s) => s.decisions);
  const allFeed = useOrganizationStore((s) => s.organizationFeedItems);
  const providerHealth = useRuntimeStore((s) => s.providerHealth);
  const alerts = useRuntimeStore((s) => s.alerts);

  const missionDecisions = useMemo(
    () => allDecisions.filter((d) => d.relatedMissionId === missionId),
    [allDecisions, missionId]
  );

  const missionFeed = useMemo(
    () => allFeed.filter((f) => f.missionId === missionId),
    [allFeed, missionId]
  );

  useEffect(() => {
    setActiveMission(missionId);
    setSelectedMission(missionId);
  }, [missionId, setActiveMission, setSelectedMission]);

  const recentActivity = useMemo(() => {
    if (!mission) return [];
    return buildMissionRecentActivity(mission, missionFeed, missionDecisions, alerts);
  }, [mission, missionFeed, missionDecisions, alerts]);

  const runtimeSignals = useMemo(
    () => getRuntimeSignalsForMission(missionId, providerHealth, alerts),
    [missionId, providerHealth, alerts]
  );

  const missionTasks = useMemo(
    () => tasks.filter((t) => t.missionId === missionId),
    [tasks, missionId]
  );

  const taskActivity = useMemo(() => {
    return missionTasks
      .filter((t) => (t.events?.length ?? 0) > 0)
      .slice(0, 4)
      .map((t) => {
        const lastEvent = t.events?.[t.events.length - 1];
        const last = lastEvent ? lastEvent.message : `Updated task: ${t.title}`;
        return {
          id: `task-${t.id}`,
          source: "task" as const,
          timestamp: t.updatedAt ?? "Recent",
          message: last,
          meta: `${t.assignedTo} · ${t.title}`,
        };
      });
  }, [missionTasks]);

  const recentActivityWithTasks = useMemo(
    () => [...taskActivity, ...recentActivity].slice(0, 12),
    [taskActivity, recentActivity]
  );

  if (!hydrated) {
    return <MissionDetailSkeleton />;
  }

  if (!mission) {
    return (
      <AppShell>
        <div className="mx-auto max-w-lg py-16 text-center">
          <h1 className="text-lg font-semibold text-foreground">Mission not found</h1>
          <p className="mt-2 text-sm text-muted">
            This mission is not in your local state. Reset from Settings or return to the
            list.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/missions" className="text-sm font-medium text-accent hover:underline">
              Back to Missions
            </Link>
            <Link href="/settings" className="text-sm font-medium text-accent hover:underline">
              Settings
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const pendingDecisions = missionDecisions.filter((d) => d.status === "pending");
  const activeTasks = missionTasks.filter((t) => t.status !== "completed");
  const taskCounts = countTasksByStatus(tasks, missionId);
  const recentlyUpdatedTask = getRecentlyUpdatedTask(missionTasks, missionId);
  const judgmentSpawnedCount = countJudgmentSpawnedTasks(tasks, missionId);
  const relatedBranches = getBranchesForMissionId(mission);
  const relatedPrs = getPullRequestsForMissionId(mission);
  const memoryInsights = getMemoriesForMissionId(mission);
  const release = getReleaseForMissionId(missionId);

  const hasPendingDecisions = pendingDecisions.length > 0;
  const hasCode = relatedBranches.length > 0 || relatedPrs.length > 0;
  const hasFeed = missionFeed.length > 0;

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/missions"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Missions
        </Link>
        <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className="text-muted">Related:</span>
          <Link
            href={`/tasks?mission=${missionId}`}
            className="transition-colors hover:text-accent"
          >
            Tasks
          </Link>
          {hasPendingDecisions && (
            <Link
              href={`/judgment?mission=${missionId}`}
              className="transition-colors hover:text-accent"
            >
              Judgment
            </Link>
          )}
          {hasCode && (
            <Link href="/code-release" className="transition-colors hover:text-accent">
              Code & Release
            </Link>
          )}
          {hasFeed && (
            <Link
              href={`/organization-feed?mission=${missionId}`}
              className="transition-colors hover:text-accent"
            >
              Organization Feed
            </Link>
          )}
        </nav>
      </div>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{mission.name}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
            {mission.description}
          </p>
          <p className="mt-2 max-w-3xl text-sm text-foreground">{mission.summary}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatusPill variant={statusVariant[mission.status]}>{mission.status}</StatusPill>
            <StatusPill variant={healthVariant[mission.health]}>{mission.health}</StatusPill>
            <span className="text-xs text-muted">Updated {mission.updatedAt}</span>
          </div>
        </div>
        <div className="w-full max-w-xs">
          <ProgressBar value={mission.progress} showLabel />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <SectionHeader
              title="Current Lifecycle Phase"
              description={`Active phase: ${mission.lifecycle}`}
            />
            <LifecycleStepper currentPhase={mission.lifecycle} />
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <SectionHeader title="Requirements Summary" />
              <p className="text-sm leading-relaxed text-muted">
                {mission.requirementsSummary}
              </p>
            </Card>
            <Card>
              <SectionHeader title="Architecture Summary" />
              <p className="text-sm leading-relaxed text-muted">
                {mission.architectureSummary}
              </p>
            </Card>
          </div>

          <Card>
            <SectionHeader title="Assigned AI Team" />
            <div className="flex flex-wrap gap-4">
              {mission.assignedAgents.map((role) => (
                <AgentAvatar key={role} role={role} />
              ))}
            </div>
          </Card>

          <Card>
            <SectionHeader title="Task Summary" description="Execution state for this mission" />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-surface p-3">
                <p className="text-xs font-medium uppercase text-muted">Active</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {taskCounts.active + taskCounts.in_review}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-3">
                <p className="text-xs font-medium uppercase text-muted">Blocked</p>
                <p className="mt-1 text-2xl font-semibold text-danger">{taskCounts.blocked}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-3">
                <p className="text-xs font-medium uppercase text-muted">Completed</p>
                <p className="mt-1 text-2xl font-semibold text-success">{taskCounts.completed}</p>
              </div>
            </div>
            {recentlyUpdatedTask ? (
              <div className="mt-4 rounded-lg border border-border bg-surface p-3">
                <p className="text-xs font-medium uppercase text-muted">Recently updated</p>
                <Link
                  href={`/tasks/${recentlyUpdatedTask.id}`}
                  className="mt-1 block text-sm font-medium text-foreground hover:text-accent"
                >
                  {recentlyUpdatedTask.title}
                </Link>
                <p className="mt-1 text-xs text-muted">
                  {recentlyUpdatedTask.status}
                  {recentlyUpdatedTask.updatedAt ? ` · ${recentlyUpdatedTask.updatedAt}` : ""}
                </p>
              </div>
            ) : null}
            <Link
              href={`/tasks?mission=${missionId}`}
              className="mt-3 inline-block text-xs font-medium text-accent hover:underline"
            >
              Open all tasks →
            </Link>
          </Card>

          <Card>
            <SectionHeader title="Active Tasks" />
            {activeTasks.length === 0 ? (
              <p className="text-sm text-muted">No active tasks.</p>
            ) : (
              <ul className="divide-y divide-border">
                {activeTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <Link
                        href={`/tasks/${task.id}`}
                        className="text-sm font-medium text-foreground hover:text-accent"
                      >
                        {task.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted">
                        {task.assignedTo} · ETA {task.eta}
                        {task.dependencies.length > 0 &&
                          ` · Depends: ${task.dependencies.join(", ")}`}
                      </p>
                    </div>
                    <StatusPill variant={taskStatusVariant[task.status]}>
                      {task.status}
                    </StatusPill>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href={`/tasks?mission=${missionId}`}
              className="mt-3 inline-block text-xs font-medium text-accent hover:underline"
            >
              View all tasks →
            </Link>
          </Card>

          <Card>
            <SectionHeader
              title="Pending Decisions"
              description={
                judgmentSpawnedCount > 0
                  ? `${judgmentSpawnedCount} task(s) created from judgment on this mission`
                  : undefined
              }
            />
            {pendingDecisions.length === 0 ? (
              <p className="text-sm text-muted">No decisions awaiting CEO judgment.</p>
            ) : (
              <ul className="space-y-3">
                {pendingDecisions.map((d) => {
                  const linkedCount = getLinkedTasksForDecision(
                    missionTasks,
                    d.id,
                    d.relatedTaskIds
                  ).length;
                  return (
                    <li
                      key={d.id}
                      className="rounded-lg border border-border bg-surface p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{d.title}</p>
                        <StatusPill variant={d.priority === "high" ? "danger" : "warning"}>
                          {d.priority}
                        </StatusPill>
                      </div>
                      <p className="mt-1 text-sm text-muted">{d.summary}</p>
                      {linkedCount > 0 ? (
                        <p className="mt-2 text-xs text-muted">
                          {linkedCount} linked task{linkedCount === 1 ? "" : "s"}
                        </p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap gap-3">
                        <Link
                          href={`/judgment?mission=${missionId}`}
                          className="text-xs font-medium text-accent hover:underline"
                        >
                          Open in Judgment Center →
                        </Link>
                        {linkedCount > 0 ? (
                          <Link
                            href={`/tasks?mission=${missionId}`}
                            className="text-xs font-medium text-accent hover:underline"
                          >
                            Open Tasks →
                          </Link>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card>
            <SectionHeader title="Code — Branches & Pull Requests" />
            {relatedBranches.length === 0 && relatedPrs.length === 0 ? (
              <p className="text-sm text-muted">No linked branches or pull requests yet.</p>
            ) : (
              <div className="space-y-4">
                {relatedBranches.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase text-muted">Branches</p>
                    <ul className="space-y-2">
                      {relatedBranches.map((b) => (
                        <li
                          key={b.name}
                          className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                        >
                          <span className="font-mono text-accent">{b.name}</span>
                          <span className="text-xs text-muted">
                            +{b.ahead} / -{b.behind} · {b.lastCommit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {relatedPrs.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase text-muted">
                      Pull Requests
                    </p>
                    <ul className="space-y-2">
                      {relatedPrs.map((pr) => (
                        <li
                          key={pr.id}
                          className="flex items-start gap-2 rounded-lg border border-border px-3 py-2"
                        >
                          <GitPullRequest className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              #{pr.number} {pr.title}
                            </p>
                            <p className="text-xs text-muted">
                              {pr.branch} · {pr.author} · {pr.status}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <SectionHeader title="Release Readiness" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold text-foreground">
                  {mission.releaseReadiness.score}%
                </span>
                <StatusPill
                  variant={
                    mission.releaseReadiness.score >= 80
                      ? "success"
                      : mission.releaseReadiness.score >= 50
                        ? "warning"
                        : "muted"
                  }
                >
                  {mission.releaseReadiness.label}
                </StatusPill>
              </div>
              <ProgressBar value={mission.releaseReadiness.score} />
              <p className="text-sm text-muted">{mission.releaseReadiness.summary}</p>
              {mission.releaseReadiness.blockers.length > 0 && (
                <ul className="space-y-1 border-t border-border pt-3">
                  {mission.releaseReadiness.blockers.map((b) => (
                    <li key={b} className="text-sm text-danger">
                      · {b}
                    </li>
                  ))}
                </ul>
              )}
              {release && (
                <p className="text-xs text-muted">
                  Candidate: v{release.version} ({release.state})
                </p>
              )}
            </div>
          </Card>

          <Card>
            <SectionHeader
              title="Runtime Signals"
              description="Operational provider health affecting this mission"
            />
            <ul className="space-y-2">
              {runtimeSignals.map((signal) => (
                <li
                  key={signal.id}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
                >
                  <StatusPill variant={signalVariant[signal.severity]} className="mb-1">
                    {signal.severity}
                  </StatusPill>
                  <span className="text-muted">{signal.message}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/runtime-cost"
              className="mt-3 inline-block text-xs font-medium text-accent hover:underline"
            >
              Open Runtime & Cost →
            </Link>
          </Card>

          <Card>
            <SectionHeader title="Blockers" />
            {mission.blockers.length === 0 ? (
              <p className="text-sm text-muted">None</p>
            ) : (
              <ul className="space-y-2">
                {mission.blockers.map((b) => (
                  <li key={b} className="text-sm text-danger">
                    · {b}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <SectionHeader title="Recent Activity" />
            <ul className="space-y-3">
              {recentActivityWithTasks.map((item) => (
                <li key={item.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <p className="text-xs text-muted">
                    {item.meta} · {item.timestamp}
                  </p>
                  <p className="mt-0.5 text-sm text-foreground">{item.message}</p>
                </li>
              ))}
            </ul>
            {hasFeed && (
              <Link
                href={`/organization-feed?mission=${missionId}`}
                className="mt-3 inline-block text-xs font-medium text-accent hover:underline"
              >
                View full Organization Feed →
              </Link>
            )}
          </Card>

          <Card>
            <SectionHeader title="Memory Insights" />
            {memoryInsights.length === 0 ? (
              <p className="text-sm text-muted">No linked memories for this mission.</p>
            ) : (
              <>
                <ul className="space-y-3">
                  {memoryInsights.map((m) => (
                    <li key={m.id} className="rounded-lg border border-border bg-surface p-3">
                      <p className="text-sm font-medium text-foreground">{m.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted">{m.summary}</p>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/memory"
                  className="mt-3 inline-block text-xs font-medium text-accent hover:underline"
                >
                  Open Memory Vault →
                </Link>
              </>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
