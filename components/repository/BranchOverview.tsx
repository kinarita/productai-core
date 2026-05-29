"use client";

import type { BranchOverviewRow } from "@/lib/repository/repositoryAnalysis";
import { useRepositoryWorkspaceStore } from "@/lib/store/repositoryWorkspaceStore";
import { cn } from "@/lib/utils";

export function BranchOverview({
  rows,
  compact = false,
}: {
  rows: BranchOverviewRow[];
  compact?: boolean;
}) {
  const selectedBranch = useRepositoryWorkspaceStore((s) => s.selectedBranch);
  const setSelectedBranch = useRepositoryWorkspaceStore((s) => s.setSelectedBranch);

  if (rows.length === 0) {
    return <p className="text-xs text-muted">No mission branches to display.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-xs">
        <thead>
          <tr className="border-b border-border text-muted">
            <th className="pb-2 pr-3 font-medium">Branch Name</th>
            <th className="pb-2 pr-3 font-medium">Related Task</th>
            <th className="pb-2 pr-3 font-medium">Mission</th>
            <th className="pb-2 pr-3 font-medium">Status</th>
            <th className="pb-2 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, compact ? 4 : undefined).map((row) => (
            <tr
              key={row.branchName}
              className={cn(
                "border-b border-border/60 cursor-pointer hover:bg-muted/5",
                selectedBranch === row.branchName && "bg-accent/5"
              )}
              onClick={() =>
                setSelectedBranch(selectedBranch === row.branchName ? null : row.branchName)
              }
            >
              <td className="py-2 pr-3 font-medium text-foreground">{row.branchName}</td>
              <td className="py-2 pr-3 text-muted">{row.relatedTask}</td>
              <td className="py-2 pr-3 text-muted">{row.missionName}</td>
              <td className="py-2 pr-3 text-muted">{row.status}</td>
              <td className="py-2 text-muted">{row.updatedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
