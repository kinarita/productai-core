"use client";

import type { ArchitectHandoffContext } from "@/lib/director/architectHandoff";
import { cn } from "@/lib/utils";

export function ArchitectHandoffPanel({ context }: { context: ArchitectHandoffContext }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-lg border border-border px-3 py-2">
        <p className="text-[10px] uppercase text-muted">Readiness Status</p>
        <p className="text-lg font-semibold text-foreground">{context.statusLabel}</p>
        <p className="mt-1 text-xs text-muted">{context.recommendation}</p>
      </div>
      <div>
        <p className="text-xs font-medium text-foreground">Readiness Areas</p>
        <ul className="mt-2 space-y-2">
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
      </div>
      <p className="text-[10px] text-muted">
        Recommendation only—no automatic Architect approval or assignment.
      </p>
    </div>
  );
}
