import type { GovernanceTrendPoint } from "@/lib/orchestration/governance-history/governanceHistoryTypes";

export function GovernanceTrendCard({ points }: { points: GovernanceTrendPoint[] }) {
  if (!points.length) {
    return <p className="text-xs text-muted">No historical trend points recorded yet.</p>;
  }
  return (
    <div className="space-y-2 rounded-lg border border-border bg-surface p-3">
      <p className="text-xs font-medium uppercase text-muted">Historical governance trend</p>
      <ul className="space-y-2">
        {points.slice(0, 5).map((point) => (
          <li key={point.label} className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted">
            <span className="font-medium text-foreground">{point.label}</span> · health {point.governanceHealthScore}
            {" · "}review {point.reviewDensity}
            {" · "}runtime {point.runtimeInstability}
            {" · "}advisory {point.advisoryDensity}
          </li>
        ))}
      </ul>
    </div>
  );
}
