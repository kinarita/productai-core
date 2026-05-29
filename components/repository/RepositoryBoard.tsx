"use client";

import Link from "next/link";
import type { RepositoryBoardItem } from "@/lib/repository/repositoryAnalysis";
import { useRepositoryWorkspaceStore } from "@/lib/store/repositoryWorkspaceStore";
import { cn } from "@/lib/utils";

export function RepositoryBoard({
  items,
  compact = false,
}: {
  items: RepositoryBoardItem[];
  compact?: boolean;
}) {
  const selectedRepositoryId = useRepositoryWorkspaceStore((s) => s.selectedRepositoryId);
  const setSelectedRepository = useRepositoryWorkspaceStore((s) => s.setSelectedRepository);

  if (items.length === 0) {
    return <p className="text-xs text-muted">No repository contexts for active missions.</p>;
  }

  return (
    <div className={cn("grid gap-3", compact ? "grid-cols-1" : "md:grid-cols-2")}>
      {items.slice(0, compact ? 3 : undefined).map((item) => (
        <button
          key={item.repositoryId}
          type="button"
          onClick={() =>
            setSelectedRepository(
              selectedRepositoryId === item.repositoryId ? null : item.repositoryId
            )
          }
          className={cn(
            "rounded-lg border border-border bg-background px-3 py-3 text-left transition hover:border-accent/40",
            selectedRepositoryId === item.repositoryId && "border-accent/60 bg-accent/5"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-foreground">{item.repositoryLabel}</p>
              <Link
                href={`/missions/${item.missionId}`}
                className="text-xs text-accent hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {item.missionName}
              </Link>
            </div>
            <Link
              href={`/repository-workspace?mission=${item.missionId}`}
              className="text-[10px] text-muted hover:text-accent"
              onClick={(e) => e.stopPropagation()}
            >
              Detail
            </Link>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-muted">
            <span>Tasks: {item.relatedTasks.length}</span>
            <span>Branches: {item.branches.length}</span>
            <span>PRs: {item.pullRequests.length}</span>
            <span>Review: {item.reviewState}</span>
          </div>
          <p className="mt-2 text-[11px] text-muted">Release: {item.releaseState}</p>
          {!compact && item.relatedTasks.length > 0 ? (
            <p className="mt-1 truncate text-[10px] text-muted">
              Tasks: {item.relatedTasks.slice(0, 2).join(", ")}
            </p>
          ) : null}
        </button>
      ))}
    </div>
  );
}
