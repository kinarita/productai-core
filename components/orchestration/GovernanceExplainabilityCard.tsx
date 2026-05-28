import { ContinuityScoreBreakdown } from "@/components/orchestration/ContinuityScoreBreakdown";
import type { GovernanceContinuityExplanation } from "@/lib/orchestration/processing/processingTypes";
import type { ReplayDiagnostics } from "@/lib/replay-query/replayDiagnostics";

export function GovernanceExplainabilityCard({
  explanation,
  breakdown,
  historicalExplanation,
  replayExplanation,
  continuityShiftExplanation,
  replayDiagnosticsExplanation,
  replayVisibilityExplanation,
  replayConfidenceExplanation,
  replayDiagnostics,
}: {
  explanation: GovernanceContinuityExplanation;
  breakdown: {
    runtimeStability: number;
    advisoryDensity: number;
    reviewLoad: number;
    blockerDensity: number;
    governanceContinuity: number;
  };
  historicalExplanation?: string;
  replayExplanation?: string;
  continuityShiftExplanation?: string;
  replayDiagnosticsExplanation?: string;
  replayVisibilityExplanation?: string;
  replayConfidenceExplanation?: string;
  replayDiagnostics?: ReplayDiagnostics;
}) {
  const diagnosticsContinuity = replayDiagnostics?.continuityExplanation ?? replayDiagnosticsExplanation;
  const diagnosticsVisibility = replayDiagnostics?.visibilityExplanation ?? replayVisibilityExplanation;
  const diagnosticsConfidence = replayDiagnostics?.confidenceExplanation ?? replayConfidenceExplanation;
  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Analytics explainability</p>
      <p className="text-xs text-muted">
        Governance continuity score reflects elevated advisory density and review concentration.
      </p>
      {historicalExplanation ? (
        <p className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted">
          {historicalExplanation}
        </p>
      ) : null}
      {replayExplanation ? (
        <p className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted">
          {replayExplanation}
        </p>
      ) : null}
      {continuityShiftExplanation ? (
        <p className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted">
          {continuityShiftExplanation}
        </p>
      ) : null}
      {diagnosticsContinuity ? (
        <p className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted">
          {diagnosticsContinuity}
        </p>
      ) : null}
      {diagnosticsVisibility ? (
        <p className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted">
          {diagnosticsVisibility}
        </p>
      ) : null}
      {diagnosticsConfidence ? (
        <p className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted">
          {diagnosticsConfidence}
        </p>
      ) : null}
      <ContinuityScoreBreakdown breakdown={breakdown} />
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-background p-2">
          <p className="text-xs font-medium text-muted">Stability factors</p>
          <ul className="mt-1 space-y-1 text-xs text-muted">
            {explanation.stabilityFactors.slice(0, 3).map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-md border border-border bg-background p-2">
          <p className="text-xs font-medium text-muted">Degradation factors</p>
          <ul className="mt-1 space-y-1 text-xs text-muted">
            {explanation.degradationFactors.slice(0, 3).map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-md border border-border bg-background p-2">
          <p className="text-xs font-medium text-muted">Recommendations</p>
          <ul className="mt-1 space-y-1 text-xs text-muted">
            {explanation.recommendations.slice(0, 3).map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="text-[11px] text-muted">Generated at {explanation.generatedAt}</p>
    </div>
  );
}
