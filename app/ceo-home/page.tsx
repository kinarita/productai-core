import { AppShell } from "@/components/AppShell";
import { Card, StatCard } from "@/components/Card";
import { Badge } from "@/components/Badge";
import {
  organizationHealth,
  missions,
  pendingApprovals,
  operationalAlerts,
  agents,
} from "@/data/mockData";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

const healthVariant = {
  stable: "success" as const,
  delayed: "warning" as const,
  risky: "warning" as const,
  blocked: "danger" as const,
};

export default function CeoHomePage() {
  return (
    <AppShell
      title="CEO Home"
      description="Executive operational overview of your AI product organization"
    >
      <div className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Organization Health"
            value={`${organizationHealth.score}%`}
            subtext={organizationHealth.label}
          />
          <StatCard
            label="Active Missions"
            value={organizationHealth.activeMissions}
            subtext="Across product portfolio"
          />
          <StatCard
            label="Pending Approvals"
            value={organizationHealth.pendingApprovals}
            subtext="Require your judgment"
          />
          <StatCard
            label="Weekly Velocity"
            value={`${organizationHealth.weeklyVelocity}%`}
            subtext="Tasks completed vs planned"
            trend="up"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Active Missions" description="Current product initiatives">
            <ul className="divide-y divide-border">
              {missions
                .filter((m) => m.health !== "blocked")
                .slice(0, 4)
                .map((mission) => (
                  <li key={mission.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{mission.name}</p>
                      <p className="mt-0.5 truncate text-sm text-muted">{mission.recentActivity}</p>
                      <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-surface">
                        <div
                          className="h-full rounded-full bg-accent transition-all"
                          style={{ width: `${mission.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end gap-1">
                      <Badge variant={healthVariant[mission.health]}>{mission.health}</Badge>
                      <span className="text-xs text-muted">{mission.progress}%</span>
                    </div>
                  </li>
                ))}
            </ul>
          </Card>

          <Card title="Pending Approvals" description="Decisions awaiting CEO action">
            <ul className="space-y-3">
              {pendingApprovals.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4"
                >
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 text-xs text-muted">
                      {item.mission} · {item.type} · {item.requestedAt}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
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
                    <p className="mt-1 text-xs text-muted">
                      {alert.mission ? `${alert.mission} · ` : ""}
                      {alert.timestamp}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
