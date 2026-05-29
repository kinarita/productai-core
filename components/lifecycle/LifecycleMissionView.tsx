"use client";

import Link from "next/link";
import type { MissionLifecycleView } from "@/lib/lifecycle/lifecycleAnalysis";
import { useLifecycleWorkspaceStore } from "@/lib/store/lifecycleWorkspaceStore";
import { cn } from "@/lib/utils";

export function LifecycleMissionView({
  views,
  compact = false,
}: {
  views: MissionLifecycleView[];
  compact?: boolean;
}) {
  const selectedMissionId = useLifecycleWorkspaceStore((s) => s.selectedMissionId);
  const setSelectedMission = useLifecycleWorkspaceStore((s) => s.setSelectedMission);

  if (views.length === 0) {
    return <p className="text-xs text-muted">No missions match the current lifecycle filters.</p>;
  }

  return (
    <div className="space-y-3">
      {!compact ? (
        <div className="flex flex-wrap gap-2">
          {views.map((view) => (
            <button
              key={view.missionId}
              type="button"
              onClick={() =>
                setSelectedMission(
                  selectedMissionId === view.missionId ? null : view.missionId
                )
              }
              className={cn(
                "rounded-full border border-border px-3 py-1 text-xs transition",
                selectedMissionId === view.missionId
                  ? "border-accent bg-accent/10 text-accent"
                  : "text-muted hover:border-accent/40"
              )}
            >
              {view.missionName}
            </button>
          ))}
        </div>
      ) : null}

      <ul className="space-y-3">
        {(compact ? views.slice(0, 3) : views).map((view) => (
          <li
            key={view.missionId}
            className={cn(
              "rounded-lg border border-border px-4 py-3",
              selectedMissionId === view.missionId && "border-accent/50 bg-accent/5"
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Link
                  href={`/missions/${view.missionId}`}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  {view.missionName}
                </Link>
                <p className="mt-1 text-xs text-muted">{view.progressNote}</p>
              </div>
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase text-muted">
                {view.currentStageLabel}
              </span>
            </div>
            {!compact ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="Previous Stage" value={view.previousStageLabel ?? "—"} />
                <Detail label="Related Reviews" value={view.relatedReviews} />
                <Detail label="Repository" value={view.relatedRepository} />
                <Detail label="Release" value={view.relatedRelease} />
                <Detail label="Outcome" value={view.relatedOutcome} />
                <Detail
                  label="Related Tasks"
                  value={
                    view.relatedTasks.length > 0
                      ? view.relatedTasks.join(" · ")
                      : "No linked tasks"
                  }
                />
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 px-3 py-2">
      <p className="text-[10px] uppercase text-muted">{label}</p>
      <p className="mt-0.5 text-xs text-foreground">{value}</p>
    </div>
  );
}
