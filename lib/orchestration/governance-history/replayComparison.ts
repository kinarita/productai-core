import type { ReplayDiagnostics } from "@/lib/replay-query/replayDiagnostics";
import {
  formatInterpretationRecordLabel,
  type ReplayInterpretationRecord,
} from "@/lib/orchestration/governance-history/replayInterpretationHistory";

export interface ReplayComparisonSnapshot {
  label: string;
  visibilityScore: number;
  replayConfidence: ReplayDiagnostics["replayConfidence"];
  continuityStability: ReplayDiagnostics["continuityStability"];
  advisoryDensity: number;
  reviewDensity: number;
  continuityExplanation: string;
}

export interface ReplayComparisonResult {
  left: ReplayComparisonSnapshot;
  right: ReplayComparisonSnapshot;
  visibilityDelta: number;
  confidenceChanged: boolean;
  continuityChanged: boolean;
  interpretationNote: string;
}

export function snapshotFromDiagnostics(
  label: string,
  diagnostics: ReplayDiagnostics
): ReplayComparisonSnapshot {
  return {
    label,
    visibilityScore: diagnostics.replayVisibilityScore,
    replayConfidence: diagnostics.replayConfidence,
    continuityStability: diagnostics.continuityStability,
    advisoryDensity: diagnostics.advisoryDensity,
    reviewDensity: diagnostics.reviewDensity,
    continuityExplanation: diagnostics.continuityExplanation,
  };
}

export function snapshotFromInterpretationRecord(
  record: ReplayInterpretationRecord
): ReplayComparisonSnapshot {
  return {
    label: formatInterpretationRecordLabel(record),
    visibilityScore: record.visibilityScore,
    replayConfidence: record.replayConfidence,
    continuityStability: record.continuityStability,
    advisoryDensity: 0,
    reviewDensity: 0,
    continuityExplanation: record.reviewFocus,
  };
}

export function compareReplaySnapshots(
  left: ReplayComparisonSnapshot,
  right: ReplayComparisonSnapshot
): ReplayComparisonResult {
  const visibilityDelta = right.visibilityScore - left.visibilityScore;
  const confidenceChanged = left.replayConfidence !== right.replayConfidence;
  const continuityChanged = left.continuityStability !== right.continuityStability;

  const parts: string[] = [
    `Visibility shifted by ${visibilityDelta >= 0 ? "+" : ""}${visibilityDelta} points between contexts.`,
  ];
  if (confidenceChanged) {
    parts.push(
      `Replay confidence moved from ${left.replayConfidence} to ${right.replayConfidence}—interpret as continuity reading support only.`
    );
  }
  if (continuityChanged) {
    parts.push(
      `Continuity stability changed from ${left.continuityStability.replaceAll("_", " ")} to ${right.continuityStability.replaceAll("_", " ")}.`
    );
  }
  parts.push("Comparison supports situational interpretation; it does not trigger automated governance actions.");

  return {
    left,
    right,
    visibilityDelta,
    confidenceChanged,
    continuityChanged,
    interpretationNote: parts.join(" "),
  };
}
