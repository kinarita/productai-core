"use client";

import Link from "next/link";
import { buildReplayHref } from "@/lib/replay-query/replayQueryNavigation";
import { mergeReplayQuery } from "@/lib/replay-query/replayQueryParser";
import { replayQueryDefaults } from "@/lib/replay-query/replayQueryDefaults";
import { buildReplaySessionRecommendations } from "@/lib/orchestration/governance-history/replayContinuityMemory";
import { useReplayPersonalizationStore } from "@/lib/store/replayPersonalizationStore";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

interface ReplaySessionRecommendationsProps {
  baseReplayQuery?: ReplayQueryState;
  linkBasePath?: string;
}

export function ReplaySessionRecommendations({
  baseReplayQuery = replayQueryDefaults,
  linkBasePath = "/runtime-cost",
}: ReplaySessionRecommendationsProps) {
  const continuityMemory = useReplayPersonalizationStore((s) => s.continuityMemory);
  const lastReplayView = useReplayPersonalizationStore((s) => s.lastReplayView);

  const recommendations = buildReplaySessionRecommendations({
    memory: continuityMemory,
    lastReplayView,
  });

  if (recommendations.length === 0) {
    return (
      <p className="text-xs text-muted">
        Session recommendations will appear after you review replay contexts in this browser.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {recommendations.map((item) => {
        const href = buildReplayHref(
          linkBasePath,
          mergeReplayQuery(baseReplayQuery, item.replayQuery)
        );
        return (
          <li key={item.id} className="rounded-lg border border-border bg-background px-3 py-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <Link href={href} className="text-xs font-medium text-accent hover:underline">
                Continue →
              </Link>
            </div>
            <p className="mt-1 text-xs text-muted">{item.description}</p>
            <p className="mt-1 text-[11px] text-muted">Recommendation-only · no automated replay actions</p>
          </li>
        );
      })}
    </ul>
  );
}
