"use client";

import type { OutcomeOverviewSummary } from "@/lib/outcome/outcomeSummary";

export function OutcomeOverviewCard({
  overview,
  compact = false,
}: {
  overview: OutcomeOverviewSummary;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Released Missions</p>
          <p className="text-lg font-semibold">{overview.releasedMissions}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Observed Outcomes</p>
          <p className="text-lg font-semibold">{overview.observedOutcomes}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Validated Outcomes</p>
          <p className="text-lg font-semibold">{overview.validatedOutcomes}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Follow-up Reviews</p>
          <p className="text-lg font-semibold">{overview.activeFollowUps}</p>
        </div>
      </div>
      {!compact ? (
        <p className="text-xs text-muted">Outcome signals: {overview.outcomeSignals}</p>
      ) : null}
      <p className="text-xs text-muted">{overview.advisoryNote}</p>
    </div>
  );
}
