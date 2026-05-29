"use client";

import { useMemo } from "react";
import type { DecisionTraceability } from "@/lib/orchestration/governance-history/decisionTraceability";
import { buildPathTimeline } from "@/lib/orchestration/governance-history/traceabilityAnalysis";
import { useDecisionTraceabilityStore } from "@/lib/store/decisionTraceabilityStore";

function TimelineBlock({
  label,
  entries,
}: {
  label: string;
  entries: Array<{ at: string; label: string }>;
}) {
  if (entries.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted">{label}</p>
      <ul className="mt-1 space-y-2 border-l border-border pl-3">
        {entries.map((entry) => (
          <li key={`${entry.at}-${entry.label}`} className="relative text-xs">
            <span className="absolute -left-[7px] top-1.5 h-2 w-2 rounded-full bg-border" />
            <p className="text-[11px] text-muted">{entry.at.slice(0, 16)}</p>
            <p className="text-foreground">{entry.label}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DecisionPathTimeline({
  traceability,
}: {
  traceability: DecisionTraceability;
}) {
  const selectedPathwayId = useDecisionTraceabilityStore((s) => s.selectedPathwayId);

  const timeline = useMemo(
    () => buildPathTimeline(traceability, selectedPathwayId ?? undefined),
    [selectedPathwayId, traceability]
  );

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        Past → interpretation → current context → continuity theme. Timeline reading support only.
      </p>
      <TimelineBlock label="Past" entries={timeline.past} />
      <TimelineBlock label="Interpretation" entries={timeline.interpretation} />
      <TimelineBlock label="Current context" entries={timeline.currentContext} />
      <div className="rounded-lg border border-border bg-background px-3 py-2">
        <p className="text-xs font-medium uppercase text-muted">Continuity theme</p>
        <p className="mt-1 text-xs text-muted">{timeline.continuityTheme}</p>
      </div>
    </div>
  );
}
