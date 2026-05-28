import { GovernanceNote } from "@/components/orchestration/GovernanceNote";
import type { ExecutionAuthorizationRequest } from "@/lib/orchestration/authorization/authorizationTypes";
import type { ExecutionQueueItem } from "@/lib/orchestration/queue/executionQueueTypes";

export function ExecutionIntentReview({
  request,
  item,
}: {
  request?: ExecutionAuthorizationRequest;
  item: ExecutionQueueItem;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-surface p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Execution intent review</p>
      <p className="text-sm text-foreground">{request?.authorizationIntent ?? item.taskId}</p>
      <p className="text-xs text-muted">Target: {item.executionTarget}</p>
      <p className="text-xs text-muted">Readiness score: {item.readinessScore}</p>
      <p className="text-xs text-muted">
        Runtime risk: {request?.runtimeRisk ?? "No active runtime risk advisory."}
      </p>
      {item.blockingConditions.length > 0 ? (
        <ul className="space-y-1 text-xs text-muted">
          {item.blockingConditions.map((c) => (
            <li key={c}>· {c}</li>
          ))}
        </ul>
      ) : null}
      <GovernanceNote>{request?.governanceSummary ?? item.governanceBoundary}</GovernanceNote>
    </div>
  );
}
