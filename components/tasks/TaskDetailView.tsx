"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { MissionLink } from "@/components/MissionLink";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusPill } from "@/components/StatusPill";
import { TaskStatusActions } from "@/components/tasks/TaskStatusActions";
import { missions as seedMissions } from "@/data/mockData";
import { getRuntimeSignalsForMission } from "@/lib/mission/missionDetailData";
import {
  executeSuggestedAction,
  getSuggestedActionsForStatus,
} from "@/lib/task/suggestedTaskActions";
import { agentName, sourceBadgeClass } from "@/lib/task/taskUi";
import { useMissionStore } from "@/lib/store/missionStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { useRuntimeStore } from "@/lib/store/runtimeStore";
import { useTaskStore } from "@/lib/store/taskStore";
import type { TaskEvent, TaskStatus } from "@/types/productai";

const taskStatusVariant: Record<TaskStatus, "info" | "warning" | "danger" | "success"> = {
  active: "info",
  in_review: "warning",
  blocked: "danger",
  completed: "success",
};

function eventVariant(type: TaskEvent["type"]) {
  if (type === "blocked") return "danger";
  if (type === "completed") return "success";
  if (type === "moved_to_review") return "warning";
  if (type === "revision_requested") return "warning";
  if (type === "task_started") return "info";
  if (type === "reassigned") return "accent";
  return "muted";
}

function formatEventType(type: TaskEvent["type"]) {
  return type.replaceAll("_", " ");
}

interface TaskDetailViewProps {
  taskId: string;
}

