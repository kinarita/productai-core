import Link from "next/link";
import { GovernanceSeverityBadge } from "@/components/orchestration/GovernanceSeverityBadge";
import { resolveMissionLabel } from "@/lib/orchestration/processing/missionLabel";
import type { ProcessingSession } from "@/lib/orchestration/processing/processingTypes";

export function ProcessingReviewQueue({
  sessions,
  missionNameMap,
}: {
  sessions: ProcessingSession[];
  missionNameMap?: Record<string, string>;
}) {
  if (!sessions.length) {
    return <p className="text-xs text-muted">No processing governance items currently require executive review.</p>;
  }
  return (
    <ul className="space-y-2">
      {sessions.slice(0, 8).map((session) => (
        <li key={session.id} className="rounded-lg border border-border bg-surface p-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-foreground">{session.processingIntent}</p>
            {session.latestReviewReason ? (
              <GovernanceSeverityBadge severity={session.latestReviewReason.severity} />
            ) : null}
          </div>
          <p className="mt-1 text-muted">
            State: {session.processingStatus.replaceAll("_", " ")} · Mission:{" "}
            {resolveMissionLabel({ missionId: session.missionId, missionNameMap })} · Advisory:{" "}
            {session.advisoryState}
          </p>
          {session.latestReviewReason ? (
            <>
              <p className="mt-1 text-muted">Recommendation: {session.latestReviewReason.recommendation}</p>
              <p className="mt-1 text-muted">
                Active reasons: {session.activeReasons.length} · Severity history:{" "}
                {session.activeReasons.map((reason) => reason.severity.replaceAll("_", " ")).join(", ")}
              </p>
            </>
          ) : null}
          <div className="mt-1 flex flex-wrap gap-3">
            <Link href={`/missions/${session.missionId}`} className="font-medium text-accent hover:underline">
              Open related mission →
            </Link>
            <Link
              href={`/runtime-cost?mission=${encodeURIComponent(session.missionId)}&review=processing_review_required`}
              className="font-medium text-accent hover:underline"
            >
              Open related processing review →
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
