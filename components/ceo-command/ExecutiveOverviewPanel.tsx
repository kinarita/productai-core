"use client";

import type { ExecutiveOverviewSummary } from "@/lib/ceo-command/ceoCommandCenterAnalysis";

export function ExecutiveOverviewPanel({ overview }: { overview: ExecutiveOverviewSummary }) {
  const items = [
    { label: "Active Ideas", value: overview.activeIdeas },
    { label: "Active Missions", value: overview.activeMissions },
    { label: "Active Reviews", value: overview.activeReviews },
    { label: "Release Candidates", value: overview.releaseCandidates },
    { label: "Active Outcomes", value: overview.activeOutcomes },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-border px-3 py-2">
            <p className="text-[10px] uppercase text-muted">{item.label}</p>
            <p className="text-lg font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted">{overview.advisoryNote}</p>
    </div>
  );
}
