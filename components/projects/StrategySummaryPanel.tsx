"use client";

import type { StrategySummary } from "@/lib/discussion/strategyRoomTypes";

export function StrategySummaryPanel({
  summary,
  canGenerate,
  ceoTurnCount,
  onGenerate,
  onApply,
  onKeep,
  busy,
}: {
  summary?: StrategySummary;
  canGenerate: boolean;
  ceoTurnCount: number;
  onGenerate: () => void;
  onApply: () => void;
  onKeep: () => void;
  busy?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface/50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
        Strategy Summary
      </p>
      {!summary ? (
        <>
          <p className="mt-2 text-xs text-muted">
            After several turns, Planner synthesizes what you learned and what changed.
          </p>
          <button
            type="button"
            disabled={!canGenerate || busy}
            onClick={onGenerate}
            className="mt-3 rounded-lg border border-accent/40 bg-indigo-50/50 px-3 py-1.5 text-xs font-medium text-accent hover:bg-indigo-50 disabled:opacity-50"
          >
            {canGenerate
              ? "Generate Strategy Summary"
              : `Need more discussion (${ceoTurnCount}/2 CEO turns)`}
          </button>
        </>
      ) : (
        <div className="mt-2 space-y-3 text-xs">
          <section>
            <p className="font-medium text-foreground">What We Learned</p>
            <ul className="mt-1 list-inside list-disc text-muted">
              {summary.whatWeLearned.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section>
            <p className="font-medium text-foreground">What Changed</p>
            <ul className="mt-1 list-inside list-disc text-muted">
              {summary.whatChanged.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section>
            <p className="font-medium text-foreground">Open Questions</p>
            <ul className="mt-1 list-inside list-disc text-muted">
              {summary.openQuestions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section>
            <p className="font-medium text-foreground">Recommended Next Step</p>
            <p className="mt-1 text-muted">{summary.recommendedNextStep}</p>
          </section>
          {summary.status === "draft" ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={onApply}
                className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                Apply to Brief
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={onKeep}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:bg-surface disabled:opacity-50"
              >
                Keep as Discussion
              </button>
            </div>
          ) : (
            <p className="text-[11px] text-muted">Status: {summary.status.replace(/_/g, " ")}</p>
          )}
        </div>
      )}
    </div>
  );
}
