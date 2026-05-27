# ProductAI Phase 3 Backend Foundation

## Purpose

Phase 3-1 establishes the backend skeleton required to evolve ProductAI from a local-state UI MVP into a persistent operational system.

This phase is intentionally foundational:

- no UI redesign
- no realtime orchestration
- no auth/multi-user
- no external integrations

## Architecture evolution

### Phase 2 architecture

`UI -> Zustand stores -> localStorage`

### Phase 3-1 architecture (hybrid)

`UI -> Zustand stores (active path)`  
`API routes -> repositories -> SQLite (new path)`

The new backend path is now available for gradual migration while preserving current UX.

## Persistence strategy

### SQLite foundation

- Engine: `better-sqlite3`
- DB file: `data/productai.db`
- Bootstrap responsibilities:
  - create schema if missing
  - seed minimal records from existing mock data
  - run safely on repeated startup

### Schema scope (initial)

- `missions`
- `decisions`
- `tasks`
- `feed_items`
- `runtime_events`

This schema is intentionally compact and operationally oriented.

## Repository pattern

SQL access is isolated to repository classes under `lib/server/repositories`.

Benefits:

- UI does not touch SQL directly.
- API handlers remain thin.
- future write flows can be added without coupling to components.

## Domain separation

`lib/domain/*` contains record-level domain mapping logic:

- mission
- task
- feed
- judgment

This keeps frontend UI types and backend row representations decoupled.

## API foundation

Implemented route handlers:

- `GET /api/missions`
- `GET /api/tasks`
- `GET /api/feed`

Each route:

- ensures DB bootstrap,
- reads via repository abstraction,
- returns JSON for future UI data-loading migration.

## Phase 3-2 write API foundation

Phase 3-2 extends the foundation with backend write capability while preserving current UI behavior.

### Write endpoints added

- Tasks
  - `POST /api/tasks`
  - `GET /api/tasks/:taskId`
  - `PATCH /api/tasks/:taskId`
- Feed
  - `POST /api/feed`
  - `GET /api/feed/:feedId`
- Judgments
  - `GET /api/judgments`
  - `GET /api/judgments/:decisionId`
  - `PATCH /api/judgments/:decisionId`

### Repository write capabilities

- `taskRepository`: `create`, `update`, `getById`
- `feedRepository`: `create`, `getById`
- `judgmentRepository`: `getById`, `updateStatus`

### Service write capabilities

- `taskService`: `createTask`, `updateTask`
- `feedService`: `createFeedItem`
- `judgmentService`: `updateDecisionStatus`
- shared API wrapper: `apiClient`

### API response contract

- success: `{ "ok": true, "data": ... }`
- failure: `{ "ok": false, "error": "..." }`

### Validation/error baseline

- `400`: invalid payload
- `404`: entity not found
- `500`: unexpected server error

### Coexistence status

- Local Zustand state remains active UX path.
- Write APIs are now available for gradual store migration.
- No forced UI migration performed in this phase.

## Phase 3-3 hybrid sync bridge

Phase 3-3 introduces the migration bridge between local-first store actions and backend write APIs.

### Feature flag

- `NEXT_PUBLIC_PRODUCTAI_PERSISTENCE_MODE`
  - `local`: local-only writes
  - `hybrid`: local immediate write + best-effort backend write
  - `remote`: reserved for future full remote-first mode

Default mode is `hybrid`.

### Sync helper model

- `syncWrite(label, localFn, remoteFn)` executes:
  1. local update first
  2. remote write asynchronously (mode-based)
  3. warn on remote failure without breaking UX

### Store bridge actions

- Task store:
  - `updateTaskStatusWithSync`
  - `addTaskWithSync`
  - `addTaskEventWithSync`
- Organization store:
  - `addFeedItemWithSync`
  - `updateDecisionStatusWithSync`

### UI migration scope (partial)

Key operational paths now call sync actions:

- task status buttons
- judgment approve/reject/revision actions
- create task from judgment
- suggested action executions

This keeps UX unchanged while backend write adoption begins incrementally.

## Phase 3-4 read hydration bridge

Phase 3-4 adds mode-aware backend reads and safe store merge actions.

### Read hydration strategy

- `local`:
  - no backend fetch
  - localStorage only
- `hybrid`:
  - render local persisted state immediately
  - hydrate in background from backend
  - merge remote records into local stores without destructive reset
- `remote`:
  - foundation prepared for backend-priority reads (full remote mode deferred)

### Hydration service and lifecycle

- New: `lib/services/readHydrationService.ts`
  - `hydrateProductAIState`
  - `hydrateMissions`
  - `hydrateTasks`
  - `hydrateFeed`
  - `hydrateJudgments`
- New global hydration effect:
  - `components/ProductAIReadHydration.tsx`
  - mounted in `app/layout.tsx`

### Merge semantics

- id-based merge with local coexistence
- prefer newer `updatedAt` when available
- preserve local-only entities
- avoid heavy conflict-resolution logic in this phase

### Sync observability

- New sync store (`productai-sync`) tracks:
  - hydration status
  - last hydrated timestamp
  - recent read/write failures
- Runtime/Settings surfaces show lightweight sync health without intrusive UI.

## Phase 3-5 sync operational layer

Phase 3-5 promotes sync/hydration from background mechanics into a visible operational system for CEO use.

### Operational capabilities

- manual actions in Settings:
  - refresh from backend
  - run hydration
  - retry sync
- lightweight backend health check:
  - endpoint probe (`/api/missions`)
  - 3s timeout
  - statuses: `healthy` / `degraded` / `unavailable`
- sync warning system:
  - calm operational messages
  - no panic overlays
  - local continuity emphasized

### Remote mode specification (future-oriented)

- `local`:
  - browser-first, localStorage persistence only
- `hybrid`:
  - local-first interaction model
  - best-effort backend read/write synchronization
- `remote` (specification only in current phase):
  - backend as source of truth
  - intended base for auth + multi-user collaboration
  - full source-of-truth migration deferred

### Metadata normalization

To prepare future conflict resolution:

- Mission / Task / Decision / Feed now support normalized metadata:
  - `createdAt`
  - `updatedAt`
  - `syncedAt` (optional, future-ready)

This phase does not introduce heavy conflict-resolution logic; it only standardizes metadata shape.

## Store migration path

A service layer (`lib/services`) is introduced as migration prep:

- `missionService`
- `taskService`

Planned path:

1. keep Zustand as interaction model,
2. switch store hydration/fetch from mock data to API incrementally,
3. move mutating actions to backend routes,
4. retain existing UX behavior.

## Event persistence thinking

ProductAI operational chain:

`Judgment -> Task -> Execution -> Feed`

The schema now treats `feed_items` and `runtime_events` as persistent event-oriented records, enabling future memory/orchestration layers without full event-sourcing complexity today.

## Coexistence guarantees (Phase 3-1)

- localStorage persist remains active and unchanged.
- reset/hydration flows remain valid.
- UI and navigation behavior remain stable.
- backend foundation is additive, not disruptive.

## Deferred to later Phase 3 steps

- write APIs (POST/PATCH/DELETE) for mission/task/feed mutations
- store adapters fully routed through services/APIs
- auth and multi-user isolation
- GitHub API + orchestration execution loops
- realtime updates (WebSocket/SSE)
