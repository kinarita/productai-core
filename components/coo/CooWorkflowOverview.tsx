"use client";

import type { CooWorkflowSummary } from "@/lib/coo/cooWorkflowSummary";
import { useCooWorkspaceStore } from "@/lib/store/cooWorkspaceStore";
import type { CooPipelineStageId } from "@/lib/coo/cooWorkspace";
import { cn } from "@/lib/utils";

export function CooWorkflowOverview({
  summary,
  compact = false,
}: {
  summary: CooWorkflowSummary;
  compact?: boolean;
}) {
  const selectedStage = useCooWorkspaceStore((s) => s.selectedStage);
  const setSelectedStage = useCooWorkspaceStore((s) => s.setSelectedStage);

  const stageLabels: Record<CooPipelineStageId, string> = {
    planning: "Planning Missions",
    direction: "Direction Missions",
    architecture: "Architecture Missions",
    design: "Design Missions",
    development: "Development Missions",
    qa: "QA Missions",
    release: "Release Ready Missions",
    reflection: "Reflection Missions",
  };

  const visibleStages = summary.stages.filter(
    (s) => s.stage !== "reflection" || s.missionCount > 0
  );

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="flex flex-wrap gap-2 text-xs text-muted">
        <span>Active: {summary.activeMissionCount}</span>
        <span>·</span>
        <span>Release ready: {summary.releaseReadyCount}</span>
      </div>
      <div className={cn("grid gap-2", compact ? "grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4")}>
        {visibleStages.map((stage) => (
          <button
            key={stage.stage}
            type="button"
            onClick={() => setSelectedStage(selectedStage === stage.stage ? null : stage.stage)}
            className={cn(
              "rounded-lg border border-border px-3 py-2 text-left transition hover:border-accent/40",
              selectedStage === stage.stage && "border-accent/60 bg-accent/5"
            )}
          >
            <p className="text-[10px] font-medium uppercase text-muted">
              {stageLabels[stage.stage] ?? stage.title}
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">{stage.missionCount}</p>
            {!compact && stage.missionNames.length > 0 ? (
              <p className="mt-1 truncate text-[11px] text-muted">
                {stage.missionNames.slice(0, 2).join(", ")}
              </p>
            ) : null}
          </button>
        ))}
      </div>
      {!compact ? (
        <p className="text-xs text-muted">{summary.advisoryNote}</p>
      ) : null}
    </div>
  );
}
