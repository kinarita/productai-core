import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";
import {
  replayContinuityLabels,
  replayScopeLabels,
  replaySeverityLabels,
  replayWindowLabels,
} from "@/lib/replay-query/replayLabels";

export function ReplayQuerySummary({ query }: { query: ReplayQueryState }) {
  return (
    <p className="text-xs text-muted">
      Scope: {replayScopeLabels[query.scope]} · Window: {replayWindowLabels[query.replayWindow]} · Severity:{" "}
      {replaySeverityLabels[query.severity] ?? query.severity.replaceAll("_", " ")} · Advisory:{" "}
      {query.advisory.replaceAll("_", " ")} · Continuity:{" "}
      {replayContinuityLabels[query.continuity] ?? query.continuity.replaceAll("_", " ")} · Attention:{" "}
      {query.governanceAttention.replaceAll("_", " ")}
    </p>
  );
}
