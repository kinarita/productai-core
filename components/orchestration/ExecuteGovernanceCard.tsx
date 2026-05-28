import { ExecuteReadyBadge } from "@/components/orchestration/ExecuteReadyBadge";
import { GovernanceNote } from "@/components/orchestration/GovernanceNote";
import type { ExecuteStub } from "@/lib/orchestration/execute/executeTypes";
import { humanExecutionBoundaryMessage } from "@/lib/orchestration/execute/executeBoundary";

export function ExecuteGovernanceCard({ stub }: { stub?: ExecuteStub }) {
  if (!stub) return null;
  return (
    <div className="space-y-2 rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Execute governance</p>
        <ExecuteReadyBadge status={stub.executeStatus} />
      </div>
      <p className="text-sm text-foreground">{stub.executionIntent}</p>
      <p className="text-xs text-muted">Target: {stub.executionTarget}</p>
      <GovernanceNote>{stub.governanceValidation}</GovernanceNote>
      <p className="text-xs text-muted">{humanExecutionBoundaryMessage()}</p>
    </div>
  );
}
