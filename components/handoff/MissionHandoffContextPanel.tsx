"use client";

import Link from "next/link";
import type { Mission, Task } from "@/types/productai";
import { buildMissionHandoffContext } from "@/lib/handoff/handoffAnalysis";
import { HandoffTimeline } from "@/components/handoff/HandoffTimeline";
import { handoffStatusLabel } from "@/lib/handoff/handoffStatus";

export function MissionHandoffContextPanel({
  mission,
  tasks,
}: {
  mission: Mission;
  tasks: Task[];
}) {
  const context = buildMissionHandoffContext({ mission, tasks });

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">{context.progressNote}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Current Role</p>
          <p className="text-sm">{context.currentRoleLabel}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Current Artifact</p>
          <p className="text-sm">{context.currentArtifact}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Artifact Status</p>
          <p className="text-sm">{handoffStatusLabel(context.currentArtifactStatus)}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Next Handoff</p>
          <p className="text-sm">{context.nextHandoffRoleLabel ?? "—"}</p>
        </div>
      </div>
      <HandoffTimeline steps={context.timeline} compact />
      <Link
        href={`/team-handoff?mission=${mission.id}`}
        className="inline-block text-xs text-accent hover:underline"
      >
        Open Team Handoff Workspace
      </Link>
    </div>
  );
}
