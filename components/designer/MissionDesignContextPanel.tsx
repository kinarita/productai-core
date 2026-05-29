"use client";

import Link from "next/link";
import type { Mission, Task } from "@/types/productai";
import { buildDesignerMissionContext } from "@/lib/designer/designerAnalysis";
import { designSpecificationArtifactId } from "@/lib/designer/designerWorkspace";

export function MissionDesignContextPanel({
  mission,
  missions,
  tasks,
}: {
  mission: Mission;
  missions: Mission[];
  tasks: Task[];
}) {
  const ctx = buildDesignerMissionContext({ mission, missions, tasks });

  if (!ctx) {
    return (
      <p className="text-xs text-muted">
        Design context appears when Architect technical specification is available.{" "}
        <Link href="/architect-workspace" className="text-accent hover:underline">
          Architect Workspace
        </Link>
      </p>
    );
  }

  const artifactHref = `/artifact-review?mission=${mission.id}&artifact=${designSpecificationArtifactId(mission.id)}`;

  return (
    <div className="space-y-3 text-xs">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">User Flow</p>
          <p className="font-medium text-foreground">{ctx.userFlow.title}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Screen Count</p>
          <p className="text-lg font-semibold">{ctx.screens.length}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Design Specification</p>
          <p className="font-medium">{ctx.designSpec.title}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Design Review Status</p>
          <p className="font-medium">{ctx.designReview.statusLabel}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href={`/designer-workspace?mission=${mission.id}`} className="text-accent hover:underline">
          Designer Workspace
        </Link>
        <Link href={artifactHref} className="text-accent hover:underline">
          Design Specification Review
        </Link>
      </div>
    </div>
  );
}
