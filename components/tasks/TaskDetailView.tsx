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
  getSuggestedActionsForTask,
} from "@/lib/task/suggestedTaskActions";
import { isWaitingOnDependency } from "@/lib/task/taskDependencies";
import { agentName, sourceBadgeClass } from "@/lib/task/taskUi";
import { TaskDependenciesPanel } from "@/components/tasks/TaskDependenciesPanel";
import { ProvenanceCard } from "@/components/orchestration/ProvenanceCard";
import { useProposalStore } from "@/lib/store/proposalStore";
import { useExecutionStore } from "@/lib/store/executionStore";
import { TaskWorkflowSteps } from "@/components/tasks/TaskWorkflowSteps";
import { useMissionStore } from "@/lib/store/missionStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { useRuntimeStore } from "@/lib/store/runtimeStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { useSyncStore } from "@/lib/store/syncStore";
import { useExecutionQueueStore } from "@/lib/store/executionQueueStore";
import { ExecutionQueueCard } from "@/components/orchestration/ExecutionQueueCard";
import { queueFeedMessage } from "@/lib/orchestration/queue/queueFeed";
import { validateExecutionBoundary } from "@/lib/orchestration/queue/executionGate";
import { GovernanceNote } from "@/components/orchestration/GovernanceNote";
import { useExecutionAuthorizationStore } from "@/lib/store/executionAuthorizationStore";
import { ExecutionIntentReview } from "@/components/orchestration/ExecutionIntentReview";
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
  const proposals = useProposalStore((s) => s.proposals);
  const executionTickets = useExecutionStore((s) => s.tickets);
  const addFeedItem = useOrganizationStore((s) => s.addFeedItemWithSync);
  const syncWarnings = useSyncStore((s) => s.syncWarnings);
  const queueItem = useExecutionQueueStore((s) => s.getItemForTask(taskId));
  const runtimeLock = useExecutionQueueStore((s) => s.runtimeLock);
  const enqueueTask = useExecutionQueueStore((s) => s.enqueueTask);
  const reserveSlot = useExecutionQueueStore((s) => s.reserveSlot);
  const releaseReservation = useExecutionQueueStore((s) => s.releaseReservation);
  const prepareWorkerForItem = useExecutionQueueStore((s) => s.prepareWorkerForItem);
  const completePreparationReview = useExecutionQueueStore((s) => s.completePreparationReview);
  const refreshRuntimeLock = useExecutionQueueStore((s) => s.refreshRuntimeLock);
  const requestAuthorization = useExecutionAuthorizationStore((s) => s.requestAuthorization);
  const authorizeExecution = useExecutionAuthorizationStore((s) => s.authorizeExecution);
  const denyAuthorization = useExecutionAuthorizationStore((s) => s.denyAuthorization);
  const revokeAuthorization = useExecutionAuthorizationStore((s) => s.revokeAuthorization);
  const getRequestForQueueItem = useExecutionAuthorizationStore((s) => s.getRequestForQueueItem);
  const getAuditForQueueItem = useExecutionAuthorizationStore((s) => s.getAuditForQueueItem);
  const signatures = useExecutionAuthorizationStore((s) => s.signatures);

  const task = useMemo(() => tasks.find((t) => t.id === taskId), [tasks, taskId]);

  const providerDegraded = useMemo(
    () => providerHealth.some((p) => p.health === "degraded" || p.health === "down"),
    [providerHealth]
  );

  const provenanceProposal = useMemo(() => {
    if (!task?.provenance?.createdFromProposalId) return undefined;
    return proposals.find((p) => p.id === task.provenance?.createdFromProposalId);
  }, [proposals, task]);

  const provenanceTicket = useMemo(() => {
    if (!task?.provenance?.createdFromExecutionTicketId) return undefined;
    return executionTickets.find(
      (t) => t.id === task.provenance?.createdFromExecutionTicketId
    );
  }, [executionTickets, task]);

  const mission = useMemo(() => {
    if (!task) return undefined;
    return storeMission.find((m) => m.id === task.missionId) ?? seedMissions.find((m) => m.id === task.missionId);
  }, [storeMission, task]);

  const relatedDecision = useMemo(() => {
    if (!task) return undefined;
    if (task.relatedDecisionId) {
      return decisions.find((d) => d.id === task.relatedDecisionId);
    }
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

  const pushQueueFeed = (action: Parameters<typeof queueFeedMessage>[0]) => {
    addFeedItem({
      type: "coordination",
      author: action === "runtime_lock" ? "Runtime Observer" : "COO",
      authorName: action === "runtime_lock" ? "Pulse" : "Nova",
      missionId: task.missionId,
      missionName: task.missionName,
      taskId: task.id,
      message: queueFeedMessage(action, task.title),
      status: "active",
      requiresCeoApproval: false,
    });
  };

  const suggestions = getSuggestedActionsForTask(task, tasks);
  const waitingOnDep = isWaitingOnDependency(task, tasks);

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <nav className="mb-2 flex flex-wrap items-center gap-1 text-xs text-muted">
            <Link href="/ceo-home" className="hover:text-accent">CEO Home</Link>
            <span>&gt;</span>
            <Link href={`/missions/${task.missionId}`} className="hover:text-accent">{task.missionName}</Link>
            <span>&gt;</span>
            <Link href={`/tasks?mission=${task.missionId}`} className="hover:text-accent">Task Execution</Link>
            <span>&gt;</span>
            <span className="text-foreground">Execution</span>
          </nav>
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

      {waitingOnDep ? (
        <div className="mb-6 rounded-lg border border-warning/30 bg-amber-50/50 px-4 py-3 text-sm text-foreground">
          <span className="font-medium text-warning">Waiting on dependency</span>
          <span className="text-muted"> — upstream task must be unblocked before execution can proceed.</span>
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
              {task.priority ? <p className="text-muted">Priority: {task.priority}</p> : null}
              {task.createdFrom ? (
                <p className="text-muted">Origin: {task.createdFrom}</p>
              ) : null}
              <p className="text-muted">Progress: {task.progress}%</p>
            </div>
          </Card>

          <Card>
            <SectionHeader title="Workflow" description="Judgment to mission progress" />
            <TaskWorkflowSteps task={task} hasDecision={Boolean(relatedDecision)} />
          </Card>

          <Card>
            <SectionHeader title="Dependencies" description="Depends on and blocking relationships" />
            <TaskDependenciesPanel task={task} allTasks={tasks} />
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

          {task.provenance ? (
            <Card>
              <SectionHeader
                title="Governance Provenance"
                description="Why this operational task exists"
              />
              <ProvenanceCard
                provenance={task.provenance}
                proposal={provenanceProposal}
                ticket={provenanceTicket}
              />
            </Card>
          ) : null}

          {task.createdFrom === "materialization" ? (
            <Card>
              <SectionHeader
                title="Execution Queue Status"
                description="Controlled preparation — no autonomous execution"
              />
              <GovernanceNote>{validateExecutionBoundary()}</GovernanceNote>
              {queueItem ? (
                <div className="mt-4">
                  {queueItem.queueStatus === "awaiting_execution_authorization" ||
                  queueItem.queueStatus === "authorization_requested" ||
                  queueItem.queueStatus === "execution_authorized" ? (
                    <div className="mb-3">
                      <ExecutionIntentReview
                        item={queueItem}
                        request={getRequestForQueueItem(queueItem.id)}
                      />
                    </div>
                  ) : null}
                  <ExecutionQueueCard
                    item={queueItem}
                    taskTitle={task.title}
                    runtimeLockActive={runtimeLock.active}
                    authorizationRequest={getRequestForQueueItem(queueItem.id)}
                    authorizationSignature={signatures[queueItem.id]}
                    authorizationAudit={getAuditForQueueItem(queueItem.id)}
                    onReserve={() => {
                      refreshRuntimeLock(syncWarnings.length, alerts.length);
                      if (reserveSlot(queueItem.id, "COO")) pushQueueFeed("slot_reserved");
                    }}
                    onRelease={() => {
                      if (releaseReservation(queueItem.id)) pushQueueFeed("reservation_released");
                    }}
                    onPrepareWorker={() => {
                      refreshRuntimeLock(syncWarnings.length, alerts.length);
                      if (prepareWorkerForItem(queueItem.id, providerDegraded)) {
                        pushQueueFeed("worker_prepared");
                      }
                    }}
                    onCompleteReview={() => {
                      if (completePreparationReview(queueItem.id)) {
                        pushQueueFeed("awaiting_authorization");
                      }
                    }}
                    onRequestAuthorization={() => {
                      if (requestAuthorization(queueItem.id)) {
                        pushQueueFeed("authorization_requested");
                      }
                    }}
                    onAuthorizeExecution={() => {
                      if (authorizeExecution(queueItem.id)) {
                        pushQueueFeed("authorization_granted");
                      }
                    }}
                    onDenyAuthorization={() => {
                      if (denyAuthorization(queueItem.id)) {
                        pushQueueFeed("authorization_denied");
                      }
                    }}
                    onRevokeAuthorization={() => {
                      if (revokeAuthorization(queueItem.id)) {
                        pushQueueFeed("authorization_revoked");
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="mt-4">
                  <ExecutionQueueCard
                    item={{
                      id: "pending",
                      taskId: task.id,
                      missionId: task.missionId,
                      executionTarget: provenanceTicket?.executionTarget ?? "InternalAgent",
                      queueStatus: "execution_ready",
                      governanceBoundary: validateExecutionBoundary(),
                      runtimeLockStatus: runtimeLock.active ? "advisory_locked" : "unlocked",
                      readinessScore: 0,
                      blockingConditions: [],
                      createdAt: "—",
                    }}
                    taskTitle={task.title}
                    runtimeLockActive={runtimeLock.active}
                    showEnqueue
                    onEnqueue={() => {
                      refreshRuntimeLock(syncWarnings.length, alerts.length);
                      const item = enqueueTask(task.id, syncWarnings.length, alerts.length);
                      if (item) pushQueueFeed("queued");
                      if (runtimeLock.active) pushQueueFeed("runtime_lock");
                    }}
                    onReserve={() => {}}
                    onRelease={() => {}}
                    onPrepareWorker={() => {}}
                    onCompleteReview={() => {}}
                  />
                </div>
              )}
            </Card>
          ) : null}

          <Card>
            <SectionHeader
              title="Originating Decision"
              description="Judgment that spawned or governs this work"
            />
            {relatedDecision ? (
              <div className="rounded-lg border border-border bg-surface p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{relatedDecision.title}</p>
                  <StatusPill variant={relatedDecision.status === "approved" ? "success" : relatedDecision.status === "rejected" ? "danger" : "warning"}>
                    {relatedDecision.status}
                  </StatusPill>
                </div>
                <p className="mt-1 text-sm text-muted">{relatedDecision.summary}</p>
                {task.createdFrom === "judgment" ? (
                  <p className="mt-2 text-xs text-muted">This task was created from judgment.</p>
                ) : null}
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
              <p className="text-sm text-muted">No originating decision linked to this task.</p>
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
                  <li key={f.id}>
                    <Link
                      href={`/organization-feed?task=${task.id}`}
                      className="block rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-background"
                    >
                      <p className="text-xs text-muted">
                        {f.authorName} ({f.author}) · {f.timestamp}
                        {f.taskId === task.id ? " · this task" : ""}
                      </p>
                      <p className="mt-1 text-sm text-foreground">{f.message}</p>
                    </Link>
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
