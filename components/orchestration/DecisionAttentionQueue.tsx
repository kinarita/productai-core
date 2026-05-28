import Link from "next/link";
import type { DecisionAttentionItem } from "@/lib/orchestration/decision-attention/decisionAttention";
import { buildReplayHref } from "@/lib/replay-query/replayQueryNavigation";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

export function DecisionAttentionQueue({
  items,
  replayQuery,
  onGenerateFeedVisibility,
}: {
  items: DecisionAttentionItem[];
  replayQuery: ReplayQueryState;
  onGenerateFeedVisibility?: (item: DecisionAttentionItem) => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        Decision attention queue
      </p>
      {items.length === 0 ? (
        <p className="text-xs text-muted">
          Executive attention remains balanced for the current replay scope.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="rounded-md border border-border bg-background p-2">
              <p className="text-xs font-medium text-foreground">
                {item.governanceReason}
              </p>
              <p className="mt-1 text-xs text-muted">{item.whyThisNeedsAttention}</p>
              <p className="mt-1 text-xs text-muted">
                Visibility {item.replayVisibilityScore} · Confidence {item.replayConfidence} ·{" "}
                {item.continuityCategory.replaceAll("_", " ")}
              </p>
              <p className="mt-1 text-xs text-muted">{item.recommendedReviewAction}</p>
              <div className="mt-1 flex flex-wrap gap-3 text-xs">
                <Link href={item.drilldownHref} className="font-medium text-accent hover:underline">
                  Open replay context →
                </Link>
                <Link
                  href={buildReplayHref("/organization-feed", {
                    ...replayQuery,
                    mission: item.missionId === "organization" ? replayQuery.mission : item.missionId,
                    governanceAttention: "decision_attention",
                  })}
                  className="font-medium text-accent hover:underline"
                >
                  Open feed trace →
                </Link>
                <Link
                  href={buildReplayHref("/judgment", {
                    ...replayQuery,
                    mission: item.missionId === "organization" ? replayQuery.mission : item.missionId,
                    governanceAttention: "decision_attention",
                  })}
                  className="font-medium text-accent hover:underline"
                >
                  Open judgment context →
                </Link>
                {item.missionId !== "organization" ? (
                  <Link href={`/missions/${item.missionId}`} className="font-medium text-accent hover:underline">
                    Open mission →
                  </Link>
                ) : null}
                {item.taskId ? (
                  <Link href={`/tasks/${item.taskId}`} className="font-medium text-accent hover:underline">
                    Open task →
                  </Link>
                ) : null}
                {onGenerateFeedVisibility ? (
                  <button
                    type="button"
                    onClick={() => onGenerateFeedVisibility(item)}
                    className="font-medium text-accent hover:underline"
                  >
                    Generate Feed Visibility
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
