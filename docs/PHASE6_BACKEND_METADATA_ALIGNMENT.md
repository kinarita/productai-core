# Phase 6-1 Backend Metadata Alignment

## Objective

Align governance replay metadata with backend persistence so feed metadata can round-trip:

- frontend model → API payload → repository → SQLite
- SQLite row → domain record → API response → frontend model

## Schema strategy

- `feed_items` now includes replay metadata columns:
  - `governance_category`
  - `replay_category`
  - `continuity_category`
  - `advisory_level`
  - `replay_severity`
  - `replay_source`
  - `replay_tags_json`
  - `metadata_json`
- Existing DB compatibility is preserved through additive migration.

## Migration strategy

- `bootstrap.ts` ensures missing columns are added via idempotent `ensureColumn(...)`.
- Safe for existing `data/productai.db` and repeat execution.

## Repository and API compatibility

- Feed repository now writes/reads metadata columns and supports metadata filters:
  - `governanceCategory`
  - `replayCategory`
  - `continuityCategory`
  - `replaySeverity`
  - `replaySource`
- `/api/feed`:
  - accepts metadata fields on POST
  - returns metadata fields on GET/GET by id

## Query compatibility mapping

- Replay query parser normalizes legacy continuity values:
  - `stable` → `continuity_stable`
  - `degraded` → `continuity_advisory`
- Existing `gov`/`category` compatibility remains supported.

## Known limitations

- Some existing seeded or legacy records may still carry partial metadata until rewritten.
- Backend uses additive compatibility rather than strict taxonomy validation enforcement.
