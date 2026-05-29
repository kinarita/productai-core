"use client";

import Link from "next/link";
import type { CooMissionBoardItem } from "@/lib/coo/cooMissionAnalysis";
import { useCooWorkspaceStore } from "@/lib/store/cooWorkspaceStore";
import { ProgressBar } from "@/components/ProgressBar";
import { cn } from "@/lib/utils";

export function CooMissionBoard({
  items,
  compact = false,
}: {
  items: CooMissionBoardItem[];
  compact?: boolean;
}) {
  const selectedMissionId = useCooWorkspaceStore((s) => s.selectedMissionId);
  const setSelectedMission = useCooWorkspaceStore((s) => s.setSelectedMission);

  if (items.length === 0) {
    return <p className="text-xs text-muted">No missions on the board.</p>;
  }

  return (
    <div className={cn("grid gap-3", compact ? "grid-cols-1" : "md:grid-cols-2 xl:grid-cols-3")}>
      {items.slice(0, compact ? 4 : undefined).map((item) => (
        <button
          key={item.missionId}
          type="button"
          onClick={() => setSelectedMission(item.missionId)}
          className={cn(
            "rounded-lg border border-border bg-background px-3 py-3 text-left transition hover:border-accent/40",
            selectedMissionId === item.missionId && "border-accent/60 bg-accent/5"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/missions/${item.missionId}`}
              className="text-sm font-medium text-accent hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {item.missionName}
            </Link>
            <span className="text-[10px] uppercase text-muted">{item.health}</span>
          </div>
          <p className="mt-1 text-xs text-muted">
            {item.stageLabel} · {item.primaryRole}
          </p>
          <div className="mt-2">
            <ProgressBar value={item.progress} />
          </div>
          {item.blockers.length > 0 ? (
            <ul className="mt-2 space-y-0.5 text-[11px] text-muted">
              {item.blockers.slice(0, 2).map((b) => (
                <li key={b}>· {b}</li>
              ))}
            </ul>
          ) : null}
        </button>
      ))}
    </div>
  );
}
