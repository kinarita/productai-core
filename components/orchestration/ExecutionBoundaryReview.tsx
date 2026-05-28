import { GovernanceNote } from "@/components/orchestration/GovernanceNote";
import { buildExecutionBoundaryConfirmation } from "@/lib/orchestration/execution-start/executionBoundaryConfirmation";
import type { ExecutionQueueItem } from "@/lib/orchestration/queue/executionQueueTypes";

export function ExecutionBoundaryReview({
  item,
  runtimeAdvisory,
}: {
  item: ExecutionQueueItem;
  runtimeAdvisory?: string;
}) {
  const lines = buildExecutionBoundaryConfirmation(item, runtimeAdvisory);
  return (
    <div className="space-y-2 rounded-lg border border-border bg-background p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Execution boundary confirmation</p>
      <ul className="space-y-1 text-xs text-muted">
        {lines.map((line) => (
          <li key={line}>· {line}</li>
        ))}
      </ul>
      <GovernanceNote>
        Execution session activation is governance state only. Actual execution remains disabled.
      </GovernanceNote>
    </div>
  );
}
