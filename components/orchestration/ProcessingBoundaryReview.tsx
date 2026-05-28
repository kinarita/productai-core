import { GovernanceNote } from "@/components/orchestration/GovernanceNote";
import { processingBoundaryLines } from "@/lib/orchestration/processing/processingBoundary";
import type { ExecutionQueueItem } from "@/lib/orchestration/queue/executionQueueTypes";

export function ProcessingBoundaryReview({
  item,
  runtimeAdvisory,
}: {
  item: ExecutionQueueItem;
  runtimeAdvisory?: string;
}) {
  const lines = processingBoundaryLines(item, runtimeAdvisory);
  return (
    <div className="space-y-2 rounded-lg border border-border bg-background p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Processing boundary semantics</p>
      <ul className="space-y-1 text-xs text-muted">
        {lines.map((line) => (
          <li key={line}>· {line}</li>
        ))}
      </ul>
      <GovernanceNote>No operational execution has been initiated.</GovernanceNote>
    </div>
  );
}
