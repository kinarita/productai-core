"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, StatCard } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { getPersistenceMode } from "@/lib/config/persistenceMode";
import { buildOrchestrationContext } from "@/lib/orchestration/contextBuilder";
import { GovernanceNote } from "@/components/orchestration/GovernanceNote";
import { getProductAIOrchestrator } from "@/lib/orchestration/orchestrator";
import { getExecutionPolicy } from "@/lib/orchestration/policy/executionPolicy";
import { getHandoffBoundaryMessage } from "@/lib/orchestration/execution/executionPolicy";
import { ExecutionReadinessCard } from "@/components/orchestration/ExecutionReadinessCard";
import { buildExecutionQueue } from "@/lib/orchestration/materialization/executionQueue";
import { useExecutionStore } from "@/lib/store/executionStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { useMaterializationStore } from "@/lib/store/materializationStore";
import { useMissionStore } from "@/lib/store/missionStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { useExecutionQueueStore } from "@/lib/store/executionQueueStore";
import { ExecutionQueueCard } from "@/components/orchestration/ExecutionQueueCard";
import { GovernanceAnalyticsCard } from "@/components/orchestration/GovernanceAnalyticsCard";
import { GovernanceExplainabilityCard } from "@/components/orchestration/GovernanceExplainabilityCard";
import { GovernanceFilterBar } from "@/components/orchestration/GovernanceFilterBar";
import { OperationalReplayPanel } from "@/components/orchestration/OperationalReplayPanel";
import { GovernanceTrendCard } from "@/components/orchestration/GovernanceTrendCard";
import { ReplayShareCard } from "@/components/orchestration/ReplayShareCard";
import { ReplaySummaryPanel } from "@/components/orchestration/ReplaySummaryPanel";
import { RuntimeLockBadge } from "@/components/orchestration/RuntimeLockBadge";
import { validateExecutionBoundary } from "@/lib/orchestration/queue/executionGate";
import { queueFeedMessage, queueFeedMetadata } from "@/lib/orchestration/queue/queueFeed";
import { useExecutionAuthorizationStore } from "@/lib/store/executionAuthorizationStore";
import { useExecuteStore } from "@/lib/store/executeStore";
import { useExecutionSessionStore } from "@/lib/store/executionSessionStore";
import { useProcessingStore } from "@/lib/store/processingStore";
import { describeAllExecutionBoundaries } from "@/lib/orchestration/execution/executionAdapters";
import { getOverallApiHealth, useRuntimeStore } from "@/lib/store/runtimeStore";
import { useSyncStore } from "@/lib/store/syncStore";
import {
  formatBackendHealthLabel,
  getSuggestedRetryLabel,
} from "@/lib/services/syncPolicyUi";
import { runtimeCosts } from "@/data/mockData";
import { resolveMissionLabel } from "@/lib/orchestration/processing/missionLabel";
import { buildProcessingAnalytics } from "@/lib/orchestration/processing/processingAnalytics";
import { buildGovernanceReplay } from "@/lib/orchestration/governance-history/governanceReplay";
import { buildExecutiveReplaySummary } from "@/lib/orchestration/governance-history/replaySummary";
import { useReplaySnapshotStore } from "@/lib/store/replaySnapshotStore";
import { replayQueryDefaults } from "@/lib/replay-query/replayQueryDefaults";
import { buildReplayQuery } from "@/lib/replay-query/replayQueryBuilder";
import { mergeReplayQuery, parseReplayQuery } from "@/lib/replay-query/replayQueryParser";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";
import { ReplayScopeSwitcher } from "@/components/orchestration/ReplayScopeSwitcher";
import { ReplayWindowSelector } from "@/components/orchestration/ReplayWindowSelector";
import { ReplayQuerySummary } from "@/components/orchestration/ReplayQuerySummary";
import { ReplayFilterChips } from "@/components/orchestration/ReplayFilterChips";
import { buildReplayMetadata } from "@/lib/replay-query/replayMetadata";
import { replayWindowDescriptions } from "@/lib/replay-query/replayLabels";
import { replaySeverityOptions } from "@/lib/replay-query/replayTokens";
import { getReplayValidationMetrics } from "@/lib/replay-query/replayValidationMetrics";
import { buildReplayDiagnostics } from "@/lib/replay-query/replayDiagnostics";

