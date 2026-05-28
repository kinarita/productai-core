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
import { MissionExecutionFlow } from "@/components/missions/MissionExecutionFlow";
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
import {
  getBlockerAge,
  getMissionDependencyInsights,
  getMissionExecutionCounts,
  getMissionExecutionFeed,
} from "@/lib/task/missionExecutionInsights";
import {
  dependencyStatusLabel,
  getBlockingTasks,
  getDependsOnTasks,
} from "@/lib/task/taskDependencies";
import { useUiStore } from "@/lib/store/uiStore";
import { ExecutionReadinessCard } from "@/components/orchestration/ExecutionReadinessCard";
import { useMaterializationStore } from "@/lib/store/materializationStore";
import { useExecutionQueueStore } from "@/lib/store/executionQueueStore";
import { useSyncStore } from "@/lib/store/syncStore";
import { useProcessingStore } from "@/lib/store/processingStore";
import { buildProcessingAnalytics } from "@/lib/orchestration/processing/processingAnalytics";
import { GovernanceHealthBadge } from "@/components/orchestration/GovernanceHealthBadge";
import { buildGovernanceReplay } from "@/lib/orchestration/governance-history/governanceReplay";
import { GovernanceHistoryPanel } from "@/components/orchestration/GovernanceHistoryPanel";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";
import { buildReplayHref } from "@/lib/replay-query/replayQueryNavigation";
import { ReplayNavigationContext } from "@/components/orchestration/ReplayNavigationContext";
import { ReplayQuerySummary } from "@/components/orchestration/ReplayQuerySummary";
import { replayWindowDescriptions } from "@/lib/replay-query/replayLabels";
import type { MissionHealth, MissionStatus, TaskStatus } from "@/types/productai";
import { getContinuityStabilityLabel } from "@/lib/replay-query/replayDiagnosticsHelpers";
import { getReplayValidationMetrics } from "@/lib/replay-query/replayValidationMetrics";
import { GovernanceExplainabilityCard } from "@/components/orchestration/GovernanceExplainabilityCard";
import { DecisionAttentionQueue } from "@/components/orchestration/DecisionAttentionQueue";
import { buildDecisionAttentionQueue } from "@/lib/orchestration/decision-attention/decisionAttention";
import { buildDecisionAttentionFeedEvent } from "@/lib/orchestration/queue/queueFeed";
import { ExecutiveWalkthroughPanel } from "@/components/orchestration/ExecutiveWalkthroughPanel";
import { ReplayBookmarkPanel } from "@/components/orchestration/ReplayBookmarkPanel";
import { GovernanceJournalPanel } from "@/components/orchestration/GovernanceJournalPanel";
import { ReplayInterpretationHistoryPanel } from "@/components/orchestration/ReplayInterpretationHistoryPanel";

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
  replayQuery: ReplayQueryState;
}

