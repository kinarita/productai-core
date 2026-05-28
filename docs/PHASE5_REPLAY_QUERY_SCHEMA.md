# PHASE 5-8: Unified Replay Query Architecture

## Scope

Phase 5-8 consolidates replay UX and governance query architecture into a reusable shared schema.
This phase is query and navigation focused; no execution automation is introduced.

## Replay query architecture

- Added `lib/replay-query/`:
  - `replayQueryTypes.ts`
  - `replayQueryDefaults.ts`
  - `replayQueryParser.ts`
  - `replayQueryBuilder.ts`
  - `replayQueryNavigation.ts`
- Introduced `ReplayQueryState` as single source of truth:
  - mission, severity, eventType, source, reasonCategory, continuity, advisory, review, governance, replayWindow, scope
- Added shared helpers:
  - `parseReplayQuery()`
  - `buildReplayQuery()`
  - `mergeReplayQuery()`

## UX consolidation

- Reusable replay components:
  - `ReplayScopeSwitcher`
  - `ReplayWindowSelector`
  - `ReplayQuerySummary`
  - `ReplayNavigationContext`
- Replay chip-based filtering consistency expanded across Runtime/Feed and shared context summaries in CEO/Mission.

## Navigation portability

- Query continuity is preserved in drilldowns:
  - CEO → Runtime Replay
  - Mission → Runtime Replay / Feed
- Share Replay View now relies on unified replay query schema generation.

## Human governance continuity

- Replay surfaces governance context for interpretation.
- Replay does not determine governance action.
- Only humans determine operational response and governance priority.
