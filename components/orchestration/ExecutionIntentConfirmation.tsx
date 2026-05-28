import { GovernanceNote } from "@/components/orchestration/GovernanceNote";
import type { ExecutionQueueItem } from "@/lib/orchestration/queue/executionQueueTypes";

export function ExecutionIntentConfirmation({
  item,
  runtimeAdvisory,
}: {
  item: ExecutionQueueItem;
  runtimeAdvisory?: string;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-surface p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Execution intent confirmation</p>
      <p className="text-sm text-foreground">{item.taskId}</p>
      <p className="text-xs text-muted">Target: {item.executionTarget}</p>
      <p className="text-xs text-muted">Readiness score: {item.readinessScore}</p>
      <p className="text-xs text-muted">
        Runtime advisory: {runtimeAdvisory ?? "No active runtime advisory."}
      </p>
      <p className="text-xs text-muted">Approval chain: handoff → authorization → final governance review</p>
      <GovernanceNote>{item.governanceBoundary}</GovernanceNote>
    </div>
  );
}
