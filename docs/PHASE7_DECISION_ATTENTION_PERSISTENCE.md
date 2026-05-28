# Phase 7-3 Decision Attention Persistence

## Objective

Complete end-to-end decision attention traceability across UI, feed metadata, API, database, mapper, and replay query propagation.

## Database schema

`feed_items` now includes:

- `decision_attention_id`
- `decision_attention_severity`
- `decision_attention_category`
- `decision_attention_reason`
- `decision_attention_source`
- `decision_attention_replay_confidence`
- `decision_attention_continuity_category`
- `decision_attention_lifecycle`

Indexes:

- `idx_feed_decision_attention_lifecycle`
- `idx_feed_decision_attention_id`

## Safe migration

`bootstrap.ts` and `FeedRepository.ensureFeedMetadataColumns()` apply idempotent `ALTER TABLE` migrations for all decision attention columns.

## API compatibility

`POST /api/feed` accepts decision attention metadata fields with safe validation fallback.

`GET /api/feed` supports:

- `governanceAttention` (alias: `attention`)
- `decisionAttentionId`
- `decisionAttentionSeverity`
- `decisionAttentionLifecycle`

`GET /api/feed/:id` returns normalized decision attention metadata.

## Query propagation

`ReplayQueryState.governanceAttention` is parsed, built into URLs, and displayed across:

- CEO Home
- Runtime & Cost
- Mission Detail
- Judgment
- Organization Feed

## Verification flow

Run:

```bash
npm run build
node scripts/verifyDecisionAttentionFeedMetadata.mjs
```

Requires a running app instance (`PRODUCTAI_BASE_URL`, default `http://localhost:3000`).

## HITL boundaries

Decision attention persistence records governance visibility only. It does not trigger autonomous decisions, approvals, or execution.

## Intentionally excluded scope

- autonomous decision making
- automatic approval
- execution/runtime orchestration
- MCP/GitHub integration
- worker processing and deployment automation
