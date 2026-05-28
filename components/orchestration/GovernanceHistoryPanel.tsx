import { GovernanceTimeline } from "@/components/orchestration/GovernanceTimeline";
import type { GovernanceReplayBundle } from "@/lib/orchestration/governance-history/governanceHistoryTypes";

export function GovernanceHistoryPanel({
  replay,
  missionId,
  missionNameMap,
}: {
  replay: GovernanceReplayBundle;
  missionId: string;
  missionNameMap?: Record<string, string>;
}) {
  const missionEvents = replay.events.filter((event) => event.missionId === missionId);
  const reasonHistory = missionEvents.filter((event) => event.relatedReasonCategory);
  const readinessChanges = missionEvents.filter(
    (event) => event.eventType === "execution_ready" || event.eventType === "execution_session_active"
  );
  return (
    <div className="space-y-3 rounded-lg border border-border bg-background p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Mission governance history</p>
      <p className="text-xs text-muted">
        Timeline explains why current mission governance state exists across review, processing, and advisory changes.
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-surface p-2 text-xs text-muted">
          Latest health score:{" "}
          <span className="font-medium text-foreground">{replay.latestSnapshot.governanceHealthScore}</span>
        </div>
        <div className="rounded-md border border-border bg-surface p-2 text-xs text-muted">
          Reason history entries: <span className="font-medium text-foreground">{reasonHistory.length}</span>
        </div>
        <div className="rounded-md border border-border bg-surface p-2 text-xs text-muted">
          Execution readiness changes:{" "}
          <span className="font-medium text-foreground">{readinessChanges.length}</span>
        </div>
      </div>
      <GovernanceTimeline events={missionEvents} missionNameMap={missionNameMap} />
    </div>
  );
}