export function RuntimeCostView() {
  const validationMetrics = getReplayValidationMetrics();
  const [runtimeInsight, setRuntimeInsight] = useState<string | null>(null);
  const providerHealth = useRuntimeStore((s) => s.providerHealth);
  const tokenUsage = useRuntimeStore((s) => s.tokenUsage);
  const totalCostUsd = useRuntimeStore((s) => s.totalCostUsd);
  const projectedMonthlyUsd = useRuntimeStore((s) => s.projectedMonthlyUsd);
  const budgetUsd = useRuntimeStore((s) => s.budgetUsd);
  const alerts = useRuntimeStore((s) => s.alerts);
  const hydrationStatus = useSyncStore((s) => s.hydrationStatus);
  const lastHydratedAt = useSyncStore((s) => s.lastHydratedAt);
  const lastSuccessfulReadAt = useSyncStore((s) => s.lastSuccessfulReadAt);
  const lastSuccessfulWriteAt = useSyncStore((s) => s.lastSuccessfulWriteAt);
  const pendingHydrationCount = useSyncStore((s) => s.pendingHydrationCount);
  const backendHealth = useSyncStore((s) => s.backendHealth);
  const readFailures = useSyncStore((s) => s.readFailures);
  const writeFailures = useSyncStore((s) => s.writeFailures);
  const syncWarnings = useSyncStore((s) => s.syncWarnings);
  const governanceStats = useExecutionStore((s) => s.getGovernanceStats());
  const missionTickets = useExecutionStore((s) => s.tickets);
  const materializationRecords = useMaterializationStore((s) => s.records);
  const allTasks = useTaskStore((s) => s.tasks);
  const addFeedItem = useOrganizationStore((s) => s.addFeedItemWithSync);
  const feedItems = useOrganizationStore((s) => s.organizationFeedItems);
  const missions = useMissionStore((s) => s.missions);

  const orgReadinessSummary = {
    missionId: "organization",
    governanceReviewed: allTasks.filter(
      (t) => t.provenance?.executionReadiness === "governance_reviewed"
    ).length,
    executionReady: allTasks.filter(
      (t) => t.provenance?.executionReadiness === "execution_ready"
    ).length,
    blocked: allTasks.filter((t) => t.provenance?.executionReadiness === "blocked").length,
    pendingReview: governanceStats.pendingHandoffs,
    runtimeAdvisory:
      syncWarnings.length > 0 || alerts.length > 0
        ? "Runtime Observer advisory: review execution readiness before authorizing additional handoffs."
        : undefined,
  };

  const executionQueue = buildExecutionQueue(missionTickets, materializationRecords);
  const queueItems = useExecutionQueueStore((s) => s.items);
  const queueSummary = useExecutionQueueStore((s) => s.getGovernanceSummary());
  const runtimeLock = useExecutionQueueStore((s) => s.runtimeLock);
  const refreshRuntimeLock = useExecutionQueueStore((s) => s.refreshRuntimeLock);
  const authorizationSummary = useExecutionAuthorizationStore((s) => s.getSummary());
  const requestAuthorization = useExecutionAuthorizationStore((s) => s.requestAuthorization);
  const authorizeExecution = useExecutionAuthorizationStore((s) => s.authorizeExecution);
  const denyAuthorization = useExecutionAuthorizationStore((s) => s.denyAuthorization);
  const revokeAuthorization = useExecutionAuthorizationStore((s) => s.revokeAuthorization);
  const getRequestForQueueItem = useExecutionAuthorizationStore((s) => s.getRequestForQueueItem);
  const getAuditForQueueItem = useExecutionAuthorizationStore((s) => s.getAuditForQueueItem);
  const signatures = useExecutionAuthorizationStore((s) => s.signatures);
  const executeSummary = useExecuteStore((s) => s.getSummary());
  const requestExecuteReview = useExecuteStore((s) => s.requestExecuteReview);
  const markExecuteReady = useExecuteStore((s) => s.markExecuteReady);
  const denyExecuteReady = useExecuteStore((s) => s.denyExecuteReady);
  const revokeExecuteReady = useExecuteStore((s) => s.revokeExecuteReady);
  const getExecuteStub = useExecuteStore((s) => s.getStubForQueueItem);
  const getExecuteAudit = useExecuteStore((s) => s.getAuditForQueueItem);
  const sessionSummary = useExecutionSessionStore((s) => s.getSummary());
  const requestExecutionStart = useExecutionSessionStore((s) => s.requestExecutionStart);
  const confirmExecutionBoundary = useExecutionSessionStore((s) => s.confirmExecutionBoundary);
  const startExecutionSession = useExecutionSessionStore((s) => s.startExecutionSession);
  const denyExecutionStart = useExecutionSessionStore((s) => s.denyExecutionStart);
  const revokeExecutionSession = useExecutionSessionStore((s) => s.revokeExecutionSession);
  const getExecutionSession = useExecutionSessionStore((s) => s.getSessionForQueueItem);
  const getExecutionSessionAudit = useExecutionSessionStore((s) => s.getAuditForQueueItem);
  const processingSummary = useProcessingStore((s) => s.getSummary());
  const prepareProcessing = useProcessingStore((s) => s.prepareProcessing);
  const activateProcessing = useProcessingStore((s) => s.activateProcessing);
  const requestProcessingReview = useProcessingStore((s) => s.requestProcessingReview);
  const resumeProcessing = useProcessingStore((s) => s.resumeProcessing);
  const denyProcessing = useProcessingStore((s) => s.denyProcessing);
  const pauseProcessing = useProcessingStore((s) => s.pauseProcessing);
  const revokeProcessing = useProcessingStore((s) => s.revokeProcessing);
  const getProcessingSession = useProcessingStore((s) => s.getSessionForQueueItem);
  const getProcessingAudit = useProcessingStore((s) => s.getAuditForQueueItem);
  const processingSessions = useProcessingStore((s) => s.getSessions());
  const processingAuditTrail = useProcessingStore((s) => s.getAuditTrail());
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterAdvisory, setFilterAdvisory] = useState<string>("all");
  const [filterMission, setFilterMission] = useState<string>("all");
  const [filterReviewState, setFilterReviewState] = useState<string>("all");
  const [filterContinuity, setFilterContinuity] = useState<string>("all");
  const [timelineEventTypeFilter, setTimelineEventTypeFilter] = useState<string>("all");
  const [timelineSeverityFilter, setTimelineSeverityFilter] = useState<string>("all");
  const [timelineSourceFilter, setTimelineSourceFilter] = useState<string>("all");
  const [timelineReasonFilter, setTimelineReasonFilter] = useState<string>("all");
  const [replayQuery, setReplayQuery] = useState<ReplayQueryState>(replayQueryDefaults);
  const savedSnapshots = useReplaySnapshotStore((s) => s.snapshots);
  const recordSnapshot = useReplaySnapshotStore((s) => s.recordSnapshot);

  useEffect(() => {
    refreshRuntimeLock(syncWarnings.length, alerts.length);
  }, [syncWarnings.length, alerts.length, refreshRuntimeLock]);

  useEffect(() => {
    const parsed = parseReplayQuery(new URLSearchParams(window.location.search));
    setReplayQuery(parsed);
    setFilterMission(parsed.mission);
    setFilterSeverity(parsed.severity);
    setFilterAdvisory(parsed.advisory);
    setFilterReviewState(parsed.review);
    setFilterContinuity(parsed.continuity);
    setTimelineEventTypeFilter(parsed.eventType);
    setTimelineSeverityFilter(parsed.severity);
    setTimelineSourceFilter(parsed.source);
    setTimelineReasonFilter(parsed.reasonCategory);
  }, []);

  const apiHealth = getOverallApiHealth(providerHealth);
  const providerDegraded = providerHealth.some(
    (p) => p.health === "degraded" || p.health === "down"
  );
  const budgetUsed = Math.round((totalCostUsd / budgetUsd) * 100);

  const rows = runtimeCosts.map((mock) => {
    const live = providerHealth.find((p) => p.provider === mock.provider);
    return { ...mock, health: live?.health ?? mock.health };
  });

  const gemini = providerHealth.find((p) => p.provider === "Google Gemini");
  const persistenceMode = getPersistenceMode();
  const backendLabel = formatBackendHealthLabel(backendHealth);
  const retryLabel = getSuggestedRetryLabel(pendingHydrationCount);
  const healthBadgeVariant =
    hydrationStatus === "failed" || backendHealth === "unavailable"
      ? "warning"
      : "success";

  const generateRuntimeInsight = async () => {
    const orchestrator = getProductAIOrchestrator();
    const context = buildOrchestrationContext();
    const insight = await orchestrator.generateRuntimeObserverInsight(context);
    setRuntimeInsight(insight);
  };

  const filteredProcessingSessions = useMemo(() => {
    return processingSessions.filter((session) => {
      const reason = session.latestReviewReason;
      if (filterCategory !== "all" && reason?.category !== filterCategory) return false;
      if (filterSeverity !== "all" && reason?.severity !== filterSeverity) return false;
      if (filterAdvisory !== "all") {
        if (filterAdvisory === "advisory" && !reason?.advisoryOnly) return false;
        if (filterAdvisory === "decision" && reason?.advisoryOnly) return false;
      }
      if (filterMission !== "all" && session.missionId !== filterMission) return false;
      if (filterReviewState !== "all" && session.processingStatus !== filterReviewState) return false;
      if (filterContinuity !== "all") {
        if (
          (filterContinuity === "stable" || filterContinuity === "continuity_stable") &&
          session.reviewRequired
        )
          return false;
        if (
          (filterContinuity === "degraded" || filterContinuity === "continuity_advisory") &&
          !session.reviewRequired
        )
          return false;
      }
      return true;
    });
  }, [
    filterAdvisory,
    filterCategory,
    filterContinuity,
    filterMission,
    filterReviewState,
    filterSeverity,
    processingSessions,
  ]);

  const missionNameMap = useMemo(
    () => Object.fromEntries(missions.map((mission) => [mission.id, mission.name])),
    [missions]
  );
  const missionOptions = useMemo(
    () =>
      Array.from(new Set(processingSessions.map((session) => session.missionId))).map((missionId) => ({
        id: missionId,
        label: resolveMissionLabel({ missionId, missionNameMap }),
      })),
    [missionNameMap, processingSessions]
  );

  const filterQuery = useMemo(() => buildReplayQuery(replayQuery), [replayQuery]);

  const handleFilterChange = (
    key: "category" | "severity" | "advisory" | "mission" | "review" | "continuity",
    value: string
  ) => {
    if (key === "category") setFilterCategory(value);
    if (key === "severity") {
      setFilterSeverity(value);
      setTimelineSeverityFilter(value);
    }
    if (key === "advisory") setFilterAdvisory(value);
    if (key === "mission") setFilterMission(value);
    if (key === "review") setFilterReviewState(value);
    if (key === "continuity") setFilterContinuity(value);
    const mapKey: Record<string, keyof ReplayQueryState> = {
      mission: "mission",
      severity: "severity",
      advisory: "advisory",
      review: "review",
      continuity: "continuity",
      category: "reasonCategory",
    };
    const next = mergeReplayQuery(replayQuery, { [mapKey[key] ?? "mission"]: value } as Partial<ReplayQueryState>);
    setReplayQuery(next);
    window.history.replaceState({}, "", `/runtime-cost${buildReplayQuery(next)}`);
  };
  const handleReplayFilterChange = (
    key: "eventType" | "severity" | "source" | "reasonCategory",
    value: string
  ) => {
    if (key === "eventType") setTimelineEventTypeFilter(value);
    if (key === "severity") {
      setTimelineSeverityFilter(value);
      setFilterSeverity(value);
    }
    if (key === "source") setTimelineSourceFilter(value);
    if (key === "reasonCategory") setTimelineReasonFilter(value);
    const next = mergeReplayQuery(replayQuery, {
      eventType: key === "eventType" ? value : replayQuery.eventType,
      severity: key === "severity" ? value : replayQuery.severity,
      source: key === "source" ? value : replayQuery.source,
      reasonCategory: key === "reasonCategory" ? value : replayQuery.reasonCategory,
    });
    setReplayQuery(next);
    window.history.replaceState({}, "", `/runtime-cost${buildReplayQuery(next)}`);
  };
  const copyReplaySummary = () => {
    const text = [
      replaySummary.governanceHealthSummary,
      replaySummary.reviewPressureSummary,
      replaySummary.runtimeGovernanceSummary,
      ...replaySummary.keyContinuityDrivers,
      ...replaySummary.recommendedExecutiveFocus,
    ].join("\n");
    void navigator.clipboard.writeText(text);
    addFeedItem({
      type: "coordination",
      author: "COO",
      authorName: "Nova",
      missionId: "organization",
      missionName: "Organization",
      message: "COO prepared executive replay summary for sharing.",
      status: "active",
      requiresCeoApproval: false,
      ...buildReplayMetadata({
        governanceCategory: "governance_replay",
        replayCategory: "replay_summary",
        continuityCategory: "continuity_replay",
        advisoryLevel: "advisory_low",
        replayTags: ["replay", "summary", "export"],
        replaySeverity: "low",
        replaySource: "coo",
      }),
    });
  };
  const shareReplayView = () => {
    const href = `${window.location.origin}/runtime-cost${filterQuery}`;
    void navigator.clipboard.writeText(href);
    addFeedItem({
      type: "coordination",
      author: "COO",
      authorName: "Nova",
      missionId: "organization",
      missionName: "Organization",
      message: "COO shared replay view context for executive governance review.",
      status: "active",
      requiresCeoApproval: false,
      ...buildReplayMetadata({
        governanceCategory: "governance_replay",
        replayCategory: "replay_summary",
        continuityCategory: "continuity_replay",
        advisoryLevel: "advisory_low",
        replayTags: ["replay", "share", "continuity"],
        replaySeverity: "low",
        replaySource: "coo",
      }),
    });
  };

  const publishGovernanceSummary = () => {
    const metadata = queueFeedMetadata("processing_governance_summary");
    addFeedItem({
      type: "coordination",
      author: "COO",
      authorName: "Nova",
      missionId: "organization",
      missionName: "Organization",
      message: queueFeedMessage("processing_governance_summary"),
      status: "active",
      requiresCeoApproval: false,
      ...metadata,
    });
  };
  const filteredAnalytics = useMemo(
    () => buildProcessingAnalytics(filteredProcessingSessions),
    [filteredProcessingSessions]
  );
  const replay = useMemo(
    () =>
      buildGovernanceReplay({
        processingSessions: filteredProcessingSessions,
        processingAuditTrail,
        feedItems,
        runtimeAlerts: alerts,
        syncWarnings,
        persistedSnapshots: savedSnapshots,
        replayQuery,
      }),
    [alerts, feedItems, filteredProcessingSessions, processingAuditTrail, replayQuery, savedSnapshots, syncWarnings]
  );
  const replayEvents = useMemo(
    () =>
      replay.events.filter((event) => {
        if (timelineEventTypeFilter !== "all" && event.eventType !== timelineEventTypeFilter) return false;
        if (timelineSeverityFilter !== "all" && event.severity !== timelineSeverityFilter) return false;
        if (timelineSourceFilter !== "all" && event.source !== timelineSourceFilter) return false;
        if (timelineReasonFilter !== "all" && event.relatedReasonCategory !== timelineReasonFilter) return false;
        return true;
      }),
    [replay.events, timelineEventTypeFilter, timelineReasonFilter, timelineSeverityFilter, timelineSourceFilter]
  );
  const replayWindowEventLimit = useMemo(() => {
    if (replayQuery.replayWindow === "latest") return 8;
    if (replayQuery.replayWindow === "short") return 16;
    if (replayQuery.replayWindow === "medium") return 32;
    return 64;
  }, [replayQuery.replayWindow]);
  const visibleReplayEvents = useMemo(
    () => replayEvents.slice(0, replayWindowEventLimit),
    [replayEvents, replayWindowEventLimit]
  );
  const replayDiagnostics = useMemo(
    () =>
      buildReplayDiagnostics({
        events: visibleReplayEvents,
        allEventCount: replayEvents.length,
        feedItems,
        replayQuery,
        memoryItems: replay.memoryItems,
      }),
    [feedItems, replay.memoryItems, replayEvents.length, replayQuery, visibleReplayEvents]
  );
  const historicalContinuityExplanation = useMemo(() => {
    const recent = replayEvents.slice(0, 3);
    const reviewDensity = recent.filter((event) => event.eventType === "review_requested").length;
    const runtimeDensity = recent.filter((event) => event.eventType === "runtime_advisory").length;
    if (reviewDensity === 0 && runtimeDensity === 0) {
      return "Governance score remains stable because recent events did not increase review or runtime advisory density.";
    }
    return `Governance score shifted because review density (${reviewDensity}) and runtime advisories (${runtimeDensity}) increased across the latest ${recent.length} events.`;
  }, [replayEvents]);
  const replayExplanation = useMemo(
    () =>
      `This explanation reflects ${replayWindowDescriptions[replayQuery.replayWindow]} focused on ${replayQuery.scope.replaceAll("_", " ")} continuity context.`,
    [replayQuery.replayWindow, replayQuery.scope]
  );
  const continuityShiftExplanation = useMemo(() => {
    const snapshots = replay.snapshots.slice(0, 2);
    if (snapshots.length < 2) {
      return "Continuity shift baseline is forming from newly persisted replay snapshots.";
    }
    const delta = snapshots[0].governanceHealthScore - snapshots[1].governanceHealthScore;
    if (delta === 0) return "Continuity shift is neutral compared with the prior replay snapshot.";
    return delta > 0
      ? `Continuity shift improved by ${delta} points versus the prior replay snapshot.`
      : `Continuity shift decreased by ${Math.abs(delta)} points versus the prior replay snapshot.`;
  }, [replay.snapshots]);
  const trendPoints = useMemo(
    () =>
      replay.snapshots.slice(0, 5).map((snapshot) => ({
        label: snapshot.createdAt,
        governanceHealthScore: snapshot.governanceHealthScore,
        reviewDensity: snapshot.reviewRequiredCount,
        runtimeInstability: snapshot.runtimeInstabilityCount,
        advisoryDensity: snapshot.elevatedRiskCount,
      })),
    [replay.snapshots]
  );
  const replaySummary = useMemo(
    () =>
      buildExecutiveReplaySummary({
        events: visibleReplayEvents,
        snapshots: replay.snapshots,
        processingSessions: filteredProcessingSessions,
        memoryItems: replay.memoryItems,
        continuityExplanation: filteredAnalytics.continuityExplanation,
        query: replayQuery,
        diagnostics: replayDiagnostics,
      }),
    [
      filteredAnalytics.continuityExplanation,
      filteredProcessingSessions,
      replay.memoryItems,
      replay.snapshots,
      replayDiagnostics,
      visibleReplayEvents,
      replayQuery,
    ]
  );

  useEffect(() => {
    if (!replay.latestSnapshot.id) return;
    recordSnapshot(replay.latestSnapshot);
  }, [recordSnapshot, replay.latestSnapshot]);

  return (
    <AppShell
      title="Runtime & Cost"
      description="AI operational cost observability and provider health"
    >
      <div className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Token Usage (MTD)"
            value={`${(tokenUsage / 1_000_000).toFixed(1)}M`}
            subtext="Across all providers"
          />
          <StatCard
            label="Provider Costs (MTD)"
            value={`$${totalCostUsd.toFixed(0)}`}
            subtext={`${budgetUsed}% of budget`}
          />
          <StatCard
            label="Projected Monthly"
            value={`$${projectedMonthlyUsd}`}
            subtext={`Budget: $${budgetUsd}`}
            trend={projectedMonthlyUsd > budgetUsd * 0.9 ? "up" : "neutral"}
          />
          <StatCard
            label="API Health"
            value={apiHealth.label}
            subtext="Live provider status"
          />
        </div>

        {alerts.length > 0 && (
          <Card title="Operational Alerts">
            <ul className="space-y-3">
              {alerts.map((alert) => (
                <li
                  key={alert.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-border bg-surface px-4 py-3"
                >
                  <div>
                    <p className="text-sm text-foreground">{alert.message}</p>
                    <p className="mt-0.5 text-xs text-muted">{alert.timestamp}</p>
                  </div>
                  <Badge
                    variant={
                      alert.severity === "danger"
                        ? "danger"
                        : alert.severity === "warning"
                          ? "warning"
                          : "info"
                    }
                  >
                    {alert.severity}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card title="Provider Breakdown">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="pb-3 font-medium">Provider</th>
                  <th className="pb-3 font-medium">Tokens</th>
                  <th className="pb-3 font-medium">Cost (USD)</th>
                  <th className="pb-3 font-medium">Trend</th>
                  <th className="pb-3 font-medium">Health</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.provider} className="border-b border-border last:border-0">
                    <td className="py-4 font-medium text-foreground">{row.provider}</td>
                    <td className="py-4 text-muted">{row.tokensUsed.toLocaleString()}</td>
                    <td className="py-4 text-foreground">${row.costUsd.toFixed(2)}</td>
                    <td className="py-4">
                      <Badge
                        variant={
                          row.trend === "up"
                            ? "warning"
                            : row.trend === "down"
                              ? "success"
                              : "muted"
                        }
                      >
                        {row.trend}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <Badge
                        variant={
                          row.health === "healthy"
                            ? "success"
                            : row.health === "degraded"
                              ? "warning"
                              : "danger"
                        }
                      >
                        {row.health}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {gemini && (
                  <tr className="border-b border-border last:border-0">
                    <td className="py-4 font-medium text-foreground">Google Gemini</td>
                    <td className="py-4 text-muted">—</td>
                    <td className="py-4 text-muted">—</td>
                    <td className="py-4">
                      <Badge variant="muted">stable</Badge>
                    </td>
                    <td className="py-4">
                      <Badge
                        variant={
                          gemini.health === "healthy"
                            ? "success"
                            : gemini.health === "degraded"
                              ? "warning"
                              : "danger"
                        }
                      >
                        {gemini.health}
                      </Badge>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Budget Projection">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Current spend</span>
              <span className="font-medium">${totalCostUsd.toFixed(2)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-accent"
                style={{
                  width: `${Math.min(100, (projectedMonthlyUsd / budgetUsd) * 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted">
              Projected ${projectedMonthlyUsd} of ${budgetUsd} monthly budget
            </p>
          </div>
        </Card>

        <Card title="Sync Health">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant={healthBadgeVariant}>Operational sync</Badge>
              <span className="text-xs text-muted">{retryLabel}</span>
            </div>
            <p className="text-muted">
              Persistence mode: <span className="text-foreground">{persistenceMode}</span>
            </p>
            <p className="text-muted">
              Backend health: <span className="text-foreground">{backendLabel}</span>
            </p>
            <p className="text-muted">
              Hydration status: <span className="text-foreground">{hydrationStatus}</span>
            </p>
            <p className="text-muted">
              Last hydrated: <span className="text-foreground">{lastHydratedAt ?? "Not yet"}</span>
            </p>
            <p className="text-muted">
              Last successful read/write:{" "}
              <span className="text-foreground">
                {lastSuccessfulReadAt ?? "N/A"} / {lastSuccessfulWriteAt ?? "N/A"}
              </span>
            </p>
            <p className="text-muted">
              Pending retries: <span className="text-foreground">{pendingHydrationCount}</span>
            </p>
          </div>
          {(readFailures.length > 0 || writeFailures.length > 0) && (
            <ul className="mt-3 space-y-2">
              {[...readFailures, ...writeFailures].slice(0, 4).map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted"
                >
                  <span className="font-medium text-foreground">{entry.label}</span>
                  {" · "}
                  Backend synchronization delayed — local continuity maintained.
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Execution Queue Governance">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <RuntimeLockBadge status={runtimeLock.active ? "advisory_locked" : "unlocked"} />
            {runtimeLock.active ? (
              <p className="text-xs text-muted">{runtimeLock.reason}</p>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Queued</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{queueSummary.queued}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Reserved</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{queueSummary.reserved}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Awaiting authorization</p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {queueSummary.awaitingAuthorization}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Worker prepared</p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {queueSummary.workerPrepared}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Blocked preparation</p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {queueSummary.blockedPreparation}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Runtime locked items</p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {queueSummary.runtimeLocked}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <GovernanceNote>{validateExecutionBoundary()}</GovernanceNote>
          </div>
          {queueItems.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {queueItems.slice(0, 4).map((item) => {
                const task = allTasks.find((t) => t.id === item.taskId);
                return (
                  <li key={item.id}>
                    <ExecutionQueueCard
                      item={item}
                      taskTitle={task?.title}
                      runtimeLockActive={runtimeLock.active}
                      authorizationRequest={getRequestForQueueItem(item.id)}
                      authorizationSignature={signatures[item.id]}
                      authorizationAudit={getAuditForQueueItem(item.id)}
                      executeStub={getExecuteStub(item.id)}
                      executeAudit={getExecuteAudit(item.id)}
                      executionSession={getExecutionSession(item.id)}
                      executionSessionAudit={getExecutionSessionAudit(item.id)}
                      processingSession={getProcessingSession(item.id)}
                      processingAudit={getProcessingAudit(item.id)}
                      onReserve={() => {
                        useExecutionQueueStore.getState().reserveSlot(item.id, "COO");
                      }}
                      onRelease={() => {
                        useExecutionQueueStore.getState().releaseReservation(item.id);
                      }}
                      onPrepareWorker={() => {
                        useExecutionQueueStore
                          .getState()
                          .prepareWorkerForItem(item.id, providerDegraded);
                      }}
                      onCompleteReview={() => {
                        useExecutionQueueStore.getState().completePreparationReview(item.id);
                      }}
                      onRequestAuthorization={() => {
                        requestAuthorization(item.id);
                      }}
                      onAuthorizeExecution={() => {
                        authorizeExecution(item.id);
                      }}
                      onDenyAuthorization={() => {
                        denyAuthorization(item.id);
                      }}
                      onRevokeAuthorization={() => {
                        revokeAuthorization(item.id);
                      }}
                      onRequestExecuteReview={() => {
                        requestExecuteReview(item.id);
                      }}
                      onMarkExecuteReady={() => {
                        markExecuteReady(item.id);
                      }}
                      onDenyExecuteReady={() => {
                        denyExecuteReady(item.id);
                      }}
                      onRevokeExecuteReady={() => {
                        revokeExecuteReady(item.id);
                      }}
                      onRequestExecutionStart={() => {
                        requestExecutionStart(
                          item.id,
                          runtimeLock.active ? "Runtime lock advisory is active." : undefined
                        );
                      }}
                      onConfirmExecutionBoundary={() => {
                        confirmExecutionBoundary(item.id);
                      }}
                      onStartExecutionSession={() => {
                        startExecutionSession(item.id);
                      }}
                      onDenyExecutionStart={() => {
                        denyExecutionStart(item.id);
                      }}
                      onRevokeExecutionSession={() => {
                        revokeExecutionSession(item.id);
                      }}
                      onPrepareProcessing={() => {
                        prepareProcessing(
                          item.id,
                          runtimeLock.active
                            ? "Runtime Observer recommended review before activation."
                            : "Runtime continuity stable for governance processing."
                        );
                      }}
                      onActivateProcessing={() => {
                        activateProcessing(item.id);
                      }}
                      onPauseProcessing={() => {
                        pauseProcessing(item.id, "Runtime Observer recommended temporary pause.");
                      }}
                      onRequestProcessingReview={() => {
                        requestProcessingReview(
                          item.id,
                          runtimeLock.active ? "runtime_stability" : providerDegraded ? "provider_instability" : "advisory_review"
                        );
                      }}
                      onResumeProcessing={() => {
                        resumeProcessing(item.id);
                      }}
                      onDenyProcessing={() => {
                        denyProcessing(item.id, "Governance review concluded with denial.");
                      }}
                      onRevokeProcessing={() => {
                        revokeProcessing(item.id, "Governance continuity revoked by human operator.");
                      }}
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 text-xs text-muted">
              No tasks in the controlled execution queue. Materialize tasks from Executive Sync to
              begin preparation.
            </p>
          )}
        </Card>

        <Card title="Execution Governance">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted">
            Execution readiness (organization)
          </p>
          <ExecutionReadinessCard
            summary={orgReadinessSummary}
            queueSize={executionQueue.length}
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Pending handoffs</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {governanceStats.pendingHandoffs}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Approved requests</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {governanceStats.approvedHandoffs}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Governance queue</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {governanceStats.queueSize}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <GovernanceNote>{getHandoffBoundaryMessage()}</GovernanceNote>
          </div>
          {missionTickets.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {missionTickets.slice(0, 5).map((ticket) => (
                <li
                  key={ticket.id}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-xs"
                >
                  <span className="font-medium text-foreground">{ticket.executionIntent}</span>
                  <span className="ml-2 capitalize text-muted">{ticket.status.replaceAll("_", " ")}</span>
                  <span className="ml-2 text-muted">· {ticket.executionTarget}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-xs text-muted">
              No execution handoff tickets yet. Create tickets from Executive Sync after plan approval.
            </p>
          )}
          {syncWarnings.length > 0 ? (
            <p className="mt-3 text-xs text-muted">
              Runtime Observer flagged elevated execution risk — review handoffs before boundary authorization.
            </p>
          ) : null}
          <details className="mt-4">
            <summary className="cursor-pointer text-xs font-medium text-muted">
              Execution target boundaries (advisory)
            </summary>
            <ul className="mt-2 space-y-1">
              {describeAllExecutionBoundaries().map((b) => (
                <li key={b.target} className="text-xs text-muted">
                  <span className="font-medium text-foreground">{b.target}</span> — {b.description}
                </li>
              ))}
            </ul>
          </details>
        </Card>

        <Card title="Authorization Governance">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Pending requests</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{authorizationSummary.pending}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Authorized items</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{authorizationSummary.authorized}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Denied</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{authorizationSummary.denied}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Revoked</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{authorizationSummary.revoked}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            AI may request authorization after preparation. Only humans may authorize execution.
          </p>
        </Card>

        <Card title="Execute Governance Readiness">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Review pending</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{executeSummary.reviewPending}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Execute ready</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{executeSummary.ready}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Denied</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{executeSummary.denied}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Revoked</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{executeSummary.revoked}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            execute_ready indicates validated readiness only. Execution is not initiated in this phase.
          </p>
        </Card>

        <Card title="Execution Session Governance">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Start requested</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{sessionSummary.requested}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Session active</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{sessionSummary.active}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Denied</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{sessionSummary.denied}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Revoked</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{sessionSummary.revoked}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            execution_session_active is governance state only. No execution processing is running.
          </p>
        </Card>

        <Card title="Processing Governance State">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Prepared</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{processingSummary.prepared}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Active continuity</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{processingSummary.active}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Paused</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{processingSummary.paused}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Revoked</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{processingSummary.revoked}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Review required</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{processingSummary.reviewRequired}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            processing_active is governance continuity only. No operational execution has been initiated.
          </p>
        </Card>

        <Card title="Processing Governance Analytics">
          <GovernanceFilterBar
            category={filterCategory}
            severity={filterSeverity}
            advisory={filterAdvisory}
            mission={filterMission}
            review={filterReviewState}
            continuity={filterContinuity}
            missionOptions={missionOptions}
            onChange={handleFilterChange}
          />
          <div className="mt-4">
            <GovernanceAnalyticsCard
              sessions={filteredProcessingSessions}
              missionNameMap={missionNameMap}
              filterQuery={filterQuery}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <Link href={`/runtime-cost${filterQuery}`} className="font-medium text-accent hover:underline">
              Share this executive view →
            </Link>
            <Link href={`/organization-feed?gov=processing_governance`} className="font-medium text-accent hover:underline">
              Open governance feed visibility →
            </Link>
          </div>
          <button
            type="button"
            onClick={publishGovernanceSummary}
            className="mt-3 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface"
          >
            Publish Governance Visibility Summary
          </button>
        </Card>

        <Card title="Processing Governance Review">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Review required</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{processingSummary.reviewRequired}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Denied</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{processingSummary.denied}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Revoked</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{processingSummary.revoked}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Elevated risk</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{processingSummary.elevatedRisk}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            Processing governance review is recommendation-first and human resolved. No autonomous revocation is executed.
          </p>
        </Card>

        <Card title="Analytics Explainability">
          <GovernanceExplainabilityCard
            explanation={filteredAnalytics.continuityExplanation}
            breakdown={filteredAnalytics.scoreBreakdown}
            historicalExplanation={historicalContinuityExplanation}
            replayExplanation={replayExplanation}
            continuityShiftExplanation={continuityShiftExplanation}
            replayDiagnostics={replayDiagnostics}
          />
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <Link href={`/organization-feed?gov=continuity_events`} className="font-medium text-accent hover:underline">
              Continuity events →
            </Link>
            <Link href={`/organization-feed?gov=runtime_governance`} className="font-medium text-accent hover:underline">
              Runtime governance →
            </Link>
          </div>
        </Card>

        <Card title="Governance Timeline / Operational Replay">
          <div className="mb-3 grid gap-2 lg:grid-cols-2">
            <div>
              <p className="mb-1 text-xs text-muted">Replay scope</p>
              <ReplayScopeSwitcher
                value={replayQuery.scope}
                onChange={(value) => {
                  const next = mergeReplayQuery(replayQuery, { scope: value });
                  setReplayQuery(next);
                  window.history.replaceState({}, "", `/runtime-cost${buildReplayQuery(next)}`);
                }}
              />
            </div>
            <div>
              <p className="mb-1 text-xs text-muted">Replay window</p>
              <ReplayWindowSelector
                value={replayQuery.replayWindow}
                onChange={(value) => {
                  const next = mergeReplayQuery(replayQuery, { replayWindow: value });
                  setReplayQuery(next);
                  window.history.replaceState({}, "", `/runtime-cost${buildReplayQuery(next)}`);
                }}
              />
            </div>
          </div>
          <ReplayQuerySummary query={replayQuery} />
          <div className="grid gap-3 lg:grid-cols-2">
            <div>
              <p className="mb-1 text-xs text-muted">Event type</p>
              <ReplayFilterChips
                value={timelineEventTypeFilter}
                onChange={(v) => handleReplayFilterChange("eventType", v)}
                options={[
                  { id: "all", label: "all" },
                  { id: "review_requested", label: "review requested" },
                  { id: "review_resolved", label: "review resolved" },
                  { id: "processing_paused", label: "processing paused" },
                  { id: "runtime_advisory", label: "runtime advisory" },
                  { id: "governance_summary", label: "governance summary" },
                ]}
              />
            </div>
            <div>
              <p className="mb-1 text-xs text-muted">Severity</p>
              <ReplayFilterChips
                value={timelineSeverityFilter}
                onChange={(v) => handleReplayFilterChange("severity", v)}
                options={replaySeverityOptions()}
              />
            </div>
            <div>
              <p className="mb-1 text-xs text-muted">Source</p>
              <ReplayFilterChips
                value={timelineSourceFilter}
                onChange={(v) => handleReplayFilterChange("source", v)}
                options={[
                  { id: "all", label: "all" },
                  { id: "Runtime Observer", label: "Runtime Observer" },
                  { id: "COO", label: "COO" },
                  { id: "Nova", label: "Nova" },
                  { id: "CEO", label: "CEO" },
                ]}
              />
            </div>
            <div>
              <p className="mb-1 text-xs text-muted">Reason category</p>
              <ReplayFilterChips
                value={timelineReasonFilter}
                onChange={(v) => handleReplayFilterChange("reasonCategory", v)}
                options={[
                  { id: "all", label: "all" },
                  { id: "runtime_stability", label: "runtime stability" },
                  { id: "provider_instability", label: "provider instability" },
                  { id: "dependency_blocker", label: "dependency blocker" },
                  { id: "advisory_review", label: "advisory review" },
                ]}
              />
            </div>
          </div>
          <div className="mt-4">
            <OperationalReplayPanel
              replay={{ ...replay, events: visibleReplayEvents, diagnostics: replayDiagnostics }}
              missionNameMap={missionNameMap}
              maxEvents={replayWindowEventLimit}
            />
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <GovernanceTrendCard points={trendPoints} />
            <ReplaySummaryPanel summary={replaySummary} onCopy={copyReplaySummary} />
          </div>
          <div className="mt-3">
            <ReplayShareCard shareHref={`/runtime-cost${filterQuery}`} onShare={shareReplayView} />
          </div>
        </Card>

        <Card title="Runtime Observer Insight">
          {runtimeInsight ? (
            <p className="text-sm text-foreground">{runtimeInsight}</p>
          ) : (
            <p className="text-sm text-muted">
              Generate a concise operational insight from Runtime Observer.
            </p>
          )}
          <div className="mt-3">
            <GovernanceNote>
              Runtime Observer outputs are recommendation-only. Automated recovery, deploy actions,
              and background remediation remain disabled under execution policy.
            </GovernanceNote>
          </div>
          <p className="mt-2 text-xs text-muted">{getExecutionPolicy().boundaryMessage}</p>
          <button
            type="button"
            onClick={() => void generateRuntimeInsight()}
            className="mt-3 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface"
          >
            Generate Runtime Insight
          </button>
        </Card>

        <Card title="Sync Warnings">
          {syncWarnings.length > 0 ? (
            <ul className="space-y-2">
              {syncWarnings.slice(0, 6).map((warning) => (
                <li
                  key={warning.id}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted"
                >
                  <span className="font-medium text-foreground">{warning.message}</span>
                  {(warning.count ?? 1) > 1 ? (
                    <span className="ml-2 text-muted">×{warning.count}</span>
                  ) : null}
                  <span className="ml-2 text-muted">
                    · last {warning.lastSeenAt ?? warning.createdAt}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted">
              No active sync advisories. Local execution continuity is maintained.
            </p>
          )}
        </Card>
        {process.env.NODE_ENV !== "production" ? (
          <Card title="Replay Metadata Normalization">
            <ul className="space-y-1 text-xs text-muted">
              <li>Alias normalized: {validationMetrics.aliasNormalizationCount}</li>
              <li>Invalid replay category fallback: {validationMetrics.invalidReplayCategoryCount}</li>
              <li>Invalid continuity fallback: {validationMetrics.invalidContinuityCount}</li>
              <li>Invalid severity fallback: {validationMetrics.invalidSeverityCount}</li>
              <li>Invalid source fallback: {validationMetrics.invalidSourceCount}</li>
              <li>Invalid advisory fallback: {validationMetrics.invalidAdvisoryCount}</li>
            </ul>
          </Card>
        ) : null}
        <Card title="Replay Diagnostics">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Replay visibility score</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{replayDiagnostics.replayVisibilityScore}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Replay confidence</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{replayDiagnostics.replayConfidence}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Metadata completeness</p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {Math.round(replayDiagnostics.metadataCompletenessRatio * 100)}%
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase text-muted">Replay density</p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {Math.round((replayDiagnostics.advisoryDensity + replayDiagnostics.reviewDensity) * 100)}%
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">{replayDiagnostics.visibilityExplanation}</p>
          <p className="mt-1 text-xs text-muted">{replayDiagnostics.confidenceExplanation}</p>
          {replayDiagnostics.compressedEventCount ? (
            <p className="mt-1 text-xs text-muted">
              Replay view has been condensed for executive readability ({replayDiagnostics.compressedEventCount} events condensed).
            </p>
          ) : null}
          {replayDiagnostics.diagnosticsWarnings.length > 0 ? (
            <ul className="mt-2 space-y-1 text-xs text-muted">
              {replayDiagnostics.diagnosticsWarnings.slice(0, 5).map((warning) => (
                <li key={warning}>- {warning}</li>
              ))}
            </ul>
          ) : null}
        </Card>
      </div>
    </AppShell>
  );
}
