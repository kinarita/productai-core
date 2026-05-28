import Link from "next/link";
import type { DecisionAttentionItem } from "@/lib/orchestration/decision-attention/decisionAttention";

export function DecisionAttentionQueue({
  items,
}: {
  items: DecisionAttentionItem[];
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
                {item.missionId !== "organization" ? (
                  <Link href={`/missions/${item.missionId}`} className="font-medium text-accent hover:underline">
                    Open mission →
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
