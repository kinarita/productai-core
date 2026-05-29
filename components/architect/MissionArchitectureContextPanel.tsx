"use client";

import Link from "next/link";
import type { Mission, Task } from "@/types/productai";
import { buildArchitectMissionContext } from "@/lib/architect/architectAnalysis";
import { technicalSpecificationArtifactId } from "@/lib/architect/architectWorkspace";

export function MissionArchitectureContextPanel({
  mission,
  missions,
  tasks,
}: {
  mission: Mission;
  missions: Mission[];
  tasks: Task[];
}) {
  const ctx = buildArchitectMissionContext({ mission, missions, tasks });

  if (!ctx) {
    return (
      <p className="text-xs text-muted">
        Architecture context appears when Director handoff planning is available.{" "}
        <Link href="/director-workspace" className="text-accent hover:underline">
          Director Workspace
        </Link>
      </p>
    );
  }

  const artifactHref = `/artifact-review?mission=${mission.id}&artifact=${technicalSpecificationArtifactId(mission.id)}`;

  return (
    <div className="space-y-3 text-xs">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Technical Specification</p>
          <p className="font-medium text-foreground">{ctx.specification.title}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Architecture Review</p>
          <p className="font-medium">{ctx.architectureReview.statusLabel}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Component Summary</p>
          <p>{ctx.components.length} layers documented</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Design Readiness</p>
          <p>{ctx.architectureReview.recommendation.slice(0, 80)}…</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href={`/architect-workspace?mission=${mission.id}`} className="text-accent hover:underline">
          Architect Workspace
        </Link>
        <Link href={artifactHref} className="text-accent hover:underline">
          Artifact Review
        </Link>
      </div>
    </div>
  );
}
