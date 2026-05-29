"use client";

import type { HandoffOverviewSummary } from "@/lib/handoff/handoffAnalysis";
import type { buildCeoHandoffSummary } from "@/lib/handoff/handoffAnalysis";

type CeoHandoffSummary = ReturnType<typeof buildCeoHandoffSummary>;

export function HandoffSummaryCard({
  summary,
  compact = false,
  ceoOverview = false,
  ceoSummary,
}: {
  summary?: HandoffOverviewSummary;
  compact?: boolean;
  ceoOverview?: boolean;
  ceoSummary?: CeoHandoffSummary;
}) {
  const items = ceoOverview && ceoSummary
    ? [
        { label: "Current Role", value: ceoSummary.currentRole },
        { label: "Pending Reviews", value: ceoSummary.pendingReviews },
        { label: "Waiting Handoffs", value: ceoSummary.waitingHandoffs },
        { label: "Completed Handoffs", value: ceoSummary.completedHandoffs },
      ]
    : summary
      ? [
          { label: "Active Artifacts", value: summary.activeArtifacts },
          { label: "Pending Reviews", value: summary.pendingReviews },
          { label: "Completed Handoffs", value: summary.completedHandoffs },
          { label: "Returned Artifacts", value: summary.returnedArtifacts },
        ]
      : [];

  const note = ceoSummary?.advisoryNote ?? summary?.advisoryNote ?? "";
  const position = summary?.currentWorkflowPosition;

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div
        className={
          compact
            ? "grid grid-cols-2 gap-2 sm:grid-cols-4"
            : "grid grid-cols-2 gap-2 sm:grid-cols-4"
        }
      >
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-border px-3 py-2">
            <p className="text-[10px] uppercase text-muted">{item.label}</p>
            <p className="text-lg font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
      {!compact && position ? (
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Current Workflow Position</p>
          <p className="text-sm">{position}</p>
        </div>
      ) : null}
      {note ? <p className="text-xs text-muted">{note}</p> : null}
    </div>
  );
}
