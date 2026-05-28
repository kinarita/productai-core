import { ExecutiveSnapshotCard } from "@/components/orchestration/ExecutiveSnapshotCard";
import { GovernanceTimeline } from "@/components/orchestration/GovernanceTimeline";
import type { GovernanceReplayBundle } from "@/lib/orchestration/governance-history/governanceHistoryTypes";
import { getContinuityStabilityLabel } from "@/lib/replay-query/replayDiagnosticsHelpers";
import { getReplayDensityWording } from "@/lib/replay-query/replayDiagnosticsLabels";

export function OperationalReplayPanel({
  replay,
  missionNameMap,
  maxEvents,
}: {
  replay: GovernanceReplayBundle;
  missionNameMap?: Record<string, string>;
  maxEvents?: number;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-background p-3">
      <ExecutiveSnapshotCard snapshot={replay.latestSnapshot} />
      <div className="rounded-lg border border-border bg-surface p-3">
        <p className="mb-2 text-xs font-medium uppercase text-muted">Governance timeline</p>
        <p className="mb-2 text-xs text-muted">
          Replay visibility emphasizes governance continuity across advisory and review transitions.
        </p>
        <p className="mb-2 text-xs text-muted">
          Visibility {replay.diagnostics.replayVisibilityScore} · Confidence {replay.diagnostics.replayConfidence} ·{" "}
          {getContinuityStabilityLabel(replay.diagnostics.continuityStability)}
        </p>
        {replay.diagnostics.compressedEventCount ? (
          <p className="mb-2 text-xs text-muted">
            {getReplayDensityWording("compact")}.
          </p>
        ) : null}
        <GovernanceTimeline events={replay.events} missionNameMap={missionNameMap} maxEvents={maxEvents} />
      </div>
    </div>
  );
}
