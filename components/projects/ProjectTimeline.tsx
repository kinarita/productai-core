"use client";

import type { ProjectTimelineStage } from "@/lib/project-creation/projectCreationTypes";
import { cn } from "@/lib/utils";

export function ProjectTimeline({ stages }: { stages: ProjectTimelineStage[] }) {
  return (
    <div className="flex gap-1">
      {stages.map((stage) => (
        <div key={stage.id} className="flex-1">
          <div
            className={cn(
              "h-2 rounded-full",
              stage.state === "done"
                ? "bg-success"
                : stage.state === "current"
                  ? "bg-accent"
                  : "bg-border"
            )}
          />
          <p
            className={cn(
              "mt-1 truncate text-center text-[10px]",
              stage.state === "current" ? "font-medium text-foreground" : "text-muted"
            )}
          >
            {stage.label}
          </p>
        </div>
      ))}
    </div>
  );
}
