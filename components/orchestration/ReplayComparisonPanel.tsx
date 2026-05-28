"use client";

import {
  compareReplaySnapshots,
  snapshotFromInterpretationRecord,
} from "@/lib/orchestration/governance-history/replayComparison";
import { useReplayInterpretationStore } from "@/lib/store/replayInterpretationStore";
import type { ReplayDiagnostics } from "@/lib/replay-query/replayDiagnostics";

interface ReplayComparisonPanelProps {
  currentDiagnostics?: ReplayDiagnostics | null;
  currentLabel?: string;
}

export function ReplayComparisonPanel({
  currentDiagnostics,
  currentLabel = "Current view",
}: ReplayComparisonPanelProps) {
  const records = useReplayInterpretationStore((s) => s.records);
  const comparisonLeftId = useReplayInterpretationStore((s) => s.comparisonLeftId);
  const comparisonRightId = useReplayInterpretationStore((s) => s.comparisonRightId);

  const leftRecord = records.find((r) => r.id === comparisonLeftId);
  const rightRecord = records.find((r) => r.id === comparisonRightId);

  if (!leftRecord && !rightRecord && !currentDiagnostics) {
    return (
      <p className="text-xs text-muted">
        Select two interpretation records (Compare A / B) to support situational change reading.
      </p>
    );
  }

  const left = leftRecord
    ? snapshotFromInterpretationRecord(leftRecord)
    : currentDiagnostics
      ? {
          label: currentLabel,
          visibilityScore: currentDiagnostics.replayVisibilityScore,
          replayConfidence: currentDiagnostics.replayConfidence,
          continuityStability: currentDiagnostics.continuityStability,
          advisoryDensity: currentDiagnostics.advisoryDensity,
          reviewDensity: currentDiagnostics.reviewDensity,
          continuityExplanation: currentDiagnostics.continuityExplanation,
        }
      : null;

  const right = rightRecord
    ? snapshotFromInterpretationRecord(rightRecord)
    : currentDiagnostics && leftRecord
      ? {
          label: currentLabel,
          visibilityScore: currentDiagnostics.replayVisibilityScore,
          replayConfidence: currentDiagnostics.replayConfidence,
          continuityStability: currentDiagnostics.continuityStability,
          advisoryDensity: currentDiagnostics.advisoryDensity,
          reviewDensity: currentDiagnostics.reviewDensity,
          continuityExplanation: currentDiagnostics.continuityExplanation,
        }
      : null;

  if (!left || !right) {
    return (
      <p className="text-xs text-muted">
        Assign Compare A and Compare B on interpretation history entries to open comparison.
      </p>
    );
  }

  const result = compareReplaySnapshots(left, right);

  return (
    <div className="space-y-3 rounded-lg border border-border bg-background p-3">
      <p className="text-xs font-medium uppercase text-muted">Replay comparison</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-border p-2 text-xs text-muted">
          <p className="font-medium text-foreground">{result.left.label}</p>
          <p className="mt-1">Visibility: {result.left.visibilityScore}</p>
          <p>Confidence: {result.left.replayConfidence}</p>
          <p>Continuity: {result.left.continuityStability.replaceAll("_", " ")}</p>
          <p>Advisory density: {Math.round(result.left.advisoryDensity * 100)}%</p>
          <p>Review density: {Math.round(result.left.reviewDensity * 100)}%</p>
        </div>
        <div className="rounded-md border border-border p-2 text-xs text-muted">
          <p className="font-medium text-foreground">{result.right.label}</p>
          <p className="mt-1">Visibility: {result.right.visibilityScore}</p>
          <p>Confidence: {result.right.replayConfidence}</p>
          <p>Continuity: {result.right.continuityStability.replaceAll("_", " ")}</p>
          <p>Advisory density: {Math.round(result.right.advisoryDensity * 100)}%</p>
          <p>Review density: {Math.round(result.right.reviewDensity * 100)}%</p>
        </div>
      </div>
      <p className="text-xs text-muted">{result.interpretationNote}</p>
    </div>
  );
}
