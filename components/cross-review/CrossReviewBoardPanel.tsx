"use client";

import { cn } from "@/lib/utils";
import type { CrossReviewBoardRow } from "@/lib/cross-review/crossRoleReviewAnalysis";

export function CrossReviewBoardPanel({
  rows,
  selectedReviewId,
  onSelect,
}: {
  rows: CrossReviewBoardRow[];
  selectedReviewId: string | null;
  onSelect: (row: CrossReviewBoardRow) => void;
}) {
  if (rows.length === 0) {
    return <p className="text-xs text-muted">No reviews match the current filters.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-xs">
        <thead>
          <tr className="border-b border-border text-muted">
            <th className="px-2 py-2 font-medium">Artifact</th>
            <th className="px-2 py-2 font-medium">Type</th>
            <th className="px-2 py-2 font-medium">Mission</th>
            <th className="px-2 py-2 font-medium">Owner</th>
            <th className="px-2 py-2 font-medium">Reviewer</th>
            <th className="px-2 py-2 font-medium">State</th>
            <th className="px-2 py-2 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.reviewId}
              className={cn(
                "cursor-pointer border-b border-border/60 transition hover:bg-muted/5",
                selectedReviewId === row.reviewId && "bg-accent/5"
              )}
              onClick={() => onSelect(row)}
            >
              <td className="px-2 py-2 font-medium text-foreground">{row.artifact}</td>
              <td className="px-2 py-2 text-muted">{row.artifactType}</td>
              <td className="px-2 py-2 text-muted">{row.mission}</td>
              <td className="px-2 py-2 text-muted">{row.ownerRole}</td>
              <td className="px-2 py-2 text-muted">{row.reviewerRole}</td>
              <td className="px-2 py-2">{row.reviewState}</td>
              <td className="px-2 py-2 text-muted">{row.lastUpdated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
