"use client";

import Link from "next/link";
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
import { useUiStore } from "@/lib/store/uiStore";
import type { FeedFilter } from "@/lib/store/uiStore";
import type { OrganizationFeedItem } from "@/types/productai";
import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

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
}: OrganizationFeedViewProps) {
  useMissionFilterFromUrl(missionFilter);
  useLiveOrganizationFeed(true);

  const feedItems = useOrganizationStore((s) => s.organizationFeedItems);
  const addFeedItemWithSync = useOrganizationStore((s) => s.addFeedItemWithSync);
  const activeFeedFilter = useUiStore((s) => s.activeFeedFilter);
  const setFeedFilter = useUiStore((s) => s.setFeedFilter);
  const filterChipClass =
    "rounded-md border border-border bg-surface px-2 py-1 text-muted";

  let filtered = feedItems;

  if (missionFilter) {
    filtered = filtered.filter((f) => f.missionId === missionFilter);
  }
  if (taskFilter) {
    filtered = filtered.filter((f) => f.taskId === taskFilter);
  }
  if (typeFilter) {
    filtered = filtered.filter((f) => f.type === typeFilter);
  }

  filtered = filtered.filter((f) => matchesFeedFilter(f, activeFeedFilter));
  filtered = filtered.filter((f) => matchesStatus(f, statusFilter));

  const generateAIEvent = async () => {
    const orchestrator = getProductAIOrchestrator();
    const context = buildOrchestrationContext();
    const event = await orchestrator.generateOperationalFeedEvent(context);
    const mission = context.missions[0];
    addFeedItemWithSync({
      type: event.type,
      author:
        event.author === "Runtime Observer"
          ? "Runtime Observer"
          : event.author,
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
      {(missionFilter || taskFilter || typeFilter || statusFilter) && (
        <div className="mb-3 flex flex-wrap gap-2 text-xs">
          {missionFilter ? <span className={filterChipClass}>mission: {missionFilter}</span> : null}
          {taskFilter ? <span className={filterChipClass}>task: {taskFilter}</span> : null}
          {typeFilter ? <span className={filterChipClass}>type: {typeFilter}</span> : null}
          {statusFilter ? <span className={filterChipClass}>status: {statusFilter}</span> : null}
          <span className={filterChipClass}>view: {activeFeedFilter}</span>
          <Link href="/organization-feed" className="rounded-md border border-border bg-background px-2 py-1 text-accent hover:bg-surface">
            Clear filters
          </Link>
        </div>
      )}

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
