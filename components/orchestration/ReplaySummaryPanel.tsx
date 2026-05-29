import type { ExecutiveReplaySummary } from "@/lib/orchestration/governance-history/governanceHistoryTypes";
import { getReplayDensityWording } from "@/lib/replay-query/replayDiagnosticsLabels";
import { ReplayDiagnosticsDefinition } from "@/components/orchestration/ReplayDiagnosticsDefinition";

export function ReplaySummaryPanel({
  summary,
  onCopy,
  onExportInterpretation,
  onExportGovernanceDigest,
  onExportGovernanceNarrative,
  readabilityMode = "compact",
  interpretationPresetTitle,
  bookmarkContinuityNote,
}: {
  summary: ExecutiveReplaySummary;
  onCopy: () => void;
  onExportInterpretation?: () => void;
  onExportGovernanceDigest?: () => void;
  onExportGovernanceNarrative?: () => void;
  readabilityMode?: "compact" | "expanded";
  interpretationPresetTitle?: string;
  bookmarkContinuityNote?: string;
}) {
  const expanded = readabilityMode === "expanded";

  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Executive replay summary</p>
      {interpretationPresetTitle ? (
        <p className="text-xs text-muted">
          Interpretation preset: <span className="text-foreground">{interpretationPresetTitle}</span>
        </p>
      ) : null}
      {bookmarkContinuityNote ? (
        <p className="text-xs text-muted">{bookmarkContinuityNote}</p>
      ) : null}
      <p className="text-sm text-foreground">{summary.governanceHealthSummary}</p>
      <p className="text-xs text-muted">
        {summary.generatedAt} · {summary.replayWindow}
      </p>
      {expanded ? (
        <>
          <p className="text-xs text-muted">{summary.replayWindowDescription}</p>
          <p className="text-xs text-muted">
            Scope: {summary.activeScope.replaceAll("_", " ")} · Continuity focus: {summary.continuityFocus}{" "}
            · Severity: {summary.filteredSeverity.replaceAll("_", " ")}
          </p>
          <p className="text-xs text-muted">
            Viewing {summary.activeReplayWindow} operational replay window · {summary.visibleEventCount}{" "}
            visible events · {getReplayDensityWording(summary.timelineDensity)}
          </p>
        </>
      ) : (
        <p className="text-xs text-muted">
          {summary.activeScope.replaceAll("_", " ")} · {summary.visibleEventCount} events ·{" "}
          {getReplayDensityWording(summary.timelineDensity)}
        </p>
      )}
      <p className="text-xs text-muted">{summary.continuityContext}</p>
      {expanded ? (
        <>
          <p className="text-xs text-muted">{summary.governanceFocusSummary}</p>
          <ul className="space-y-1 text-xs text-muted">
            {summary.keyContinuityDrivers.map((driver) => (
              <li key={driver}>- {driver}</li>
            ))}
          </ul>
          <p className="text-xs text-muted">{summary.reviewPressureSummary}</p>
          <p className="text-xs text-muted">{summary.runtimeGovernanceSummary}</p>
        </>
      ) : null}
      <p className="text-xs text-muted">{summary.diagnosticsSummary}</p>
      {summary.decisionAttentionSummary ? (
        <p className="text-xs text-muted">{summary.decisionAttentionSummary}</p>
      ) : null}
      {expanded && summary.decisionAttentionTraceability ? (
        <p className="text-xs text-muted">{summary.decisionAttentionTraceability}</p>
      ) : null}
      <ul className="space-y-1 text-xs text-muted">
        {summary.recommendedExecutiveFocus.slice(0, expanded ? 5 : 3).map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
      <ReplayDiagnosticsDefinition compact />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCopy}
          className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground hover:bg-surface"
        >
          Copy Replay Summary
        </button>
        {onExportInterpretation ? (
          <button
            type="button"
            onClick={onExportInterpretation}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-accent hover:bg-surface"
          >
            Export replay interpretation context
          </button>
        ) : null}
        {onExportGovernanceDigest ? (
          <button
            type="button"
            onClick={onExportGovernanceDigest}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-accent hover:bg-surface"
          >
            Export governance digest
          </button>
        ) : null}
        {onExportGovernanceNarrative ? (
          <button
            type="button"
            onClick={onExportGovernanceNarrative}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-accent hover:bg-surface"
          >
            Export governance narrative
          </button>
        ) : null}
      </div>
    </div>
  );
}
