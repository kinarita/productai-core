import {
  buildContinuityInterpretation,
  buildGovernanceAttentionInterpretation,
  buildReplayLiteracySummary,
} from "@/lib/orchestration/governance-history/replayLiteracy";
import type { ReplayDiagnostics } from "@/lib/replay-query/replayDiagnostics";

interface ReplayOnboardingSummaryProps {
  diagnostics?: ReplayDiagnostics | null;
  attentionCount?: number;
  compact?: boolean;
}

export function ReplayOnboardingSummary({
  diagnostics,
  attentionCount = 0,
  compact = false,
}: ReplayOnboardingSummaryProps) {
  const literacy = buildReplayLiteracySummary(diagnostics);
  const continuity = buildContinuityInterpretation(diagnostics);
  const attention = buildGovernanceAttentionInterpretation({ attentionCount });

  return (
    <div className={`space-y-3 ${compact ? "text-xs" : "text-sm"}`}>
      <div className="rounded-lg border border-border bg-background px-3 py-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          What this replay view shows
        </p>
        <p className="mt-1 text-muted">{literacy}</p>
      </div>
      <div className="rounded-lg border border-border bg-background px-3 py-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Why attention may appear
        </p>
        <p className="mt-1 text-muted">{attention}</p>
      </div>
      <div className="rounded-lg border border-border bg-background px-3 py-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          How continuity should be interpreted
        </p>
        <p className="mt-1 text-muted">{continuity}</p>
      </div>
      <div className="rounded-lg border border-border bg-background px-3 py-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          What this system intentionally does not do
        </p>
        <ul className="mt-1 list-inside list-disc space-y-1 text-muted">
          <li>ProductAI does not autonomously execute operational actions.</li>
          <li>Replay diagnostics are recommendation-oriented governance aids.</li>
          <li>Governance replay does not initiate handoffs, workers, or automatic recovery.</li>
        </ul>
      </div>
    </div>
  );
}
