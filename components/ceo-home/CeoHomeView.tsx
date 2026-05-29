"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, StatCard } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { MissionLink } from "@/components/MissionLink";
import { computeOrganizationHealth } from "@/lib/store/computeOrganizationHealth";
import { useMissionStore } from "@/lib/store/missionStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { useRuntimeStore } from "@/lib/store/runtimeStore";
import { useSyncStore } from "@/lib/store/syncStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { useProcessingStore } from "@/lib/store/processingStore";
import { buildProcessingAnalytics } from "@/lib/orchestration/processing/processingAnalytics";
import { GovernanceHealthBadge } from "@/components/orchestration/GovernanceHealthBadge";
import { ExecutiveSnapshotCard } from "@/components/orchestration/ExecutiveSnapshotCard";
import { buildExecutiveGovernanceSnapshot } from "@/lib/orchestration/governance-history/governanceSnapshot";
import { buildGovernanceReplay } from "@/lib/orchestration/governance-history/governanceReplay";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";
import { buildReplayHref } from "@/lib/replay-query/replayQueryNavigation";
import { ReplayNavigationContext } from "@/components/orchestration/ReplayNavigationContext";
import { ReplayQuerySummary } from "@/components/orchestration/ReplayQuerySummary";
import { replayWindowDescriptions } from "@/lib/replay-query/replayLabels";
import { GovernanceExplainabilityCard } from "@/components/orchestration/GovernanceExplainabilityCard";
import { DecisionAttentionQueue } from "@/components/orchestration/DecisionAttentionQueue";
import { getDependencyWarnings } from "@/lib/task/taskDependencies";
import { getImportantTasks, getRecentlyCreatedTasks } from "@/lib/task/taskSelectors";
import { getBlockerAge } from "@/lib/task/missionExecutionInsights";
import { StatusPill } from "@/components/StatusPill";
import type { TaskStatus } from "@/types/productai";
import { agents } from "@/data/mockData";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { getContinuityStabilityLabel } from "@/lib/replay-query/replayDiagnosticsHelpers";
import { getReplayValidationMetrics } from "@/lib/replay-query/replayValidationMetrics";
import { buildDecisionAttentionQueue } from "@/lib/orchestration/decision-attention/decisionAttention";
import { buildDecisionAttentionFeedEvent } from "@/lib/orchestration/queue/queueFeed";
import { ExecutiveWalkthroughPanel } from "@/components/orchestration/ExecutiveWalkthroughPanel";
import { ExecutiveReplayWorkspace } from "@/components/orchestration/ExecutiveReplayWorkspace";
import { ExecutiveGovernanceWorkspace } from "@/components/orchestration/ExecutiveGovernanceWorkspace";
import { useReplayPersonalizationStore } from "@/lib/store/replayPersonalizationStore";
import { KnowledgeGraphSummaryPanel } from "@/components/orchestration/KnowledgeGraphSummary";
import { useGovernanceKnowledgeGraph } from "@/lib/hooks/useGovernanceKnowledgeGraph";
import { useDecisionMemoryAtlas } from "@/lib/hooks/useDecisionMemoryAtlas";
import { DecisionAtlasSummaryPanel } from "@/components/orchestration/DecisionAtlasSummary";
import { useDecisionTraceability } from "@/lib/hooks/useDecisionTraceability";
import { TraceabilitySummaryPanel } from "@/components/orchestration/TraceabilitySummary";
import { MissionTeamOverviewPanel } from "@/components/mission-team/MissionTeamPanel";
import { useIdeaWorkspace } from "@/lib/hooks/useIdeaWorkspace";
import { IdeaSummaryCard } from "@/components/idea/IdeaSummaryCard";
import { ProductBriefSummary } from "@/components/brief/ProductBriefSummary";
import { useProductBriefWorkspace } from "@/lib/hooks/useProductBriefWorkspace";
import { DirectorWorkspaceSummary } from "@/components/director/DirectorWorkspaceSummary";
import { useDirectorWorkspace } from "@/lib/hooks/useDirectorWorkspace";
import { ArchitectWorkspaceSummary } from "@/components/architect/ArchitectWorkspaceSummary";
import { useArchitectWorkspace } from "@/lib/hooks/useArchitectWorkspace";
import { DesignerWorkspaceSummary } from "@/components/designer/DesignerWorkspaceSummary";
import { useDesignerWorkspace } from "@/lib/hooks/useDesignerWorkspace";
import { CooWorkspaceSummaryPanel } from "@/components/coo/CooRecommendationsPanel";
import { useCooWorkspace } from "@/lib/hooks/useCooWorkspace";
import { DeliveryOverviewCard } from "@/components/delivery/DeliverySummaryCard";
import { useDeliveryWorkspace } from "@/lib/hooks/useDeliveryWorkspace";
import { branches, commits, memories, pullRequests, releases } from "@/data/mockData";
import { RepositoryOverviewCard } from "@/components/repository/RepositorySummaryCard";
import { useRepositoryWorkspace } from "@/lib/hooks/useRepositoryWorkspace";
import { ReleaseOverviewCard } from "@/components/release/ReleaseSummaryCard";
import { useReleaseWorkspace } from "@/lib/hooks/useReleaseWorkspace";
import { OutcomeOverviewCard } from "@/components/outcome/OutcomeSummaryCard";
import { useOutcomeWorkspace } from "@/lib/hooks/useOutcomeWorkspace";
import { LifecycleSummaryCard } from "@/components/lifecycle/LifecycleSummaryCard";
import { useLifecycleWorkspace } from "@/lib/hooks/useLifecycleWorkspace";
import { HandoffSummaryCard } from "@/components/handoff/HandoffSummaryCard";
import { useHandoffWorkspace } from "@/lib/hooks/useHandoffWorkspace";
import { ArtifactReviewSummary } from "@/components/review/ArtifactReviewSummary";
import { useReviewWorkspace } from "@/lib/hooks/useReviewWorkspace";

