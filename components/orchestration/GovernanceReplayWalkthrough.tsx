"use client";

import { useState } from "react";
import Link from "next/link";
import { mergeReplayQuery } from "@/lib/replay-query/replayQueryParser";
import { replayQueryDefaults } from "@/lib/replay-query/replayQueryDefaults";
import { buildReplayHref } from "@/lib/replay-query/replayQueryNavigation";
import {
  governanceReplayWalkthroughSteps,
  type ReplayWalkthroughStep,
} from "@/lib/orchestration/governance-history/replayWalkthrough";
import { useReplayTutorialStore } from "@/lib/store/replayTutorialStore";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";
import { cn } from "@/lib/utils";

interface GovernanceReplayWalkthroughProps {
  baseReplayQuery?: ReplayQueryState;
  linkBasePath?: string;
  compact?: boolean;
}

export function GovernanceReplayWalkthrough({
  baseReplayQuery = replayQueryDefaults,
  linkBasePath = "/runtime-cost",
  compact = false,
}: GovernanceReplayWalkthroughProps) {
  const completedSteps = useReplayTutorialStore((s) => s.completedSteps);
  const markStepCompleted = useReplayTutorialStore((s) => s.markStepCompleted);
  const setLastViewedReplayScope = useReplayTutorialStore((s) => s.setLastViewedReplayScope);
  const [activeIndex, setActiveIndex] = useState(0);

  const step = governanceReplayWalkthroughSteps[activeIndex] as ReplayWalkthroughStep | undefined;
  if (!step) return null;

  const stepHref = step.relatedReplayQuery
    ? buildReplayHref(linkBasePath, mergeReplayQuery(baseReplayQuery, step.relatedReplayQuery))
    : null;

  const goNext = () => {
    markStepCompleted(step.id);
    if (step.relatedReplayQuery?.scope) {
      setLastViewedReplayScope(step.relatedReplayQuery.scope);
    }
    setActiveIndex((i) => Math.min(i + 1, governanceReplayWalkthroughSteps.length - 1));
  };

  const goPrev = () => setActiveIndex((i) => Math.max(i - 1, 0));

  return (
    <div className={cn("rounded-lg border border-border bg-surface", compact ? "p-3" : "p-4")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Governance replay walkthrough
        </p>
        <p className="text-xs text-muted">
          Step {activeIndex + 1} of {governanceReplayWalkthroughSteps.length}
        </p>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {governanceReplayWalkthroughSteps.map((s, index) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={cn(
              "rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors",
              index === activeIndex
                ? "border-accent bg-indigo-50 text-accent"
                : "border-border bg-background text-muted hover:bg-surface",
              completedSteps.includes(s.id) && index !== activeIndex && "text-success"
            )}
          >
            {s.title}
          </button>
        ))}
      </div>
      <h4 className="mt-3 text-sm font-semibold text-foreground">{step.title}</h4>
      <p className="mt-1 text-xs leading-relaxed text-muted">{step.description}</p>
      <p className="mt-2 text-xs text-foreground">
        <span className="font-medium">Recommended:</span> {step.recommendedAction}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={goPrev}
          disabled={activeIndex === 0}
          className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={activeIndex >= governanceReplayWalkthroughSteps.length - 1}
          className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-surface disabled:opacity-50"
        >
          Next step
        </button>
        {stepHref ? (
          <Link
            href={stepHref}
            onClick={() => markStepCompleted(step.id)}
            className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium text-accent transition-colors hover:bg-surface"
          >
            Open related replay scope →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
