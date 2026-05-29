"use client";

import Link from "next/link";
import { buildReviewSequenceSteps } from "@/lib/orchestration/governance-history/reviewSequencing";
import { useReplayInterpretationStore } from "@/lib/store/replayInterpretationStore";
import { useGovernanceJournalStore } from "@/lib/store/governanceJournalStore";
import { useGovernanceWorkspaceStore } from "@/lib/store/governanceWorkspaceStore";
import { buildReplayHref } from "@/lib/replay-query/replayQueryNavigation";
import { mergeReplayQuery } from "@/lib/replay-query/replayQueryParser";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

interface ReplayReviewSequenceProps {
  replayQuery: ReplayQueryState;
  linkBasePath?: string;
}

export function ReplayReviewSequence({
  replayQuery,
  linkBasePath = "/runtime-cost",
}: ReplayReviewSequenceProps) {
  const records = useReplayInterpretationStore((s) => s.records);
  const journals = useGovernanceJournalStore((s) => s.entries);
  const cursor = useGovernanceWorkspaceStore((s) => s.reviewSequenceCursor);
  const setReviewSequenceCursor = useGovernanceWorkspaceStore((s) => s.setReviewSequenceCursor);

  const steps = buildReviewSequenceSteps({
    interpretations: records,
    journals,
    currentQuery: replayQuery,
  });

  if (steps.length === 0) {
    return (
      <p className="text-xs text-muted">
        Review sequencing will appear as interpretations and journals accumulate.
      </p>
    );
  }

  const active = steps[cursor] ?? steps[0];

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted">
        Human reading assistance only—sequencing does not determine operational priority.
      </p>
      <div className="flex flex-wrap gap-1">
        {steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            onClick={() => setReviewSequenceCursor(index)}
            className={`rounded-md border px-2 py-0.5 text-[10px] font-medium ${
              index === cursor
                ? "border-accent bg-indigo-50 text-accent"
                : "border-border text-muted"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-background px-3 py-2">
        <p className="text-sm font-medium text-foreground">{active.title}</p>
        <p className="mt-1 text-xs text-muted">{active.description}</p>
        <p className="mt-1 text-[11px] text-muted">{active.rationale}</p>
        <Link
          href={buildReplayHref(linkBasePath, mergeReplayQuery(replayQuery, active.replayQuery))}
          className="mt-2 inline-block text-xs font-medium text-accent hover:underline"
        >
          Open sequence step →
        </Link>
      </div>
    </div>
  );
}
