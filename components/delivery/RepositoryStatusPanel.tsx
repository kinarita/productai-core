"use client";

import Link from "next/link";
import type { RepositoryStatusSummary } from "@/lib/delivery/repositoryStatus";

export function RepositoryStatusPanel({
  summary,
  compact = false,
}: {
  summary: RepositoryStatusSummary;
  compact?: boolean;
}) {
  const counts = [
    { label: "No Repository", value: summary.noRepository },
    { label: "Repository Planned", value: summary.repositoryPlanned },
    { label: "Repository Linked", value: summary.repositoryLinked },
    { label: "Repository Ready", value: summary.repositoryReady },
  ];

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="rounded-lg border border-border px-3 py-2">
        <p className="text-[10px] uppercase text-muted">Mission Repository State</p>
        <p className="text-sm font-medium">{summary.missionStateLabel}</p>
      </div>
      <div className={compact ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 gap-2 sm:grid-cols-4"}>
        {counts.map((item) => (
          <div key={item.label} className="rounded-lg border border-border px-3 py-2">
            <p className="text-[10px] uppercase text-muted">{item.label}</p>
            <p className="text-lg font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
      {!compact && (summary.linkedBranches.length > 0 || summary.linkedPullRequests.length > 0) ? (
        <div className="text-xs text-muted">
          {summary.linkedBranches.length > 0 ? (
            <p>Branches: {summary.linkedBranches.join(", ")}</p>
          ) : null}
          {summary.linkedPullRequests.length > 0 ? (
            <p className="mt-1">PRs: {summary.linkedPullRequests.slice(0, 2).join("; ")}</p>
          ) : null}
        </div>
      ) : null}
      {!compact ? (
        <>
          <p className="text-xs text-muted">
            Repository connection is not performed here—visualization only.
          </p>
          <Link href="/repository-workspace" className="mt-2 inline-block text-xs text-accent hover:underline">
            Open Repository Coordination Workspace
          </Link>
        </>
      ) : (
        <Link href="/repository-workspace" className="mt-2 inline-block text-xs text-accent hover:underline">
          Repository Context
        </Link>
      )}
    </div>
  );
}