export function TaskDetailView({ taskId }: TaskDetailViewProps) {
  const tasks = useTaskStore((s) => s.tasks);
  const decisions = useOrganizationStore((s) => s.decisions);
  const feed = useOrganizationStore((s) => s.organizationFeedItems);
  const providerHealth = useRuntimeStore((s) => s.providerHealth);
  const alerts = useRuntimeStore((s) => s.alerts);
  const storeMission = useMissionStore((s) => s.missions);

  const task = useMemo(() => tasks.find((t) => t.id === taskId), [tasks, taskId]);

  const mission = useMemo(() => {
    if (!task) return undefined;
    return storeMission.find((m) => m.id === task.missionId) ?? seedMissions.find((m) => m.id === task.missionId);
  }, [storeMission, task]);

  const relatedDecision = useMemo(() => {
    if (!task) return undefined;
    return decisions.find((d) => d.relatedTaskIds?.includes(task.id));
  }, [decisions, task]);

  const relatedFeed = useMemo(() => {
    if (!task) return [];
    const byTask = feed.filter((f) => f.taskId === task.id);
    const byMission = feed.filter((f) => f.missionId === task.missionId && !f.taskId);
    return [...byTask, ...byMission].slice(0, 8);
  }, [feed, task]);

  const runtimeSignals = useMemo(() => {
    if (!task) return [];
    return getRuntimeSignalsForMission(task.missionId, providerHealth, alerts);
  }, [alerts, providerHealth, task]);

  const runtimeImpactMessage = useMemo(() => {
    if (!task || task.status !== "blocked") return null;
    const claude = providerHealth.find(
      (p) => p.provider.includes("Claude") && p.health !== "healthy"
    );
    if (claude) {
      return "Claude latency may affect summarization workflow.";
    }
    const degraded = providerHealth.find((p) => p.health === "degraded");
    if (degraded) {
      return `Runtime impact detected — ${degraded.provider} elevated latency may slow execution.`;
    }
    return null;
  }, [providerHealth, task]);

  const timeline = useMemo(() => {
    const events = task?.events ?? [];
    return [...events].slice().reverse().slice(0, 24);
  }, [task]);

  if (!task) {
    notFound();
  }

  const suggestions = getSuggestedActionsForStatus(task.status);

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Link
            href="/tasks"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            ← Back to Tasks
          </Link>
          <h1 className="mt-2 truncate text-2xl font-semibold text-foreground">{task.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
            <StatusPill variant={taskStatusVariant[task.status]}>{task.status}</StatusPill>
            <span>Assigned: {agentName(task.assignedTo)}</span>
            <span>·</span>
            <MissionLink missionId={task.missionId} missionName={task.missionName} variant="pill" />
            {task.updatedAt ? (
              <>
                <span>·</span>
                <span>Updated {task.updatedAt}</span>
              </>
            ) : null}
          </div>
        </div>
        <div className="shrink-0">
          <TaskStatusActions task={task} compact />
        </div>
      </div>

      {runtimeImpactMessage ? (
        <div className="mb-6 rounded-lg border border-warning/30 bg-amber-50/50 px-4 py-3 text-sm text-foreground">
          <span className="font-medium text-warning">Runtime impact detected</span>
          <span className="text-muted"> — </span>
          {runtimeImpactMessage}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <SectionHeader title="Task Overview" />
            <div className="space-y-2 text-sm">
              <p className="text-muted">
                Mission:{" "}
                <Link href={`/missions/${task.missionId}`} className="font-medium text-accent hover:underline">
                  {task.missionName}
                </Link>
              </p>
              <p className="text-muted">ETA: {task.eta}</p>
              {task.dependencies.length ? (
                <p className="text-muted">Dependencies: {task.dependencies.join(", ")}</p>
              ) : (
                <p className="text-muted">Dependencies: None</p>
              )}
              <p className="text-muted">Progress: {task.progress}%</p>
            </div>
          </Card>

          <Card>
            <SectionHeader title="Execution Status" description="Current operational state and expectations" />
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-foreground">
                  Status:{" "}
                  <StatusPill variant={taskStatusVariant[task.status]} className="ml-2">
                    {task.status}
                  </StatusPill>
                </p>
                <p className="mt-2 text-sm text-muted">
                  Owner: {agentName(task.assignedTo)} ({task.assignedTo})
                </p>
              </div>
              <div className="w-full max-w-xs rounded-lg border border-border bg-surface p-3">
                <p className="text-xs font-medium uppercase text-muted">Latest event</p>
                <p className="mt-1 text-sm text-foreground">
                  {task.events?.length ? task.events[task.events.length - 1].message : "No events yet."}
                </p>
              </div>
            </div>
            <TaskStatusActions task={task} />
          </Card>

          <Card>
            <SectionHeader title="Event Timeline" description="Structured execution log" />
            {timeline.length === 0 ? (
              <p className="text-sm text-muted">No events recorded for this task.</p>
            ) : (
              <ul className="space-y-3">
                {timeline.map((e) => (
                  <li key={e.id} className="rounded-lg border border-border bg-surface p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={sourceBadgeClass(e.source)}>{e.source}</span>
                        <StatusPill variant={eventVariant(e.type)}>{formatEventType(e.type)}</StatusPill>
                      </div>
                      <span className="text-xs text-muted">{e.timestamp}</span>
                    </div>
                    <p className="mt-2 text-sm text-foreground">{e.message}</p>
                    {e.actor ? (
                      <p className="mt-1 text-xs text-muted">
                        {agentName(e.actor)} · {e.actor}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <SectionHeader title="Related Mission" />
            {mission ? (
              <div className="rounded-lg border border-border bg-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{mission.name}</p>
                    <p className="mt-1 text-xs text-muted">{mission.summary}</p>
                  </div>
                  <Link
                    href={`/missions/${mission.id}`}
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    Open Mission →
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">Mission not available in local state.</p>
            )}
          </Card>

          <Card>
            <SectionHeader title="Related Decision" />
            {relatedDecision ? (
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="text-sm font-medium text-foreground">{relatedDecision.title}</p>
                <p className="mt-1 text-sm text-muted">{relatedDecision.summary}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                  <Link
                    href={`/judgment?mission=${task.missionId}`}
                    className="font-medium text-accent hover:underline"
                  >
                    Open in Judgment Center →
                  </Link>
                  <Link
                    href={`/missions/${task.missionId}`}
                    className="font-medium text-accent hover:underline"
                  >
                    View Mission →
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">No explicit decision link for this task.</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <SectionHeader title="Feed Activity" description="Organization stream relevant to this work" />
            {relatedFeed.length === 0 ? (
              <p className="text-sm text-muted">No recent feed activity.</p>
            ) : (
              <ul className="space-y-3">
                {relatedFeed.map((f) => (
                  <li key={f.id} className="rounded-lg border border-border bg-surface p-3">
                    <p className="text-xs text-muted">
                      {f.authorName} ({f.author}) · {f.timestamp}
                      {f.taskId === task.id ? " · this task" : ""}
                    </p>
                    <p className="mt-1 text-sm text-foreground">{f.message}</p>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href={`/organization-feed?mission=${task.missionId}`}
              className="mt-3 inline-block text-xs font-medium text-accent hover:underline"
            >
              View full Organization Feed →
            </Link>
          </Card>

          <Card>
            <SectionHeader title="Runtime Signals" description="Quiet operational context" />
            {runtimeSignals.length === 0 ? (
              <p className="text-sm text-muted">No signals.</p>
            ) : (
              <ul className="space-y-2">
                {runtimeSignals.map((s) => (
                  <li key={s.id} className="rounded-lg border border-border bg-surface p-3">
                    <StatusPill
                      variant={s.severity === "danger" ? "danger" : s.severity === "warning" ? "warning" : "muted"}
                      className="mb-2"
                    >
                      {s.severity}
                    </StatusPill>
                    <p className="text-sm text-foreground">{s.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <SectionHeader title="Suggested Next Actions" description="Execute organizational responses" />
            <ul className="space-y-3">
              {suggestions.map((a) => (
                <li key={a.key} className="rounded-lg border border-border bg-surface p-3">
                  <p className="text-sm font-medium text-foreground">{a.title}</p>
                  <p className="mt-1 text-xs text-muted">{a.description}</p>
                  <button
                    type="button"
                    onClick={() => executeSuggestedAction(task, a.key)}
                    className="mt-3 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-surface"
                  >
                    Run action
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
