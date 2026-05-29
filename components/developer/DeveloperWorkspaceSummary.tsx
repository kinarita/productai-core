"use client";

import type { DevelopmentOverviewSummary } from "@/lib/developer/developerAnalysis";

export function DeveloperWorkspaceSummary({
  summary,
  compact = false,
}: {
  summary: DevelopmentOverviewSummary;
  compact?: boolean;
}) {
  const items = [
    { label: "Implementation Plans", value: summary.implementationPlans },
    { label: "Development Reviews", value: summary.developmentReviews },
    { label: "Technical Risks", value: summary.technicalRisks },
    { label: "QA Planning Candidates", value: summary.qaPlanningCandidates },
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
