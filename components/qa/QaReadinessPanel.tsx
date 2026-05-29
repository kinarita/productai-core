"use client";

import type { QaReadinessContext } from "@/lib/qa/qaReadiness";
import { cn } from "@/lib/utils";

export function QaReadinessPanel({ context }: { context: QaReadinessContext }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-lg border border-border px-3 py-2">
        <p className="text-[10px] uppercase text-muted">QA Readiness</p>
        <p className="text-lg font-semibold text-foreground">{context.statusLabel}</p>
        <p className="mt-1 text-xs text-muted">{context.recommendation}</p>
      </div>
      <ul className="space-y-2">
        {context.areas.map((area) => (
          <li
            key={area.id}
            className={cn(
              "rounded-lg border border-border px-3 py-2 text-xs",
              area.available && "border-accent/30"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{area.label}</span>
              <span className={area.available ? "text-accent" : "text-muted"}>
                {area.available ? "Available" : "Pending"}
              </span>
            </div>
            <p className="mt-1 text-muted">{area.note}</p>
          </li>
        ))}
      </ul>
      <p className="text-[10px] text-muted">
        Recommendation only—no automatic QA approval or release approval.
      </p>
    </div>
  );
}