export function MissionDetailView({
  missionId,
  replayQuery,
}: MissionDetailViewProps) {
  const hydrated = useStoreHydration();
  const setActiveMission = useUiStore((s) => s.setActiveMission);
  const setSelectedMission = useMissionStore((s) => s.setSelectedMission);
  const allMissions = useMissionStore((s) => s.missions);

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
  const addFeedItemWithSync = useOrganizationStore((s) => s.addFeedItemWithSync);
  const providerHealth = useRuntimeStore((s) => s.providerHealth);
  const alerts = useRuntimeStore((s) => s.alerts);
  const syncWarnings = useSyncStore((s) => s.syncWarnings);
  const getReadinessSummary = useMaterializationStore((s) => s.getReadinessSummary);
  const getQueueForMission = useMaterializationStore((s) => s.getQueueForMission);

  const readinessSummary = useMemo(
    () => getReadinessSummary(missionId, syncWarnings.length),
    [getReadinessSummary, missionId, syncWarnings.length]
  );
  const executionQueue = useMemo(
    () => getQueueForMission(missionId),
    [getQueueForMission, missionId]
  );
  const missionQueueItems = useExecutionQueueStore((s) => s.getItemsForMission(missionId));
  const queueGovernance = useExecutionQueueStore((s) => s.getGovernanceSummary());
  const processingSessions = useProcessingStore((s) => s.getSessions());
  const processingAuditTrail = useProcessingStore((s) => s.getAuditTrail());

  const missionDecisions = useMemo(
    () => allDecisions.filter((d) => d.relatedMissionId === missionId),
    [allDecisions, missionId]
  );
  const missionProcessingSessions = useMemo(
    () => processingSessions.filter((session) => session.missionId === missionId),
    [missionId, processingSessions]
  );
  const filteredMissionProcessingSessions = useMemo(
    () =>
      missionProcessingSessions.filter((session) => {
        if (replayQuery.severity !== "all") {
          if (!session.activeReasons.some((reason) => reason.severity === replayQuery.severity)) return false;
        }
        if (
          (replayQuery.continuity === "degraded" ||
            replayQuery.continuity === "continuity_advisory") &&
          !session.reviewRequired
        )
          return false;
        if (
          (replayQuery.continuity === "stable" ||
            replayQuery.continuity === "continuity_stable") &&
          session.reviewRequired
        )
          return false;
        if (replayQuery.advisory === "advisory" && !session.activeReasons.some((reason) => reason.advisoryOnly)) {
          return false;
        }
        if (replayQuery.advisory === "decision" && !session.activeReasons.some((reason) => !reason.advisoryOnly)) {
          return false;
        }
        if (replayQuery.governance === "runtime") {
          return session.activeReasons.some(
            (reason) => reason.category === "runtime_stability" || reason.category === "provider_instability"
          );
        }
        return true;
      }),
    [missionProcessingSessions, replayQuery]
  );
  const missionProcessingAnalytics = useMemo(
    () => buildProcessingAnalytics(filteredMissionProcessingSessions),
    [filteredMissionProcessingSessions]
  );
  const missionNameMap = useMemo(
    () => Object.fromEntries((allMissions.length > 0 ? allMissions : seedMissions).map((m) => [m.id, m.name])),
    [allMissions]
  );

  const missionFeed = useMemo(
    () => allFeed.filter((f) => f.missionId === missionId),
    [allFeed, missionId]
  );
  const replay = useMemo(
    () =>
      buildGovernanceReplay({
        processingSessions: filteredMissionProcessingSessions,
        processingAuditTrail,
        feedItems: missionFeed,
        runtimeAlerts: alerts,
        syncWarnings,
        replayQuery: { ...replayQuery, mission: missionId },
      }),
    [
      alerts,
      filteredMissionProcessingSessions,
      missionFeed,
      missionId,
      processingAuditTrail,
      replayQuery,
      syncWarnings,
    ]
  );
  const replayDiagnostics = replay.diagnostics;
  const validationMetrics = getReplayValidationMetrics();
  const decisionAttentionItems = useMemo(
    () =>
      buildDecisionAttentionQueue({
        replayDiagnostics,
        memoryItems: replay.memoryItems,
        processingSessions: filteredMissionProcessingSessions,
        runtimeAlerts: alerts,
        replayQuery: { ...replayQuery, mission: missionId },
      }),
    [
      alerts,
      filteredMissionProcessingSessions,
      missionId,
      replay.memoryItems,
      replayDiagnostics,
      replayQuery,
    ]
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
  const executionCounts = getMissionExecutionCounts(missionTasks, missionDecisions.length);
  const dependencyInsights = getMissionDependencyInsights(missionTasks, tasks);
  const executionFeed = getMissionExecutionFeed(
    allFeed,
    missionId,
    missionTasks.map((t) => t.id)
  );
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
        <div className="flex flex-col gap-2">
          <Link
            href="/missions"
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Missions
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-xs text-muted">
            <Link href="/ceo-home" className="hover:text-accent">CEO Home</Link>
            <span>&gt;</span>
            <Link href="/missions" className="hover:text-accent">Missions</Link>
            <span>&gt;</span>
            <span className="text-foreground">{mission.name}</span>
          </nav>
        </div>
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
      <div className="mb-4">
        <ReplayQuerySummary query={replayQuery} />
        <p className="mt-1 text-xs text-muted">{replayWindowDescriptions[replayQuery.replayWindow]}</p>
        {replayQuery.governanceAttention !== "all" ? (
          <p className="mt-1 text-xs text-muted">
            Executive attention context is active ({replayQuery.governanceAttention.replaceAll("_", " ")}) for this
            mission replay view.
          </p>
        ) : null}
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

          <Card>
            <SectionHeader
              title="Mission Execution Map"
              description="Judgment → Tasks → Dependencies → QA → Mission readiness"
            />
            <div className="grid gap-4 lg:grid-cols-2">
              <MissionExecutionFlow missionId={missionId} counts={executionCounts} />
              <div className="space-y-3 rounded-lg border border-border bg-surface p-4">
                <p className="text-xs font-medium uppercase text-muted">Execution Health</p>
                <p className="text-sm text-muted">
                  Dependencies tracked: {executionCounts.dependencyRefs}
                </p>
                <p className="text-sm text-muted">
                  Blocked tasks: {executionCounts.blockedCount}
                </p>
                <p className="text-sm text-muted">
                  In review: {executionCounts.reviewCount}
                </p>
              </div>
            </div>
            {dependencyInsights.waitingChains.length > 0 ? (
              <div className="mt-4 rounded-lg border border-warning/30 bg-amber-50/40 px-4 py-3">
                <p className="text-sm font-medium text-warning">Dependency Blocker</p>
                <ul className="mt-2 space-y-1">
                  {dependencyInsights.waitingChains.slice(0, 3).map((chain) => (
                    <li key={`${chain.blockedTask.id}-${chain.blockedBy.id}`} className="text-sm text-foreground">
                      <Link href={`/tasks/${chain.blockedTask.id}`} className="font-medium text-accent hover:underline">
                        {chain.blockedTask.title}
                      </Link>
                      <span className="text-muted"> is waiting on </span>
                      <Link
                        href={`/tasks/${chain.blockedBy.id}`}
                        className="font-medium text-accent hover:underline"
                      >
                        {chain.blockedBy.title}
                      </Link>
                      <span className="text-muted"> · blocked for {chain.ageLabel}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
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
            <div className="mt-4 rounded-lg border border-border bg-surface p-3">
              <p className="text-xs font-medium uppercase text-muted">Task distribution</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
                {taskCounts.total > 0 ? (
                  <div className="flex h-full w-full">
                    <div
                      className="bg-blue-300"
                      style={{ width: `${(taskCounts.active / taskCounts.total) * 100}%` }}
                    />
                    <div
                      className="bg-amber-300"
                      style={{ width: `${(taskCounts.in_review / taskCounts.total) * 100}%` }}
                    />
                    <div
                      className="bg-red-300"
                      style={{ width: `${(taskCounts.blocked / taskCounts.total) * 100}%` }}
                    />
                    <div
                      className="bg-green-300"
                      style={{ width: `${(taskCounts.completed / taskCounts.total) * 100}%` }}
                    />
                  </div>
                ) : null}
              </div>
              <p className="mt-2 text-xs text-muted">
                Active {taskCounts.active} · Review {taskCounts.in_review} · Blocked {taskCounts.blocked} · Completed{" "}
                {taskCounts.completed}
              </p>
            </div>
          </Card>

          <Card>
            <SectionHeader title="Dependency Insights" description="What is slowing execution flow" />
            <ul className="space-y-2 text-sm">
              <li className="rounded-lg border border-border bg-surface px-3 py-2 text-muted">
                {dependencyInsights.warningsCount} tasks currently waiting on blocked dependencies.
              </li>
              <li className="rounded-lg border border-border bg-surface px-3 py-2 text-muted">
                {dependencyInsights.architectureWaiting} tasks waiting on architecture-owned dependencies.
              </li>
              <li className="rounded-lg border border-border bg-surface px-3 py-2 text-muted">
                {dependencyInsights.downstreamLinked} downstream task links across this mission.
              </li>
              <li className="rounded-lg border border-border bg-surface px-3 py-2 text-muted">
                {dependencyInsights.runtimeImpacted} tasks show runtime-related execution impact.
              </li>
              <li className="rounded-lg border border-border bg-surface px-3 py-2 text-muted">
                Longest blocker age:{" "}
                {dependencyInsights.waitingChains.length > 0
                  ? getBlockerAge(dependencyInsights.waitingChains[0].blockedTask)
                  : "none"}
              </li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              {dependencyInsights.causeTags.map((tag) => (
                <span key={tag} className="rounded border border-border bg-surface px-2 py-0.5 text-xs text-muted">
                  {tag}
                </span>
              ))}
            </div>
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
                      <div className="mt-1 flex flex-wrap gap-2 text-xs">
                        {getDependsOnTasks(task, tasks).slice(0, 2).map((dep) => (
                          <Link
                            key={`${task.id}-dep-${dep.id}`}
                            href={`/tasks/${dep.id}`}
                            className={`rounded border px-2 py-0.5 ${
                              dep.status === "blocked"
                                ? "border-warning/40 bg-amber-50 text-warning"
                                : "border-border bg-background text-muted"
                            }`}
                          >
                            Depends on: {dep.title} ({dependencyStatusLabel(dep.status)})
                          </Link>
                        ))}
                        {getBlockingTasks(task, missionTasks).slice(0, 1).map((down) => (
                          <Link
                            key={`${task.id}-block-${down.id}`}
                            href={`/tasks/${down.id}`}
                            className="rounded border border-border bg-background px-2 py-0.5 text-muted"
                          >
                            Blocking: {down.title}
                          </Link>
                        ))}
                      </div>
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
            <SectionHeader
              title="Execution Readiness"
              description="Governance-reviewed operational task preparation"
            />
            <ExecutionReadinessCard
              summary={readinessSummary}
              queueSize={executionQueue.length + missionQueueItems.length}
            />
            {missionQueueItems.length > 0 ? (
              <p className="mt-3 text-xs text-muted">
                Controlled queue: {missionQueueItems.length} task
                {missionQueueItems.length === 1 ? "" : "s"} ·{" "}
                {queueGovernance.awaitingAuthorization} awaiting authorization
              </p>
            ) : null}
          </Card>

          <Card>
            <SectionHeader
              title="Processing Governance Summary"
              description="Mission-level continuity and review visibility"
            />
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted">Continuity health</p>
              <GovernanceHealthBadge score={missionProcessingAnalytics.summary.governanceHealthScore} />
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-surface p-2 text-xs text-muted">
                Active sessions:{" "}
                <span className="font-medium text-foreground">
                  {missionProcessingAnalytics.summary.activeProcessingCount}
                </span>
              </div>
              <div className="rounded-lg border border-border bg-surface p-2 text-xs text-muted">
                Review required:{" "}
                <span className="font-medium text-foreground">
                  {missionProcessingAnalytics.summary.reviewRequiredCount}
                </span>
              </div>
              <div className="rounded-lg border border-border bg-surface p-2 text-xs text-muted">
                Paused/revoked:{" "}
                <span className="font-medium text-foreground">
                  {
                    missionProcessingSessions.filter(
                      (session) =>
                        session.processingStatus === "processing_paused" ||
                        session.processingStatus === "processing_revoked"
                    ).length
                  }
                </span>
              </div>
              <div className="rounded-lg border border-border bg-surface p-2 text-xs text-muted">
                Runtime advisories:{" "}
                <span className="font-medium text-foreground">
                  {missionProcessingAnalytics.summary.runtimeInstabilityCount}
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted">
              Governance continuity remains human-prioritized. Analytics are review guidance only.
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              <Link
                href={buildReplayHref("/runtime-cost", {
                  ...replayQuery,
                  mission: missionId,
                  review: "processing_review_required",
                })}
                className="font-medium text-accent hover:underline"
              >
                Open related processing review →
              </Link>
              <Link href={`/tasks?mission=${missionId}`} className="font-medium text-accent hover:underline">
                View mission tasks →
              </Link>
            </div>
          </Card>

          <Card>
            <SectionHeader
              title="Governance History"
              description="Mission-specific timeline and continuity context"
            />
            <GovernanceHistoryPanel replay={replay} missionId={missionId} missionNameMap={missionNameMap} />
            <div className="mt-3">
              <ReplayNavigationContext
                runtimeHref={buildReplayHref("/runtime-cost", { ...replayQuery, mission: missionId })}
                feedHref={buildReplayHref("/organization-feed", { ...replayQuery, mission: missionId })}
              />
            </div>
          </Card>

          <Card>
            <SectionHeader
              title="Mission Replay Diagnostics"
              description="Mission-scoped continuity semantics and visibility diagnostics"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-surface p-2 text-xs text-muted">
                Replay visibility score:{" "}
                <span className="font-medium text-foreground">{replayDiagnostics.replayVisibilityScore}</span>
              </div>
              <div className="rounded-lg border border-border bg-surface p-2 text-xs text-muted">
                Replay confidence:{" "}
                <span className="font-medium text-foreground">{replayDiagnostics.replayConfidence}</span>
              </div>
              <div className="rounded-lg border border-border bg-surface p-2 text-xs text-muted">
                Continuity stability:{" "}
                <span className="font-medium text-foreground">
                  {getContinuityStabilityLabel(replayDiagnostics.continuityStability)}
                </span>
              </div>
              <div className="rounded-lg border border-border bg-surface p-2 text-xs text-muted">
                Metadata completeness:{" "}
                <span className="font-medium text-foreground">
                  {Math.round(replayDiagnostics.metadataCompletenessRatio * 100)}%
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted">{replayDiagnostics.continuityExplanation}</p>
            <p className="mt-1 text-xs text-muted">{replayDiagnostics.visibilityExplanation}</p>
            {replayDiagnostics.diagnosticsWarnings.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs text-muted">
                {replayDiagnostics.diagnosticsWarnings.slice(0, 3).map((warning) => (
                  <li key={warning}>- {warning}</li>
                ))}
              </ul>
            ) : null}
            {process.env.NODE_ENV !== "production" ? (
              <p className="mt-2 text-[11px] text-muted">
                Dev normalization summary: alias normalized {validationMetrics.aliasNormalizationCount} times.
              </p>
            ) : null}
          </Card>

          <Card>
            <SectionHeader
              title="Replay bookmarks"
              description="Mission-scoped replay view continuity"
            />
            <ReplayBookmarkPanel
              currentReplayQuery={{ ...replayQuery, mission: missionId }}
              linkBasePath="/runtime-cost"
              focusCategory="governance_review"
              compact
            />
          </Card>

          <Card>
            <SectionHeader
              title="Governance journaling"
              description="Human interpretation continuity for this mission"
            />
            <GovernanceJournalPanel
              replayQuery={{ ...replayQuery, mission: missionId }}
              missionId={missionId}
              compact
            />
            <div className="mt-3">
              <ReplayInterpretationHistoryPanel
                replayQuery={{ ...replayQuery, mission: missionId }}
                replayDiagnostics={replayDiagnostics}
                linkBasePath="/runtime-cost"
                compact
              />
            </div>
          </Card>

          <ExecutiveWalkthroughPanel
            replayQuery={{ ...replayQuery, mission: missionId }}
            replayDiagnostics={replayDiagnostics}
            attentionCount={decisionAttentionItems.length}
            linkBasePath="/runtime-cost"
            compact
          />

          <DecisionAttentionQueue
            items={decisionAttentionItems}
            replayQuery={{ ...replayQuery, mission: missionId }}
            onGenerateFeedVisibility={(item) => {
              addFeedItemWithSync(
                buildDecisionAttentionFeedEvent({
                  action: "decision_attention_generated",
                  item,
                  replayDiagnostics,
                  memoryItems: replay.memoryItems,
                  replayQuery: { ...replayQuery, mission: missionId },
                })
              );
            }}
          />

          <Card>
            <SectionHeader
              title="Governance Explainability"
              description="Mission-level explainability aligned with cross-view replay diagnostics"
            />
            <GovernanceExplainabilityCard
              explanation={missionProcessingAnalytics.continuityExplanation}
              breakdown={missionProcessingAnalytics.scoreBreakdown}
              replayDiagnostics={replayDiagnostics}
              scope={replayQuery.scope}
              replayWindow={replayQuery.replayWindow}
              compact
            />
          </Card>

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
            {runtimeSignals.length === 0 ? (
              <p className="text-sm text-muted">
                No runtime alerts are currently affecting this mission.
              </p>
            ) : (
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
            )}
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
            <SectionHeader title="Execution Activity Stream" description="Feed items linked to execution path" />
            {executionFeed.length === 0 ? (
              <p className="text-sm text-muted">No execution feed items for this mission yet.</p>
            ) : (
              <ul className="space-y-2">
                {executionFeed.map((item) => (
                  <li key={item.id} className="rounded-lg border border-border bg-surface p-3">
                    <p className="text-xs text-muted">
                      {item.authorName} · {item.timestamp}
                    </p>
                    <p className="mt-1 text-sm text-foreground">{item.message}</p>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs">
                      {item.taskId ? (
                        <Link
                          href={`/tasks/${item.taskId}`}
                          className="font-medium text-accent hover:underline"
                        >
                          Open Task →
                        </Link>
                      ) : null}
                      <Link
                        href={`/organization-feed?mission=${missionId}${item.taskId ? `&task=${item.taskId}` : ""}`}
                        className="font-medium text-accent hover:underline"
                      >
                        Open in Feed →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
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
