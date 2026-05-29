"use client";

import Link from "next/link";
import type { MissionCommandRow } from "@/lib/ceo-command/ceoCommandCenterAnalysis";

export function MissionCommandTable({ rows }: { rows: MissionCommandRow[] }) {
  if (rows.length === 0) {
    return <p className="text-xs text-muted">No active missions in view.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-xs">
        <thead>
          <tr className="border-b border-border text-muted">
            <th className="px-2 py-2 font-medium">Mission</th>
            <th className="px-2 py-2 font-medium">Stage</th>
            <th className="px-2 py-2 font-medium">Health</th>
            <th className="px-2 py-2 font-medium">Links</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.missionId} className="border-b border-border/60">
              <td className="px-2 py-2">
                <Link href={`/missions/${row.missionId}`} className="font-medium text-accent hover:underline">
                  {row.missionName}
                </Link>
                <p className="text-[10px] text-muted">{row.status}</p>
              </td>
              <td className="px-2 py-2 text-muted">{row.pipelineStage}</td>
              <td className="px-2 py-2 text-muted">{row.health}</td>
              <td className="px-2 py-2">
                <div className="flex flex-wrap gap-2">
                  <Link href={row.lifecycleHref} className="text-accent hover:underline">
                    Lifecycle
                  </Link>
                  <Link href={row.lineageHref} className="text-accent hover:underline">
                    Lineage
                  </Link>
                  <Link href={row.reviewHref} className="text-accent hover:underline">
                    Review
                  </Link>
                  <Link href={row.workspaceHref} className="text-accent hover:underline">
                    Workspace
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
