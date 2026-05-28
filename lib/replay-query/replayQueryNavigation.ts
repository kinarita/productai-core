import { buildReplayQuery } from "@/lib/replay-query/replayQueryBuilder";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

export function buildReplayHref(pathname: string, state: ReplayQueryState): string {
  return `${pathname}${buildReplayQuery(state)}`;
}
