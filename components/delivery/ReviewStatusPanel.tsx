"use client";

import type { ReviewStatusSummary } from "@/lib/delivery/reviewStatus";

export function ReviewStatusPanel({
  summary,
  compact = false,
}: {
  summary: ReviewStatusSummary;
  compact?: boolean;
}) {
  const items = [
    { label: "Pending Review", value: summary.pendingReview },
    { label: "In Review", value: summary.inReview },
    { label: "Review Completed", value: summary.reviewCompleted },
    { label: "Review Blocked", value: summary.reviewBlocked },
    { label: "Review Notes", value: summary.reviewNotesCount },
  ];

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className={compact ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 gap-2 sm:grid-cols-5"}>
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-border px-3 py-2">
            <p className="text-[10px] uppercase text-muted">{item.label}</p>
            <p className="text-lg font-semibold text-foreground">{item.value}</p>
          </div>
        ))}
      </div>
      {!compact ? (
        <p className="text-xs text-muted">
          Review status is aggregated for coordination visibility—no automatic review routing.
        </p>
      ) : null}
    </div>
  );
}
