"use client";

import { BriefChangeSummaryBlock } from "@/components/projects/BriefDiffViewer";
import { getChangesSinceLastReview } from "@/lib/brief-diff/getChangesSinceLastReview";
import type { BriefVersionRecord } from "@/lib/discussion/discussionTypes";

export function LatestChangesReviewPanel({
  briefVersions,
  currentVersion,
  latestApprovedBriefVersion,
}: {
  briefVersions?: BriefVersionRecord[];
  currentVersion?: number;
  latestApprovedBriefVersion?: number;
}) {
  const { baselineVersion, currentVersion: current, summary, diff } = getChangesSinceLastReview({
    briefVersions,
    currentVersion,
    latestApprovedBriefVersion,
  });

  if (!summary || !diff) {
    return (
      <p className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted">
        No Brief changes since v{baselineVersion}. You are approving the current discovery package
        as-is.
      </p>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-warning/30 bg-amber-50/30 px-4 py-3">
      <p className="text-sm font-medium text-foreground">
        Latest Changes Since Last Review
      </p>
      <p className="text-xs text-muted">
        Comparing v{baselineVersion} → v{current}. Review what you are approving before
        architecture unlock.
      </p>
      <BriefChangeSummaryBlock summary={summary} />
    </div>
  );
}
