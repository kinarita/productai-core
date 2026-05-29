"use client";

import type { ProductBriefOverviewSummary } from "@/lib/brief/productBriefAnalysis";

export function ProductBriefSummary({
  summary,
  compact = false,
}: {
  summary: ProductBriefOverviewSummary;
  compact?: boolean;
}) {
  const items = [
    { label: "Draft Briefs", value: summary.draftBriefs },
    { label: "Under Review", value: summary.underReview },
    { label: "Approved", value: summary.approvedBriefs },
    { label: "Director Ready", value: summary.directorReadyBriefs },
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
