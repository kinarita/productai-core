"use client";

import type { IdeaOverviewSummary } from "@/lib/idea/ideaAnalysis";

export function IdeaSummaryCard({
  summary,
  compact = false,
}: {
  summary: IdeaOverviewSummary;
  compact?: boolean;
}) {
  const items = [
    { label: "Ideas", value: summary.ideas },
    { label: "Ideas In Review", value: summary.ideasInReview },
    { label: "Product Brief Drafts", value: summary.productBriefDrafts },
    { label: "Approved Briefs", value: summary.approvedBriefs },
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
