import { GovernanceNote } from "@/components/orchestration/GovernanceNote";
import { ExecutionOperatorSignatureView } from "@/components/orchestration/ExecutionOperatorSignatureView";
import type { ExecutionSession } from "@/lib/orchestration/execution-start/executionStartTypes";

export function ExecutionSessionCard({ session }: { session?: ExecutionSession }) {
  if (!session) return null;
  return (
    <div className="space-y-2 rounded-lg border border-border bg-surface p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Execution session governance</p>
      <p className="text-sm text-foreground">{session.executionIntent}</p>
      <p className="text-xs text-muted">
        Status: {session.executionSessionStatus.replaceAll("_", " ")} · Target: {session.executionTarget}
      </p>
      <p className="text-xs text-muted">
        Runtime reservation: {session.runtimeReservation.reserved ? "reserved" : "not reserved"} ·{" "}
        {session.runtimeReservation.note}
      </p>
      <GovernanceNote>{session.governanceBoundaryConfirmation}</GovernanceNote>
      <ExecutionOperatorSignatureView signature={session.operatorSignature} />
    </div>
  );
}