const healthVariant = {
  stable: "success" as const,
  delayed: "warning" as const,
  risky: "warning" as const,
  blocked: "danger" as const,
};

const taskStatusVariant: Record<TaskStatus, "info" | "warning" | "danger" | "success"> = {
  active: "info",
  in_review: "warning",
  blocked: "danger",
  completed: "success",
};

interface CeoHomeViewProps {
  replayQuery: ReplayQueryState;
}

export function CeoHomeView({ replayQuery }: CeoHomeViewProps) {
  const preferredInterpretationPreset = useReplayPersonalizationStore(
    (s) => s.preferredInterpretationPreset
  );
  const missions = useMissionStore((s) => s.missions);
  const decisions = useOrganizationStore((s) => s.decisions);
  const feedItems = useOrganizationStore((s) => s.organizationFeedItems);
  const addFeedItemWithSync = useOrganizationStore((s) => s.addFeedItemWithSync);
  const runtimeAlerts = useRuntimeStore((s) => s.alerts);
  const syncWarnings = useSyncStore((s) => s.syncWarnings);
  const tasks = useTaskStore((s) => s.tasks);
  const processingSessions = useProcessingStore((s) => s.getSessions());
  const processingAuditTrail = useProcessingStore((s) => s.getAuditTrail());
  const filteredProcessingSessions = processingSessions.filter((session) => {
    if (replayQuery.mission !== "all" && session.missionId !== replayQuery.mission) return false;
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
    if (replayQuery.advisory === "advisory" && !session.activeReasons.some((reason) => reason.advisoryOnly))
      return false;
    if (replayQuery.advisory === "decision" && !session.activeReasons.some((reason) => !reason.advisoryOnly))
      return false;
    if (
      replayQuery.governance === "runtime" &&
      !session.activeReasons.some((r) => r.category === "runtime_stability")
    ) {
      return false;
    }
    return true;
  });
  const importantTasks = getImportantTasks(tasks, 6);
  const recentlyCreated = getRecentlyCreatedTasks(tasks, 5);
  const dependencyWarnings = getDependencyWarnings(tasks).slice(0, 5);
  const blockedMissions = missions.filter((m) => m.health === "blocked" || m.health === "risky");
  const reviewBottlenecks = tasks.filter((t) => t.status === "in_review").length;
  const runtimeImpacted = tasks.filter((t) =>
    (t.events ?? []).some((e) => e.source === "runtime" || /runtime|latency|provider/i.test(e.message))
  ).length;

  const orgHealth = computeOrganizationHealth(missions, runtimeAlerts);
  const activeMissions = missions.filter((m) => m.status === "active" || m.status === "planning");
  const pendingDecisions = decisions.filter((d) => d.status === "pending");
  const processingAnalytics = buildProcessingAnalytics(filteredProcessingSessions);
  const executiveSnapshot = buildExecutiveGovernanceSnapshot({
    processingSessions: filteredProcessingSessions,
    runtimeAlerts,
    syncWarnings,
    feedItems,
  });
  const missionRiskRows = Object.entries(processingAnalytics.missionRisk)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const replayHref = useMemo(() => buildReplayHref("/runtime-cost", replayQuery), [replayQuery]);
  const replay = useMemo(
    () =>
      buildGovernanceReplay({
        processingSessions: filteredProcessingSessions,
        processingAuditTrail,
        feedItems,
        runtimeAlerts,
        syncWarnings,
        replayQuery,
      }),
    [feedItems, filteredProcessingSessions, processingAuditTrail, replayQuery, runtimeAlerts, syncWarnings]
  );
  const diagnostics = replay.diagnostics;
  const validationMetrics = getReplayValidationMetrics();
  const decisionAttentionItems = useMemo(
    () =>
      buildDecisionAttentionQueue({
        replayDiagnostics: diagnostics,
        memoryItems: replay.memoryItems,
        processingSessions: filteredProcessingSessions,
        runtimeAlerts,
        replayQuery,
      }),
    [diagnostics, filteredProcessingSessions, replay.memoryItems, replayQuery, runtimeAlerts]
  );
  const { summary: knowledgeGraphSummary } = useGovernanceKnowledgeGraph(decisionAttentionItems);
  const { summary: decisionAtlasSummary } = useDecisionMemoryAtlas(decisionAttentionItems);
  const { summary: traceabilitySummary } = useDecisionTraceability(decisionAttentionItems);
  const { summary: cooWorkspaceSummary } = useCooWorkspace({
    missions,
    tasks,
    decisionAttention: decisionAttentionItems,
  });
  const { overview: deliveryOverview } = useDeliveryWorkspace({
    missions,
    tasks,
    pullRequests,
    releases,
  });
  const { overview: repositoryOverview } = useRepositoryWorkspace({
    missions,
    tasks,
    branches,
    pullRequests,
    releases,
    commits,
  });
  const { overview: releaseOverview } = useReleaseWorkspace({
    missions,
    tasks,
    pullRequests,
    releases,
  });
  const { overview: outcomeOverview } = useOutcomeWorkspace({
    missions,
    tasks,
    memories,
    feedItems,
    releases,
    pullRequests,
  });
  const { overview: lifecycleOverview } = useLifecycleWorkspace({
    missions,
    tasks,
    pullRequests,
    releases,
    memories,
    feedItems,
  });
  const { ceoSummary: handoffCeoSummary } = useHandoffWorkspace({
    missions,
    tasks,
  });
  const { ceoSummary: reviewCeoSummary } = useReviewWorkspace({
    missions,
    tasks,
  });
  const { overview: ideaOverview } = useIdeaWorkspace({ missions });
  const { overview: productBriefOverview } = useProductBriefWorkspace({ missions });
  const { overview: directorPlanningOverview } = useDirectorWorkspace({ missions, tasks });
  const { overview: architectureOverview } = useArchitectWorkspace({ missions, tasks });
  const { overview: designOverview } = useDesignerWorkspace({ missions, tasks });

  const operationalAlerts = [
    ...runtimeAlerts.slice(0, 3).map((a) => ({
      id: a.id,
      severity: a.severity,
      message: a.message,
      timestamp: a.timestamp,
      relatedMissionId: undefined as string | undefined,
      missionName: undefined as string | undefined,
    })),
    ...missions
      .filter((m) => m.health === "risky" || m.health === "delayed")
      .slice(0, 2)
      .map((m) => ({
        id: `mission-${m.id}`,
        severity: m.health === "risky" ? ("warning" as const) : ("info" as const),
        message: `${m.name} requires attention — ${m.health}`,
        timestamp: m.updatedAt,
        relatedMissionId: m.id,
        missionName: m.name,
      })),
  ].slice(0, 5);

  return (
    <AppShell
      title="CEO Home"
      description="Executive operational overview of your AI product organization"
    >
      <div className="space-y-8">
        <ReplayQuerySummary query={replayQuery} />
        <p className="text-xs text-muted">{replayWindowDescriptions[replayQuery.replayWindow]}</p>
        {replayQuery.governanceAttention !== "all" ? (
          <p className="text-xs text-muted">
            Executive attention context is active ({replayQuery.governanceAttention.replaceAll("_", " ")}) and
            preserved across replay navigation.
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Organization Health"
            value={`${orgHealth.score}%`}
            subtext={orgHealth.label}
          />
          <StatCard
            label="Active Missions"
            value={activeMissions.length}
            subtext="Across product portfolio"
          />
          <StatCard
            label="Pending Approvals"
            value={pendingDecisions.length}
            subtext="Require your judgment"
          />
          <StatCard
            label="Weekly Velocity"
            value="72%"
            subtext="Tasks completed vs planned"
            trend="up"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Recently Created Tasks" description="Work spawned from judgment and coordination">
            {recentlyCreated.length === 0 ? (
              <p className="text-sm text-muted">No judgment-driven tasks yet. Create one from Judgment Center.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recentlyCreated.map((task) => (
                  <li key={task.id}>
                    <Link
                      href={`/tasks/${task.id}`}
                      className="group flex items-center justify-between gap-4 py-3 transition-colors first:pt-0 last:pb-0 hover:bg-surface/50"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground group-hover:text-accent">{task.title}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          <MissionLink missionId={task.missionId} missionName={task.missionName} variant="pill" />
                          {task.createdAt ? ` · ${task.createdAt}` : ""}
                        </p>
                      </div>
                      <StatusPill variant={taskStatusVariant[task.status]}>{task.status}</StatusPill>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/judgment" className="mt-3 inline-block text-xs font-medium text-accent hover:underline">
              Judgment Center →
            </Link>
          </Card>

          <Card title="Dependency Warnings" description="Tasks waiting on blocked upstream work">
            {dependencyWarnings.length === 0 ? (
              <p className="text-sm text-muted">No dependency blockers detected.</p>
            ) : (
              <ul className="space-y-3">
                {dependencyWarnings.map(({ task, blockedDependency }) => (
                  <li key={`${task.id}-${blockedDependency.id}`} className="rounded-lg border border-border bg-surface p-3">
                    <p className="text-sm text-foreground">
                      <Link href={`/tasks/${task.id}`} className="font-medium hover:text-accent">
                        {task.title}
                      </Link>
                      <span className="text-muted"> waiting on </span>
                      <Link href={`/tasks/${blockedDependency.id}`} className="font-medium hover:text-accent">
                        {blockedDependency.title}
                      </Link>
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Blocker status: {blockedDependency.status}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card title="Important Tasks" description="Blocked, in review, and recently updated work">
          {importantTasks.length === 0 ? (
            <p className="text-sm text-muted">No tasks need attention right now.</p>
          ) : (
            <ul className="divide-y divide-border">
              {importantTasks.map((task) => (
                <li key={task.id}>
                  <Link
                    href={`/tasks/${task.id}`}
                    className="group flex items-center justify-between gap-4 py-4 transition-colors first:pt-0 last:pb-0 hover:bg-surface/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground group-hover:text-accent">{task.title}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                        <MissionLink
                          missionId={task.missionId}
                          missionName={task.missionName}
                          variant="pill"
                        />
                        {task.updatedAt ? <span>· Updated {task.updatedAt}</span> : null}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                        Open execution console
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                    <StatusPill variant={taskStatusVariant[task.status]}>{task.status}</StatusPill>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/tasks"
            className="mt-4 inline-block text-xs font-medium text-accent hover:underline"
          >
            View all tasks →
          </Link>
        </Card>

        <Card title="Execution Risk Overview" description="Where mission flow is currently constrained">
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/missions" className="rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-background">
              <p className="text-xs font-medium uppercase text-muted">Missions with blockers</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{blockedMissions.length}</p>
            </Link>
            <Link href="/tasks?status=blocked" className="rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-background">
              <p className="text-xs font-medium uppercase text-muted">Blocked dependencies</p>
              <p className="mt-1 text-2xl font-semibold text-warning">{dependencyWarnings.length}</p>
            </Link>
            <Link href="/tasks?status=in_review" className="rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-background">
              <p className="text-xs font-medium uppercase text-muted">Review bottlenecks</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{reviewBottlenecks}</p>
            </Link>
            <Link href="/organization-feed?status=blocked&type=runtime" className="rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-background">
              <p className="text-xs font-medium uppercase text-muted">Runtime-impacted tasks</p>
              <p className="mt-1 text-2xl font-semibold text-danger">{runtimeImpacted}</p>
            </Link>
          </div>
          {blockedMissions.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {blockedMissions.slice(0, 4).map((mission) => (
                <li key={mission.id} className="rounded-lg border border-border bg-surface px-3 py-2">
                  <Link href={`/missions/${mission.id}`} className="text-sm font-medium text-foreground hover:text-accent">
                    {mission.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted">
                    {mission.health} · {mission.recentActivity}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </Card>

        <Card title="Governance Risk Summary" description="Executive visibility over processing continuity risk">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs text-muted">Governance continuity health</p>
            <GovernanceHealthBadge score={processingAnalytics.summary.governanceHealthScore} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href={replayHref} className="rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-background">
              <p className="text-xs font-medium uppercase text-muted">High severity items</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {processingAnalytics.summary.elevatedRiskCount}
              </p>
            </Link>
            <Link href={buildReplayHref("/runtime-cost", { ...replayQuery, review: "processing_review_required" })} className="rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-background">
              <p className="text-xs font-medium uppercase text-muted">Review-required sessions</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {processingAnalytics.summary.reviewRequiredCount}
              </p>
            </Link>
            <Link href={buildReplayHref("/runtime-cost", { ...replayQuery, reasonCategory: "runtime_stability" })} className="rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-background">
              <p className="text-xs font-medium uppercase text-muted">Runtime continuity concerns</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {processingAnalytics.summary.runtimeInstabilityCount}
              </p>
            </Link>
            <Link href={buildReplayHref("/runtime-cost", { ...replayQuery, review: "processing_paused" })} className="rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-background">
              <p className="text-xs font-medium uppercase text-muted">Processing pauses/revokes</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {
                  filteredProcessingSessions.filter(
                    (session) =>
                      session.processingStatus === "processing_paused" ||
                      session.processingStatus === "processing_revoked"
                  ).length
                }
              </p>
            </Link>
          </div>
          {missionRiskRows.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {missionRiskRows.map(([missionId, score]) => (
                <li key={missionId} className="rounded-lg border border-border bg-surface px-3 py-2">
                  <Link href={`/missions/${missionId}`} className="text-sm font-medium text-foreground hover:text-accent">
                    {missionId}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted">Governance risk density score: {score}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">No mission-level governance review load at this time.</p>
          )}
        </Card>

        <Card title="Governance Replay Diagnostics Summary" description="Cross-view continuity diagnostics for executive visibility">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-surface p-3">
              <p className="text-xs font-medium uppercase text-muted">Replay visibility score</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{diagnostics.replayVisibilityScore}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-3">
              <p className="text-xs font-medium uppercase text-muted">Replay confidence</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{diagnostics.replayConfidence}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-3">
              <p className="text-xs font-medium uppercase text-muted">Continuity stability</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{getContinuityStabilityLabel(diagnostics.continuityStability)}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-3">
              <p className="text-xs font-medium uppercase text-muted">Metadata completeness</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {Math.round(diagnostics.metadataCompletenessRatio * 100)}%
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">{diagnostics.continuityExplanation}</p>
          {diagnostics.diagnosticsWarnings.length > 0 ? (
            <ul className="mt-2 space-y-1 text-xs text-muted">
              {diagnostics.diagnosticsWarnings.slice(0, 4).map((warning) => (
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

        <ExecutiveReplayWorkspace
          replayQuery={replayQuery}
          replayDiagnostics={diagnostics}
          linkBasePath="/ceo-home"
        />

        <ExecutiveGovernanceWorkspace
          replayQuery={replayQuery}
          replayDiagnostics={diagnostics}
          interpretationPreset={preferredInterpretationPreset}
          linkBasePath="/ceo-home"
          onExportDigest={(text) => void navigator.clipboard.writeText(text)}
        />

        <Card
          title="Knowledge Graph Summary"
          description="Connected themes, review areas, and executive participation for CEO understanding"
        >
          <KnowledgeGraphSummaryPanel summary={knowledgeGraphSummary} compact />
        </Card>

        <Card
          title="Executive Decision Atlas Summary"
          description="Decision themes, review continuity, and executive participation across governance memory"
        >
          <DecisionAtlasSummaryPanel summary={decisionAtlasSummary} compact />
        </Card>

        <Card
          title="Executive Decision Traceability Summary"
          description="Top pathways, review paths, and continuity chains for explainability reading"
        >
          <TraceabilitySummaryPanel summary={traceabilitySummary} compact />
        </Card>

        <Card
          title="Mission Team Overview"
          description="Product planning, mission direction, architecture, development, and QA across active missions"
        >
          <MissionTeamOverviewPanel missions={missions} compact />
        </Card>

        <Card
          title="Idea Workspace Overview"
          description="CEO ideas, Product Brief drafts, and approved briefs—the ProductAI entry point"
          action={
            <Link href="/idea-workspace" className="text-xs text-accent hover:underline">
              Open Idea Workspace
            </Link>
          }
        >
          <IdeaSummaryCard summary={ideaOverview} compact />
        </Card>

        <Card
          title="Product Brief Overview"
          description="Draft briefs, under review, approved, and Director-ready planning artifacts"
          action={
            <Link href="/product-brief" className="text-xs text-accent hover:underline">
              Open Product Brief Workspace
            </Link>
          }
        >
          <ProductBriefSummary summary={productBriefOverview} compact />
        </Card>

        <Card
          title="Director Planning Overview"
          description="Active mission plans, planning reviews, handoff candidates, and Architect-ready planning"
          action={
            <Link href="/director-workspace" className="text-xs text-accent hover:underline">
              Open Director Workspace
            </Link>
          }
        >
          <DirectorWorkspaceSummary summary={directorPlanningOverview} compact />
        </Card>

        <Card
          title="Architecture Overview"
          description="Technical specs, review candidates, design readiness, and open questions"
          action={
            <Link href="/architect-workspace" className="text-xs text-accent hover:underline">
              Open Architect Workspace
            </Link>
          }
        >
          <ArchitectWorkspaceSummary summary={architectureOverview} compact />
        </Card>

        <Card
          title="Design Overview"
          description="User flows, design reviews, development planning candidates, and open UX questions"
          action={
            <Link href="/designer-workspace" className="text-xs text-accent hover:underline">
              Open Designer Workspace
            </Link>
          }
        >
          <DesignerWorkspaceSummary summary={designOverview} compact />
        </Card>

        <Card
          title="AI COO Workspace Summary"
          description="Active missions, potential bottlenecks, review concentrations, and mission distribution"
          action={
            <Link href="/coo-workspace" className="text-xs text-accent hover:underline">
              Open COO Workspace
            </Link>
          }
        >
          <CooWorkspaceSummaryPanel summary={cooWorkspaceSummary} compact />
        </Card>

        <Card
          title="Delivery Overview"
          description="Active tasks, review concentration, release-ready missions, and delivery risks"
          action={
            <Link href="/delivery-workspace" className="text-xs text-accent hover:underline">
              Open Delivery Workspace
            </Link>
          }
        >
          <DeliveryOverviewCard overview={deliveryOverview} compact />
        </Card>

        <Card
          title="Repository Overview"
          description="Repositories, pull requests, reviews, release candidates, and coordination areas"
          action={
            <Link href="/repository-workspace" className="text-xs text-accent hover:underline">
              Open Repository Workspace
            </Link>
          }
        >
          <RepositoryOverviewCard overview={repositoryOverview} compact />
        </Card>

        <Card
          title="Release Readiness Overview"
          description="Ready for release, candidates, preparing missions, and potential risks"
          action={
            <Link href="/release-workspace" className="text-xs text-accent hover:underline">
              Open Release Workspace
            </Link>
          }
        >
          <ReleaseOverviewCard overview={releaseOverview} compact />
        </Card>

        <Card
          title="Code & Release Overview"
          description="Released missions, observed outcomes, validated outcomes, and follow-up reviews"
          action={
            <Link href="/code-release-workspace" className="text-xs text-accent hover:underline">
              Open Code & Release Workspace
            </Link>
          }
        >
          <OutcomeOverviewCard overview={outcomeOverview} compact />
        </Card>

        <Card
          title="Product Lifecycle Overview"
          description="Ideas through planning, development, QA, release, and outcome—one product journey view"
          action={
            <Link href="/product-lifecycle" className="text-xs text-accent hover:underline">
              Open Product Lifecycle
            </Link>
          }
        >
          <LifecycleSummaryCard summary={lifecycleOverview} compact ceoOverview />
        </Card>

        <Card
          title="AI Team Workflow Summary"
          description="Current role, pending reviews, waiting handoffs, and completed handoffs across the AI product organization"
          action={
            <Link href="/team-handoff" className="text-xs text-accent hover:underline">
              Open Team Workflow
            </Link>
          }
        >
          <HandoffSummaryCard compact ceoOverview ceoSummary={handoffCeoSummary} />
        </Card>

        <Card
          title="Artifact Review Overview"
          description="Pending reviews, in review, changes requested, and approved artifacts across the AI team"
          action={
            <Link href="/artifact-review" className="text-xs text-accent hover:underline">
              Open Artifact Reviews
            </Link>
          }
        >
          <ArtifactReviewSummary summary={reviewCeoSummary} compact ceoOverview />
        </Card>

        <ExecutiveWalkthroughPanel
          replayQuery={replayQuery}
          replayDiagnostics={diagnostics}
          attentionCount={decisionAttentionItems.length}
          linkBasePath="/ceo-home"
          compact
        />

        <DecisionAttentionQueue
          items={decisionAttentionItems}
          replayQuery={replayQuery}
          onGenerateFeedVisibility={(item) => {
            const feedEvent = buildDecisionAttentionFeedEvent({
              action: "decision_attention_generated",
              item,
              replayDiagnostics: diagnostics,
              memoryItems: replay.memoryItems,
              replayQuery,
            });
            addFeedItemWithSync(feedEvent);
          }}
        />

        <Card title="Governance Explainability" description="Cross-view explainability semantics aligned with runtime diagnostics">
          <GovernanceExplainabilityCard
            explanation={processingAnalytics.continuityExplanation}
            breakdown={processingAnalytics.scoreBreakdown}
            replayDiagnostics={diagnostics}
            scope={replayQuery.scope}
            replayWindow={replayQuery.replayWindow}
            compact
          />
        </Card>

        <Card title="Executive Governance Snapshot" description="Current governance context and focus">
          <ExecutiveSnapshotCard snapshot={executiveSnapshot} />
          <div className="mt-3">
            <ReplayNavigationContext runtimeHref={replayHref} feedHref={buildReplayHref("/organization-feed", replayQuery)} />
          </div>
        </Card>

        <Card title="Cross-mission Blocker List" description="Organization-wide execution bottlenecks">
          {tasks.filter((t) => t.status === "blocked").length === 0 ? (
            <p className="text-sm text-muted">No blocked tasks across missions.</p>
          ) : (
            <ul className="space-y-3">
              {tasks
                .filter((t) => t.status === "blocked")
                .slice(0, 8)
                .map((task) => {
                  const rootBlocker = task.dependencies[0] ?? "No explicit dependency";
                  const runtimeHit = (task.events ?? []).some(
                    (e) => e.source === "runtime" || /runtime|latency|provider/i.test(e.message)
                  );
                  const blockedAge = getBlockerAge(task);
                  return (
                    <li key={task.id} className="rounded-lg border border-border bg-surface p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Link href={`/tasks/${task.id}`} className="text-sm font-medium text-foreground hover:text-accent">
                          {task.title}
                        </Link>
                        <StatusPill variant="danger">blocked</StatusPill>
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        <MissionLink missionId={task.missionId} missionName={task.missionName} variant="pill" />
                        <span> · root blocker: {rootBlocker}</span>
                        <span> · deps: {task.dependencies.length}</span>
                        <span> · runtime: {runtimeHit ? "impacted" : "stable"}</span>
                        <span> · blocked for {blockedAge}</span>
                      </p>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs">
                        <Link href={`/tasks/${task.id}`} className="font-medium text-accent hover:underline">
                          Task detail →
                        </Link>
                        <Link href={`/missions/${task.missionId}`} className="font-medium text-accent hover:underline">
                          Mission detail →
                        </Link>
                      </div>
                    </li>
                  );
                })}
            </ul>
          )}
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Active Missions" description="Current product initiatives — open for detail">
            <ul className="divide-y divide-border">
              {missions
                .filter((m) => m.health !== "blocked")
                .slice(0, 4)
                .map((mission) => (
                  <li key={mission.id}>
                    <Link
                      href={`/missions/${mission.id}`}
                      className="group flex items-center justify-between py-4 transition-colors first:pt-0 last:pb-0 hover:bg-surface/50"
                    >
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="font-medium text-foreground group-hover:text-accent">
                          {mission.name}
                        </p>
                        <p className="mt-0.5 truncate text-sm text-muted">{mission.recentActivity}</p>
                        <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-surface">
                          <div
                            className="h-full rounded-full bg-accent transition-all"
                            style={{ width: `${mission.progress}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-muted">
                          Release readiness: {mission.releaseReadiness.score}% · {mission.status}
                        </p>
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                          View Details
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={healthVariant[mission.health]}>{mission.health}</Badge>
                        <span className="text-xs text-muted">{mission.progress}%</span>
                      </div>
                    </Link>
                  </li>
                ))}
            </ul>
          </Card>

          <Card title="Pending Approvals" description="Decisions awaiting CEO action">
            {pendingDecisions.length === 0 ? (
              <p className="text-sm text-muted">No pending approvals.</p>
            ) : (
              <ul className="space-y-3">
                {pendingDecisions.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4"
                  >
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted">
                        <MissionLink
                          missionId={item.relatedMissionId}
                          missionName={item.missionName}
                          variant="pill"
                        />
                        <span>· {item.priority} priority</span>
                      </p>
                      <Link
                        href={`/judgment?mission=${item.relatedMissionId}`}
                        className="mt-2 inline-block text-xs font-medium text-accent hover:underline"
                      >
                        Review in Judgment Center →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card
            title="AI Organization Status"
            description="Current activity across roles"
            className="lg:col-span-1"
          >
            <ul className="space-y-4">
              {agents.map((agent) => (
                <li key={agent.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {agent.name}{" "}
                      <span className="font-normal text-muted">({agent.role})</span>
                    </p>
                    <p className="text-xs text-muted">{agent.currentTask}</p>
                  </div>
                  <Badge
                    variant={
                      agent.status === "active"
                        ? "success"
                        : agent.status === "analyzing"
                          ? "info"
                          : agent.status === "reviewing"
                            ? "warning"
                            : "muted"
                    }
                  >
                    {agent.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>

          <Card
            title="Operational Alerts"
            description="Risks, incidents, and attention items"
            className="lg:col-span-2"
          >
            {operationalAlerts.length === 0 ? (
              <p className="text-sm text-muted">No active alerts.</p>
            ) : (
              <ul className="space-y-3">
                {operationalAlerts.map((alert) => (
                  <li
                    key={alert.id}
                    className="flex items-start gap-3 rounded-lg border border-border p-4"
                  >
                    {alert.severity === "danger" ? (
                      <AlertTriangle className="h-4 w-4 shrink-0 text-danger" />
                    ) : alert.severity === "warning" ? (
                      <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-info" />
                    )}
                    <div>
                      <p className="text-sm text-foreground">{alert.message}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted">
                        {alert.relatedMissionId && alert.missionName ? (
                          <>
                            <MissionLink
                              missionId={alert.relatedMissionId}
                              missionName={alert.missionName}
                              variant="pill"
                            />
                            <span>·</span>
                          </>
                        ) : null}
                        <span>{alert.timestamp}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
