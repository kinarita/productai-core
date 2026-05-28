"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, StatCard } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { MissionLink } from "@/components/MissionLink";
import { computeOrganizationHealth } from "@/lib/store/computeOrganizationHealth";
import { useMissionStore } from "@/lib/store/missionStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { useRuntimeStore } from "@/lib/store/runtimeStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { useProcessingStore } from "@/lib/store/processingStore";
import { buildProcessingAnalytics } from "@/lib/orchestration/processing/processingAnalytics";
import { GovernanceHealthBadge } from "@/components/orchestration/GovernanceHealthBadge";
import { getDependencyWarnings } from "@/lib/task/taskDependencies";
import { getImportantTasks, getRecentlyCreatedTasks } from "@/lib/task/taskSelectors";
import { getBlockerAge } from "@/lib/task/missionExecutionInsights";
import { StatusPill } from "@/components/StatusPill";
import type { TaskStatus } from "@/types/productai";
import { agents } from "@/data/mockData";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock } from "lucide-react";

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

export function CeoHomeView() {
  const missions = useMissionStore((s) => s.missions);
  const decisions = useOrganizationStore((s) => s.decisions);
  const runtimeAlerts = useRuntimeStore((s) => s.alerts);
  const tasks = useTaskStore((s) => s.tasks);
  const processingSessions = useProcessingStore((s) => s.getSessions());
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
  const processingAnalytics = buildProcessingAnalytics(processingSessions);
  const missionRiskRows = Object.entries(processingAnalytics.missionRisk)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

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
            <Link href="/runtime-cost" className="rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-background">
              <p className="text-xs font-medium uppercase text-muted">High severity items</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {processingAnalytics.summary.elevatedRiskCount}
              </p>
            </Link>
            <Link href="/runtime-cost?review=processing_review_required" className="rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-background">
              <p className="text-xs font-medium uppercase text-muted">Review-required sessions</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {processingAnalytics.summary.reviewRequiredCount}
              </p>
            </Link>
            <Link href="/runtime-cost?category=runtime_stability" className="rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-background">
              <p className="text-xs font-medium uppercase text-muted">Runtime continuity concerns</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {processingAnalytics.summary.runtimeInstabilityCount}
              </p>
            </Link>
            <Link href="/runtime-cost?review=processing_paused" className="rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-background">
              <p className="text-xs font-medium uppercase text-muted">Processing pauses/revokes</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {
                  processingSessions.filter(
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
