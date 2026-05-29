"use client";

import type { CrossReviewOverviewSummary } from "@/lib/cross-review/crossRoleReviewAnalysis";

export function CrossReviewOverviewPanel({ overview }: { overview: CrossReviewOverviewSummary }) {
  const items = [
    { label: "Total Reviews", value: overview.totalReviews },
    { label: "Pending Reviews", value: overview.pendingReviews },
    { label: "In Review", value: overview.inReview },
    { label: "Changes Requested", value: overview.changesRequested },
    { label: "Approved", value: overview.approved },
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
