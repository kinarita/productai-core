"use client";

import Link from "next/link";
import type { Mission, Task } from "@/types/productai";
import { buildMissionLineageContext } from "@/lib/lineage/artifactLineageAnalysis";

export function MissionLineageContextPanel({
  mission,
  tasks,
}: {
  mission: Mission;
  tasks: Task[];
}) {
  const ctx = buildMissionLineageContext({ mission, tasks });

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">{ctx.progressNote}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Current Artifact</p>
          <p className="text-sm font-medium">{ctx.currentArtifact}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Current Owner</p>
          <p className="text-sm font-medium">{ctx.currentOwner}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Previous</p>
          <p className="text-sm text-muted">{ctx.previousArtifact ?? "—"}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Next</p>
          <p className="text-sm text-muted">{ctx.nextArtifact ?? "—"}</p>
        </div>
      </div>
      <Link href={ctx.lineageHref} className="text-xs text-accent hover:underline">
        Open Lineage
      </Link>
    </div>
  );
}
