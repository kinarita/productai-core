"use client";

import { useMemo } from "react";
import { buildLongitudinalGovernanceReview } from "@/lib/orchestration/governance-history/longitudinalReview";
import { useReplayInterpretationStore } from "@/lib/store/replayInterpretationStore";

export function LongitudinalGovernanceReview({ compact = false }: { compact?: boolean }) {
  const records = useReplayInterpretationStore((s) => s.records);

  const review = useMemo(() => buildLongitudinalGovernanceReview(records), [records]);

  if (review.points.length === 0) {
    return (
      <p className="text-xs text-muted">
        Record replay interpretations over time to enable longitudinal governance review.
      </p>
    );
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <p className="text-xs text-muted">{review.readingNote}</p>
      <p className="text-xs text-muted">{review.visibilityTrend}</p>
      <p className="text-xs text-muted">{review.continuityDriftNote}</p>
      <p className="text-xs text-muted">{review.reviewDensityNote}</p>
      <p className="text-xs text-muted">{review.interpretationEvolutionNote}</p>
      <ul className="space-y-2 border-l border-border pl-3">
        {review.points.slice(0, compact ? 4 : 8).map((point) => (
          <li key={point.id} className="relative text-xs text-muted">
            <span className="absolute -left-[7px] top-1.5 h-2 w-2 rounded-full bg-border" />
            <p className="text-[11px]">{point.at.slice(0, 16)} · {point.label}</p>
            <p className="text-foreground">
              Visibility {point.visibilityScore} · {point.replayConfidence} confidence ·{" "}
              {point.continuityStability.replaceAll("_", " ")}
            </p>
            <p>{point.interpretationSummary}</p>
            {point.changeNote ? <p className="text-[11px]">{point.changeNote}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
