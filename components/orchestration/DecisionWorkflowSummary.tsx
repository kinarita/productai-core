import type { DecisionAttentionItem } from "@/lib/orchestration/decision-attention/decisionAttention";

export function DecisionWorkflowSummary({
  items,
}: {
  items: DecisionAttentionItem[];
}) {
  const elevated = items.filter((item) => item.severity === "elevated_review" || item.severity === "executive_focus").length;
  const advisory = items.filter((item) => item.severity === "advisory").length;
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        Decision workflow summary
      </p>
      <p className="mt-2 text-xs text-muted">
        Review required signals: {elevated} · Advisory routing context: {advisory} · Replay attention items: {items.length}
      </p>
      <p className="mt-1 text-xs text-muted">
        Replay diagnostics remain recommendation-only and support human-in-the-loop governance review.
      </p>
    </div>
  );
}
