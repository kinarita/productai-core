"use client";

import type { ProductBriefHistoryStep } from "@/lib/brief/productBriefAnalysis";
import { cn } from "@/lib/utils";

export function ProductBriefHistory({ steps }: { steps: ProductBriefHistoryStep[] }) {
  if (steps.length === 0) {
    return <p className="text-xs text-muted">Select a brief to view its history.</p>;
  }

  return (
    <ol className="space-y-3">
      {steps.map((step, index) => (
        <li key={step.id} className="relative pl-6">
          {index < steps.length - 1 ? (
            <span className="absolute left-[7px] top-4 h-full w-px bg-border" />
          ) : null}
          <span
            className={cn(
              "absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2",
              step.status === "completed" && "border-success bg-success/20",
              step.status === "current" && "border-accent bg-accent/20",
              step.status === "upcoming" && "border-border bg-background"
            )}
          />
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium text-foreground">{step.label}</p>
            <span className="text-[10px] uppercase text-muted">{step.status}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted">{step.detail}</p>
        </li>
      ))}
    </ol>
  );
}
