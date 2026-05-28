import { replayScopeLabels, replayWindowLabels } from "@/lib/replay-query/replayLabels";
import {
  CONTINUITY_CATEGORIES,
  REPLAY_CATEGORIES,
  REPLAY_SEVERITIES,
  REPLAY_SOURCES,
} from "@/lib/replay-query/replayTaxonomy";
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

export function replaySeverityOptions(): { id: string; label: string }[] {
  return [{ id: "all", label: "all" }, ...REPLAY_SEVERITIES.map((entry) => ({ id: entry.value, label: entry.label.toLowerCase() }))];
}

export function replayContinuityOptions(): { id: string; label: string }[] {
  return [{ id: "all", label: "all" }, ...CONTINUITY_CATEGORIES.map((entry) => ({ id: entry.value, label: entry.label.toLowerCase() }))];
}

export function replayCategoryOptions(): { id: string; label: string }[] {
  return [{ id: "all", label: "all" }, ...REPLAY_CATEGORIES.map((entry) => ({ id: entry.value, label: entry.label.toLowerCase() }))];
}

export function replaySourceOptions(): { id: string; label: string }[] {
  return [{ id: "all", label: "all" }, ...REPLAY_SOURCES.map((entry) => ({ id: entry.value, label: entry.label }))];
}
