import { GovernanceNote } from "@/components/orchestration/GovernanceNote";
import { ProcessingReasonCard } from "@/components/orchestration/ProcessingReasonCard";
import { ProcessingStateBadge } from "@/components/orchestration/ProcessingStateBadge";
import type { ProcessingSession } from "@/lib/orchestration/processing/processingTypes";

export function ProcessingGovernanceCard({ session }: { session?: ProcessingSession }) {
  if (!session) return null;
  return (
    <div className="space-y-2 rounded-lg border border-border bg-surface p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Processing governance continuity</p>
      <p className="text-sm text-foreground">{session.processingIntent}</p>
      <div className="flex items-center gap-2">
        <ProcessingStateBadge status={session.processingStatus} />
        <p className="text-xs text-muted">Target: {session.processingTarget}</p>
      </div>
      <p className="text-xs text-muted">
        Runtime continuity reservation: {session.runtimeReservation.reserved ? "reserved" : "not reserved"} ·{" "}
        {session.runtimeReservation.note}
      </p>
      <p className="text-xs text-muted">Runtime advisory: {session.advisoryState}</p>
      {session.latestReviewReason ? <ProcessingReasonCard reason={session.latestReviewReason} /> : null}
      {session.reviewRequired ? (
        <p className="text-xs text-muted">
          Processing governance is currently in review-required continuity state.
        </p>
      ) : null}
      <GovernanceNote>{session.governanceContinuity}</GovernanceNote>
    </div>
  );
}
