"use client";

import type { RepositoryOverviewSummary } from "@/lib/repository/repositoryAnalysis";
import type { RepositoryBottleneckObservation } from "@/lib/repository/repositoryAnalysis";

export function RepositoryOverviewCard({
  overview,
  compact = false,
}: {
  overview: RepositoryOverviewSummary;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Repositories</p>
          <p className="text-lg font-semibold">{overview.repositories}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Pull Requests</p>
          <p className="text-lg font-semibold">{overview.pullRequests}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Reviews</p>
          <p className="text-lg font-semibold">{overview.reviews}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Release Candidates</p>
          <p className="text-lg font-semibold">{overview.releaseCandidates}</p>
        </div>
      </div>
      {!compact ? (
        <div className="grid grid-cols-2 gap-2 text-xs text-muted">
          <span>Missions: {overview.missionCount}</span>
          <span>Tasks: {overview.taskCount}</span>
        </div>
      ) : null}
      {overview.potentialCoordinationAreas.length > 0 ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Potential Coordination Areas</p>
          <ul className="mt-1 space-y-0.5 text-xs text-muted">
            {overview.potentialCoordinationAreas.slice(0, compact ? 2 : 4).map((a) => (
              <li key={a}>· {a}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="text-xs text-muted">{overview.advisoryNote}</p>
    </div>
  );
}

export function RepositorySummaryStats({
  overview,
  bottlenecks,
  compact = false,
}: {
  overview: RepositoryOverviewSummary;
  bottlenecks: RepositoryBottleneckObservation[];
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <RepositoryOverviewCard overview={overview} compact={compact} />
      {bottlenecks.length > 0 && !compact ? (
        <ul className="space-y-1 text-xs text-muted">
          {bottlenecks.slice(0, 3).map((b) => (
            <li key={b.id}>· {b.detail}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
