"use client";

import Link from "next/link";
import type { PullRequestContextRow } from "@/lib/repository/pullRequestContext";
import { useRepositoryWorkspaceStore } from "@/lib/store/repositoryWorkspaceStore";
import { Badge } from "@/components/Badge";
import { cn } from "@/lib/utils";

export function PullRequestPanel({
  rows,
  compact = false,
}: {
  rows: PullRequestContextRow[];
  compact?: boolean;
}) {
  const selectedPullRequestId = useRepositoryWorkspaceStore((s) => s.selectedPullRequestId);
  const setSelectedPullRequest = useRepositoryWorkspaceStore((s) => s.setSelectedPullRequest);

  if (rows.length === 0) {
    return <p className="text-xs text-muted">No pull requests in context.</p>;
  }

  return (
    <ul className={compact ? "space-y-2" : "space-y-3"}>
      {rows.slice(0, compact ? 3 : undefined).map((row) => (
        <li key={row.pullRequestId}>
          <button
            type="button"
            onClick={() =>
              setSelectedPullRequest(
                selectedPullRequestId === row.pullRequestId ? null : row.pullRequestId
              )
            }
            className={cn(
              "w-full rounded-lg border border-border px-3 py-2 text-left transition hover:border-accent/40",
              selectedPullRequestId === row.pullRequestId && "border-accent/60 bg-accent/5"
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-foreground">#{row.number}</span>
              <Badge variant={row.contextId === "draft" ? "warning" : "default"}>
                {row.contextLabel}
              </Badge>
              <span className="text-[10px] text-muted">{row.reviews} review(s)</span>
            </div>
            <p className="mt-1 text-xs text-foreground">{row.title}</p>
            <p className="mt-1 text-[11px] text-muted">
              {row.branch} · {row.author} ·{" "}
              <Link
                href={`/missions/${row.missionId}`}
                className="text-accent hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {row.missionName}
              </Link>
            </p>
          </button>
        </li>
      ))}
    </ul>
  );
}
