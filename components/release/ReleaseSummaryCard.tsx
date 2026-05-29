"use client";

import type { ReleaseOverviewSummary } from "@/lib/release/releaseSummary";

export function ReleaseOverviewCard({
  overview,
  compact = false,
}: {
  overview: ReleaseOverviewSummary;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Ready For Release</p>
          <p className="text-lg font-semibold">{overview.readyForRelease}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Candidate</p>
          <p className="text-lg font-semibold">{overview.candidate}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Preparing</p>
          <p className="text-lg font-semibold">{overview.preparing}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Potential Risks</p>
          <p className="text-lg font-semibold">{overview.potentialReadinessRisks}</p>
        </div>
      </div>
      {!compact ? (
        <p className="text-xs text-muted">Released missions: {overview.released}</p>
      ) : null}
      <p className="text-xs text-muted">{overview.advisoryNote}</p>
    </div>
  );
}
