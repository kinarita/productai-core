# ProductAI Phase 3 Sync Policy

## Purpose

This document defines persistence and synchronization policy for ProductAI before remote source-of-truth, multi-user, auth, and AI orchestration are introduced.

## Persistence modes

### Local

- **Read priority:** browser `localStorage` only
- **Write priority:** Zustand stores persisted locally
- **Backend:** not required; hydration and remote writes are skipped
- **Fallback:** n/a (local is authoritative)
- **Failure behavior:** local execution continues without sync telemetry beyond idle state

### Hybrid (default)

- **Read priority:** render local persisted state immediately; backend hydration supplements via id-based merge
- **Write priority:** local state updates first; backend write is best-effort asynchronous
- **Backend:** SQLite via Next.js API routes
- **Fallback:** on backend read/write failure, local state remains authoritative; warnings are logged calmly
- **Failure behavior:** no UI rollback; `console.warn` + operational sync warnings; local-only entities preserved
- **Merge:** prefer newer `updatedAt` when comparable; preserve local-only records

### Remote (future specification)

- **Read priority:** backend source-of-truth; local cache for responsiveness
- **Write priority:** backend-first with optimistic local cache (not implemented)
- **Requirements before production:** auth, multi-user isolation, conflict resolution, realtime optional
- **Current status:** specification only — not full source-of-truth migration

## Read / write flow summary

| Mode   | UI update      | Backend read        | Backend write     |
|--------|----------------|---------------------|-------------------|
| local  | immediate local| none                | none              |
| hybrid | immediate local| background hydrate  | best-effort async |
| remote | planned cache  | backend-first       | backend-first     |

## Failure behavior

- Hydration failures do not block local execution.
- Write failures do not revert local UI state.
- Backend health `unavailable` triggers operational messaging: local continuity maintained.
- Manual retry is available from Settings (no automatic polling backoff in UI layer).

## Warning deduplication

- Warnings are keyed by `type + message` fingerprint.
- Duplicate warnings within a short window increment `count` instead of creating new rows.
- `lastSeenAt` tracks the most recent occurrence.

## Retry display (UI only)

`pendingHydrationCount` drives suggested retry guidance:

- `0` → Retry available now
- `1` → Suggested retry in 30s
- `2` → Suggested retry in 1m
- `3+` → Suggested retry in 2m

No automatic scheduler is attached in Phase 3-6.

## syncedAt policy

- `createdAt` / `updatedAt` — entity lifecycle timestamps (local or backend)
- `syncedAt` — last time entity data was aligned with backend persistence layer
- On hydration from backend, mappers set `syncedAt` via `markSyncedAt()` / `withSyncedAt()`
- Local-only mutations may update `updatedAt` without immediately updating `syncedAt`
- Future conflict resolution will compare `updatedAt` and `syncedAt` per entity id

## Future conflict resolution (deferred)

1. Compare `updatedAt` per id (local vs remote)
2. If ambiguous, compare `syncedAt`
3. Preserve local-only ids until explicitly deleted
4. CEO-visible conflict UI is out of scope until remote mode matures

## Future multi-user direction

- Organization-scoped data partitions in SQLite
- Auth-bound API routes
- Remote mode becomes default for collaborative deployments
- WebSocket/SSE optional for live feed — not required for MVP hybrid

## Related implementation

- `lib/config/persistenceMode.ts` — mode flag
- `lib/services/writeSync.ts` — hybrid write bridge
- `lib/services/readHydrationService.ts` — hybrid read hydration
- `lib/services/syncMetadata.ts` — syncedAt helpers
- `lib/store/syncStore.ts` — operational sync telemetry
