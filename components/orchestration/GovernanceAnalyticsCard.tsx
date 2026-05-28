import { GovernanceContinuityScore } from "@/components/orchestration/GovernanceContinuityScore";
import { GovernanceHealthBadge } from "@/components/orchestration/GovernanceHealthBadge";
import { SeverityDistributionBar } from "@/components/orchestration/SeverityDistributionBar";
import { ProcessingReviewQueue } from "@/components/orchestration/ProcessingReviewQueue";
import { buildProcessingAnalytics } from "@/lib/orchestration/processing/processingAnalytics";
import type { ProcessingSession } from "@/lib/orchestration/processing/processingTypes";

export function GovernanceAnalyticsCard({ sessions }: { sessions: ProcessingSession[] }) {
  const analytics = buildProcessingAnalytics(sessions);
  const topCategories = Object.entries(analytics.categoryDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  return (
    <div className="space-y-3 rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Processing governance analytics</p>
        <GovernanceHealthBadge score={analytics.summary.governanceHealthScore} />
      </div>
      <SeverityDistributionBar distribution={analytics.severityDistribution} />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md border border-border bg-surface px-2 py-2 text-xs text-muted">
          Review required: <span className="font-medium text-foreground">{analytics.summary.reviewRequiredCount}</span>
        </div>
        <div className="rounded-md border border-border bg-surface px-2 py-2 text-xs text-muted">
          Elevated risk: <span className="font-medium text-foreground">{analytics.summary.elevatedRiskCount}</span>
        </div>
        <div className="rounded-md border border-border bg-surface px-2 py-2 text-xs text-muted">
          Advisory only:{" "}
          <span className="font-medium text-foreground">
            {(analytics.advisoryOnlyRatio * 100).toFixed(0)}%
          </span>
        </div>
        <div className="rounded-md border border-border bg-surface px-2 py-2 text-xs text-muted">
          Runtime/provider issues:{" "}
          <span className="font-medium text-foreground">{analytics.summary.runtimeInstabilityCount}</span>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-surface p-3">
        <p className="text-xs font-medium uppercase text-muted">Reason category distribution</p>
        <ul className="mt-2 space-y-1 text-xs text-muted">
          {topCategories.map(([category, count]) => (
            <li key={category}>
              {category.replaceAll("_", " ")}: <span className="text-foreground">{count}</span>
            </li>
          ))}
        </ul>
      </div>
      <GovernanceContinuityScore score={analytics.summary.governanceHealthScore} />
      <div className="rounded-lg border border-border bg-surface p-3">
        <p className="mb-2 text-xs font-medium uppercase text-muted">Processing governance review queue</p>
        <ProcessingReviewQueue
          sessions={sessions.filter(
            (session) =>
              session.processingStatus === "processing_review_required" ||
              session.processingStatus === "processing_denied" ||
              session.processingStatus === "processing_revoked"
          )}
        />
      </div>
    </div>
  );
}
