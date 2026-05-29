"use client";

import Link from "next/link";
import type { HandoffReviewContextItem } from "@/lib/cross-review/crossRoleReviewAnalysis";

export function HandoffReviewContextPanel({
  items,
  compact = false,
}: {
  items: HandoffReviewContextItem[];
  compact?: boolean;
}) {
  if (items.length === 0) {
    return <p className="text-xs text-muted">No handoff review context available.</p>;
  }

  return (
    <ul className="space-y-2">
      {items.slice(0, compact ? 3 : undefined).map((item) => (
        <li key={item.missionId} className="rounded-lg border border-border px-3 py-2 text-xs">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/missions/${item.missionId}`} className="font-medium text-accent hover:underline">
              {item.missionName}
            </Link>
            <Link href={item.reviewHref} className="text-[10px] text-muted hover:text-accent">
              Review
            </Link>
          </div>
          <p className="mt-1 text-muted">Handoff review: {item.handoffReview}</p>
          <p className="text-muted">{item.approvalContext}</p>
          <p className="mt-1 text-[10px] text-muted">Artifact: {item.relatedArtifact}</p>
        </li>
      ))}
    </ul>
  );
}
