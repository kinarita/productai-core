import { replayQueryDefaults } from "@/lib/replay-query/replayQueryDefaults";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

type QueryInput = URLSearchParams | Record<string, string | string[] | undefined>;

function getValue(input: QueryInput, key: string): string | undefined {
  if (input instanceof URLSearchParams) return input.get(key) ?? undefined;
  const value = input[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

function normalizeContinuityValue(value: string): string {
  if (value === "stable") return "continuity_stable";
  if (value === "degraded") return "continuity_advisory";
  if (value === "review") return "continuity_review";
  if (value === "runtime") return "continuity_runtime";
  if (value === "governance") return "continuity_governance";
  if (value === "replay") return "continuity_replay";
  return value;
}

export function parseReplayQuery(input: QueryInput): ReplayQueryState {
  const state: ReplayQueryState = {
    mission: getValue(input, "mission") ?? replayQueryDefaults.mission,
    severity: getValue(input, "severity") ?? replayQueryDefaults.severity,
    eventType: getValue(input, "eventType") ?? replayQueryDefaults.eventType,
    source: getValue(input, "source") ?? replayQueryDefaults.source,
    reasonCategory: getValue(input, "reasonCategory") ?? replayQueryDefaults.reasonCategory,
    continuity: normalizeContinuityValue(
      getValue(input, "continuity") ?? replayQueryDefaults.continuity
    ),
    advisory: getValue(input, "advisory") ?? replayQueryDefaults.advisory,
    review: getValue(input, "review") ?? replayQueryDefaults.review,
    governance: getValue(input, "governance") ?? replayQueryDefaults.governance,
    replayWindow: (getValue(input, "replayWindow") as ReplayQueryState["replayWindow"]) ?? replayQueryDefaults.replayWindow,
    scope: (getValue(input, "scope") as ReplayQueryState["scope"]) ?? replayQueryDefaults.scope,
  };
  const legacyGov = getValue(input, "gov");
  if (legacyGov && state.governance === "all") state.governance = legacyGov;
  const legacyCategory = getValue(input, "category");
  if (legacyCategory && state.reasonCategory === "all") state.reasonCategory = legacyCategory;
  return state;
}

export function mergeReplayQuery(
  base: ReplayQueryState,
  partial: Partial<ReplayQueryState>
): ReplayQueryState {
  return { ...base, ...partial };
}
