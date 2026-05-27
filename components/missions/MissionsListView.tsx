"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { AgentAvatar } from "@/components/AgentAvatar";
import { LifecycleStepper } from "@/components/LifecycleStepper";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusPill } from "@/components/StatusPill";
import { useMissionStore } from "@/lib/store/missionStore";
import type { MissionHealth } from "@/types/productai";

const healthVariant: Record<MissionHealth, "success" | "warning" | "danger"> = {
  stable: "success",
  delayed: "warning",
  risky: "warning",
  blocked: "danger",
};

const statusVariant = {
  planning: "muted" as const,
  active: "accent" as const,
  on_hold: "warning" as const,
  completed: "success" as const,
};

export function MissionsListView() {
  const missions = useMissionStore((s) => s.missions);

  return (
    <AppShell
      title="Products / Missions"
      description="Track software products from idea to release"
    >
      <div className="grid gap-6">
        {missions.map((mission) => (
          <Card key={mission.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground">{mission.name}</h3>
                  <StatusPill variant={healthVariant[mission.health]}>{mission.health}</StatusPill>
                  <StatusPill variant={statusVariant[mission.status]}>{mission.status}</StatusPill>
                </div>
                <p className="mt-2 max-w-2xl text-sm text-muted">{mission.description}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-foreground">{mission.progress}%</p>
                <p className="text-xs text-muted">
                  Readiness {mission.releaseReadiness.score}% · {mission.updatedAt}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
                Mission Lifecycle
              </p>
              <LifecycleStepper currentPhase={mission.lifecycle} compact />
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                  Assigned AI Team
                </p>
                <div className="flex flex-wrap gap-3">
                  {mission.assignedAgents.map((role) => (
                    <AgentAvatar key={role} role={role} />
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                  Blockers
                </p>
                {mission.blockers.length === 0 ? (
                  <p className="text-sm text-muted">None</p>
                ) : (
                  <ul className="space-y-1">
                    {mission.blockers.map((b) => (
                      <li key={b} className="text-sm text-danger">
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                  Recent Activity
                </p>
                <p className="text-sm text-foreground">{mission.recentActivity}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <ProgressBar value={mission.progress} showLabel />
              <p className="text-xs text-muted">{mission.releaseReadiness.label}</p>
            </div>

            <div className="mt-6 flex justify-end border-t border-border pt-4">
              <Link
                href={`/missions/${mission.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-surface"
              >
                View Details
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
