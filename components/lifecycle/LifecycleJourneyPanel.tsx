"use client";

import type { ProductLifecycleStageId } from "@/lib/lifecycle/productLifecycle";
import { cn } from "@/lib/utils";

export function LifecycleJourneyPanel({
  journey,
  compact = false,
}: {
  journey: {
    stage: ProductLifecycleStageId;
    label: string;
    status: "completed" | "current" | "upcoming";
  }[];
  compact?: boolean;
}) {
  if (journey.length === 0) {
    return (
      <p className="text-xs text-muted">
        Select a mission to view how it progressed through the product lifecycle.
      </p>
    );
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-4"}>
      <p className="text-xs text-muted">
        Journey path from idea through outcome—derived from existing mission and release context,
        not automatic evaluation.
      </p>
      <div className="flex flex-wrap items-center gap-1">
        {journey.map((step, index) => (
          <div key={step.stage} className="flex items-center gap-1">
            <div
              className={cn(
                "rounded-lg border px-2 py-1 text-[10px] font-medium",
                step.status === "completed" && "border-success/40 bg-success/10 text-success",
                step.status === "current" && "border-accent bg-accent/10 text-accent",
                step.status === "upcoming" && "border-border text-muted"
              )}
            >
              {step.label}
            </div>
            {index < journey.length - 1 ? (
              <span className="text-muted">→</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
