"use client";

import Link from "next/link";
import type { MissionReleaseReadinessRow } from "@/lib/release/releaseReadiness";
import { useReleaseWorkspaceStore } from "@/lib/store/releaseWorkspaceStore";
import { Badge } from "@/components/Badge";
import { releaseLevelLabel } from "@/lib/release/releaseWorkspace";
import { cn } from "@/lib/utils";

export function ReleaseMissionBoard({
  rows,
  compact = false,
}: {
  rows: MissionReleaseReadinessRow[];
  compact?: boolean;
}) {
  const selectedMissionId = useReleaseWorkspaceStore((s) => s.selectedMissionId);
  const setSelectedMission = useReleaseWorkspaceStore((s) => s.setSelectedMission);

  if (rows.length === 0) {
    return <p className="text-xs text-muted">No missions match the current release readiness filter.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-xs">
        <thead>
          <tr className="border-b border-border text-muted">
            <th className="pb-2 pr-3 font-medium">Mission</th>
            <th className="pb-2 pr-3 font-medium">Current Stage</th>
            <th className="pb-2 pr-3 font-medium">Task Completion</th>
            <th className="pb-2 pr-3 font-medium">Review</th>
            <th className="pb-2 pr-3 font-medium">Repository</th>
            <th className="pb-2 pr-3 font-medium">QA</th>
            <th className="pb-2 pr-3 font-medium">Documentation</th>
            <th className="pb-2 pr-3 font-medium">Readiness</th>
            <th className="pb-2 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, compact ? 4 : undefined).map((row) => (
            <tr
              key={row.missionId}
              className={cn(
                "border-b border-border/60 cursor-pointer hover:bg-muted/5",
                selectedMissionId === row.missionId && "bg-accent/5"
              )}
              onClick={() => setSelectedMission(row.missionId)}
            >
              <td className="py-2 pr-3">
                <Link href={`/missions/${row.missionId}`} className="text-accent hover:underline">
                  {row.missionName}
                </Link>
              </td>
              <td className="py-2 pr-3 text-muted">{row.currentStage}</td>
              <td className="py-2 pr-3 text-muted">{row.taskCompletion}</td>
              <td className="py-2 pr-3 text-muted">{row.reviewCompletion}</td>
              <td className="py-2 pr-3 text-muted">{row.repositoryStatus}</td>
              <td className="py-2 pr-3 text-muted">{row.qaStatus}</td>
              <td className="py-2 pr-3 text-muted">{row.documentationStatus}</td>
              <td className="py-2 pr-3">
                <Badge variant={row.readinessLevel === "ready_for_release" ? "success" : "default"}>
                  {releaseLevelLabel(row.readinessLevel)}
                </Badge>
                {!compact ? (
                  <p className="mt-0.5 max-w-[140px] text-[10px] text-muted">{row.releaseReadiness}</p>
                ) : null}
              </td>
              <td className="py-2 text-muted">{row.updatedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
