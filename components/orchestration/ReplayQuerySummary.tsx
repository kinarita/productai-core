import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

export function ReplayQuerySummary({ query }: { query: ReplayQueryState }) {
  return (
    <p className="text-xs text-muted">
      Replay scope: {query.scope.replaceAll("_", " ")} · window: {query.replayWindow} · severity:{" "}
      {query.severity.replaceAll("_", " ")} · continuity: {query.continuity}
    </p>
  );
}
