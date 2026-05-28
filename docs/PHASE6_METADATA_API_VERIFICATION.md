# Phase 6-2 Metadata API Verification

## Objective

Stabilize governance replay metadata integrity across:

- POST `/api/feed`
- SQLite persistence
- GET `/api/feed`
- GET `/api/feed/:id`
- mapper restoration flow

without introducing strict rejection that breaks compatibility.

## Verification flow

Verification utilities:

- `scripts/verifyFeedMetadataApi.mjs`
- `scripts/verifyReplayMetadataRoundtrip.mjs`

Flow:

1. Post feed item with valid metadata taxonomy.
2. Post feed item with intentionally invalid metadata taxonomy.
3. Verify both items are returned by feed list endpoint.
4. Verify feed-by-id returns normalized metadata.
5. Verify continuity compatibility mapping is preserved.

## Taxonomy validation and fallback

Validation helper:

- `lib/replay-query/replayValidation.ts`

Policy:

- Never throw on unknown metadata taxonomy values.
- Normalize legacy values where possible.
- Fall back to safe governance continuity defaults.

Examples:

- `continuity: degraded` -> `continuity_advisory`
- unknown `replayCategory` -> `replay_governance`
- unknown `replaySeverity` -> `moderate`
- unknown `replaySource` -> `governance`
- unknown `advisoryLevel` -> `advisory`

## Compatibility mapping

Legacy compatibility is preserved by normalization:

- `stable` -> `continuity_stable`
- `degraded` -> `continuity_advisory`
- `runtime_observer` -> `runtime`
- `coo` -> `orchestration`
- `ceo` -> `advisory`
- `system` -> `governance`
- `advisory_low` -> `informational`
- `advisory_moderate` -> `advisory`
- `advisory_elevated` -> `elevated`

## Operational tone

Unknown replay metadata is normalized with a calm continuity-first message in dev logs:

"Unknown replay metadata was normalized to preserve governance continuity."
