import { replayScopeLabels, replayWindowLabels } from "@/lib/replay-query/replayLabels";
import type { ReplayScope, ReplayWindow } from "@/lib/replay-query/replayQueryTypes";

export function replayScopeOptions(): { id: ReplayScope; label: string }[] {
  return (Object.keys(replayScopeLabels) as ReplayScope[]).map((id) => ({
    id,
    label: replayScopeLabels[id],
  }));
}

export function replayWindowOptions(): { id: ReplayWindow; label: string }[] {
  return (Object.keys(replayWindowLabels) as ReplayWindow[]).map((id) => ({
    id,
    label: replayWindowLabels[id],
  }));
}
