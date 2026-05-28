"use client";

import type { ExecutionReadinessSummary } from "@/lib/orchestration/materialization/materializationTypes";
import { GovernanceNote } from "@/components/orchestration/GovernanceNote";
import { validateMaterializationBoundary } from "@/lib/orchestration/materialization/materializationPolicy";

interface ExecutionReadinessCardProps {
  summary: ExecutionReadinessSummary;
  queueSize?: number;
}

export function ExecutionReadinessCard({ summary, queueSize = 0 }: ExecutionReadinessCardProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-surface px-3 py-3">
          <p className="text-xs font-medium uppercase text-muted">Governance reviewed</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{summary.governanceReviewed}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface px-3 py-3">
          <p className="text-xs font-medium uppercase text-muted">Execution ready</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{summary.executionReady}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface px-3 py-3">
          <p className="text-xs font-medium uppercase text-muted">Blocked</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{summary.blocked}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface px-3 py-3">
          <p className="text-xs font-medium uppercase text-muted">Pending review</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{summary.pendingReview}</p>
        </div>
      </div>

      {queueSize > 0 ? (
        <p className="text-xs text-muted">Execution queue entries: {queueSize}</p>
      ) : null}

      {summary.runtimeAdvisory ? (
        <p className="text-xs text-muted">{summary.runtimeAdvisory}</p>
      ) : null}

      <GovernanceNote>{validateMaterializationBoundary()}</GovernanceNote>
    </div>
  );
}