"use client";

import type { ArtifactLineageMissionContext } from "@/lib/lineage/artifactLineageAnalysis";

export function LineageOverviewPanel({ context }: { context: ArtifactLineageMissionContext }) {
  const { overview } = context;
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border border-border px-3 py-2">
        <p className="text-[10px] uppercase text-muted">Mission</p>
        <p className="text-sm font-medium">{overview.missionName}</p>
      </div>
      <div className="rounded-lg border border-border px-3 py-2">
        <p className="text-[10px] uppercase text-muted">Lifecycle Stage</p>
        <p className="text-sm font-medium">{overview.currentLifecycleStage}</p>
      </div>
      <div className="rounded-lg border border-border px-3 py-2">
        <p className="text-[10px] uppercase text-muted">Current Team Role</p>
        <p className="text-sm font-medium">{overview.currentTeamRole}</p>
      </div>
      <div className="rounded-lg border border-border px-3 py-2">
        <p className="text-[10px] uppercase text-muted">Artifact Count</p>
        <p className="text-sm font-medium">{overview.artifactCount}</p>
        <p className="text-[10px] text-muted">Updated {overview.lastUpdated}</p>
      </div>
    </div>
  );
}
