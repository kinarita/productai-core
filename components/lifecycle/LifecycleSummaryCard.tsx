"use client";

import type { LifecycleOverviewSummary } from "@/lib/lifecycle/lifecycleSummary";

export function LifecycleSummaryCard({
  summary,
  compact = false,
  ceoOverview = false,
}: {
  summary: LifecycleOverviewSummary;
  compact?: boolean;
  ceoOverview?: boolean;
}) {
  const items = ceoOverview
    ? [
        { label: "Ideas", value: summary.ideas },
        { label: "Planning", value: summary.activePlanning },
        { label: "Development", value: summary.developmentMissions },
        { label: "QA", value: summary.qaMissions },
        { label: "Release", value: summary.releaseReady + summary.released },
        { label: "Outcome", value: summary.observedOutcomes },
      ]
    : [
        { label: "Ideas", value: summary.ideas },
        { label: "Active Planning", value: summary.activePlanning },
        { label: "Development", value: summary.developmentMissions },
        { label: "QA", value: summary.qaMissions },
        { label: "Release Ready", value: summary.releaseReady },
        { label: "Released", value: summary.released },
        { label: "Observed Outcomes", value: summary.observedOutcomes },
      ];

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className={compact ? "grid grid-cols-2 gap-2 sm:grid-cols-3" : "grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7"}>
        {items.slice(0, compact ? items.length : undefined).map((item) => (
          <div key={item.label} className="rounded-lg border border-border px-3 py-2">
            <p className="text-[10px] uppercase text-muted">{item.label}</p>
            <p className="text-lg font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
      {!compact && !ceoOverview ? (
        <div className="grid grid-cols-3 gap-2">
          {items.slice(4).map((item) => (
            <div key={item.label} className="rounded-lg border border-border px-3 py-2">
              <p className="text-[10px] uppercase text-muted">{item.label}</p>
              <p className="text-lg font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      ) : null}
      <p className="text-xs text-muted">{summary.advisoryNote}</p>
    </div>
  );
}
