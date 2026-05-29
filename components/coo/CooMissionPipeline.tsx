"use client";

import Link from "next/link";
import type { CooMissionPipelineRow } from "@/lib/coo/cooMissionAnalysis";
import { useCooWorkspaceStore } from "@/lib/store/cooWorkspaceStore";
import { cn } from "@/lib/utils";

export function CooMissionPipeline({
  rows,
  compact = false,
}: {
  rows: CooMissionPipelineRow[];
  compact?: boolean;
}) {
  const selectedMissionId = useCooWorkspaceStore((s) => s.selectedMissionId);
  const setSelectedMission = useCooWorkspaceStore((s) => s.setSelectedMission);

  if (rows.length === 0) {
    return <p className="text-xs text-muted">No active missions in the pipeline.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-xs">
        <thead>
          <tr className="border-b border-border text-muted">
            <th className="pb-2 pr-3 font-medium">Mission</th>
            <th className="pb-2 pr-3 font-medium">Current Stage</th>
            <th className="pb-2 pr-3 font-medium">Primary Role</th>
            <th className="pb-2 pr-3 font-medium">Status</th>
            <th className="pb-2 pr-3 font-medium">Attention</th>
            <th className="pb-2 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, compact ? 5 : undefined).map((row) => (
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
              <td className="py-2 pr-3 text-muted">{row.currentStageLabel}</td>
              <td className="py-2 pr-3 capitalize text-muted">{row.primaryRole}</td>
              <td className="py-2 pr-3 capitalize text-muted">{row.status}</td>
              <td className="py-2 pr-3 text-muted">{row.attentionCount}</td>
              <td className="py-2 text-muted">{row.updatedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
