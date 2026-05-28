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
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";
import { buildReplayMetadata } from "@/lib/replay-query/replayMetadata";

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
}: OrganizationFeedViewProps) {
  useMissionFilterFromUrl(missionFilter);
  useLiveOrganizationFeed(true);

  const feedItems = useOrganizationStore((s) => s.organizationFeedItems);
  const addFeedItemWithSync = useOrganizationStore((s) => s.addFeedItemWithSync);
  const activeFeedFilter = useUiStore((s) => s.activeFeedFilter);
  const setFeedFilter = useUiStore((s) => s.setFeedFilter);
  const missions = useMissionStore((s) => s.missions);
  const missionNameMap = Object.fromEntries(missions.map((m) => [m.id, m.name]));
  const [replayQuery, setReplayQuery] = useState<ReplayQueryState>(() =>
    parseReplayQuery({
      mission: missionFilter,
      governance: governanceFilter,
      severity: undefined,
      continuity: undefined,
      advisory: undefined,
      review: undefined,
      eventType: undefined,
      source: undefined,
      reasonCategory: undefined,
      replayWindow: undefined,
      scope: undefined,
    })
  );
  const [activeGovernanceFilter, setActiveGovernanceFilter] = useState<string>(replayQuery.governance);
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
  }, [governanceFilter]);

  let filtered = feedItems;

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
    ],
    []
  );
  const onGovernanceFilterChange = (value: string) => {
    setActiveGovernanceFilter(value);
    const next = mergeReplayQuery(replayQuery, { governance: value });
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
      <ReplayQuerySummary query={replayQuery} />

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
                    {typeLabels[item.type] ?? item.type}
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
                {(item.taskId || item.decisionId) && (
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
                  </div>
                )}
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted">
              No organization activity matches the selected filters.
            </p>
          )}
        </ul>
      </Card>
    </AppShell>
  );
}
