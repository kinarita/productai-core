"use client";

import type { ReleaseOutcomeContext } from "@/lib/outcome/releaseOutcomeContext";

export function ReleaseOutcomePanel({
  context,
  compact = false,
}: {
  context: ReleaseOutcomeContext;
  compact?: boolean;
}) {
  const items = [
    { label: "Release Context", value: context.releaseContext },
    { label: "Review Context", value: context.reviewContext },
    { label: "Outcome Context", value: context.outcomeContext },
    { label: "Reflection Context", value: context.reflectionContext },
  ];

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {!compact ? <p className="text-xs text-muted">{context.advisoryNote}</p> : null}
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-border px-3 py-2">
            <p className="text-[10px] uppercase text-muted">{item.label}</p>
            <p className="mt-1 text-xs text-foreground">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
