"use client";

import type { buildCeoCrossReviewSummary } from "@/lib/cross-review/crossRoleReviewAnalysis";

type CeoCrossReviewSummary = ReturnType<typeof buildCeoCrossReviewSummary>;

export function CrossReviewSummary({
  summary,
  compact = false,
}: {
  summary: CeoCrossReviewSummary;
  compact?: boolean;
}) {
  const items = [
    { label: "Pending Reviews", value: summary.pendingReviews },
    { label: "Active Reviews", value: summary.activeReviews },
    { label: "Approved Reviews", value: summary.approvedReviews },
    { label: "Review Concentrations", value: summary.reviewConcentrations },
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
