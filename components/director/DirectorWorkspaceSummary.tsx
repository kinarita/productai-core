"use client";

import type { DirectorPlanningOverview } from "@/lib/director/directorAnalysis";

export function DirectorWorkspaceSummary({
  summary,
  compact = false,
}: {
  summary: DirectorPlanningOverview;
  compact?: boolean;
}) {
  const items = [
    { label: "Active Mission Plans", value: summary.activeMissionPlans },
    { label: "Planning Reviews", value: summary.planningReviews },
    { label: "Handoff Candidates", value: summary.handoffCandidates },
    { label: "Architect Ready", value: summary.architectReady },
  ];

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-border px-3 py-2">
            <p className="text-[10px] uppercase text-muted">{item.label}</p>
            <p className="text-lg font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted">{summary.advisoryNote}</p>
    </div>
  );
}
