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
import { getImportantTasks } from "@/lib/task/taskSelectors";
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
  const importantTasks = getImportantTasks(tasks, 6);

  const orgHealth = computeOrganizationHealth(missions, runtimeAlerts);
  const activeMissions = missions.filter((m) => m.status === "active" || m.status === "planning");
  const pendingDecisions = decisions.filter((d) => d.status === "pending");

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
