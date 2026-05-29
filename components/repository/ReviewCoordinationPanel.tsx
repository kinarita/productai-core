"use client";

import type { ReviewCoordinationSummary } from "@/lib/repository/reviewCoordination";

export function ReviewCoordinationPanel({
  summary,
  compact = false,
}: {
  summary: ReviewCoordinationSummary;
  compact?: boolean;
}) {
  const items = [
    { label: "Pending Reviews", value: summary.pendingReviews },
    { label: "Active Reviews", value: summary.activeReviews },
    { label: "Completed Reviews", value: summary.completedReviews },
    { label: "Blocked Reviews", value: summary.blockedReviews },
    { label: "Review Notes", value: summary.reviewNotes },
  ];

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className={compact ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 gap-2 sm:grid-cols-5"}>
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-border px-3 py-2">
            <p className="text-[10px] uppercase text-muted">{item.label}</p>
            <p className="text-lg font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
      {!compact ? (
        <p className="text-xs text-muted">
          Review coordination is visibility only—no merge, PR creation, or GitHub operations.
        </p>
      ) : null}
    </div>
  );
}
