"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { AgentAvatar } from "@/components/AgentAvatar";
import { MissionLink } from "@/components/MissionLink";
import { MissionFilterBanner } from "@/components/MissionFilterBanner";
import { useLiveOrganizationFeed } from "@/lib/hooks/useLiveOrganizationFeed";
import { useMissionFilterFromUrl } from "@/lib/hooks/useMissionFilterFromUrl";
import { buildOrchestrationContext } from "@/lib/orchestration/contextBuilder";
import { getProductAIOrchestrator } from "@/lib/orchestration/orchestrator";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { useMissionStore } from "@/lib/store/missionStore";
import { useUiStore } from "@/lib/store/uiStore";
import type { FeedFilter } from "@/lib/store/uiStore";
import type { OrganizationFeedItem } from "@/types/productai";
import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveMissionLabel } from "@/lib/orchestration/processing/missionLabel";
import { ReplayFilterChips } from "@/components/orchestration/ReplayFilterChips";
import { ReplayQuerySummary } from "@/components/orchestration/ReplayQuerySummary";
import { parseReplayQuery, mergeReplayQuery } from "@/lib/replay-query/replayQueryParser";
import { buildReplayQuery } from "@/lib/replay-query/replayQueryBuilder";
import { buildReplayHref } from "@/lib/replay-query/replayQueryNavigation";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";
import { buildReplayMetadata } from "@/lib/replay-query/replayMetadata";
import { matchesGovernanceAttentionFilter } from "@/lib/orchestration/decision-attention/decisionAttention";
import { countDecisionAttentionFeedItems } from "@/lib/services/feedMerge";
import { buildDecisionAttentionSeedPayloads } from "@/lib/replay-query/replaySeedCatalog";
import { ReplayBookmarkPanel } from "@/components/orchestration/ReplayBookmarkPanel";
import { ReplaySessionRecommendations } from "@/components/orchestration/ReplaySessionRecommendations";
import { replayInterpretationPresets } from "@/lib/orchestration/governance-history/replayInterpretationPresets";
import { useReplayPersonalizationStore } from "@/lib/store/replayPersonalizationStore";
import { GovernanceJournalPanel } from "@/components/orchestration/GovernanceJournalPanel";
import { ReplayInterpretationHistoryPanel } from "@/components/orchestration/ReplayInterpretationHistoryPanel";
import { ExecutiveGovernanceDigestPanel } from "@/components/orchestration/ExecutiveGovernanceDigest";
import { GovernanceReadingModeSwitcher } from "@/components/orchestration/GovernanceReadingModeSwitcher";
import { getGovernanceReadingMode } from "@/lib/orchestration/governance-history/readingModes";
import { useGovernanceWorkspaceStore } from "@/lib/store/governanceWorkspaceStore";
import { GovernanceStoryModeSwitcher } from "@/components/orchestration/GovernanceStoryModeSwitcher";
import { getGovernanceStoryMode } from "@/lib/orchestration/governance-history/storyModes";
import { useGovernanceNarrativeStore } from "@/lib/store/governanceNarrativeStore";
import { useDecisionMemoryAtlasStore } from "@/lib/store/decisionMemoryAtlasStore";
import { useDecisionTraceabilityStore } from "@/lib/store/decisionTraceabilityStore";

const typeLabels: Record<string, string> = {
  judgment: "Judgment",
  coordination: "Coordination",
  task_assignment: "Task Assignment",
  task_creation: "Task Creation",
  implementation: "Implementation Update",
  architecture: "Architecture Recommendation",
  qa_review: "QA Review",
  escalation: "Escalation",
  approval_required: "Approval Required",
  runtime: "Runtime Signal",
  memory: "Memory",
  decision_attention_generated: "Decision Attention Generated",
  decision_attention_reviewed: "Decision Attention Reviewed",
  decision_attention_resolved: "Decision Attention Resolved",
  decision_attention_deferred: "Decision Attention Deferred",
  planning_started: "Planning Started",
  planning_completed: "Planning Completed",
  direction_started: "Direction Started",
  direction_completed: "Direction Completed",
  architecture_started: "Architecture Started",
  architecture_completed: "Architecture Completed",
  design_started: "Design Started",
  design_completed: "Design Completed",
  development_started: "Development Started",
  development_completed: "Development Completed",
  qa_started: "QA Started",
  qa_completed: "QA Completed",
  coo_review_generated: "COO Review Generated",
  coo_bottleneck_observed: "COO Bottleneck Observed",
  coo_coordination_note: "COO Coordination Note",
  coo_workflow_snapshot: "COO Workflow Snapshot",
  task_created: "Task Created",
  task_review_started: "Task Review Started",
  task_review_completed: "Task Review Completed",
  repository_ready: "Repository Ready",
  release_readiness_updated: "Release Readiness Updated",
  delivery_snapshot: "Delivery Snapshot",
  repository_created: "Repository Created",
  branch_created: "Branch Created",
  pull_request_opened: "Pull Request Opened",
  review_requested: "Review Requested",
  review_completed: "Review Completed",
  release_candidate_created: "Release Candidate Created",
  repository_snapshot: "Repository Snapshot",
  release_checklist_updated: "Release Checklist Updated",
  release_risk_observed: "Release Risk Observed",
  release_ready: "Release Ready",
  release_snapshot: "Release Snapshot",
};

