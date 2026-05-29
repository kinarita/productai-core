"use client";

import type { ReviewOverviewSummary } from "@/lib/review/reviewAnalysis";
import type { buildCeoReviewSummary } from "@/lib/review/reviewAnalysis";

type CeoReviewSummary = ReturnType<typeof buildCeoReviewSummary>;

export function ArtifactReviewSummary({
  summary,
  compact = false,
  ceoOverview = false,
}: {
  summary: ReviewOverviewSummary | CeoReviewSummary;
  compact?: boolean;
  ceoOverview?: boolean;
}) {
  const items = ceoOverview
    ? [
        { label: "Pending Reviews", value: summary.pendingReviews },
        { label: "In Review", value: summary.inReview },
        { label: "Changes Requested", value: summary.changesRequested },
        { label: "Approved", value: summary.approvedArtifacts },
      ]
    : [
        { label: "Pending Reviews", value: summary.pendingReviews },
        { label: "In Review", value: summary.inReview },
        { label: "Changes Requested", value: summary.changesRequested },
        { label: "Approved Artifacts", value: summary.approvedArtifacts },
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
