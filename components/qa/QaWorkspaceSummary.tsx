"use client";

import type { QaOverviewSummary } from "@/lib/qa/qaAnalysis";

export function QaWorkspaceSummary({
  summary,
  compact = false,
}: {
  summary: QaOverviewSummary;
  compact?: boolean;
}) {
  const items = [
    { label: "Test Plans", value: summary.testPlans },
    { label: "QA Reviews", value: summary.qaReviews },
    { label: "Validation Risks", value: summary.validationRisks },
    { label: "Release Review Candidates", value: summary.releaseReviewCandidates },
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