const typeVariant: Record<string, "default" | "info" | "warning" | "accent" | "danger"> = {
  judgment: "accent",
  coordination: "default",
  task_assignment: "info",
  task_creation: "info",
  implementation: "info",
  architecture: "accent",
  qa_review: "default",
  escalation: "warning",
  approval_required: "danger",
  runtime: "warning",
  memory: "accent",
  decision_attention_generated: "info",
  decision_attention_reviewed: "accent",
  decision_attention_resolved: "default",
  decision_attention_deferred: "warning",
  planning_started: "info",
  planning_completed: "accent",
  direction_started: "info",
  direction_completed: "accent",
  architecture_started: "accent",
  architecture_completed: "default",
  design_started: "info",
  design_completed: "default",
  development_started: "info",
  development_completed: "default",
  qa_started: "warning",
  qa_completed: "default",
  coo_review_generated: "info",
  coo_bottleneck_observed: "warning",
  coo_coordination_note: "default",
  coo_workflow_snapshot: "info",
  task_created: "info",
  task_review_started: "warning",
  task_review_completed: "accent",
  repository_ready: "accent",
  release_readiness_updated: "info",
  delivery_snapshot: "default",
  repository_created: "info",
  branch_created: "info",
  pull_request_opened: "accent",
  review_requested: "warning",
  review_completed: "accent",
  release_candidate_created: "info",
  repository_snapshot: "default",
  release_checklist_updated: "info",
  release_risk_observed: "warning",
  release_ready: "accent",
  release_snapshot: "default",
};

const feedFilters: { key: FeedFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "decisions", label: "Decisions" },
  { key: "tasks", label: "Tasks" },
  { key: "runtime", label: "Runtime" },
  { key: "escalations", label: "Escalations" },
  { key: "qa", label: "QA" },
];

function matchesFeedFilter(item: OrganizationFeedItem, filter: FeedFilter): boolean {
  if (filter === "all") return true;
  if (filter === "decisions") {
    return (
      item.type === "judgment" ||
      item.type === "architecture" ||
      item.type === "approval_required" ||
      item.type === "coordination" ||
      item.type.startsWith("decision_attention_") ||
      Boolean(item.decisionAttentionId) ||
      Boolean(item.decisionId)
    );
  }
  if (filter === "tasks") {
    return (
      item.type === "task_creation" ||
      item.type === "task_assignment" ||
      item.type === "implementation" ||
      Boolean(item.taskId)
    );
  }
  if (filter === "runtime") {
    return item.type === "runtime";
  }
  if (filter === "escalations") return item.type === "escalation";
  if (filter === "qa") return item.type === "qa_review";
  return true;
}

interface OrganizationFeedViewProps {
  missionFilter?: string;
  taskFilter?: string;
  typeFilter?: string;
  statusFilter?: string;
  governanceFilter?: string;
  initialReplayQuery?: ReplayQueryState;
}

function matchesStatus(item: OrganizationFeedItem, status?: string) {
  if (!status) return true;
  const normalized = status.toLowerCase();
  if (item.status) return item.status.toLowerCase() === normalized;
  if (normalized === "blocked") {
    return item.type === "escalation";
  }
  if (normalized === "in_review") {
    return item.type === "qa_review";
  }
  if (normalized === "completed") {
    return item.type === "implementation";
  }
  if (normalized === "active") {
    return item.type === "task_assignment" || item.type === "task_creation";
  }
  return true;
}

