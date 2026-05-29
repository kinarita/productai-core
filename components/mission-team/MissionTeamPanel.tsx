"use client";

import Link from "next/link";
import type { Mission } from "@/types/productai";
import {
  buildMissionTeamOverview,
  buildMissionTeamResponsibilityView,
} from "@/lib/mission-team/missionWorkflow";
import { roleResponsibilityDetails } from "@/lib/mission-team/roleResponsibilities";
import { cooCoordinationNote, missionTeamRoles } from "@/lib/mission-team/missionRoles";
import { RoleResponsibilityCard } from "@/components/mission-team/RoleResponsibilityCard";
import { MissionWorkflowView } from "@/components/mission-team/MissionWorkflowView";
import { ProductPlanningStage } from "@/components/mission-team/ProductPlanningStage";
import { DirectorCoordinationStage } from "@/components/mission-team/DirectorCoordinationStage";
import { useMissionTeamStore } from "@/lib/store/missionTeamStore";
import { cn } from "@/lib/utils";

export function MissionTeamOverviewPanel({
  missions,
  compact = false,
}: {
  missions: Mission[];
  compact?: boolean;
}) {
  const buckets = buildMissionTeamOverview(missions);

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <p className="text-xs text-muted">
        Mission Team turns CEO ideas into delivered products. COO coordinates—Planner and Director own
        planning and direction.
      </p>
      {buckets.map((bucket) => (
        <div key={bucket.id} className="rounded-lg border border-border bg-background px-3 py-2">
          <p className="text-xs font-medium uppercase text-muted">{bucket.label}</p>
          {bucket.activeMissions.length > 0 ? (
            <ul className="mt-1 space-y-1 text-xs text-muted">
              {bucket.activeMissions.slice(0, compact ? 2 : 4).map((m) => (
                <li key={m.id}>
                  <Link href={`/missions/${m.id}`} className="text-accent hover:underline">
                    {m.name}
                  </Link>{" "}
                  · {m.stageLabel}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-xs text-muted">No active missions in this bucket.</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function MissionTeamPanel({
  mission,
  missions = [],
  compact = false,
}: {
  mission?: Mission;
  missions?: Mission[];
  compact?: boolean;
}) {
  const activeView = useMissionTeamStore((s) => s.activeWorkflowView);
  const setActiveView = useMissionTeamStore((s) => s.setActiveWorkflowView);
  const selectedRole = useMissionTeamStore((s) => s.selectedRole);

  const views = [
    { id: "overview" as const, label: "Overview" },
    { id: "workflow" as const, label: "Workflow" },
    { id: "planning" as const, label: "Planning" },
    { id: "direction" as const, label: "Direction" },
    { id: "roles" as const, label: "Roles" },
  ];

  const roleDetail = roleResponsibilityDetails.find((r) => r.roleId === selectedRole);

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <p className="text-xs text-muted">{cooCoordinationNote}</p>

      {!compact ? (
        <div className="flex flex-wrap gap-1">
          {views.map((view) => (
            <button
              key={view.id}
              type="button"
              onClick={() => setActiveView(view.id)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                activeView === view.id
                  ? "border-accent bg-indigo-50 text-accent"
                  : "border-border bg-background text-muted hover:bg-surface"
              )}
            >
              {view.label}
            </button>
          ))}
        </div>
      ) : null}

      {(activeView === "overview" || compact) && missions.length > 0 ? (
        <MissionTeamOverviewPanel missions={missions} compact={compact} />
      ) : null}

      {(activeView === "workflow" || compact) && mission ? (
        <MissionWorkflowView mission={mission} compact={compact} />
      ) : null}

      {(activeView === "planning" || compact) && mission ? (
        <ProductPlanningStage mission={mission} />
      ) : null}

      {(activeView === "direction" || compact) && mission ? (
        <DirectorCoordinationStage mission={mission} />
      ) : null}

      {activeView === "roles" || compact ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {missionTeamRoles.slice(0, compact ? 4 : 6).map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => useMissionTeamStore.getState().setSelectedRole(role.id)}
              className="text-left"
            >
              <RoleResponsibilityCard
                detail={roleResponsibilityDetails.find((r) => r.roleId === role.id)!}
                compact
              />
            </button>
          ))}
        </div>
      ) : null}

      {roleDetail && !compact ? <RoleResponsibilityCard detail={roleDetail} /> : null}
    </div>
  );
}

export function MissionTeamResponsibilityPanel({ mission }: { mission: Mission }) {
  const view = buildMissionTeamResponsibilityView(mission);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">{view.statusNote}</p>
      <div className="rounded-lg border border-border bg-background px-3 py-2">
        <p className="text-sm font-medium text-foreground">Current stage: {view.stageTitle}</p>
        <p className="mt-1 text-xs text-muted">{view.stageDescription}</p>
        <p className="mt-2 text-xs text-muted">
          Primary role: {view.primaryRoleTitle}
          {view.cooCoordinates ? " · COO coordinates" : ""}
        </p>
      </div>
      <MissionWorkflowView mission={mission} compact />
    </div>
  );
}
