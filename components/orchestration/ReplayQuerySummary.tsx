import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";
import { replayScopeLabels, replayWindowLabels, replaySeverityLabels } from "@/lib/replay-query/replayLabels";

export function ReplayQuerySummary({ query }: { query: ReplayQueryState }) {
  return (
    <p className="text-xs text-muted">
      Scope: {replayScopeLabels[query.scope]} · Window: {replayWindowLabels[query.replayWindow]} · Severity:{" "}
      {replaySeverityLabels[query.severity] ?? query.severity.replaceAll("_", " ")} · Advisory:{" "}
      {query.advisory.replaceAll("_", " ")} · Continuity: {query.continuity.replaceAll("_", " ")}
    </p>
  );
}
