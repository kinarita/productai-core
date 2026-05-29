"use client";

import type { Mission } from "@/types/productai";
import {
  inferMissionWorkflowStage,
  missionWorkflowStages,
  getWorkflowStage,
} from "@/lib/mission-team/missionWorkflow";
import { useMissionTeamStore } from "@/lib/store/missionTeamStore";
import { cn } from "@/lib/utils";

export function MissionWorkflowView({
  mission,
  compact = false,
}: {
  mission?: Mission;
  compact?: boolean;
}) {
  const selectedStage = useMissionTeamStore((s) => s.selectedStage);
  const setSelectedStage = useMissionTeamStore((s) => s.setSelectedStage);
  const activeStageId = mission
    ? inferMissionWorkflowStage(mission)
    : selectedStage ?? "product_planning";

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <p className="text-xs text-muted">
        Mission workflow from CEO idea through reflection—visibility only, no automatic execution.
      </p>
      <ol className="space-y-2 border-l border-border pl-3">
        {missionWorkflowStages.map((stage) => {
          const isActive = stage.id === activeStageId;
          return (
            <li key={stage.id} className="relative text-xs">
              <span
                className={cn(
                  "absolute -left-[7px] top-1.5 h-2 w-2 rounded-full",
                  isActive ? "bg-accent" : "bg-border"
                )}
              />
              <button
                type="button"
                onClick={() => setSelectedStage(stage.id)}
                className={cn(
                  "text-left",
                  isActive ? "font-medium text-foreground" : "text-muted hover:text-foreground"
                )}
              >
                {stage.title}
              </button>
              {!compact && isActive ? (
                <p className="mt-1 text-muted">{getWorkflowStage(stage.id).description}</p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