export function OrganizationFeedView({
  missionFilter,
  taskFilter,
  typeFilter,
  statusFilter,
  governanceFilter,
  initialReplayQuery,
}: OrganizationFeedViewProps) {
  useMissionFilterFromUrl(missionFilter);
  useLiveOrganizationFeed(true);

  const feedItems = useOrganizationStore((s) => s.organizationFeedItems);
  const addFeedItemWithSync = useOrganizationStore((s) => s.addFeedItemWithSync);
  const activeFeedFilter = useUiStore((s) => s.activeFeedFilter);
  const setFeedFilter = useUiStore((s) => s.setFeedFilter);
  const missions = useMissionStore((s) => s.missions);
  const missionNameMap = Object.fromEntries(missions.map((m) => [m.id, m.name]));
  const [replayQuery, setReplayQuery] = useState<ReplayQueryState>(
    () =>
      initialReplayQuery ??
      parseReplayQuery({
        mission: missionFilter,
        governance: governanceFilter,
      })
  );
  const [activeGovernanceFilter, setActiveGovernanceFilter] = useState<string>(replayQuery.governance);
  const [activeAttentionFilter, setActiveAttentionFilter] = useState<string>(replayQuery.governanceAttention);
  const hydratedAttentionCount = useMemo(
    () => countDecisionAttentionFeedItems(feedItems),
    [feedItems]
  );
  const attentionFilterActive =
    activeAttentionFilter !== "all" ||
    replayQuery.governanceAttention !== "all" ||
    activeGovernanceFilter === "decision_attention";
  const displayFeedItems = useMemo(() => {
    if (!attentionFilterActive) return feedItems;
    const knownIds = new Set(feedItems.map((item) => item.id));
    const supplemental = buildDecisionAttentionSeedPayloads().filter((seed) => !knownIds.has(seed.id));
    if (supplemental.length === 0) return feedItems;
    return [...feedItems, ...supplemental];
  }, [attentionFilterActive, feedItems]);
  const filterChipClass =
    "rounded-md border border-border bg-surface px-2 py-1 text-muted";

  useEffect(() => {
    const parsed = parseReplayQuery(
      new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : `?gov=${governanceFilter ?? "all"}`
      )
    );
    setReplayQuery(parsed);
    setActiveGovernanceFilter(parsed.governance);
    setActiveAttentionFilter(parsed.governanceAttention);
  }, [governanceFilter, initialReplayQuery]);

  let filtered = displayFeedItems;

  if (missionFilter) {
    filtered = filtered.filter((f) => f.missionId === missionFilter);
  }
  if (replayQuery.mission !== "all") {
    filtered = filtered.filter((f) => f.missionId === replayQuery.mission);
  }
  if (taskFilter) {
    filtered = filtered.filter((f) => f.taskId === taskFilter);
  }
  if (typeFilter) {
    filtered = filtered.filter((f) => f.type === typeFilter);
  }
  if (activeGovernanceFilter && activeGovernanceFilter !== "all") {
    filtered = filtered.filter((item) => {
      if (activeGovernanceFilter === "governance_summary") {
        return (
          item.governanceCategory === "governance_summary" ||
          item.replayCategory === "replay_summary"
        );
      }
      if (activeGovernanceFilter === "review_lifecycle") {
        return (
          item.governanceCategory === "governance_review" ||
          item.replayCategory === "replay_review"
        );
      }
      if (activeGovernanceFilter === "continuity_events" || activeGovernanceFilter === "continuity") {
        return (
          item.governanceCategory === "governance_continuity" ||
          item.continuityCategory !== undefined
        );
      }
      if (activeGovernanceFilter === "advisory_events") {
        return item.replayCategory === "replay_advisory" || item.advisoryLevel !== undefined;
      }
      if (activeGovernanceFilter === "runtime_governance") {
        return (
          item.governanceCategory === "governance_runtime" ||
          item.replayCategory === "replay_runtime" ||
          item.replaySource === "runtime_observer" ||
          item.replaySource === "runtime"
        );
      }
      if (activeGovernanceFilter === "processing_governance") {
        return (
          item.governanceCategory === "governance_processing" ||
          item.replayTags?.includes("processing")
        );
      }
      if (activeGovernanceFilter === "timeline_memory") {
        return (
          item.replayCategory === "replay_timeline" || item.replayCategory === "replay_memory"
        );
      }
      if (activeGovernanceFilter === "decision_attention") {
        return matchesGovernanceAttentionFilter(item, "decision_attention");
      }
      return true;
    });
  }
  if (replayQuery.severity !== "all") {
    filtered = filtered.filter((item) => item.replaySeverity === replayQuery.severity);
  }
  if (replayQuery.continuity !== "all") {
    filtered = filtered.filter((item) => item.continuityCategory === replayQuery.continuity);
  }
  if (replayQuery.advisory !== "all") {
    filtered = filtered.filter((item) =>
      replayQuery.advisory === "advisory"
        ? item.advisoryLevel !== "advisory_low" && item.advisoryLevel !== "informational"
        : item.advisoryLevel === "advisory_low" || item.advisoryLevel === "informational"
    );
  }
  if (replayQuery.review !== "all") {
    filtered = filtered.filter((item) => item.governanceCategory === "governance_review");
  }
  if (replayQuery.governanceAttention !== "all") {
    filtered = filtered.filter((item) =>
      matchesGovernanceAttentionFilter(item, replayQuery.governanceAttention)
    );
  }
  const govOptions = useMemo(
    () => [
      { id: "all", label: "all" },
      { id: "governance_summary", label: "summary" },
      { id: "review_lifecycle", label: "review lifecycle" },
      { id: "continuity", label: "continuity" },
      { id: "advisory_events", label: "advisory" },
      { id: "runtime_governance", label: "runtime governance" },
      { id: "processing_governance", label: "processing governance" },
      { id: "timeline_memory", label: "timeline & memory" },
      { id: "decision_attention", label: "decision attention" },
    ],
    []
  );
  const attentionOptions = useMemo(
    () => [
      { id: "all", label: "all" },
      { id: "attention", label: "attention" },
      { id: "generated", label: "generated" },
      { id: "reviewed", label: "reviewed" },
      { id: "resolved", label: "resolved" },
      { id: "deferred", label: "deferred" },
    ],
    []
  );
  const onGovernanceFilterChange = (value: string) => {
    setActiveGovernanceFilter(value);
    const next = mergeReplayQuery(replayQuery, {
      governance: value,
      governanceAttention: value === "decision_attention" ? "decision_attention" : replayQuery.governanceAttention,
    });
    setReplayQuery(next);
    window.history.replaceState({}, "", `/organization-feed${buildReplayQuery(next)}`);
  };
  const recordReplayView = useReplayPersonalizationStore((s) => s.recordReplayView);
  const lastReplayView = useReplayPersonalizationStore((s) => s.lastReplayView);
  const activeReadingMode = useGovernanceWorkspaceStore((s) => s.activeReadingMode);
  const createWorkspace = useGovernanceWorkspaceStore((s) => s.createWorkspace);
  const activeStoryMode = useGovernanceNarrativeStore((s) => s.activeStoryMode);

  useEffect(() => {
    recordReplayView(replayQuery);
  }, [recordReplayView, replayQuery]);

  const onAttentionFilterChange = (value: string) => {
    setActiveAttentionFilter(value);
    const next = mergeReplayQuery(replayQuery, { governanceAttention: value });
    setReplayQuery(next);
    window.history.replaceState({}, "", `/organization-feed${buildReplayQuery(next)}`);
  };


  filtered = filtered.filter((f) => matchesFeedFilter(f, activeFeedFilter));
  filtered = filtered.filter((f) => matchesStatus(f, statusFilter));

  const generateAIEvent = async () => {
    const orchestrator = getProductAIOrchestrator();
    const context = buildOrchestrationContext();
    const event = await orchestrator.generateOperationalFeedEvent(context);
    const mission = context.missions[0];
    addFeedItemWithSync({
      type: event.type,
      author: event.author,
      authorName:
        event.author === "COO"
          ? "Nova"
          : event.author === "Architect"
            ? "Sage"
            : event.author === "QA"
              ? "Lens"
              : "Pulse",
      missionId: mission?.id ?? "m-1",
      missionName: mission?.name ?? "Operational Overview",
      message: event.message,
      status: "active",
      requiresCeoApproval: false,
      ...buildReplayMetadata({
        governanceCategory: "governance_replay",
        replayCategory: "replay_timeline",
        continuityCategory: "continuity_replay",
        advisoryLevel: "advisory_low",
        replayTags: ["replay", "timeline"],
        replaySeverity: "low",
        replaySource: "system",
      }),
    });
  };

  const generateGovernanceEvent = async () => {
    const orchestrator = getProductAIOrchestrator();
    const context = buildOrchestrationContext();
    const kind =
      context.syncWarnings.length > 0
        ? "runtime_recommendation"
        : context.tasks.some((t) => t.status === "blocked")
          ? "architect_review"
          : "approval";
    const event = await orchestrator.generateGovernanceFeedEvent(context, kind);
    const mission = context.missions[0];
    addFeedItemWithSync({
      type: event.type,
      author: event.author,
      authorName: event.author === "Architect" ? "Sage" : event.author === "COO" ? "Nova" : "Pulse",
      missionId: mission?.id ?? "m-1",
      missionName: mission?.name ?? "Operational Overview",
      message: event.message,
      status: "active",
      requiresCeoApproval: event.requiresCeoApproval,
      ...buildReplayMetadata({
        governanceCategory: "governance_summary",
        replayCategory: "replay_governance",
        continuityCategory: "continuity_governance",
        advisoryLevel: context.syncWarnings.length > 0 ? "advisory_elevated" : "advisory_moderate",
        replayTags: ["governance", "summary"],
        replaySeverity: context.syncWarnings.length > 0 ? "elevated" : "moderate",
        replaySource: event.author === "Architect" ? "system" : "coo",
      }),
    });
  };
  const generateTimelineEvent = () => {
    addFeedItemWithSync({
      type: "coordination",
      author: "COO",
      authorName: "Nova",
      missionId: missionFilter ?? "organization",
      missionName: missionFilter ? resolveMissionLabel({ missionId: missionFilter, missionNameMap }) : "Organization",
      message: "COO generated executive governance snapshot for operational replay.",
      status: "active",
      requiresCeoApproval: false,
      ...buildReplayMetadata({
        governanceCategory: "governance_replay",
        replayCategory: "replay_timeline",
        continuityCategory: "continuity_replay",
        advisoryLevel: "advisory_low",
        replaySeverity: "low",
        replaySource: "coo",
        replayTags: ["replay", "snapshot"],
      }),
    });
  };
  const generateMemoryEvent = () => {
    addFeedItemWithSync({
      type: "memory",
      author: "Runtime Observer",
      authorName: "Pulse",
      missionId: missionFilter ?? "organization",
      missionName: missionFilter ? resolveMissionLabel({ missionId: missionFilter, missionNameMap }) : "Organization",
      message: "Runtime Observer identified recurring advisory pattern and recorded governance memory.",
      status: "active",
      requiresCeoApproval: false,
      ...buildReplayMetadata({
        governanceCategory: "governance_continuity",
        replayCategory: "replay_memory",
        continuityCategory: "continuity_advisory",
        advisoryLevel: "advisory_moderate",
        replaySeverity: "moderate",
        replaySource: "runtime_observer",
        replayTags: ["memory", "advisory", "runtime"],
      }),
    });
  };

  return (
    <AppShell
      title="Organization Feed"
      description="Live stream of AI organizational collaboration"
    >
      {missionFilter && (
        <MissionFilterBanner missionId={missionFilter} basePath="/organization-feed" />
      )}
      {(missionFilter || taskFilter || typeFilter || statusFilter || activeGovernanceFilter !== "all") && (
        <div className="mb-3 flex flex-wrap gap-2 text-xs">
          {missionFilter ? (
            <span className={filterChipClass}>
              mission: {resolveMissionLabel({ missionId: missionFilter, missionNameMap })}
            </span>
          ) : null}
          {taskFilter ? <span className={filterChipClass}>task: {taskFilter}</span> : null}
          {typeFilter ? <span className={filterChipClass}>type: {typeFilter}</span> : null}
          {statusFilter ? <span className={filterChipClass}>status: {statusFilter}</span> : null}
          {activeGovernanceFilter !== "all" ? (
            <span className={filterChipClass}>governance: {activeGovernanceFilter}</span>
          ) : null}
          <span className={filterChipClass}>view: {activeFeedFilter}</span>
          <Link href="/organization-feed" className="rounded-md border border-border bg-background px-2 py-1 text-accent hover:bg-surface">
            Clear filters
          </Link>
        </div>
      )}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted">Governance:</span>
        <ReplayFilterChips value={activeGovernanceFilter} options={govOptions} onChange={onGovernanceFilterChange} />
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted">Attention:</span>
        <ReplayFilterChips
          value={activeAttentionFilter}
          options={attentionOptions}
          onChange={onAttentionFilterChange}
        />
        <Link
          href={buildReplayHref("/runtime-cost", {
            ...replayQuery,
            governanceAttention:
              activeAttentionFilter !== "all" ? activeAttentionFilter : "attention",
            governance:
              activeGovernanceFilter === "decision_attention"
                ? "decision_attention"
                : replayQuery.governance,
          })}
          className="ml-auto rounded-md border border-border bg-background px-2.5 py-1 font-medium text-accent transition-colors hover:bg-surface"
        >
          Open replay walkthrough →
        </Link>
      </div>
      <ReplayQuerySummary query={replayQuery} />
      <div className="mb-4 rounded-lg border border-border bg-surface p-3">
        <p className="text-xs font-medium uppercase text-muted">Replay personalization</p>
        <p className="mt-1 text-xs text-muted">
          Save bookmarks and apply interpretation presets while preserving governance attention query
          continuity.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {replayInterpretationPresets.slice(0, 4).map((preset) => (
            <Link
              key={preset.id}
              href={buildReplayHref(
                "/runtime-cost",
                mergeReplayQuery(replayQuery, preset.recommendedReplayQuery)
              )}
              className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-accent hover:bg-surface"
            >
              {preset.title}
            </Link>
          ))}
          {lastReplayView ? (
            <Link
              href={buildReplayHref("/runtime-cost", lastReplayView)}
              className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface"
            >
              Continue replay review →
            </Link>
          ) : null}
        </div>
        <div className="mt-3">
          <ReplayBookmarkPanel
            currentReplayQuery={replayQuery}
            linkBasePath="/organization-feed"
            focusCategory="attention_interpretation"
            compact
          />
        </div>
        <div className="mt-3">
          <ReplaySessionRecommendations baseReplayQuery={replayQuery} linkBasePath="/runtime-cost" />
        </div>
      </div>
      <div className="mb-4 rounded-lg border border-border bg-surface p-3">
        <p className="text-xs font-medium uppercase text-muted">Executive governance workspace</p>
        <p className="mt-1 text-xs text-muted">
          Open governance workspace, continue longitudinal review, and preserve attention query
          continuity across reading modes.
        </p>
        <div className="mt-2">
          <GovernanceReadingModeSwitcher compact />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href={buildReplayHref(
              "/runtime-cost",
              mergeReplayQuery(replayQuery, getGovernanceReadingMode(activeReadingMode).recommendedReplayQuery)
            )}
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-accent hover:bg-surface"
          >
            Open in governance workspace →
          </Link>
          <Link
            href={buildReplayHref("/runtime-cost", {
              ...replayQuery,
              governanceAttention:
                activeAttentionFilter !== "all" ? activeAttentionFilter : replayQuery.governanceAttention,
            })}
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface"
          >
            Continue longitudinal review →
          </Link>
          <button
            type="button"
            onClick={() =>
              createWorkspace({
                title: `Feed workspace · ${activeAttentionFilter !== "all" ? activeAttentionFilter : "attention"}`,
                savedReplayQuery: replayQuery,
                activeReadingMode,
              })
            }
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface"
          >
            Pin to executive workspace
          </button>
        </div>
      </div>
      <div className="mb-4 rounded-lg border border-border bg-surface p-3">
        <p className="text-xs font-medium uppercase text-muted">Governance story</p>
        <p className="mt-1 text-xs text-muted">
          Open narratives, review journeys, and continuity maps to understand AI organization change as
          flow—not as automated conclusions.
        </p>
        <div className="mt-2">
          <GovernanceStoryModeSwitcher compact />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href={buildReplayHref(
              "/runtime-cost",
              mergeReplayQuery(replayQuery, {
                governance: "governance_summary",
                governanceAttention:
                  activeAttentionFilter !== "all"
                    ? activeAttentionFilter
                    : replayQuery.governanceAttention,
              })
            )}
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-accent hover:bg-surface"
          >
            Open narrative →
          </Link>
          <Link
            href={buildReplayHref(
              "/runtime-cost",
              mergeReplayQuery(replayQuery, {
                governance: "review_lifecycle",
                governanceAttention:
                  activeAttentionFilter !== "all"
                    ? activeAttentionFilter
                    : replayQuery.governanceAttention,
              })
            )}
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface"
          >
            Open review journey →
          </Link>
          <Link
            href={buildReplayHref(
              "/runtime-cost",
              mergeReplayQuery(replayQuery, {
                continuity: "continuity_review",
                governanceAttention:
                  activeAttentionFilter !== "all"
                    ? activeAttentionFilter
                    : replayQuery.governanceAttention,
              })
            )}
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface"
          >
            Open continuity map →
          </Link>
          <Link
            href={buildReplayHref(
              "/runtime-cost",
              mergeReplayQuery(replayQuery, getGovernanceReadingMode("deep_review").recommendedReplayQuery)
            )}
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-accent hover:bg-surface"
          >
            Continue governance story ({getGovernanceStoryMode(activeStoryMode).title}) →
          </Link>
          <Link
            href={buildReplayHref(
              "/runtime-cost",
              mergeReplayQuery(replayQuery, {
                scope: "governance_review",
                governanceAttention:
                  activeAttentionFilter !== "all"
                    ? activeAttentionFilter
                    : replayQuery.governanceAttention,
              })
            )}
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-accent hover:bg-surface"
          >
            Open knowledge context →
          </Link>
        </div>
      </div>
      <div className="mb-4 rounded-lg border border-border bg-surface p-3">
        <p className="text-xs font-medium uppercase text-muted">Decision memory atlas</p>
        <p className="mt-1 text-xs text-muted">
          Open decision context, explore themes, and view the executive memory atlas while preserving
          attention query continuity.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href={buildReplayHref(
              "/runtime-cost",
              mergeReplayQuery(replayQuery, {
                scope: "governance_review",
                governanceAttention:
                  activeAttentionFilter !== "all"
                    ? activeAttentionFilter
                    : replayQuery.governanceAttention,
              })
            ).concat("#decision-memory-atlas")}
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-accent hover:bg-surface"
          >
            Open decision context →
          </Link>
          <Link
            href={buildReplayHref("/runtime-cost", replayQuery).concat("#decision-memory-atlas")}
            onClick={() => {
              useDecisionMemoryAtlasStore.getState().setActiveAtlasView("themes");
            }}
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface"
          >
            Open theme explorer →
          </Link>
          <Link
            href={buildReplayHref("/runtime-cost", replayQuery).concat("#decision-memory-atlas")}
            onClick={() => {
              useDecisionMemoryAtlasStore.getState().setActiveAtlasView("summary");
            }}
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface"
          >
            Open atlas view →
          </Link>
        </div>
      </div>
      <div className="mb-4 rounded-lg border border-border bg-surface p-3">
        <p className="text-xs font-medium uppercase text-muted">Decision traceability</p>
        <p className="mt-1 text-xs text-muted">
          Open decision paths, traceability view, and continuity chains while preserving replay query
          continuity.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href={buildReplayHref(
              "/runtime-cost",
              mergeReplayQuery(replayQuery, {
                scope: "governance_review",
                governanceAttention:
                  activeAttentionFilter !== "all"
                    ? activeAttentionFilter
                    : replayQuery.governanceAttention,
              })
            ).concat("#decision-traceability")}
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-accent hover:bg-surface"
          >
            Open decision path →
          </Link>
          <Link
            href={buildReplayHref("/runtime-cost", replayQuery).concat("#decision-traceability")}
            onClick={() => {
              useDecisionTraceabilityStore.getState().setActiveTraceabilityView("paths");
            }}
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface"
          >
            Open traceability view →
          </Link>
          <Link
            href={buildReplayHref("/runtime-cost", replayQuery).concat("#decision-traceability")}
            onClick={() => {
              useDecisionTraceabilityStore.getState().setActiveTraceabilityView("timeline");
            }}
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface"
          >
            Open continuity chain →
          </Link>
        </div>
      </div>
      <div className="mb-4 rounded-lg border border-border bg-surface p-3">
        <p className="text-xs font-medium uppercase text-muted">Governance reading continuity</p>
        <p className="mt-1 text-xs text-muted">
          Save human governance journals, record interpretations, and open replay comparison while
          preserving attention query continuity.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href={buildReplayHref("/runtime-cost", {
              ...replayQuery,
              governanceAttention:
                activeAttentionFilter !== "all" ? activeAttentionFilter : replayQuery.governanceAttention,
            })}
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface"
          >
            Continue replay interpretation →
          </Link>
          <Link
            href={buildReplayHref("/runtime-cost", replayQuery)}
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-accent hover:bg-surface"
          >
            Open replay comparison →
          </Link>
        </div>
        <div className="mt-3">
          <GovernanceJournalPanel
            replayQuery={replayQuery}
            missionId={missionFilter}
            compact
          />
        </div>
        <div className="mt-3">
          <ReplayInterpretationHistoryPanel
            replayQuery={replayQuery}
            linkBasePath="/organization-feed"
            compact
          />
        </div>
        <div className="mt-3">
          <ExecutiveGovernanceDigestPanel
            compact
            onExportDigest={(text) => void navigator.clipboard.writeText(text)}
          />
        </div>
      </div>
      {process.env.NODE_ENV !== "production" ? (
        <p className="mb-2 text-[11px] text-muted">
          Hydrated decision attention events: {hydratedAttentionCount} · Decision attention continuity was
          preserved during replay hydration.
        </p>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">Filter:</span>
        {feedFilters.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFeedFilter(key)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
              activeFeedFilter === key
                ? "border-accent bg-indigo-50 text-accent"
                : "border-border bg-background text-muted hover:bg-surface"
            )}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-1.5 text-xs text-muted">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-40" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
          </span>
          Live
        </span>
        <button
          type="button"
          onClick={() => void generateAIEvent()}
          className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-surface"
        >
          Generate AI Event
        </button>
        <button
          type="button"
          onClick={() => void generateGovernanceEvent()}
          className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-surface"
        >
          Generate Governance Event
        </button>
        <button
          type="button"
          onClick={generateTimelineEvent}
          className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-surface"
        >
          Generate Timeline Event
        </button>
        <button
          type="button"
          onClick={generateMemoryEvent}
          className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-surface"
        >
          Generate Memory Event
        </button>
      </div>

      <Card>
        <ul className="space-y-6">
          {filtered.map((item, index) => (
            <li
              key={item.id}
              className={cn(
                "flex gap-4 border-b border-border pb-6 last:border-0 last:pb-0",
                index === 0 && item.id.startsWith("f-live-") && "animate-[fadeIn_0.4s_ease-out]"
              )}
            >
              <AgentAvatar
                role={item.author}
                name={item.authorName}
                showStatus
                status="active"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={typeVariant[item.type] ?? "default"}>
                    {typeLabels[item.type] ?? item.type.replaceAll("_", " ")}
                  </Badge>
                  <MissionLink
                    missionId={item.missionId}
                    missionName={item.missionName}
                    variant="pill"
                  />
                  <span className="text-xs text-muted">· {item.timestamp}</span>
                  {item.requiresCeoApproval && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-warning">
                      <ShieldAlert className="h-3 w-3" />
                      CEO approval required
                    </span>
                  )}
                  {item.governanceCategory ? (
                    <span className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted">
                      {item.governanceCategory.replace("governance_", "")}
                    </span>
                  ) : null}
                  {item.replayCategory ? (
                    <span className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted">
                      {item.replayCategory.replace("replay_", "")}
                    </span>
                  ) : null}
                  {item.continuityCategory ? (
                    <span className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted">
                      {item.continuityCategory.replace("continuity_", "")}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground">{item.message}</p>
                {item.decisionAttentionId ? (
                  <div className="mt-2 space-y-1 text-xs text-muted">
                    <p>
                      Attention {item.decisionAttentionSeverity?.replaceAll("_", " ")} ·{" "}
                      {item.decisionAttentionCategory?.replaceAll("_", " ")} · confidence{" "}
                      {item.decisionAttentionReplayConfidence}
                    </p>
                    <p>{item.decisionAttentionReason}</p>
                  </div>
                ) : null}
                {(item.taskId || item.decisionId || item.decisionAttentionId) && (
                  <div className="mt-2 flex flex-wrap gap-3 text-xs">
                    {item.taskId ? (
                      <Link href={`/tasks/${item.taskId}`} className="font-medium text-accent hover:underline">
                        View task →
                      </Link>
                    ) : null}
                    {item.decisionId ? (
                      <Link
                        href={`/judgment?mission=${item.missionId}`}
                        className="font-medium text-accent hover:underline"
                      >
                        View decision →
                      </Link>
                    ) : null}
                    {item.decisionAttentionId ? (
                      <Link
                        href={buildReplayHref("/runtime-cost", {
                          ...replayQuery,
                          mission: item.missionId,
                          governanceAttention: "decision_attention",
                        })}
                        className="font-medium text-accent hover:underline"
                      >
                        Attention replay query →
                      </Link>
                    ) : null}
                  </div>
                )}
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <div className="space-y-2 text-sm text-muted">
              <p>No organization activity matches the selected filters.</p>
              {attentionFilterActive && hydratedAttentionCount < 4 ? (
                <p>
                  Replay continuity examples may be available after refreshing development seeds in
                  Settings. Governance interpretation filters remain advisory.
                </p>
              ) : null}
            </div>
          )}
        </ul>
      </Card>
    </AppShell>
  );
}
