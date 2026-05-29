"use client";

import Link from "next/link";
import type { OutcomeMissionRow } from "@/lib/outcome/outcomeAnalysis";
import { useOutcomeWorkspaceStore } from "@/lib/store/outcomeWorkspaceStore";
import { Badge } from "@/components/Badge";
import { cn } from "@/lib/utils";

export function OutcomeMissionBoard({
  rows,
  compact = false,
}: {
  rows: OutcomeMissionRow[];
  compact?: boolean;
}) {
  const selectedMissionId = useOutcomeWorkspaceStore((s) => s.selectedMissionId);
  const setSelectedMission = useOutcomeWorkspaceStore((s) => s.setSelectedMission);

  if (rows.length === 0) {
    return <p className="text-xs text-muted">No missions match the current outcome filter.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[880px] text-left text-xs">
        <thead>
          <tr className="border-b border-border text-muted">
            <th className="pb-2 pr-3 font-medium">Mission</th>
            <th className="pb-2 pr-3 font-medium">Release State</th>
            <th className="pb-2 pr-3 font-medium">Release Date</th>
            <th className="pb-2 pr-3 font-medium">Outcome Status</th>
            <th className="pb-2 pr-3 font-medium">Signals</th>
            <th className="pb-2 pr-3 font-medium">Outcome Notes</th>
            <th className="pb-2 pr-3 font-medium">Review Continuity</th>
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
              <td className="py-2 pr-3 text-muted">{row.releaseState}</td>
              <td className="py-2 pr-3 text-muted">{row.releaseDate}</td>
              <td className="py-2 pr-3">
                <Badge variant={row.outcomeStatus === "validated_outcome" ? "success" : "default"}>
                  {row.outcomeStatusLabel}
                </Badge>
              </td>
              <td className="py-2 pr-3 text-muted">{row.outcomeSignalsCount}</td>
              <td className="py-2 pr-3 max-w-[180px] text-muted">{row.outcomeNotes}</td>
              <td className="py-2 pr-3 text-muted">{row.reviewContinuity}</td>
              <td className="py-2 text-muted">{row.updatedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
