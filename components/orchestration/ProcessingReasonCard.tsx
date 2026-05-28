import { GovernanceSeverityBadge } from "@/components/orchestration/GovernanceSeverityBadge";
import { ProcessingReasonBadge } from "@/components/orchestration/ProcessingReasonBadge";
import type { ProcessingGovernanceReason } from "@/lib/orchestration/processing/processingTypes";

export function ProcessingReasonCard({ reason }: { reason: ProcessingGovernanceReason }) {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-background p-3">
      <div className="flex flex-wrap items-center gap-2">
        <ProcessingReasonBadge category={reason.category} />
        <GovernanceSeverityBadge severity={reason.severity} />
        <span className="text-xs text-muted">{reason.advisoryOnly ? "advisory" : "governance decision"}</span>
      </div>
      <p className="text-sm font-medium text-foreground">{reason.title}</p>
      <p className="text-xs text-muted">{reason.description}</p>
      <p className="text-xs text-muted">Recommendation: {reason.recommendation}</p>
    </div>
  );
}
