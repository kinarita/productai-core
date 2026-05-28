import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

export function ReplayQuerySummary({ query }: { query: ReplayQueryState }) {
  return (
    <p className="text-xs text-muted">
      Scope: {query.scope.replaceAll("_", " ")} · Window: {query.replayWindow} · Severity:{" "}
      {query.severity.replaceAll("_", " ")} · Advisory: {query.advisory} · Continuity: {query.continuity}
    </p>
  );
}
