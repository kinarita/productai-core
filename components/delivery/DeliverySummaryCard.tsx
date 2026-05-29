"use client";

import Link from "next/link";
import type { DeliveryOverviewSummary } from "@/lib/delivery/taskDeliveryAnalysis";
import type { MissionDeliverySummary } from "@/lib/delivery/taskDeliveryAnalysis";
import type { DeliveryBottleneckObservation } from "@/lib/delivery/taskDeliveryAnalysis";

export function DeliveryOverviewCard({
  overview,
  compact = false,
}: {
  overview: DeliveryOverviewSummary;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Active Tasks</p>
          <p className="text-lg font-semibold">{overview.activeTasks}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Tasks In Review</p>
          <p className="text-lg font-semibold">{overview.tasksInReview}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Release Ready Missions</p>
          <p className="text-lg font-semibold">{overview.releaseReadyMissions}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Delivery Risks</p>
          <p className="text-lg font-semibold">{overview.potentialDeliveryRisks}</p>
        </div>
      </div>
      <p className="text-xs text-muted">{overview.advisoryNote}</p>
    </div>
  );
}

export function DeliverySummaryCard({
  summaries,
  bottlenecks,
  compact = false,
}: {
  summaries: MissionDeliverySummary[];
  bottlenecks: DeliveryBottleneckObservation[];
  compact?: boolean;
}) {
  const visible = summaries.slice(0, compact ? 3 : 8);

  return (
    <div className={compact ? "space-y-2" : "space-y-4"}>
      {visible.map((s) => (
        <div key={s.missionId} className="rounded-lg border border-border px-3 py-2">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/missions/${s.missionId}`} className="text-sm font-medium text-accent hover:underline">
              {s.missionName}
            </Link>
            <Link
              href={`/delivery-workspace?mission=${s.missionId}`}
              className="text-[10px] text-muted hover:text-accent"
            >
              Delivery detail
            </Link>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-muted sm:grid-cols-4">
            <span>Tasks: {s.taskCount}</span>
            <span>Completed: {s.completedTasks}</span>
            <span>In Review: {s.tasksInReview}</span>
            <span>Release: {s.releaseReadinessLabel}</span>
          </div>
          {s.potentialDeliveryRisks.length > 0 && !compact ? (
            <ul className="mt-2 space-y-0.5 text-[11px] text-muted">
              {s.potentialDeliveryRisks.slice(0, 2).map((r) => (
                <li key={r}>· {r}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
      {bottlenecks.length > 0 && !compact ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Delivery Bottlenecks</p>
          <ul className="mt-1 space-y-1 text-xs text-muted">
            {bottlenecks.slice(0, 3).map((b) => (
              <li key={b.id}>· {b.detail}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
