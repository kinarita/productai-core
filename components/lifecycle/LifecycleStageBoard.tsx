"use client";

import Link from "next/link";
import { useLifecycleWorkspaceStore } from "@/lib/store/lifecycleWorkspaceStore";
import type { ProductLifecycleStageId } from "@/lib/lifecycle/productLifecycle";
import { cn } from "@/lib/utils";

type StageBoard = ReturnType<
  typeof import("@/lib/lifecycle/lifecycleAnalysis").buildLifecycleStageBoard
>;

export function LifecycleStageBoard({
  board,
  compact = false,
}: {
  board: StageBoard;
  compact?: boolean;
}) {
  const selectedStage = useLifecycleWorkspaceStore((s) => s.selectedStage);
  const setSelectedStage = useLifecycleWorkspaceStore((s) => s.setSelectedStage);

  return (
    <div className={cn("grid gap-3", compact ? "grid-cols-2" : "md:grid-cols-3 xl:grid-cols-5")}>
      {board.map((bucket) => (
        <button
          key={bucket.stage}
          type="button"
          onClick={() =>
            setSelectedStage(
              selectedStage === bucket.stage ? null : (bucket.stage as ProductLifecycleStageId)
            )
          }
          className={cn(
            "rounded-lg border border-border px-3 py-2 text-left transition hover:border-accent/40",
            selectedStage === bucket.stage && "border-accent/60 bg-accent/5"
          )}
        >
          <p className="text-[10px] font-medium uppercase text-muted">{bucket.title}</p>
          <p className="mt-1 text-lg font-semibold">{bucket.missions.length}</p>
          {!compact && bucket.missions.length > 0 ? (
            <ul className="mt-2 space-y-0.5 text-[11px] text-muted">
              {bucket.missions.slice(0, 2).map((m) => (
                <li key={m.missionId}>
                  <Link href={`/missions/${m.missionId}`} className="text-accent hover:underline">
                    {m.missionName}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </button>
      ))}
    </div>
  );
}
