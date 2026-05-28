import type { GovernanceSeverity } from "@/lib/orchestration/processing/processingTypes";

const order: GovernanceSeverity[] = ["low", "moderate", "elevated", "critical_review"];
const color: Record<GovernanceSeverity, string> = {
  low: "bg-slate-300",
  moderate: "bg-amber-300",
  elevated: "bg-orange-300",
  critical_review: "bg-rose-300",
};

export function SeverityDistributionBar({
  distribution,
}: {
  distribution: Record<GovernanceSeverity, number>;
}) {
  const total = order.reduce((sum, key) => sum + distribution[key], 0);
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="text-xs font-medium uppercase text-muted">Severity distribution</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
        <div className="flex h-full w-full">
          {order.map((key) => (
            <div
              key={key}
              className={color[key]}
              style={{ width: `${total === 0 ? 0 : (distribution[key] / total) * 100}%` }}
            />
          ))}
        </div>
      </div>
      <p className="mt-2 text-xs text-muted">
        Low {distribution.low} · Moderate {distribution.moderate} · Elevated {distribution.elevated} · Critical{" "}
        {distribution.critical_review}
      </p>
    </div>
  );
}
