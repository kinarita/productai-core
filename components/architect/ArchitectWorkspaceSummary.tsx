"use client";

import type { ArchitectureOverviewSummary } from "@/lib/architect/architectAnalysis";

export function ArchitectWorkspaceSummary({
  summary,
  compact = false,
}: {
  summary: ArchitectureOverviewSummary;
  compact?: boolean;
}) {
  const items = [
    { label: "Technical Specs", value: summary.technicalSpecs },
    { label: "Review Candidates", value: summary.reviewCandidates },
    { label: "Design Ready", value: summary.designReady },
    { label: "Open Questions", value: summary.openQuestions },
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
