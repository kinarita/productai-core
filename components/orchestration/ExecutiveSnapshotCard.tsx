import Link from "next/link";
import type { ExecutiveGovernanceSnapshot } from "@/lib/orchestration/governance-history/governanceHistoryTypes";
import { GovernanceHealthBadge } from "@/components/orchestration/GovernanceHealthBadge";

export function ExecutiveSnapshotCard({ snapshot }: { snapshot: ExecutiveGovernanceSnapshot }) {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase text-muted">Executive governance snapshot</p>
        <GovernanceHealthBadge score={snapshot.governanceHealthScore} />
      </div>
      <p className="text-sm text-foreground">{snapshot.summary}</p>
      <p className="text-xs text-muted">
        Review required {snapshot.reviewRequiredCount} · Elevated risk {snapshot.elevatedRiskCount} · Active{" "}
        {snapshot.activeProcessingCount}
      </p>
      <ul className="space-y-1 text-xs text-muted">
        {snapshot.keyDrivers.slice(0, 3).map((driver) => (
          <li key={driver}>- {driver}</li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3 text-xs">
        <Link href="/runtime-cost" className="font-medium text-accent hover:underline">
          Open Runtime & Cost replay →
        </Link>
      </div>
    </div>
  );
}
