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
