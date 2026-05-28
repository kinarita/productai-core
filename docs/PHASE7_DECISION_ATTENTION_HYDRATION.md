# Phase 7-4 Decision Attention Hydration

## Objective

Complete decision attention traceability across hydration, remote merge, and seed/mock initialization so attention metadata survives first load and backend synchronization.

## Hydration architecture

1. `fetchFeed()` retrieves taxonomy-aligned records from `/api/feed`.
2. `mapFeedRecordToFeedItem()` restores replay and decision attention metadata with validation fallback.
3. `mergeFeedFromRemote()` uses `mergeOrganizationFeedItem()` to coalesce metadata without loss.
4. Local-only feed items remain appended after remote merge.

## Merge continuity

`lib/services/feedMerge.ts` provides:

- `mergeOrganizationFeedItem()` — coalesces replay + decision attention fields from local/remote winners
- `countDecisionAttentionFeedItems()` — dev observability helper

Merge never throws when metadata is partial.

## Seed/mock alignment

`data/mockData.ts` includes decision attention samples:

- `f-attn-generated`
- `f-attn-reviewed`
- `f-attn-resolved`
- `f-attn-deferred`

Each item includes taxonomy-aligned replay metadata and decision attention lifecycle fields.

`bootstrap.ts` seeds all decision attention columns into SQLite.

## Replay filter initialization

Organization Feed attention chips (`all`, `attention`, `generated`, `reviewed`, `resolved`, `deferred`) operate on metadata fields via `matchesGovernanceAttentionFilter()`.

## Metadata preservation

Hydration and merge preserve:

- `governanceAttention` query context (URL-synced)
- `decisionAttentionLifecycle`
- `decisionAttentionReplayConfidence`
- `continuityCategory`

## Verification

```bash
npm run build
node scripts/verifyDecisionAttentionHydration.mjs
```

## Intentionally excluded scope

- autonomous runtime
- execution orchestration
- MCP/GitHub integration
- automatic decision routing or escalation
- self-running governance loops
