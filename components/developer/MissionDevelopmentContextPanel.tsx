"use client";

import Link from "next/link";
import type { Mission, Task } from "@/types/productai";
import { buildDeveloperMissionContext } from "@/lib/developer/developerAnalysis";
import { implementationPlanArtifactId } from "@/lib/developer/developerWorkspace";

export function MissionDevelopmentContextPanel({
  mission,
  missions,
  tasks,
}: {
  mission: Mission;
  missions: Mission[];
  tasks: Task[];
}) {
  const ctx = buildDeveloperMissionContext({ mission, missions, tasks });

  if (!ctx) {
    return (
      <p className="text-xs text-muted">
        Development context appears when Designer artifacts are available.{" "}
        <Link href="/designer-workspace" className="text-accent hover:underline">
          Designer Workspace
        </Link>
      </p>
    );
  }

  const artifactHref = `/artifact-review?mission=${mission.id}&artifact=${implementationPlanArtifactId(mission.id)}`;

  return (
    <div className="space-y-3 text-xs">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Implementation Plan</p>
          <p className="font-medium text-foreground">{ctx.implementationPlan.title}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Work Breakdown</p>
          <p className="text-lg font-semibold">{ctx.workBreakdown.length} items</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Repository Plan</p>
          <p>{ctx.repositoryPlan.branchStrategy[0]}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Development Readiness</p>
          <p className="font-medium">{ctx.readiness.statusLabel}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href={`/developer-workspace?mission=${mission.id}`} className="text-accent hover:underline">
          Developer Workspace
        </Link>
        <Link href={artifactHref} className="text-accent hover:underline">
          Implementation Plan Review
        </Link>
      </div>
    </div>
  );
}
